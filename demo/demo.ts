import { Contract, utils } from 'koilib'
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

const signSendTransactionButton = document.getElementById(
  'sign-send-transaction-button'
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
      name: 'Web3Modal',
      description: 'Web3Modal',
      url: 'web3modal.com',
      icons: ['https://walletconnect.com/_next/static/media/logo_mark.84dd8525.svg']
    },
    modalOptions: {
      explorerRecommendedWalletIds: 'NONE',
      enableExplorer: false
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
      [
        Methods.SignMessage,
        Methods.SignTransaction,
        Methods.SignAndSendTransaction,
        Methods.PrepareTransaction,
        Methods.WaitForTransaction
      ]
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
    const signer = walletConnectKoinos.getSigner(accounts[0])

    // get Koin balance
    const koin = new Contract({
      // Harbinger Testnet Koin contract
      id: '19JntSm8pSNETT9aHTwAUHC5RMoaSmgZPJ',
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

async function onSignAndSendTransaction(): Promise<void> {
  try {
    signSendTransactionButton.disabled = true
    const signer = walletConnectKoinos.getSigner(accounts[0])

    const koin = new Contract({
      // Harbinger Testnet Koin contract
      id: '19JntSm8pSNETT9aHTwAUHC5RMoaSmgZPJ',
      abi: utils.tokenAbi,
      signer
    })

    const result = await koin.functions.transfer({
      from: signer.getAddress(),
      to: toInput.value,
      value: utils.parseUnits(amountInput.value, 8)
    })

    await result.transaction?.wait()

    signedTransaction.value = JSON.stringify(result, null, 2)
    alert(`successfully sent ${amountInput.value} tKoin to ${toInput.value}`)
  } catch (err) {
    console.error(err)
    alert((err as Error).message)
  } finally {
    signSendTransactionButton.disabled = false
  }
}

connectButton.addEventListener('click', onConnect)
disconnectButton.addEventListener('click', onDisconnect)
signMessageButton.addEventListener('click', onSignMessage)
signTransactionButton.addEventListener('click', onSignTransaction)
signSendTransactionButton.addEventListener('click', onSignAndSendTransaction)
