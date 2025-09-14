import { Request } from 'express'

export function getClientIp(req: Request): string {
  let ip: string | undefined

  // 优先取 X-Forwarded-For 的第一个有效 IP
  const forwarded = req.headers['x-forwarded-for']

  if (typeof forwarded === 'string') {
    ip = forwarded.split(',')[0].trim()
  } else if (Array.isArray(forwarded)) {
    ip = forwarded[0].trim()
  }

  // 如果没有，使用 socket 的远程地址
  ip = ip || req.socket?.remoteAddress || ''

  // 清理 IPv6 映射前缀
  return ip.replace(/^::ffff:/, '').replace(/^::1$/, '127.0.0.1')
}
