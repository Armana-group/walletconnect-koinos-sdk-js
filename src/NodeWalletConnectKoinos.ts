import Client, { SignClient } from '@walletconnect/sign-client'
import { SignClientTypes } from '@walletconnect/types'
import { getSdkError } from '@walletconnect/utils'
import { Provider, Signer } from 'koilib'
import { Options, LogLevel, ChainIds, Methods } from '.'
import { generateProvider } from './provider'
import { generateSigner } from './signer'
import { KeyValueStorage } from '@walletconnect/keyvaluestorage'

export class NodeWalletConnectKoinos {
  public signClient?: Client
  private topic = ''
  private chainId: string | undefined
  private accounts: string[] = []
  private options: Options = {
    logLevel: LogLevel.none
  }

  async init(signClientOptions: SignClientTypes.Options, options?: Options): Promise<void> {
    if (options) {
      this.options = options
    }

    const signClient = await SignClient.init({
      projectId: signClientOptions.projectId,
      //@ts-expect-error types are compatible here
      metadata: {
        ...signClientOptions.metadata
      },
      storage: new KeyValueStorage({
        database: 'WALLET_CONNECT_V2.db'
      })
    })

    const doNotAutoDisconnect = options?.autoDisconnect === false

    if (!doNotAutoDisconnect) {
      signClient.on('session_delete', (ev: { id: number; topic: string }) =>
        this.onSessionDelete(ev)
      )
    }

    this.signClient = signClient
  }

  async close(): Promise<void> {
    this.signClient?.core.events.removeAllListeners()
    this.signClient?.core.relayer.events.removeAllListeners()
    this.signClient?.core.heartbeat.stop()
    this.signClient?.core.relayer.provider.events.removeAllListeners()
    this.signClient?.core.relayer.subscriber.events.removeAllListeners()
    this.signClient?.core.relayer.provider.connection.events.removeAllListeners()
    this.signClient?.events.removeAllListeners('session_delete')
    if (this.signClient?.core.relayer.connected) {
      await this.signClient?.core.relayer.transportClose()
    }

    this.signClient = undefined
  }

  private async onSessionDelete(data: { id: number; topic: string }): Promise<void> {
    if (this.options.logLevel === LogLevel.debug) {
      console.log('onSessionDelete', data)
    }

    this.accounts = []
    this.topic = ''
    this.chainId = undefined
  }

  private checkIfInitialized(): void {
    if (!this.signClient) {
      throw new Error('Please call init(...) first')
    }
  }

  async connect(chains: ChainIds[], methods: Methods[]): Promise<string[]> {
    this.checkIfInitialized()
    this.accounts = []
    // check if there is an existing session
    // we want to always use the newwest sessions
    const sessions = this.signClient!.session.getAll()
    let session = sessions!.length ? sessions[sessions.length - 1] : undefined

    if (!session) {
      // open WC modal if no existing session
      const { uri, approval } = await this.signClient!.connect({
        requiredNamespaces: {
          koinos: {
            methods: methods,
            chains: chains,
            events: []
          }
        }
      })

      if (!uri) {
        throw new Error('Could not generate WalletConnect URI')
      }
      console.log(`Please copy the following WalletConnect Pairing URI into your wallet:`)
      console.log(uri)

      session = await approval()
    }

    if (!session) {
      return []
    }

    // populate the topic from the session
    this.topic = session.topic

    // if only one chain was selected for this session, populate chainId
    if (session.namespaces.koinos.chains?.length === 1) {
      this.chainId = session.namespaces.koinos.chains[0]
    }

    const accounts: string[] = session.namespaces.koinos.accounts.reduce((acc: string[], acct) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [_namespace, _chainId, address] = acct.split(':')

      if (!acc.includes(address)) {
        acc.push(address)
      }

      return acc
    }, [])

    this.accounts = accounts
    return accounts
  }

  async disconnect(): Promise<void> {
    this.checkIfInitialized()
    // for now, disconnect from all sessions
    const sessions = await this.signClient!.session.getAll()

    for (const session of sessions) {
      try {
        this.signClient!.disconnect({
          topic: session.topic,
          reason: getSdkError('USER_DISCONNECTED')
        })
      } catch (error) {
        console.error(error)
      }

      // and pairings
      if (session.pairingTopic) {
        try {
          this.signClient!.disconnect({
            topic: session.pairingTopic,
            reason: getSdkError('USER_DISCONNECTED')
          })
        } catch (error) {
          console.error(error)
        }
      }
    }

    this.accounts = []
    this.topic = ''
    this.chainId = undefined
  }

  getAccounts(): string[] {
    return this.accounts
  }

  getSigner(address: string, provider?: Provider, chainId?: ChainIds): Signer {
    const finalChainId = chainId || this.chainId
    if (!finalChainId) {
      throw new Error(
        'You must provide a chain id because none or several are present in this session.'
      )
    }
    //@ts-expect-error compatible
    return generateSigner(address, finalChainId, this.topic, this.signClient!, provider)
  }

  getProvider(chainId?: ChainIds): Provider {
    const finalChainId = chainId || this.chainId
    if (!finalChainId) {
      throw new Error(
        'You must provide a chain id because none or several are present in this session.'
      )
    }
    //@ts-expect-error compatible
    return generateProvider(finalChainId, this.topic, this.signClient!)
  }
}
