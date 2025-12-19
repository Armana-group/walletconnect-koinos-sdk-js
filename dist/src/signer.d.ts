import { Signer, Provider } from 'koilib';
import { ISignClient } from '@walletconnect/types';
export declare function generateSigner(address: string, chainId: string, topic: string, signClient: ISignClient, provider?: Provider): Signer;
