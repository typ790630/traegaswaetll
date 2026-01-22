#!/usr/bin/env node

/**
 * 检查助记词派生的真实地址
 */

const bip39 = require('@scure/bip39')
const bip32 = require('@scure/bip32')
const { privateKeyToAccount } = require('viem/accounts')

const { mnemonicToSeedSync } = bip39
const { HDKey } = bip32

// 默认助记词（从代码中提取）
const DEFAULT_MNEMONIC = 'witch collapse practice feed shame open despair creek road again ice least'

// 当前使用的钱包地址
const CURRENT_ADDRESS = '0xbc9e12183389ad7096a6406485f3e69bf2675d41'

console.log('\n═══════════════════════════════════════════════════')
console.log('          🔍 助记词地址派生检查')
console.log('═══════════════════════════════════════════════════\n')

console.log(`📋 助记词: ${DEFAULT_MNEMONIC}`)
console.log(`📋 当前钱包: ${CURRENT_ADDRESS}\n`)

try {
  // 派生地址
  const seed = mnemonicToSeedSync(DEFAULT_MNEMONIC)
  const hdkey = HDKey.fromMasterSeed(seed)
  const path = `m/44'/60'/0'/0/0` // ETH 标准路径
  const derivedKey = hdkey.derive(path)
  
  // 转换私钥
  const privateKeyBytes = derivedKey.privateKey
  const privateKeyHex = Array.from(privateKeyBytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
  const privateKey = `0x${privateKeyHex}`
  
  // 派生地址
  const account = privateKeyToAccount(privateKey)
  const derivedAddress = account.address
  
  console.log('═══════════════════════════════════════════════════')
  console.log('📊 派生结果')
  console.log('═══════════════════════════════════════════════════\n')
  
  console.log(`🔑 私钥: ${privateKey.substring(0, 10)}...${privateKey.substring(60)}`)
  console.log(`🏠 派生地址 (EOA): ${derivedAddress}\n`)
  
  console.log('═══════════════════════════════════════════════════')
  console.log('🔍 对比分析')
  console.log('═══════════════════════════════════════════════════\n')
  
  console.log(`助记词派生 (EOA):  ${derivedAddress}`)
  console.log(`当前钱包 (实际):    ${CURRENT_ADDRESS}\n`)
  
  if (derivedAddress.toLowerCase() === CURRENT_ADDRESS.toLowerCase()) {
    console.log('✅ 地址匹配！')
    console.log('   说明：助记词正确，但钱包类型检测可能有误\n')
  } else {
    console.log('❌ 地址不匹配！')
    console.log('\n═══════════════════════════════════════════════════')
    console.log('🚨 发现严重问题')
    console.log('═══════════════════════════════════════════════════\n')
    
    console.log('这说明：')
    console.log(`1. 当前钱包 (${CURRENT_ADDRESS}) 不是由这个助记词派生的`)
    console.log(`2. 这个助记词对应的真实地址是: ${derivedAddress}`)
    console.log(`3. 当前钱包可能是：`)
    console.log(`   - AA 智能合约钱包（由 EOA 创建）`)
    console.log(`   - 或者使用了不同的助记词\n`)
    
    console.log('═══════════════════════════════════════════════════')
    console.log('🔍 推测：钱包架构')
    console.log('═══════════════════════════════════════════════════\n')
    
    console.log(`EOA 地址 (Owner):    ${derivedAddress}`)
    console.log(`AA 合约 (Wallet):    ${CURRENT_ADDRESS}`)
    console.log(`\n这是典型的 Account Abstraction 架构：`)
    console.log(`- EOA 是"所有者"，控制 AA 合约`)
    console.log(`- AA 合约是"钱包"，存储资产`)
    console.log(`- 用户通过 EOA 签名，AA 合约执行交易\n`)
  }
  
  console.log('═══════════════════════════════════════════════════')
  console.log('💡 解释')
  console.log('═══════════════════════════════════════════════════\n')
  
  console.log('这就是为什么：')
  console.log('✅ 没有 BNB 也能转账（AA 合约用 Paymaster）')
  console.log('✅ 没有授权记录（合约直接执行）')
  console.log('✅ 显示为"Withdraw Token"（通过 EntryPoint）')
  console.log('✅ 代币被转走（有人控制了 EOA 或 AA 合约）\n')
  
  console.log('═══════════════════════════════════════════════════')
  console.log('🔐 安全性分析')
  console.log('═══════════════════════════════════════════════════\n')
  
  console.log('如果资产被盗，攻击者可能：')
  console.log('1. 获得了 EOA 的私钥（助记词泄露）')
  console.log('2. 然后通过 EOA 控制 AA 合约转走资产')
  console.log('3. 使用 Paymaster 支付 Gas（不需要 BNB）\n')
  
} catch (error) {
  console.error('❌ 派生失败:', error.message)
}

console.log('═══════════════════════════════════════════════════\n')
