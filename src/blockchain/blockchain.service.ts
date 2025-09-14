import { Injectable, OnModuleInit, InternalServerErrorException, Logger } from '@nestjs/common'
import axios from 'axios'

// 定义 RPC 响应的结构，以便有更好的类型提示
interface RpcResponse<T> {
  result: T
  error: {
    code: number
    message: string
  } | null
  id: number | string
}

@Injectable()
export class BlockchainService implements OnModuleInit {
  private readonly logger = new Logger(BlockchainService.name)

  // 从环境变量中读取配置
  private readonly RPC_URL: string = `http://${process.env.RPC_HOST}:${process.env.RPC_PORT}`
  private readonly RPC_USER: string = process.env.RPC_USER
  private readonly RPC_PASS: string = process.env.RPC_PASSWORD

  /**
   * Nest.js 模块初始化时执行的生命周期钩子
   * 用于检查与节点的连接是否正常
   */
  async onModuleInit() {
    try {
      this.logger.log('正在连接到区块链节点...')
      const info = await this.getBlockchainInfo()
      this.logger.log(`连接成功！当前区块高度: ${info.blocks}`)
    } catch (error) {
      this.logger.error('无法连接到区块链节点！请检查您的 .env 配置和节点状态。')
      this.logger.error(error.message)
    }
  }

  // --- 公开的 RPC 调用方法 ---

  public async getBlockchainInfo(): Promise<any> {
    return this.rpcCall('getblockchaininfo')
  }

  public async getBlockCount(): Promise<number> {
    return this.rpcCall('getblockcount')
  }

  public async getBlockHash(height: number): Promise<string> {
    return this.rpcCall('getblockhash', [height])
  }

  public async getBlock(hash: string): Promise<any> {
    // Verbosity 2 表示获取包含所有解码后交易的完整区块信息
    return this.rpcCall('getblock', [hash, 2])
  }

  public async sendRawTransaction(hex: string): Promise<string> {
    return this.rpcCall('sendrawtransaction', [hex])
  }

  public async getTransaction(txid: string): Promise<any> {
    return this.rpcCall('getrawtransaction', [txid])
  }

  public async getRawTransaction(txid: string): Promise<any> {
    // verbosity = true (or 1) 返回 JSON 格式的详细交易信息
    return this.rpcCall('getrawtransaction', [txid, true])
  }

  /**
   * 核心 RPC 调用方法 (基于您提供的逻辑)
   * @param method RPC 方法名
   * @param params RPC 参数数组
   * @returns 返回 RPC 调用的 'result' 部分
   */
  private async rpcCall<T>(method: string, params: any[] = []): Promise<T> {
    try {
      const response = await axios.post<RpcResponse<T>>(
        this.RPC_URL,
        {
          jsonrpc: '2.0',
          id: Date.now(), // 使用时间戳作为唯一ID
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

      // 检查 RPC 错误（例如，方法不存在、参数错误）
      if (response.data.error) {
        this.logger.error(`RPC 调用 '${method}' 失败: ${response.data.error.message}`)
        throw new InternalServerErrorException(`RPC Error: ${response.data.error.message} (Code: ${response.data.error.code})`)
      }

      // 成功，返回结果
      return response.data.result
    } catch (error) {
      // 捕获网络错误或认证错误等
      if (axios.isAxiosError(error)) {
        const status = error.response?.status
        const data = error.response?.data

        let errorMessage = `请求节点时发生网络错误: ${error.message}`
        if (status === 401) {
          errorMessage = 'RPC 认证失败！请检查您的 RPC_USER 和 RPC_PASSWORD。'
        } else if (data && data.error) {
          errorMessage = `RPC 节点返回错误 (HTTP ${status}): ${data.error.message}`
        } else if (status) {
          errorMessage = `RPC 节点返回 HTTP 错误: ${status} ${error.response?.statusText}`
        }

        this.logger.error(errorMessage, error.stack)
        throw new InternalServerErrorException(errorMessage)
      }

      // 其他未知错误
      this.logger.error(`RPC 调用时发生未知错误: ${error.message}`, error.stack)
      throw new InternalServerErrorException('An unknown error occurred during RPC call')
    }
  }
}
