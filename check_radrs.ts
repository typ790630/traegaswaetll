
import { createPublicClient, http, formatEther, parseAbi, getAddress } from 'viem'
import { bsc } from 'viem/chains'

const client = createPublicClient({
  chain: bsc,
  transport: http('https://bsc-dataseed.binance.org/')
})

const RADRS_ADDRESS = '0xe2188A2E0a41A50F09359E5FE714D5e643036f2A'
// Use the address from the screenshot (OCR was 0x739ee5e0cd7ee3efeae2796e9c4dc5b2916cd9f1)
// Let's try to checksum it
const RAW_ADDRESS = '0x739ee5e0cd7ee3efeae2796e9c4dc5b2916cd9f1'

async function checkBalance() {
  try {
    const userAddress = getAddress(RAW_ADDRESS)
    console.log(`Checking balance for: ${userAddress}`)
    
    const balance = await client.readContract({
      address: RADRS_ADDRESS,
      abi: parseAbi(['function balanceOf(address) view returns (uint256)']),
      functionName: 'balanceOf',
      args: [userAddress]
    })
    console.log(`Real Balance: ${formatEther(balance)} RADRS`)
  } catch (error) {
    console.error('Error:', error)
  }
}

checkBalance()
