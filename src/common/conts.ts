export const BASE_COIN_ID = '7f8b78e7a3ad496c2c6be1e593081f9114b1'

// 每个区块奖励
export const BLOCK_REWARD = 5787

// 挖矿总数
export const MINING_AMOUNT = '1250000000'
// 空投总数
export const AIRDROP_AMOUNT = '500000000'
// 推广总数
export const SPREAD_AMOUNT = '250000000'

// 奖励百分比
export const RELATIVE_REWARD_PERCENT = 0.25

// 邀请码奖励
export const INVITE_CODE_REWARD = 2333

// discord 社区领空投奖励
export const DISCORD_AIRDROP_REWARD = 6666

// 钱包签到奖励,随机范围
export const WALLET_SIGN_REWARD = [1000, 3000]

// 硬币游戏奖励
export const COIN_GAME_REWARD = [900, 2500]

// 支付类型
export enum PAY_TYPE_ENUM {
  // 挖矿所得
  'CPU mining' = 1,
  'GPU mining' = 2,
  // 邀请码奖励
  'Invite code reward' = 3,
  // 下面的人挖矿奖励
  'LV1 CPU mining reward' = 4,
  'LV1 GPU mining reward' = 5,
  'LV2 CPU mining reward' = 6,
  'LV2 GPU mining reward' = 7,

  // discord 社区领空投奖励
  'Discord airdrop reward' = 8,
  'LV1 Discord airdrop reward' = 9,
  'LV2 Discord airdrop reward' = 10,

  // 提取到链上
  'Withdraw' = 11,

  // 钱包签到
  'WalletSign' = 12,
  'LV1 WalletSign' = 13,
  'LV2 WalletSign' = 14,

  // 参加特推活动
  'Twitter Activity' = 15,
  'LV1 Twitter Activity' = 16,
  'LV2 Twitter Activity' = 17,

  // 参与游戏活动
  'Game Activity' = 18,
  'LV1 Game Activity' = 19,
  'LV2 Game Activity' = 20,

  // 绑定discordID
  'BindDiscordId' = 21,
  // 解除绑定discordID
  'UnBindDiscordId' = 22
}

export class PAY_TYPE_GROUP {
  static LV1 = [
    PAY_TYPE_ENUM['LV1 CPU mining reward'],
    PAY_TYPE_ENUM['LV1 GPU mining reward'],
    PAY_TYPE_ENUM['LV1 Discord airdrop reward'],
    PAY_TYPE_ENUM['LV1 WalletSign'],
    PAY_TYPE_ENUM['LV1 Twitter Activity']
  ]
  static LV2 = [
    PAY_TYPE_ENUM['LV2 CPU mining reward'],
    PAY_TYPE_ENUM['LV2 GPU mining reward'],
    PAY_TYPE_ENUM['LV2 Discord airdrop reward'],
    PAY_TYPE_ENUM['LV2 WalletSign'],
    PAY_TYPE_ENUM['LV2 Twitter Activity']
  ]
  static LV_ALL = [...PAY_TYPE_GROUP.LV1, ...PAY_TYPE_GROUP.LV2]

  // 挖矿产出的
  static MINING = [PAY_TYPE_ENUM['CPU mining'], PAY_TYPE_ENUM['GPU mining']]

  // 空投产出
  static AIRDROP = [
    PAY_TYPE_ENUM['Discord airdrop reward'],
    PAY_TYPE_ENUM['Invite code reward'],
    PAY_TYPE_ENUM['WalletSign'],
    PAY_TYPE_ENUM['Twitter Activity']
  ]
}
