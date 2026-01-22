#!/usr/bin/env node

/**
 * 验证钱包是否为纯 EOA
 */

const bip39 = require('@scure/bip39')
const bip32 = require('@scure/bip32')
const { privateKeyToAccount } = require('viem/accounts')
const { createPublicClient, http } = require('viem')
const { bsc } = require('viem/chains')

const { mnemonicToSeedSync } = bip39
const { HDKey } = bip32

// 默认助记词
const DEFAULT_MNEMONIC = 'witch collapse practice feed shame open despair creek road again ice least'

const client = createPublicClient({
  chain: bsc,
  transport: http('https://bsc-dataseed.binance.org/')
})

async function verifyWallet() {
  console.log('\n═══════════════════════════════════════════════════')
  console.log('        ✅ 纯 EOA 钱包验证工具')
  console.log('═══════════════════════════════════════════════════\n')

  try {
    // 1. 从助记词派生地址
    console.log('📋 步骤 1：从助记词派生地址')
    console.log('───────────────────────────────────────────────────\n')
    
    const seed = mnemonicToSeedSync(DEFAULT_MNEMONIC)
    const hdkey = HDKey.fromMasterSeed(seed)
    const path = `m/44'/60'/0'/0/0`
    const derivedKey = hdkey.derive(path)
    
    const privateKeyBytes = derivedKey.privateKey
    const privateKeyHex = Array.from(privateKeyBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    const privateKey = `0x${privateKeyHex}`
    
    const account = privateKeyToAccount(privateKey)
    const derivedAddress = account.address
    
    console.log(`✅ 助记词: ${DEFAULT_MNEMONIC}`)
    console.log(`✅ 派生路径: ${path}`)
    console.log(`✅ EOA 地址: ${derivedAddress}`)
    console.log(`✅ 私钥: ${privateKey.substring(0, 10)}...${privateKey.substring(60)}\n`)

    // 2. 检查地址类型
    console.log('📋 步骤 2：检查地址类型（链上验证）')
    console.log('───────────────────────────────────────────────────\n')
    
    const bytecode = await client.getBytecode({ address: derivedAddress })
    
    if (!bytecode || bytecode === '0x' || bytecode === '0x0') {
      console.log('✅✅✅ 这是一个 EOA（外部拥有账户）')
      console.log('   类型: Externally Owned Account')
      console.log('   Bytecode: 无（纯 EOA）')
      console.log('   签名方式: 私钥直接签名')
      console.log('   Gas 支付: BNB\n')
    } else {
      console.log('❌❌❌ 这是一个智能合约！')
      console.log(`   类型: Smart Contract`)
      console.log(`   Bytecode: ${bytecode}`)
      console.log(`   长度: ${bytecode.length} 字符\n`)
      
      console.log('🚨 警告：检测到智能合约！')
      console.log('   可能原因：')
      console.log('   1. 这是一个 AA 钱包')
      console.log('   2. 或者是代理合约')
      console.log('   3. 或者地址已被部署为合约\n')
      
      console.log('⚠️  建议：创建新钱包（新助记词）\n')
    }

    // 3. 检查交易数量
    console.log('📋 步骤 3：检查交易历史')
    console.log('───────────────────────────────────────────────────\n')
    
    const txCount = await client.getTransactionCount({ address: derivedAddress })
    console.log(`交易总数 (Nonce): ${txCount}`)
    
    if (txCount === 0) {
      console.log('ℹ️  从未发起过交易（新地址）')
      console.log('   这是正常的新钱包状态\n')
    } else if (txCount === 11) {
      console.log('⚠️  发起过 11 笔交易')
      console.log('   这是旧钱包地址（可能是 AA）\n')
    } else {
      console.log(`✅ 发起过 ${txCount} 笔交易\n`)
    }

    // 4. 检查余额
    console.log('📋 步骤 4：检查余额')
    console.log('───────────────────────────────────────────────────\n')
    
    const balance = await client.getBalance({ address: derivedAddress })
    const bnbBalance = Number(balance) / 1e18
    
    console.log(`BNB 余额: ${bnbBalance.toFixed(6)} BNB`)
    
    if (bnbBalance === 0) {
      console.log('ℹ️  余额为 0（新钱包）\n')
    } else {
      console.log(`✅ 有余额：${bnbBalance} BNB\n`)
    }

    // 5. 最终结论
    console.log('═══════════════════════════════════════════════════')
    console.log('🎯 验证结论')
    console.log('═══════════════════════════════════════════════════\n')
    
    if (!bytecode || bytecode === '0x' || bytecode === '0x0') {
      console.log('✅✅✅ 验证通过：这是纯正的 EOA 钱包！\n')
      
      console.log('钱包特性：')
      console.log('  ✅ 助记词标准（BIP39）')
      console.log('  ✅ 派生路径标准（BIP44）')
      console.log('  ✅ EOA 地址（无合约代码）')
      console.log('  ✅ 私钥直接签名')
      console.log('  ✅ BNB 支付 Gas')
      console.log('  ✅ 可导入到任何钱包\n')
      
      console.log('🎉 您的钱包现在是纯正的 EOA 了！')
    } else {
      console.log('❌❌❌ 验证失败：检测到智能合约！\n')
      
      console.log('建议：')
      console.log('  1. 创建新钱包（生成新助记词）')
      console.log('  2. 不要使用旧地址')
      console.log('  3. 转移所有资产到新钱包')
      console.log('  4. 新钱包将是纯 EOA\n')
    }

    console.log('═══════════════════════════════════════════════════\n')

  } catch (error) {
    console.error('❌ 验证失败:', error.message)
  }
}

verifyWallet()
