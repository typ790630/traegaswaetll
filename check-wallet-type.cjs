#!/usr/bin/env node

/**
 * 检查钱包地址类型（EOA 还是合约）
 */

const { createPublicClient, http } = require('viem')
const { bsc } = require('viem/chains')

const WALLET = '0xbc9e12183389ad7096a6406485f3e69bf2675d41'

const client = createPublicClient({
  chain: bsc,
  transport: http('https://bsc-dataseed.binance.org/')
})

async function checkWalletType() {
  console.log('\n═══════════════════════════════════════════════════')
  console.log('          🔍 钱包类型检查')
  console.log('═══════════════════════════════════════════════════\n')
  
  console.log(`📋 钱包地址: ${WALLET}\n`)

  try {
    // 获取地址的 bytecode
    const bytecode = await client.getBytecode({ address: WALLET })
    
    if (bytecode && bytecode !== '0x') {
      console.log('🔴 这是一个智能合约地址！')
      console.log(`   Bytecode 长度: ${bytecode.length} bytes`)
      console.log(`   类型: Smart Contract (AA Wallet)\n`)
      
      console.log('═══════════════════════════════════════════════════')
      console.log('📊 智能合约钱包特性')
      console.log('═══════════════════════════════════════════════════\n')
      
      console.log('✅ 可以使用 Paymaster 支付 Gas（用 RADRS 代替 BNB）')
      console.log('✅ 可以在没有 BNB 的情况下发起交易')
      console.log('✅ 支持批量操作和高级功能')
      console.log('⚠️  需要通过 EntryPoint 合约发起交易\n')
      
      console.log('═══════════════════════════════════════════════════')
      console.log('🔍 这解释了为什么没有 BNB 也能转账！')
      console.log('═══════════════════════════════════════════════════\n')
      
      console.log('可能的情况：')
      console.log('1. 使用了 Paymaster 支付 Gas（消耗 RADRS）')
      console.log('2. 有人代付了 Gas 费（Sponsor）')
      console.log('3. Gasless 交易（Meta Transaction）\n')
      
    } else {
      console.log('🟢 这是一个 EOA（外部拥有账户）')
      console.log('   类型: Externally Owned Account\n')
      
      console.log('═══════════════════════════════════════════════════')
      console.log('📊 EOA 特性')
      console.log('═══════════════════════════════════════════════════\n')
      
      console.log('⚠️  必须有 BNB 才能发起交易')
      console.log('⚠️  无法使用 Paymaster')
      console.log('⚠️  每笔交易都需要消耗 BNB Gas\n')
      
      console.log('═══════════════════════════════════════════════════')
      console.log('🚨 矛盾：EOA 没有 BNB 无法转账！')
      console.log('═══════════════════════════════════════════════════\n')
      
      console.log('可能的原因：')
      console.log('1. 之前有 BNB，转账后余额被清空了')
      console.log('2. 交易记录显示错误')
      console.log('3. 私钥泄露，攻击者先充值 BNB 再转走代币\n')
    }

    // 查询历史 BNB 余额变化
    console.log('═══════════════════════════════════════════════════')
    console.log('💰 查询当前 BNB 余额')
    console.log('═══════════════════════════════════════════════════\n')
    
    const balance = await client.getBalance({ address: WALLET })
    const bnbBalance = Number(balance) / 1e18
    
    console.log(`当前 BNB 余额: ${bnbBalance} BNB`)
    
    if (bnbBalance === 0) {
      console.log('❌ 当前余额为 0')
      console.log('\n建议：查看 BSCScan 的 BNB 转账历史')
      console.log('看看是否有 BNB 的充值和转出记录\n')
    } else {
      console.log(`✅ 当前有 ${bnbBalance} BNB\n`)
    }
    
  } catch (error) {
    console.error('❌ 查询失败:', error.message)
  }

  console.log('═══════════════════════════════════════════════════\n')
}

checkWalletType()
