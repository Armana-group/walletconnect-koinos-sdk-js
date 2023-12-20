import { Contract, Provider, utils } from 'koilib'
import {
  ChainIds,
  LogLevel,
  Methods,
  WebWalletConnectKoinos
} from '@armana/walletconnect-koinos-sdk-js'

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

const webWalletConnectKoinos = new WebWalletConnectKoinos(
  {
    projectId,
    metadata: {
      name: 'Armana Test App',
      description: 'Armana Test App',
      url: 'https://portal.armana.io/',
      icons: ['https://portal.armana.io/favicon.png']
    },
    modalOptions: {
      explorerRecommendedWalletIds: [
        '4e21a70acc8f11aa35f87733de2fbada29a2dd08e9011d34d92522fb8ad0e3d2'
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
    accounts = await webWalletConnectKoinos.connect(
      [getNetworkSelection()],
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
    await webWalletConnectKoinos.disconnect()
  } catch (err) {
    console.error(err)
    alert((err as Error).message)
  } finally {
    disconnectButton.disabled = false
  }
}

function getNetworkSelection(): ChainIds {
  const networkSelection = (
    document.querySelector('input[name="network"]:checked') as HTMLInputElement
  )?.value
  console.log(networkSelection)

  return networkSelection === 'testnet' ? ChainIds.Harbinger : ChainIds.Mainnet
}

async function onSignMessage(): Promise<void> {
  try {
    signMessageButton.disabled = true
    const network = getNetworkSelection()

    const signer = webWalletConnectKoinos.getSigner(accounts[0], undefined, network)
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
    const network = getNetworkSelection()
    const jsonRPCUrl =
      network === ChainIds.Harbinger ? 'https://harbinger-api.koinos.io' : 'https://api.koinos.io'

    const provider = new Provider(jsonRPCUrl)
    const signer = webWalletConnectKoinos.getSigner(accounts[0], provider, network)

    const koinContractId =
      network === ChainIds.Harbinger
        ? '1FaSvLjQJsCJKq5ybmGsMMQs8RQYyVv8ju'
        : '15DJN4a8SgrbGhhGksSBASiSYjGnMU8dGL'
    console.log(network)
    // get Koin balance
    const koin = new Contract({
      id: koinContractId,
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
