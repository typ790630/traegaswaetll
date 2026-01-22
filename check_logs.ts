
import { createPublicClient, http, formatEther, parseAbiItem, getAddress } from 'viem'
import { bsc } from 'viem/chains'

const client = createPublicClient({
  chain: bsc,
  transport: http('https://bsc-dataseed.binance.org/')
})

const RADRS_ADDRESS = '0xe2188A2E0a41A50F09359E5FE714D5e643036f2A'
const USER_ADDRESS = '0x739ee5e0cd7ee3efeae2796e9c4dc5b2916cd9f1'

async function checkActivity() {
  try {
    const userAddress = getAddress(USER_ADDRESS)
    console.log(`Checking logs for: ${userAddress}`)
    
    const currentBlock = await client.getBlockNumber()
    console.log(`Current Block: ${currentBlock}`)
    
    // 8 mins ago = ~160 blocks. Let's scan 1000 blocks to be safe.
    const fromBlock = currentBlock - 1000n
    console.log(`Scanning from block: ${fromBlock}`)

    const logs = await client.getLogs({
      address: RADRS_ADDRESS,
      event: parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 value)'),
      args: { to: userAddress },
      fromBlock
    })

    if (logs.length === 0) {
        console.log("No logs found in the last 1000 blocks.")
    }

    logs.forEach(log => {
        console.log(`Log Found: ${log.transactionHash}`)
        console.log(`Value: ${formatEther(log.args.value || 0n)} RADRS`)
    })

  } catch (error) {
    console.error('Error:', error)
  }
}

checkActivity()
