import { Web3ModalSign } from '@web3modal/sign-html'
import { Provider, interfaces } from 'koilib'
import { Methods } from '.'

export function generateProvider(
  chainId: string,
  topic: string,
  web3Modal: Web3ModalSign
): Provider {
  return {
    async call<T = unknown>(method: string, params: unknown): Promise<T> {
      const result = await web3Modal.request<T>({
        chainId,
        topic,
        request: {
          method: Methods.JsonRpcCall,
          params: {
            method,
            params
          }
        }
      })

      return result
    },

    async getNonce(address: string): Promise<number> {
      const result = await web3Modal.request<number>({
        chainId,
        topic,
        request: {
          method: Methods.GetNonce,
          params: {
            address
          }
        }
      })

      return result
    },

    async getNextNonce(address: string): Promise<string> {
      const result = await web3Modal.request<string>({
        chainId,
        topic,
        request: {
          method: Methods.GetNextNonce,
          params: {
            address
          }
        }
      })

      return result
    },

    async getAccountRc(address: string): Promise<string> {
      const result = await web3Modal.request<string>({
        chainId,
        topic,
        request: {
          method: Methods.GetAccountRc,
          params: {
            address
          }
        }
      })

      return result
    },

    async getTransactionsById(transactionIds: string[]): Promise<{
      transactions: {
        transaction: interfaces.TransactionJson
        containing_blocks: string[]
      }[]
    }> {
      const result = await web3Modal.request<{
        transactions: {
          transaction: interfaces.TransactionJson
          containing_blocks: string[]
        }[]
      }>({
        chainId,
        topic,
        request: {
          method: Methods.GetTransactionsById,
          params: {
            transactionIds
          }
        }
      })

      return result
    },

    async getBlocksById(blockIds: string[]): Promise<{
      block_items: {
        block_id: string
        block_height: string
        block: interfaces.BlockJson
      }[]
    }> {
      const result = await web3Modal.request<{
        block_items: {
          block_id: string
          block_height: string
          block: interfaces.BlockJson
        }[]
      }>({
        chainId,
        topic,
        request: {
          method: Methods.GetBlocksById,
          params: {
            blockIds
          }
        }
      })

      return result
    },

    async getHeadInfo(): Promise<{
      head_block_time: string
      head_topology: {
        id: string
        height: string
        previous: string
      }
      head_state_merkle_root: string
      last_irreversible_block: string
    }> {
      const result = await web3Modal.request<{
        head_block_time: string
        head_topology: {
          id: string
          height: string
          previous: string
        }
        head_state_merkle_root: string
        last_irreversible_block: string
      }>({
        chainId,
        topic,
        request: {
          method: Methods.GetHeadInfo,
          params: {}
        }
      })

      return result
    },

    async getChainId(): Promise<string> {
      const result = await web3Modal.request<string>({
        chainId,
        topic,
        request: {
          method: Methods.GetChainId,
          params: {}
        }
      })

      return result
    },

    async getBlocks(
      height: number,
      numBlocks = 1,
      idRef?: string
    ): Promise<
      {
        block_id: string
        block_height: string
        block: interfaces.BlockJson
        block_receipt: {
          [x: string]: unknown
        }
      }[]
    > {
      const result = await web3Modal.request<
        {
          block_id: string
          block_height: string
          block: interfaces.BlockJson
          block_receipt: {
            [x: string]: unknown
          }
        }[]
      >({
        chainId,
        topic,
        request: {
          method: Methods.GetBlocks,
          params: {
            height,
            numBlocks,
            idRef
          }
        }
      })

      return result
    },

    async getBlock(height: number): Promise<{
      block_id: string
      block_height: string
      block: interfaces.BlockJson
      block_receipt: {
        [x: string]: unknown
      }
    }> {
      const result = await web3Modal.request<{
        block_id: string
        block_height: string
        block: interfaces.BlockJson
        block_receipt: {
          [x: string]: unknown
        }
      }>({
        chainId,
        topic,
        request: {
          method: Methods.GetBlock,
          params: {
            height
          }
        }
      })

      return result
    },

    async wait(
      transactionId: string,
      type: 'byTransactionId' | 'byBlock' = 'byBlock',
      timeout = 30000
    ): Promise<{ blockId: string; blockNumber?: number }> {
      const waitResult = await web3Modal.request<{
        blockId: string
        blockNumber?: number
      }>({
        chainId,
        topic,
        request: {
          method: Methods.WaitForTransaction,
          params: {
            transactionId,
            type,
            timeout
          }
        }
      })

      return waitResult
    },

    async sendTransaction(
      transaction: interfaces.TransactionJson,
      broadcast = true
    ): Promise<interfaces.TransactionJson> {
      const result = await web3Modal.request<interfaces.TransactionJsonWait>({
        chainId,
        topic,
        request: {
          method: Methods.SendTransaction,
          params: {
            transaction,
            broadcast
          }
        }
      })

      result.wait = async (
        type: 'byTransactionId' | 'byBlock' = 'byBlock',
        timeout = 60000
      ): Promise<{ blockId: string; blockNumber?: number | undefined }> => {
        const waitResult = await web3Modal.request<{
          blockId: string
          blockNumber?: number
        }>({
          chainId,
          topic,
          request: {
            method: Methods.WaitForTransaction,
            params: {
              transactionId: result.id,
              type,
              timeout
            }
          }
        })

        return waitResult
      }

      return result
    },

    async readContract(operation: interfaces.CallContractOperationJson): Promise<{
      result: string
      logs: string
    }> {
      const result = await web3Modal.request<{
        result: string
        logs: string
      }>({
        chainId,
        topic,
        request: {
          method: Methods.ReadContract,
          params: {
            operation
          }
        }
      })

      return result
    },

    async submitBlock(block: interfaces.BlockJson): Promise<Record<string, never>> {
      const result = await web3Modal.request<Record<string, never>>({
        chainId,
        topic,
        request: {
          method: Methods.SubmitBlock,
          params: {
            block
          }
        }
      })

      return result
    }
  } as Provider
}
