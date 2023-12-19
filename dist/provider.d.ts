import { Provider } from 'koilib';
import { ISignClient } from '@walletconnect/types';
export declare function generateProvider(chainId: string, topic: string, signClient: ISignClient): Provider;
