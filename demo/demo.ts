import { utils } from "koilib";
import { ChainIds, LogLevel, Methods, WalletConnectKoinos } from "../";

const connectButton = document.getElementById(
  "connect-button"
) as HTMLButtonElement;

const disconnectButton = document.getElementById(
  "disconnect-button"
) as HTMLButtonElement;

const accountsInfo = document.getElementById(
  "accounts-info"
) as HTMLTextAreaElement;

const signMessageButton = document.getElementById(
  "sign-message-button"
) as HTMLButtonElement;

const messageInput = document.getElementById("message") as HTMLInputElement;

const messageSignatureInput = document.getElementById(
  "message-signature"
) as HTMLInputElement;

const projectId = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID;
if (!projectId) {
  throw new Error(
    "You need to provide VITE_WALLET_CONNECT_PROJECT_ID env variable"
  );
}

const walletConnectKoinos = new WalletConnectKoinos(
  {
    projectId,
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
  },
  {
    logLevel: LogLevel.debug,
  }
);

let accounts: string[] = [];

async function onConnect() {
  try {
    connectButton.disabled = true;
    accounts = await walletConnectKoinos.connect(
      [ChainIds.Harbinger],
      [Methods.SignMessage]
    );
    console.info(accounts);
    accountsInfo.value = JSON.stringify(accounts, null, 2);
  } catch (err) {
    console.error(err);
  } finally {
    connectButton.disabled = false;
  }
}

async function onDisconnect() {
  try {
    disconnectButton.disabled = true;
    await walletConnectKoinos.disconnect();
  } catch (err) {
    console.error(err);
  } finally {
    disconnectButton.disabled = false;
  }
}

async function onSignMessage() {
  try {
    signMessageButton.disabled = true;
    const signer = walletConnectKoinos.getSigner(accounts[0]);
    const signature = await signer.signMessage(messageInput.value);
    messageSignatureInput.value = utils.encodeBase64url(signature);
  } catch (err) {
    console.error(err);
  } finally {
    signMessageButton.disabled = false;
  }
}

connectButton.addEventListener("click", onConnect);
disconnectButton.addEventListener("click", onDisconnect);
signMessageButton.addEventListener("click", onSignMessage);
