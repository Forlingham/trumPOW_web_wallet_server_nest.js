declare namespace NodeJS {
  interface ProcessEnv {
    DATABASE_URL: string
    TOKEN_SECRET: string
    NODE_ENV: string
    IS_DEBUG: string
    IS_DATABASE_DEBUG: string
    AES_KEY: string
    AES_WEB_KEY: string
    MD5_KEY: string
  }
}

// 游戏类型
type GAME_TYPE = 'coin tossing'
