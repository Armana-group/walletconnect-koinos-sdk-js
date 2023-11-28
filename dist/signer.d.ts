import { Signer, Provider } from 'koilib';
import { WalletConnectModalSign } from '@walletconnect/modal-sign-html';
export declare function generateSigner(address: string, chainId: string, topic: string, web3Modal: WalletConnectModalSign, provider?: Provider): Signer;
