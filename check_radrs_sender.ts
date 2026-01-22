
import { createPublicClient, http, formatEther, parseAbi, getAddress } from 'viem'
import { bsc } from 'viem/chains'

const client = createPublicClient({
  chain: bsc,
  transport: http('https://bsc-dataseed.binance.org/')
})

const RADRS_ADDRESS = '0xe2188A2E0a41A50F09359E5FE714D5e643036f2A'
const SENDER_ADDRESS = '0xd39c03a4478866644aab19582543e789dbf2eb49'

async function checkBalance() {
  try {
    const userAddress = getAddress(SENDER_ADDRESS)
    console.log(`Checking balance for Sender: ${userAddress}`)
    
    const balance = await client.readContract({
      address: RADRS_ADDRESS,
      abi: parseAbi(['function balanceOf(address) view returns (uint256)']),
      functionName: 'balanceOf',
      args: [userAddress]
    })
    console.log(`Sender Real Balance: ${formatEther(balance)} RADRS`)
  } catch (error) {
    console.error('Error:', error)
  }
}

checkBalance()
