import Client from '@walletconnect/sign-client';
import { SignClientTypes } from '@walletconnect/types';
import { Provider, Signer } from 'koilib';
import { Options, ChainIds, Methods } from '.';
export declare class NodeWalletConnectKoinos {
    signClient?: Client;
    private topic;
    private chainId;
    private accounts;
    private options;
    init(signClientOptions: SignClientTypes.Options, options?: Options): Promise<void>;
    close(): Promise<void>;
    private onSessionDelete;
    private checkIfInitialized;
    connect(chains: ChainIds[], methods: Methods[]): Promise<string[]>;
    disconnect(): Promise<void>;
    getAccounts(): string[];
    getSigner(address: string, provider?: Provider, chainId?: ChainIds): Signer;
    getProvider(chainId?: ChainIds): Provider;
}
