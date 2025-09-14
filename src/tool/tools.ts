import net from 'net'
import { MuExceptions205 } from 'src/common/MuExceptions205'
import { MD5_12_addValidate, MD5_validate, SHA256_validate } from './cryoto'

export function transposeTable(data: any[]) {
  const transposedData: any = {}
  Object.keys(data[0]).forEach((key) => {
    transposedData[key] = data.map((item) => item[key])
  })

  return transposedData
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function checkPort(server: { name: string; address: string; port: number }): Promise<{
  name: string
  address: string
  port: number
  time?: number
  error?: string
}> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now()
    const socket = net.createConnection({ host: server.address, port: server.port }, () => {
      const endTime = Date.now()
      const responseTime = endTime - startTime
      socket.destroy()
      resolve({ name: server.name, address: server.address, port: server.port, time: responseTime })
    })

    socket.on('error', (err: any) => {
      socket.destroy()
      reject({ name: server.name, address: server.address, port: server.port, error: err.message })
    })
  })
}

export function maskString(str: string) {
  const start = str.slice(0, 3)
  const end = str.slice(-4)
  const maskedStr = `${start}***${end}`

  return maskedStr
}

export function formatDate(date: Date) {
  const padZero = (num: number, size = 2) => {
    let s = String(num)
    while (s.length < size) s = '0' + s
    return s
  }

  const year = date.getFullYear()
  const month = padZero(date.getMonth() + 1) // getMonth() returns 0-11, so we add 1
  const day = padZero(date.getDate())
  const hours = padZero(date.getHours())
  const minutes = padZero(date.getMinutes())
  const seconds = padZero(date.getSeconds())
  const milliseconds = padZero(date.getMilliseconds(), 3) // 3 digits for milliseconds

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`
}

// 范围随机数
export function getRandomInt(min: number, max: number) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function validateAddress(addressInfo: { address: string; key: string; uniqueId: string }) {
  if (!MD5_12_addValidate(addressInfo.address, 'address')) return false

  if (!SHA256_validate(addressInfo.key, 'walletKey')) return false
  if (!['88asd', 'default'].includes(addressInfo.uniqueId) && !MD5_validate(addressInfo.uniqueId, 'uniqueId')) return false
  return true
}
