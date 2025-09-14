import { Injectable } from '@nestjs/common'
import axios from 'axios'

@Injectable()
export class ScashService {
  public RPC_URL: string = 'http://' + process.env.RPC_HOST + ':' + process.env.RPC_PORT // SCASH节点RPC地址
  public RPC_USER: string = process.env.RPC_USER
  public RPC_PASS: string = process.env.RPC_PASSWORD

  async rpcPost(method: string, params: any[]) {
    try {
      const rpcResponse = await axios.post(
        this.RPC_URL,
        {
          jsonrpc: '2.0',
          id: 1,
          method: method,
          params: params
        },
        {
          auth: {
            username: this.RPC_USER,
            password: this.RPC_PASS
          }
        }
      )

      if (rpcResponse.data.error) {
        return {
          success: false,
          error: 'RPC调用错误: ' + rpcResponse.data.error.message
        }
      }

      return {
        success: true,
        rpcData: rpcResponse.data.result
      }
    } catch (error) {
      return {
        success: false,
        error: error.response.data
      }
    }
  }

  async getblockchaininfo() {
    try {
      const rpcResponse = await this.rpcPost('getblockchaininfo', [])
      if (rpcResponse.success) {
        return {
          success: true,
          rpcData: rpcResponse.rpcData
        }
      } else {
        return {
          success: false,
          error: rpcResponse.error
        }
      }
    } catch (error) {
      return {
        success: false,
        error: '获取区块链信息时发生错误: ' + error.message
      }
    }
  }

    async gettransaction(txid: string) {
    try {
      const rpcResponse = await this.rpcPost('getrawtransaction', [txid])
      if (rpcResponse.success) {
        return {
          success: true,
          rpcData: rpcResponse.rpcData
        }
      } else {
        return {
          success: false,
          error: rpcResponse.error
        }
      }
    } catch (error) {
      return {
        success: false,
        error: '获取交易信息时发生错误: ' + error.message
      }
    }
  }

  async getrawtransaction(txid: string) {
    try {
      const rpcResponse = await this.rpcPost('getrawtransaction', [txid, true])
      if (rpcResponse.success) {
        return {
          success: true,
          rpcData: rpcResponse.rpcData
        }
      } else {
        return {
          success: false,
          error: rpcResponse.error
        }
      }
    } catch (error) {
      return {
        success: false,
        error: '获取交易信息时发生错误: ' + error.message
      }
    }
  }

  async scantxoutset(address: string) {
    try {
      const rpcResponse = await this.rpcPost('scantxoutset', ['start', [{ desc: `addr(${address})` }]])
      if (rpcResponse.success) {
        return {
          success: true,
          rpcData: rpcResponse.rpcData
        }
      } else {
        return {
          success: false,
          error: rpcResponse.error
        }
      }
    } catch (error) {
      return {
        success: false,
        error: '查询可用的交易时发生错误: ' + error.message
      }
    }
  }

  async estimatesmartfee() {
    try {
      const rpcResponse = await this.rpcPost('estimatesmartfee', [30])
      if (rpcResponse.success) {
        return {
          success: true,
          rpcData: rpcResponse.rpcData
        }
      } else {
        return {
          success: false,
          error: rpcResponse.error
        }
      }
    } catch (error) {
      return {
        success: false,
        error: '获取智能手续费失败: ' + error.message
      }
    }
  }

  async broadcast(rawtx: string) {
    try {
      const rpcResponse = await this.rpcPost('sendrawtransaction', [rawtx])
      if (rpcResponse.success) {
        return {
          success: true,
          rpcData: { txid: rpcResponse.rpcData }
        }
      } else {
        return {
          success: false,
          error: rpcResponse.error
        }
      }
    } catch (error) {
      return {
        success: false,
        error: '广播交易时发生错误: ' + error.message
      }
    }
  }
}
