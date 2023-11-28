import { WalletConnectModalSign, WalletConnectModalSignOptions } from '@walletconnect/modal-sign-html';
import { Provider, Signer } from 'koilib';
export declare enum ChainIds {
    Mainnet = "koinos:EiBZK_GGVP0H_fXVAM3j6EAuz3-B-l3e",
    Harbinger = "koinos:EiBncD4pKRIQWco_WRqo5Q-xnXR7JuO3"
}
export declare enum Methods {
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
    SubmitBlock = "koinos_submitBlock"
}
export declare enum LogLevel {
    'none' = 0,
    'debug' = 1
}
export type Options = {
    logLevel?: LogLevel;
};
export declare class WalletConnectKoinos {
    web3Modal: WalletConnectModalSign;
    private topic;
    private chainId;
    private accounts;
    private options;
    constructor(WalletConnectModalSignOptions: WalletConnectModalSignOptions, options?: Options);
    close(): void;
    onSessionDelete(data: {
        id: number;
        topic: string;
    }): Promise<void>;
    connect(chains: ChainIds[], methods: Methods[]): Promise<string[]>;
    disconnect(): Promise<void>;
    getAccounts(): string[];
    getSigner(address: string, provider?: Provider, chainId?: ChainIds): Signer;
    getProvider(chainId?: ChainIds): Provider;
}
