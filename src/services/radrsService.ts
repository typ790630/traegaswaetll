import { createPublicClient, http, formatEther, fallback } from 'viem'
import { bsc } from 'viem/chains'
import { RADRS_CONFIG, PAYMASTER_ABI, REFERRAL_ABI } from '../config/radrs'

export const publicClient = createPublicClient({
  chain: bsc,
  transport: fallback(
    RADRS_CONFIG.rpcUrls.map(url => http(url))
  ),
  pollingInterval: 4_000, 
})

export const radrsService = {
  // Paymaster Functions
  /**
   * Checks if the account is activated in the Paymaster.
   * @param address - The AA wallet address to check.
   */
  async isActivated(address: string): Promise<boolean> {
    try {
      // For mock addresses, we can return false (simulating new user)
      if (!address.startsWith('0x') || address.length !== 42) return false
      
      const isActivated = await publicClient.readContract({
        address: RADRS_CONFIG.paymasterAddress as `0x${string}`,
        abi: PAYMASTER_ABI,
        functionName: 'isActivated',
        args: [address as `0x${string}`]
      })
      return isActivated
    } catch (error) {
      console.error('Failed to check activation status:', error)
      return false // Default to not activated (free first tx)
    }
  },

  /**
   * Gets total commissions earned by a referrer (Gas Fee Rebate).
   * @param referrer - The AA wallet address of the referrer.
   */
  async getTotalCommissions(referrer: string): Promise<string> {
    try {
        if (!referrer.startsWith('0x') || referrer.length !== 42) return '0'
        const commissions = await publicClient.readContract({
            address: RADRS_CONFIG.paymasterAddress as `0x${string}`,
            abi: PAYMASTER_ABI,
            functionName: 'totalCommissions',
            args: [referrer as `0x${string}`]
        })
        return formatEther(commissions)
    } catch (error) {
        console.error('Failed to get total commissions:', error)
        return '0'
    }
  },
  /**
   * Calculates the expected RADRS charge for a transaction.
   * @param gasCostWei - The gas cost in wei.
   * @param sender - The AA wallet address sending the transaction.
   */
  async getExpectedRadrsCharge(gasCostWei: bigint, sender: string): Promise<string> {
    try {
      if (!sender.startsWith('0x') || sender.length !== 42) return '0'

      const radrsFee = await publicClient.readContract({
        address: RADRS_CONFIG.paymasterAddress as `0x${string}`,
        abi: PAYMASTER_ABI,
        functionName: 'getExpectedRadrsCharge',
        args: [gasCostWei, sender as `0x${string}`]
      })
      return formatEther(radrsFee)
    } catch (error) {
      console.error('Failed to estimate RADRS charge:', error)
      return '0'
    }
  },

  // Referral Functions
  /**
   * Gets the referrer of the given address.
   * @param address - The AA wallet address to check.
   */
  async getReferrer(address: string): Promise<string> {
    try {
        if (!address.startsWith('0x') || address.length !== 42) return '0x0000000000000000000000000000000000000000'
        const referrer = await publicClient.readContract({
            address: RADRS_CONFIG.referralRegistryAddress as `0x${string}`,
            abi: REFERRAL_ABI,
            functionName: 'getReferrer',
            args: [address as `0x${string}`]
        })
        return referrer
    } catch (error) {
        return '0x0000000000000000000000000000000000000000'
    }
  },

  /**
   * Gets the invite count of the given address.
   * @param address - The AA wallet address (referrer).
   */
  async getInviteCount(address: string): Promise<number> {
    try {
        if (!address.startsWith('0x') || address.length !== 42) return 0
        const count = await publicClient.readContract({
            address: RADRS_CONFIG.referralRegistryAddress as `0x${string}`,
            abi: REFERRAL_ABI,
            functionName: 'getInviteCount',
            args: [address as `0x${string}`]
        })
        return Number(count)
    } catch (error) {
        return 0
    }
  },

  /**
   * Checks if the reward has been claimed by the address.
   * @param address - The AA wallet address to check.
   */
  async rewardClaimed(address: string): Promise<boolean> {
    try {
        if (!address.startsWith('0x') || address.length !== 42) return false
        const claimed = await publicClient.readContract({
            address: RADRS_CONFIG.referralRegistryAddress as `0x${string}`,
            abi: REFERRAL_ABI,
            functionName: 'rewardClaimed',
            args: [address as `0x${string}`]
        })
        return claimed
    } catch (error) {
        return false
    }
  },

  /**
   * Gets total rewards earned by a referrer.
   * @param referrer - The AA wallet address of the referrer.
   */
  async getTotalRewardsEarned(referrer: string): Promise<string> {
    try {
        if (!referrer.startsWith('0x') || referrer.length !== 42) return '0'
        const rewards = await publicClient.readContract({
            address: RADRS_CONFIG.referralRegistryAddress as `0x${string}`,
            abi: REFERRAL_ABI,
            functionName: 'totalRewardsEarned',
            args: [referrer as `0x${string}`]
        })
        return formatEther(rewards)
    } catch (error) {
        return '0'
    }
  },

  /**
   * Gets the list of invitees for a referrer.
   * @param referrer - The AA wallet address of the referrer.
   */
  async getInvitees(referrer: string): Promise<{ wallet: string; bindTime: number }[]> {
    try {
        if (!referrer.startsWith('0x') || referrer.length !== 42) return []
        const invitees = await publicClient.readContract({
            address: RADRS_CONFIG.referralRegistryAddress as `0x${string}`,
            abi: REFERRAL_ABI,
            functionName: 'getInvitees',
            args: [referrer as `0x${string}`]
        })
        
        return invitees.map((item: any) => ({
            wallet: item.wallet,
            bindTime: Number(item.bindTime)
        }))
    } catch (error) {
        return []
    }
  }
}
