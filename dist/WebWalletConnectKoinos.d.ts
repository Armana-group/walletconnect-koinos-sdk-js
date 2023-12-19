import { WalletConnectModalSign, WalletConnectModalSignOptions } from '@walletconnect/modal-sign-html';
import { Provider, Signer } from 'koilib';
import { Options, ChainIds, Methods } from '.';
export declare class WebWalletConnectKoinos {
    web3Modal: WalletConnectModalSign;
    private topic;
    private chainId;
    private accounts;
    private options;
    constructor(WalletConnectModalSignOptions: WalletConnectModalSignOptions, options?: Options);
    close(): void;
    private onSessionDelete;
    connect(chains: ChainIds[], methods: Methods[]): Promise<string[]>;
    disconnect(): Promise<void>;
    getAccounts(): string[];
    getSigner(address: string, provider?: Provider, chainId?: ChainIds): Signer;
    getProvider(chainId?: ChainIds): Provider;
}
