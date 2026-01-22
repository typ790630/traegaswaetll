#!/usr/bin/env node

/**
 * 详细检查钱包 Bytecode
 */

const { createPublicClient, http } = require('viem')
const { bsc } = require('viem/chains')

const WALLET = '0xbc9e12183389ad7096a6406485f3e69bf2675d41'

const client = createPublicClient({
  chain: bsc,
  transport: http('https://bsc-dataseed.binance.org/')
})

async function checkBytecode() {
  console.log('\n═══════════════════════════════════════════════════')
  console.log('          🔍 Bytecode 详细检查')
  console.log('═══════════════════════════════════════════════════\n')
  
  console.log(`📋 钱包地址: ${WALLET}\n`)

  try {
    // 获取 bytecode
    const bytecode = await client.getBytecode({ address: WALLET })
    
    console.log('═══════════════════════════════════════════════════')
    console.log('📊 Bytecode 分析')
    console.log('═══════════════════════════════════════════════════\n')
    
    console.log(`Bytecode: ${bytecode}`)
    console.log(`长度: ${bytecode ? bytecode.length : 0} 字符`)
    console.log(`类型: ${typeof bytecode}\n`)
    
    if (!bytecode || bytecode === '0x' || bytecode === '0x0') {
      console.log('✅ 这是一个 EOA（外部拥有账户）')
      console.log('   - 没有合约代码')
      console.log('   - 由私钥控制')
      console.log('   - 需要 BNB 支付 Gas\n')
      
      console.log('═══════════════════════════════════════════════════')
      console.log('🎯 结论')
      console.log('═══════════════════════════════════════════════════\n')
      
      console.log('既然是 EOA，那转账必须要有 BNB！')
      console.log('\n可能的情况：')
      console.log('1. 转账时有 BNB，转账后被清空了')
      console.log('2. 攻击者先充值BNB，转走代币，再转走BNB')
      console.log('3. 私钥泄露，攻击者完全控制了钱包\n')
      
    } else {
      console.log('🔴 这是一个智能合约')
      console.log(`   - Bytecode 长度: ${bytecode.length} 字符`)
      console.log(`   - Bytecode 内容: ${bytecode}\n`)
      
      // 分析 bytecode
      if (bytecode.length <= 10) {
        console.log('⚠️  注意：Bytecode 很短！')
        console.log('   可能是：')
        console.log('   1. 代理合约（Proxy）')
        console.log('   2. 最小化合约')
        console.log('   3. 自毁后的残留\n')
      }
      
      console.log('═══════════════════════════════════════════════════')
      console.log('🎯 结论')
      console.log('═══════════════════════════════════════════════════\n')
      
      console.log('这是智能合约钱包（Account Abstraction）')
      console.log('\n特性：')
      console.log('✅ 可以使用 Paymaster 支付 Gas')
      console.log('✅ 不需要 BNB 也能转账')
      console.log('✅ 支持高级功能\n')
      
      console.log('如果资产被盗：')
      console.log('1. 攻击者获得了控制权（Owner私钥）')
      console.log('2. 通过合约执行转账')
      console.log('3. 使用 Paymaster 代付 Gas\n')
    }
    
    // 查询交易数量
    const txCount = await client.getTransactionCount({ address: WALLET })
    console.log('═══════════════════════════════════════════════════')
    console.log('📊 交易历史')
    console.log('═══════════════════════════════════════════════════\n')
    
    console.log(`交易总数 (Nonce): ${txCount}`)
    
    if (txCount === 0) {
      console.log('❌ 从未发起过交易（作为 Sender）')
      console.log('   这进一步证明是智能合约钱包\n')
    } else {
      console.log(`✅ 发起过 ${txCount} 笔交易`)
      console.log('   这说明是活跃的 EOA 或合约\n')
    }
    
  } catch (error) {
    console.error('❌ 查询失败:', error.message)
  }

  console.log('═══════════════════════════════════════════════════\n')
}

checkBytecode()
