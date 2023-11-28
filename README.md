# WalletConnect Koinos SDK JS

Library to easily interact with WalletConnect compatible Koinos wallets.

Test the SDK out at https://armana-group.github.io/walletconnect-koinos-sdk-js/

## Installation:

```sh
# with npm
npm install @armana/walletconnect-koinos-sdk-js

# with yarn
yarn add @armana/walletconnect-koinos-sdk-js
```

## Read a Koin balance:

### Using as a CommonJS library

```ts
import { ChainIds, Methods, WalletConnectKoinos } from "@armana/walletconnect-koinos-sdk-js"
import { Contract, utils } from "koilib"

(async () => {
  // Get your projectId by creating a free WalletConnect cloud project at https://cloud.walletconnect.com
  const projectId = "..."

  // create WalletConnectKoinos
  const walletConnectKoinos = new WalletConnectKoinos(
    {
      projectId,
      // your application information
      metadata: {
        name: "Web3Modal",
        description: "Web3Modal",
        url: "web3modal.com",
        icons: [
          "https://walletconnect.com/_next/static/media/logo_mark.84dd8525.svg",
        ],
      },
      modalOptions: {
        explorerRecommendedWalletIds: "NONE",
        enableExplorer: false,
      },
    }
  );

  // initiate connection with a wallet
  const accounts = await walletConnectKoinos.connect(
    [ChainIds.Harbinger],
    [
      Methods.ReadContract,
    ]
  );
  console.info(accounts);

  const provider = walletConnectKoinos.getProvider()

  // get Koin balance on Mainnet
  const koin = new Contract({
    // Mainnet
    // id: "15DJN4a8SgrbGhhGksSBASiSYjGnMU8dGL",
    // Harbinger Testnet
    id: "19JntSm8pSNETT9aHTwAUHC5RMoaSmgZPJ",
    abi: utils.tokenAbi,
    provider,
  })

  // Get balance
  const { result: { value } } = await koin.functions.balanceOf({
    owner: accounts[0],
  })

  console.info(`Balance of account ${accounts[0].address} is ${utils.formatUnits(value, 8)} Koin`)

})();
```

### Using Vanilla JavaScript

```html
<html>
  <script type="module">
    import * as koilib from 'https://cdn.jsdelivr.net/npm/koilib@5.5.6/dist/koinos.min.js'
    import { ChainIds, Methods, WalletConnectKoinos } from 'https://cdn.jsdelivr.net/npm/@armana/walletconnect-koinos-sdk-js@latest/dist/walletconnect-koinos-sdk-js.mjs'

    // Get your projectId by creating a free WalletConnect cloud project at https://cloud.walletconnect.com
    const projectId = "..."

    // create WalletConnectKoinos
    const walletConnectKoinos = new WalletConnectKoinos(
      {
        projectId,
        // your application information
        metadata: {
          name: "Web3Modal",
          description: "Web3Modal",
          url: "web3modal.com",
          icons: [
            "https://walletconnect.com/_next/static/media/logo_mark.84dd8525.svg",
          ],
        },
        modalOptions: {
          explorerRecommendedWalletIds: "NONE",
          enableExplorer: false,
        },
      }
    );

    // initiate connection with a wallet
    const accounts = await walletConnectKoinos.connect(
      [ChainIds.Harbinger],
      [
        Methods.ReadContract,
      ]
    );
    console.info(accounts);

    const provider = walletConnectKoinos.getProvider()

    // get Koin balance on Mainnet
    const koin = new koilib.Contract({
      // Mainnet
      // id: "15DJN4a8SgrbGhhGksSBASiSYjGnMU8dGL",
      // Harbinger Testnet
      id: "19JntSm8pSNETT9aHTwAUHC5RMoaSmgZPJ",
      abi: utils.tokenAbi,
      provider,
    })

    // Get balance
    const { result: { value } } = await koin.functions.balanceOf({
      owner: accounts[0],
    })

    console.info(`Balance of account ${accounts[0].address} is ${koilib.utils.formatUnits(value, 8)} Koin`)
  </script>
</html>
```

## Send Koin tokens:

### Using as a CommonJS library

```ts
import { ChainIds, Methods, WalletConnectKoinos } from "@armana/walletconnect-koinos-sdk-js";
import { Contract, utils } from "koilib";

(async () => {
  // Get your projectId by creating a free WalletConnect cloud project at https://cloud.walletconnect.com
  const projectId = "..."

  // create WalletConnectKoinos
  const walletConnectKoinos = new WalletConnectKoinos(
    {
      projectId,
      // your application information
      metadata: {
        name: "Web3Modal",
        description: "Web3Modal",
        url: "web3modal.com",
        icons: [
          "https://walletconnect.com/_next/static/media/logo_mark.84dd8525.svg",
        ],
      },
      modalOptions: {
        explorerRecommendedWalletIds: "NONE",
        enableExplorer: false,
      },
    }
  );

  // initiate connection with a wallet
  const accounts = await walletConnectKoinos.connect(
    [ChainIds.Harbinger],
    [
      Methods.SignAndSendTransaction,
      Methods.PrepareTransaction,
      Methods.WaitForTransaction,
    ]
  );
  console.info(accounts);

  const signer = walletConnectKoinos.getSigner(accounts[0]);

  const koin = new Contract({
    // Mainnet
    // id: "15DJN4a8SgrbGhhGksSBASiSYjGnMU8dGL",
    // Harbinger Testnet
    id: "19JntSm8pSNETT9aHTwAUHC5RMoaSmgZPJ",
    abi: utils.tokenAbi,
    signer,
  });

  // Transfer 0.00000001 Koin
  const { transaction, receipt } = await koin.functions.transfer({
    from: signer.getAddress(),
    to: "TO_ADDR",
    value: utils.parseUnits("0.00000001", 8),
  });

  console.info("transfer receipt:", receipt);

  await transaction.wait();
  console.info("transfer successful");
})();
```

### Using Vanilla JavaScript

```html
<html>
  <script type="module">
    import * as koilib from 'https://cdn.jsdelivr.net/npm/koilib@5.5.6/dist/koinos.min.js'
    import { ChainIds, Methods, WalletConnectKoinos } from 'https://cdn.jsdelivr.net/npm/@armana/walletconnect-koinos-sdk-js@latest/dist/walletconnect-koinos-sdk-js.mjs'

    // Get your projectId by creating a free WalletConnect cloud project at https://cloud.walletconnect.com
    const projectId = "..."

    // create WalletConnectKoinos
    const walletConnectKoinos = new WalletConnectKoinos(
      {
        projectId,
        // your application information
        metadata: {
          name: "Web3Modal",
          description: "Web3Modal",
          url: "web3modal.com",
          icons: [
            "https://walletconnect.com/_next/static/media/logo_mark.84dd8525.svg",
          ],
        },
        modalOptions: {
          explorerRecommendedWalletIds: "NONE",
          enableExplorer: false,
        },
      }
    );

    // initiate connection with a wallet
    const accounts = await walletConnectKoinos.connect(
      [ChainIds.Harbinger],
      [
        Methods.SignAndSendTransaction,
        Methods.PrepareTransaction,
        Methods.WaitForTransaction,
      ]
    );
    console.info(accounts);

    const signer = walletConnectKoinos.getSigner(accounts[0]);

    const koin = new koilib.Contract({
      // Mainnet
      // id: "15DJN4a8SgrbGhhGksSBASiSYjGnMU8dGL",
      // Harbinger Testnet
      id: "19JntSm8pSNETT9aHTwAUHC5RMoaSmgZPJ",
      abi: utils.tokenAbi,
      signer,
    });

    // Transfer 0.00000001 Koin
    const { transaction, receipt } = await koin.functions.transfer({
      from: signer.getAddress(),
      to: "TO_ADDR",
      value: koilib.utils.parseUnits("0.00000001", 8),
    });

    console.info("transfer receipt:", receipt);

    await transaction.wait();
    console.info("transfer successful");
  </script>
</html>
```
