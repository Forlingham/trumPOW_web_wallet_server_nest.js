import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

interface CacheData {
  data: any;
  expireAt: number;
}

@Injectable()
export class CacheService {
  private cacheDir: string;

  constructor() {
    this.cacheDir = path.join(process.cwd(), 'cache');
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  // 设置缓存
  async set(key: string, data: any, ttlSeconds?: number): Promise<void> {
    const cacheData: CacheData = {
      data,
      expireAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : Number.MAX_SAFE_INTEGER
    };

    const filePath = path.join(this.cacheDir, `${key}.json`);
    await fs.promises.writeFile(filePath, JSON.stringify(cacheData));
  }

  // 获取缓存
  async get<T>(key: string): Promise<T | null> {
    try {
      const filePath = path.join(this.cacheDir, `${key}.json`);
      const content = await fs.promises.readFile(filePath, 'utf-8');
      const cacheData: CacheData = JSON.parse(content);

      // 检查是否过期
      if (Date.now() > cacheData.expireAt) {
        await fs.promises.unlink(filePath);
        return null;
      }

      return cacheData.data as T;
    } catch (error) {
      return null;
    }
  }

  // 删除缓存
  async delete(key: string): Promise<void> {
    try {
      const filePath = path.join(this.cacheDir, `${key}.json`);
      await fs.promises.unlink(filePath);
    } catch (error) {
      // 如果文件不存在，忽略错误
    }
  }
}