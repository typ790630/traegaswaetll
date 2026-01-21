import { createPublicClient, http, formatEther, parseAbi, getAddress } from 'viem'
import { bsc } from 'viem/chains'

const client = createPublicClient({
  chain: bsc,
  transport: http('https://bsc-dataseed1.defibit.io/')
})

const ERC20_ABI = parseAbi([
  'function balanceOf(address account) view returns (uint256)'
])

const RADRS_TOKEN_ADDRESS = '0xe2188a2e0a41a50f09359e5fe714d5e643036f2a'

async function checkBalance() {
  const rawAddress = '0x2139366909c41d7fAdd2c3701db57Ca4B5f0224B'
  const address = getAddress(rawAddress) // Ensure checksum
  console.log(`Checking balance for: ${address}`)
  
  try {
    // Check BNB Balance
    const bnbBalance = await client.getBalance({ address })
    console.log(`BNB Balance: ${formatEther(bnbBalance)} BNB`)

    // Check RADRS Balance
    const radrsBalance = await client.readContract({
      address: getAddress(RADRS_TOKEN_ADDRESS),
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [address]
    })
    console.log(`RADRS Balance: ${formatEther(radrsBalance)} RADRS`)

  } catch (error) {
    console.error('Error checking balance:', error)
  }
}

checkBalance()
