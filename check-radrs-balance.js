import { createPublicClient, http, formatEther, parseAbi } from 'viem'
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
  // 从截图中的地址
  const address = '0x739Ee5E0CD7Ee3EfEA...'  // 请补充完整地址
  
  console.log('\n═══════════════════════════════════════════════')
  console.log('🔍 RADRS 余额检查')
  console.log('═══════════════════════════════════════════════\n')
  
  console.log('钱包地址:', address)
  console.log('RADRS 代币合约:', RADRS_TOKEN_ADDRESS)
  console.log('')
  
  try {
    // 1. 检查 BNB 余额（验证地址有效性）
    const bnbBalance = await client.getBalance({ address })
    console.log('✅ BNB 余额:', formatEther(bnbBalance), 'BNB')
    
    // 2. 检查 RADRS 余额
    const radrsBalance = await client.readContract({
      address: RADRS_TOKEN_ADDRESS,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [address]
    })
    console.log('📊 RADRS 余额:', formatEther(radrsBalance), 'RADRS')
    
    if (radrsBalance === 0n) {
      console.log('\n⚠️ 诊断结果：')
      console.log('   - 该地址 RADRS 余额为 0')
      console.log('   - 这是正常的（新钱包默认没有 RADRS）')
      console.log('')
      console.log('💡 如何获得 RADRS：')
      console.log('   1. 在 PancakeSwap 购买 RADRS')
      console.log('   2. 使用钱包内的兑换功能')
      console.log('   3. 从其他钱包转入')
      console.log('')
      console.log('🔗 RADRS 合约信息：')
      console.log(`   BSCScan: https://bscscan.com/token/${RADRS_TOKEN_ADDRESS}`)
    } else {
      console.log('\n✅ 钱包中有 RADRS 代币')
    }
    
  } catch (error) {
    console.error('\n❌ 查询失败:', error)
    console.log('\n可能原因：')
    console.log('   1. RPC 节点连接失败')
    console.log('   2. 代币合约地址错误')
    console.log('   3. 网络问题')
  }
}

checkBalance()
