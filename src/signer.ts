import { Signer, utils, interfaces, Provider } from 'koilib'
import { Methods } from './index'
import { generateProvider } from './provider'
import { ISignClient } from '@walletconnect/types'

export function generateSigner(
  address: string,
  chainId: string,
  topic: string,
  signClient: ISignClient,
  provider?: Provider
): Signer {
  const finalProvider = provider || generateProvider(chainId, topic, signClient)

  return {
    provider: finalProvider,

    getAddress: () => address,

    getPrivateKey: (): string => {
      throw new Error('not implemented')
    },

    signHash: async (hash: Uint8Array): Promise<Uint8Array> => {
      const result = await signClient.request<string>({
        chainId,
        topic,
        request: {
          method: Methods.SignHash,
          params: {
            address,
            hash: utils.encodeBase64(hash)
          }
        }
      })

      return utils.decodeBase64(result)
    },

    signMessage: async (message: string): Promise<Uint8Array> => {
      const result = await signClient.request<string>({
        chainId,
        topic,
        request: {
          method: Methods.SignMessage,
          params: {
            address,
            message
          }
        }
      })

      return utils.decodeBase64(result)
    },

    prepareTransaction: async (
      transaction: interfaces.TransactionJson
    ): Promise<interfaces.TransactionJson> => {
      if (provider) {
        const dummySigner = Signer.fromSeed('dummy_signer')
        dummySigner.provider = provider

        if (!transaction.header?.payer) {
          transaction.header = {
            ...transaction.header,
            payer: address
          }
        }

        return dummySigner.prepareTransaction(transaction)
      } else {
        const result = await signClient.request<interfaces.TransactionJson>({
          chainId,
          topic,
          request: {
            method: Methods.PrepareTransaction,
            params: {
              address,
              transaction
            }
          }
        })

        return result
      }
    },

    signTransaction: async (
      transaction: interfaces.TransactionJson,
      abis?: interfaces.SendTransactionOptions['abis']
    ): Promise<interfaces.TransactionJson> => {
      const result = await signClient.request<interfaces.TransactionJson>({
        chainId,
        topic,
        request: {
          method: Methods.SignTransaction,
          params: {
            address,
            transaction,
            options: {
              abis
            }
          }
        }
      })

      return result
    },

    sendTransaction: async (
      transaction: interfaces.TransactionJson,
      options?: interfaces.SendTransactionOptions
    ): Promise<{
      receipt: interfaces.TransactionReceipt
      transaction: interfaces.TransactionJsonWait
    }> => {
      const result = await signClient.request<{
        receipt: interfaces.TransactionReceipt
        transaction: interfaces.TransactionJsonWait
      }>({
        chainId,
        topic,
        request: {
          method: Methods.SignAndSendTransaction,
          params: {
            address,
            transaction,
            options
          }
        }
      })

      result.transaction.wait = async (
        type: 'byTransactionId' | 'byBlock' = 'byBlock',
        timeout = 60000
      ): Promise<{
        blockId: string
        blockNumber?: number
      }> => {
        const waitResult = await signClient.request<{
          blockId: string
          blockNumber?: number
        }>({
          chainId,
          topic,
          request: {
            method: Methods.WaitForTransaction,
            params: {
              transactionId: result.transaction.id,
              type,
              timeout
            }
          }
        })

        return waitResult
      }

      return result
    },

    prepareBlock: (): Promise<interfaces.BlockJson> => {
      throw new Error('not implemented')
    },

    signBlock: (): Promise<interfaces.BlockJson> => {
      throw new Error('not implemented')
    }
  } as unknown as Signer
}
