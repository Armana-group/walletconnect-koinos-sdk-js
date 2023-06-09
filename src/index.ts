import { Web3ModalSign, Web3ModalSignOptions } from "@web3modal/sign-html";
import { getSdkError } from "@walletconnect/utils";
import { generateSigner } from "./signer";
import { generateProvider } from "./provider";

export enum ChainIds {
  Mainnet = "koinos:EiBZK_GGVP0H_fXVAM3j6EAuz3-B-l3e",
  Harbinger = "koinos:EiAAKqFi-puoXnuJTdn7qBGGJa8yd-dc",
}

export enum Methods {
  SignMessage = "koinos_signMessage",
  SignHash = "koinos_signHash",
  SignTransaction = "koinos_signTransaction",
  SignAndSendTransaction = "koinos_signAndSendTransaction",
  PrepareTransaction = "koinos_prepareTransaction",
  WaitForTransaction = "koinos_waitForTransaction",
  JsonRpcCall = "koinos_JsonRpcCall",
  GetNonce = "koinos_getNonce",
  GetNextNonce = "koinos_getNextNonce",
  GetAccountRc = "koinos_getAccountRc",
  GetTransactionsById = "koinos_getTransactionsById",
  GetBlocksById = "koinos_getBlocksById",
  GetHeadInfo = "koinos_getHeadInfo",
  GetChainId = "koinos_getChainId",
  GetBlocks = "koinos_getBlocks",
  GetBlock = "koinos_getBlock",
  SendTransaction = "koinos_sendTransaction",
  ReadContract = "koinos_readContract",
  SubmitBlock = "koinos_submitBlock",
}

export enum LogLevel {
  "none",
  "debug",
}

export type Options = {
  logLevel?: LogLevel;
};

export class WalletConnectKoinos {
  public web3Modal: Web3ModalSign;
  private topic: string = "";
  private chainId: string | undefined;
  private accounts: string[] = [];
  private options: Options = {
    logLevel: LogLevel.none,
  };

  constructor(web3ModalSignOptions: Web3ModalSignOptions, options?: Options) {
    if (options) {
      this.options = options;
    }
    this.web3Modal = new Web3ModalSign(web3ModalSignOptions);

    this.web3Modal.onSessionDelete((ev) => this.onSessionDelete(ev));
  }

  close() {
    this.web3Modal.offSessionDelete((ev) => this.onSessionDelete(ev));
  }

  async onSessionDelete(data: { id: number; topic: string }) {
    if (this.options.logLevel === LogLevel.debug) {
      console.log("onSessionDelete", data);
    }

    this.accounts = [];
    this.topic = "";
    this.chainId = undefined;
  }

  async connect(chains: ChainIds[], methods: Methods[]) {
    this.accounts = [];
    // check if there is an existing session
    // we want to keep only 1 session
    const sessions = await this.web3Modal.getSessions();
    let session = sessions.length ? sessions[0] : undefined;

    if (!session) {
      // open WC modal if no existing session
      session = await this.web3Modal.connect({
        requiredNamespaces: {
          koinos: {
            methods: methods,
            chains: chains,
            events: [],
          },
        },
      });
    }

    if (!session) {
      return [];
    }

    // populate the topic from the session
    this.topic = session.topic;

    // if only one chain was selected for this session, populate chainId
    if (session.namespaces.koinos.chains?.length === 1) {
      this.chainId = session.namespaces.koinos.chains[0];
    }

    const accounts: string[] = session.namespaces.koinos.accounts.reduce(
      (acc: string[], acct) => {
        const [_namespace, _chainId, address] = acct.split(":");

        if (!acc.includes(address)) {
          acc.push(address);
        }

        return acc;
      },
      []
    );

    this.accounts = accounts;
    return accounts;
  }

  async disconnect() {
    // for now, disconnect from all sessions
    const sessions = await this.web3Modal.getSessions();

    for (const session of sessions) {
      try {
        this.web3Modal.disconnect({
          topic: session.topic,
          reason: getSdkError("USER_DISCONNECTED"),
        });
      } catch (error) {
        console.error(error);
      }

      // and pairings
      if (session.pairingTopic) {
        try {
          this.web3Modal.disconnect({
            topic: session.pairingTopic,
            reason: getSdkError("USER_DISCONNECTED"),
          });
        } catch (error) {
          console.error(error);
        }
      }
    }

    this.accounts = [];
  }

  getAccounts() {
    return this.accounts;
  }

  getSigner(address: string, chainId?: ChainIds) {
    let finalChainId = chainId || this.chainId;
    if (!finalChainId) {
      throw new Error(
        "You must provide a chain id because none or several are present in this session."
      );
    }
    return generateSigner(address, finalChainId, this.topic, this.web3Modal);
  }

  getProvider(chainId?: ChainIds) {
    let finalChainId = chainId || this.chainId;
    if (!finalChainId) {
      throw new Error(
        "You must provide a chain id because none or several are present in this session."
      );
    }
    return generateProvider(finalChainId, this.topic, this.web3Modal);
  }
}
