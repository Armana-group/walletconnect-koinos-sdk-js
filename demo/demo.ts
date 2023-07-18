import { Contract, Provider, utils } from 'koilib'
import { ChainIds, LogLevel, Methods, WalletConnectKoinos } from '../src'

const connectButton = document.getElementById('connect-button') as HTMLButtonElement

const disconnectButton = document.getElementById('disconnect-button') as HTMLButtonElement

const accountsInfo = document.getElementById('accounts-info') as HTMLTextAreaElement

const signMessageButton = document.getElementById('sign-message-button') as HTMLButtonElement

const messageInput = document.getElementById('message') as HTMLInputElement

const messageSignatureInput = document.getElementById('message-signature') as HTMLInputElement

const amountInput = document.getElementById('amount') as HTMLInputElement

const toInput = document.getElementById('to') as HTMLInputElement

const signTransactionButton = document.getElementById(
  'sign-transaction-button'
) as HTMLButtonElement

const signedTransaction = document.getElementById('signed-transaction') as HTMLTextAreaElement

const projectId = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID
if (!projectId) {
  throw new Error('You need to provide VITE_WALLET_CONNECT_PROJECT_ID env variable')
}

const walletConnectKoinos = new WalletConnectKoinos(
  {
    projectId,
    metadata: {
      name: 'TestApp',
      description: 'Test application',
      url: 'https://armana-group.github.io/walletconnect-koinos-sdk-js/',
      icons: ['https://walletconnect.com/_next/static/media/logo_mark.84dd8525.svg']
    },
    modalOptions: {
      explorerRecommendedWalletIds: 'NONE',
      enableExplorer: false,
      walletImages: {
        portal: 'https://portal.armana.io/favicon.png'
      },
      mobileWallets: [
        {
          id: 'portal',
          name: 'Portal',
          links: {
            native: 'portal://',
            universal: 'https://portal.armana.io'
          }
        }
      ]
    }
  },
  {
    logLevel: LogLevel.debug
  }
)

let accounts: string[] = []

async function onConnect(): Promise<void> {
  try {
    connectButton.disabled = true
    accounts = await walletConnectKoinos.connect(
      [ChainIds.Harbinger],
      [Methods.SignMessage, Methods.SignTransaction]
    )
    console.info(accounts)
    accountsInfo.value = JSON.stringify(accounts, null, 2)
  } catch (err) {
    console.error(err)
    alert((err as Error).message)
  } finally {
    connectButton.disabled = false
  }
}

async function onDisconnect(): Promise<void> {
  try {
    disconnectButton.disabled = true
    await walletConnectKoinos.disconnect()
  } catch (err) {
    console.error(err)
    alert((err as Error).message)
  } finally {
    disconnectButton.disabled = false
  }
}

async function onSignMessage(): Promise<void> {
  try {
    signMessageButton.disabled = true
    const signer = walletConnectKoinos.getSigner(accounts[0])
    const signature = await signer.signMessage(messageInput.value)
    messageSignatureInput.value = utils.encodeBase64url(signature)
  } catch (err) {
    console.error(err)
    alert((err as Error).message)
  } finally {
    signMessageButton.disabled = false
  }
}

async function onSignTransaction(): Promise<void> {
  try {
    signTransactionButton.disabled = true
    const provider = new Provider('https://harbinger-api.koinos.io')
    const signer = walletConnectKoinos.getSigner(accounts[0], provider)

    // get Koin balance
    const koin = new Contract({
      // Harbinger Testnet Koin contract
      id: '1FaSvLjQJsCJKq5ybmGsMMQs8RQYyVv8ju',
      abi: utils.tokenAbi,
      signer
    })

    const { transaction } = await koin.functions.transfer(
      {
        from: signer.getAddress(),
        to: toInput.value,
        value: utils.parseUnits(amountInput.value, 8)
      },
      {
        sendTransaction: false
      }
    )

    signedTransaction.value = JSON.stringify(transaction, null, 2)
  } catch (err) {
    console.error(err)
    alert((err as Error).message)
  } finally {
    signTransactionButton.disabled = false
  }
}

connectButton.addEventListener('click', onConnect)
disconnectButton.addEventListener('click', onDisconnect)
signMessageButton.addEventListener('click', onSignMessage)
signTransactionButton.addEventListener('click', onSignTransaction)
