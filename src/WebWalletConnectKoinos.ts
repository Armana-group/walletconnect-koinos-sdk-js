import {
  WalletConnectModalSign,
  WalletConnectModalSignOptions
} from '@walletconnect/modal-sign-html'
import { getSdkError } from '@walletconnect/utils'
import { Provider, Signer } from 'koilib'
import { Options, LogLevel, ChainIds, Methods } from '.'
import { generateProvider } from './provider'
import { generateSigner } from './signer'

export class WebWalletConnectKoinos {
  public web3Modal: WalletConnectModalSign
  private topic = ''
  private chainId: string | undefined
  private accounts: string[] = []
  private options: Options = {
    logLevel: LogLevel.none
  }

  constructor(WalletConnectModalSignOptions: WalletConnectModalSignOptions, options?: Options) {
    if (options) {
      this.options = options
    }
    this.web3Modal = new WalletConnectModalSign(WalletConnectModalSignOptions)

    const doNotAutoDisconnect = options?.autoDisconnect === false

    if (!doNotAutoDisconnect) {
      this.web3Modal.onSessionDelete((ev) => this.onSessionDelete(ev))
    }
  }

  close(): void {
    this.web3Modal.offSessionDelete((ev) => this.onSessionDelete(ev))
  }

  private async onSessionDelete(data: { id: number; topic: string }): Promise<void> {
    if (this.options.logLevel === LogLevel.debug) {
      console.log('onSessionDelete', data)
    }

    this.accounts = []
    this.topic = ''
    this.chainId = undefined
  }

  async connect(chains: ChainIds[], methods: Methods[]): Promise<string[]> {
    this.accounts = []
    // check if there is an existing session
    // we want to always use the newwest sessions
    const sessions = await this.web3Modal.getSessions()
    let session = sessions.length ? sessions[sessions.length - 1] : undefined

    if (!session) {
      // open WC modal if no existing session
      session = await this.web3Modal.connect({
        requiredNamespaces: {
          koinos: {
            methods: methods,
            chains: chains,
            events: []
          }
        }
      })
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
    // for now, disconnect from all sessions
    const sessions = await this.web3Modal.getSessions()

    for (const session of sessions) {
      try {
        this.web3Modal.disconnect({
          topic: session.topic,
          reason: getSdkError('USER_DISCONNECTED')
        })
      } catch (error) {
        console.error(error)
      }

      // and pairings
      if (session.pairingTopic) {
        try {
          this.web3Modal.disconnect({
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
    return generateSigner(address, finalChainId, this.topic, this.web3Modal, provider)
  }

  getProvider(chainId?: ChainIds): Provider {
    const finalChainId = chainId || this.chainId
    if (!finalChainId) {
      throw new Error(
        'You must provide a chain id because none or several are present in this session.'
      )
    }

    //@ts-expect-error compatible
    return generateProvider(finalChainId, this.topic, this.web3Modal)
  }
}
