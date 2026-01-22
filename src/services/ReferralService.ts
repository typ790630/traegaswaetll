import { radrsService } from './radrsService'
import { ChainService } from './ChainService'
import { formatEther, createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { bsc } from 'viem/chains'
import { RADRS_CONFIG, REFERRAL_ABI } from '../config/radrs'
import { publicClient } from './radrsService'

export interface ReferralData {
  referrer: string | null
  inviteCode: string
  totalRewards: string
  totalCommissions: string
  inviteCount: number
  invitees: Array<{
    wallet: string
    bindTime: number
  }>
  isRewardClaimed: boolean
}

export const ReferralService = {
  // Get user referral data (Read from Chain)
  getData: async (address: string): Promise<ReferralData> => {
    const referrer = await radrsService.getReferrer(address)
    const inviteCount = await radrsService.getInviteCount(address)
    const totalRewards = await radrsService.getTotalRewardsEarned(address)
    const isRewardClaimed = await radrsService.rewardClaimed(address)
    const invitees = await radrsService.getInvitees(address)
    const totalCommissions = await radrsService.getTotalCommissions(address)
    
    // Check if referrer is the zero address (not bound)
    const hasReferrer = referrer !== '0x0000000000000000000000000000000000000000'

    return {
      referrer: hasReferrer ? referrer : null,
      inviteCode: address,
      totalRewards,
      totalCommissions,
      inviteCount,
      invitees,
      isRewardClaimed
    }
  },

  // Get user balance (Read from Chain)
  getBalance: async (address: string): Promise<number> => {
    // Check RADRS token balance
    const balance = await ChainService.getErc20Balance('0xe2188a2e0a41a50f09359e5fe714d5e643036f2a', address)
    return parseFloat(balance)
  },

  // Bind Referrer Transaction (Write to Chain via EOA)
  // ⚡ Pure EOA: User pays gas with BNB
  bindReferrer: async (privateKey: string, referrerAddress: string): Promise<{ success: boolean, txHash?: string, error?: string }> => {
    try {
      console.log('[ReferralService] 🔐 Binding referrer with EOA...')
      
      // 创建 EOA 账户
      const account = privateKeyToAccount(privateKey as `0x${string}`)
      console.log(`[ReferralService] Account: ${account.address}`)
      
      // 创建 Wallet Client
      const walletClient = createWalletClient({
        account,
        chain: bsc,
        transport: http(RADRS_CONFIG.rpcUrl)
      })
      
      // 调用 bindReferrer 函数
      const txHash = await walletClient.writeContract({
        address: RADRS_CONFIG.referralRegistryAddress as `0x${string}`,
        abi: REFERRAL_ABI,
        functionName: 'bindReferrer',
        args: [referrerAddress as `0x${string}`]
      })
      
      console.log(`[ReferralService] ✅ Transaction sent: ${txHash}`)
      
      // 等待确认
      const receipt = await publicClient.waitForTransactionReceipt({ 
        hash: txHash,
        confirmations: 1
      })
      
      console.log(`[ReferralService] ✅ Transaction confirmed: ${receipt.status}`)
      
      return { 
        success: receipt.status === 'success', 
        txHash
      }
    } catch (error: any) {
      console.error("[ReferralService] ❌ Bind referrer failed", error)
      return { success: false, error: error.message || "Transaction failed" }
    }
  },

  // Claim Reward Transaction (Write to Chain via EOA)
  // ⚡ Pure EOA: User pays gas with BNB
  claimReward: async (privateKey: string): Promise<{ success: boolean, txHash?: string, error?: string }> => {
    try {
      console.log('[ReferralService] 🎁 Claiming reward with EOA...')
      
      // 创建 EOA 账户
      const account = privateKeyToAccount(privateKey as `0x${string}`)
      console.log(`[ReferralService] Account: ${account.address}`)
      
      // 创建 Wallet Client
      const walletClient = createWalletClient({
        account,
        chain: bsc,
        transport: http(RADRS_CONFIG.rpcUrl)
      })
      
      // 调用 claimReward 函数
      const txHash = await walletClient.writeContract({
        address: RADRS_CONFIG.referralRegistryAddress as `0x${string}`,
        abi: REFERRAL_ABI,
        functionName: 'claimReward',
        args: []
      })
      
      console.log(`[ReferralService] ✅ Transaction sent: ${txHash}`)
      
      // 等待确认
      const receipt = await publicClient.waitForTransactionReceipt({ 
        hash: txHash,
        confirmations: 1
      })
      
      console.log(`[ReferralService] ✅ Transaction confirmed: ${receipt.status}`)

      return { 
        success: receipt.status === 'success', 
        txHash 
      }
    } catch (error: any) {
      console.error("[ReferralService] ❌ Claim reward failed", error)
      return { success: false, error: error.message || "Transaction failed" }
    }
  }
}

