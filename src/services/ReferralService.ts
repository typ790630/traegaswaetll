import { AAService } from './AAService'
import { radrsService } from './radrsService'
import { ChainService } from './ChainService'
import { formatEther } from 'viem'

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

  // Bind Referrer Transaction (Write to Chain via AA)
  // Uses Paymaster to sponsor gas
  bindReferrer: async (privateKey: string, referrerAddress: string): Promise<{ success: boolean, txHash?: string, error?: string }> => {
    try {
      const signer = AAService.getSigner(privateKey as `0x${string}`)
      const txHash = await AAService.bindReferrer(signer, referrerAddress)
      
      return { 
        success: true, 
        txHash
      }
    } catch (error: any) {
      console.error("Bind referrer failed", error)
      return { success: false, error: error.message || "Transaction failed" }
    }
  },

  // Claim Reward Transaction (Write to Chain via AA)
  // Uses Paymaster to sponsor gas and transfer tokens
  claimReward: async (privateKey: string): Promise<{ success: boolean, txHash?: string, error?: string }> => {
    try {
      const signer = AAService.getSigner(privateKey as `0x${string}`)
      const txHash = await AAService.claimReward(signer)

      return { 
        success: true, 
        txHash 
      }
    } catch (error: any) {
      console.error("Claim reward failed", error)
      return { success: false, error: error.message || "Transaction failed" }
    }
  }
}

