import { ChainIds, Methods, NodeWalletConnectKoinos } from '../'
require('dotenv').config({ path: __dirname + '/../.env.local' })

async function main(): Promise<void> {
  const nodeWalletConnectKoinos = new NodeWalletConnectKoinos()
  try {
    await nodeWalletConnectKoinos.init({
      projectId: process.env.VITE_WALLET_CONNECT_PROJECT_ID,
      metadata: {
        name: 'Web3Modal',
        description: 'Web3Modal',
        url: 'web3modal.com',
        icons: ['https://walletconnect.com/_next/static/media/logo_mark.84dd8525.svg']
      }
    })

    const accounts = await nodeWalletConnectKoinos.connect(
      [ChainIds.Harbinger],
      [Methods.SignMessage, Methods.SignTransaction]
    )

    console.log('accounts', accounts)

    if (accounts.length) {
      const signer = nodeWalletConnectKoinos.getSigner(accounts[0])

      const signature = await signer.signMessage('Hello, Koinos!')
      console.log(signature)
    }
  } catch (error) {
    console.log(error)
  } finally {
    console.log('closing connection...')

    await nodeWalletConnectKoinos.close()
  }
}

main().catch((error) => console.log(error))
