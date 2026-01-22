#!/usr/bin/env node

/**
 * 验证新创建的钱包是否为 EOA
 * 
 * 使用方法：
 * 1. 创建新钱包后，复制助记词
 * 2. 修改下面第 24 行的助记词
 * 3. 运行：node verify-new-wallet.cjs
 */

const bip39 = require('@scure/bip39')
const bip32 = require('@scure/bip32')
const { privateKeyToAccount } = require('viem/accounts')
const { createPublicClient, http } = require('viem')
const { bsc } = require('viem/chains')

const { mnemonicToSeedSync } = bip39
const { HDKey } = bip32

// ⚠️⚠️⚠️ 请在这里填入您的新助记词 ⚠️⚠️⚠️
// 创建新钱包后，将 12 个单词复制到这里
const NEW_MNEMONIC = '请填入您的新助记词 12 个单词'
// 例如：const NEW_MNEMONIC = 'word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12'

const client = createPublicClient({
  chain: bsc,
  transport: http('https://bsc-dataseed.binance.org/')
})

async function verifyNewWallet() {
  console.log('\n═══════════════════════════════════════════════════')
  console.log('        🆕 新钱包 EOA 验证工具')
  console.log('═══════════════════════════════════════════════════\n')

  // 检查是否填入了助记词
  if (NEW_MNEMONIC.includes('请填入') || NEW_MNEMONIC.includes('word1')) {
    console.log('❌ 错误：请先填入您的新助记词！\n')
    console.log('📋 步骤：')
    console.log('   1. 在应用中创建新钱包')
    console.log('   2. 复制新生成的 12 个单词')
    console.log('   3. 修改本脚本第 24 行')
    console.log('   4. 重新运行脚本\n')
    console.log('═══════════════════════════════════════════════════\n')
    return
  }

  try {
    // 1. 验证助记词格式
    console.log('📋 步骤 1：验证助记词格式')
    console.log('───────────────────────────────────────────────────\n')
    
    const words = NEW_MNEMONIC.trim().split(/\s+/)
    console.log(`助记词单词数: ${words.length}`)
    
    if (words.length !== 12) {
      console.log('❌ 错误：助记词必须是 12 个单词！')
      console.log(`   当前: ${words.length} 个单词\n`)
      return
    }
    
    console.log(`✅ 助记词格式正确（12 个单词）\n`)

    // 2. 从助记词派生地址
    console.log('📋 步骤 2：从助记词派生 EOA 地址')
    console.log('───────────────────────────────────────────────────\n')
    
    const seed = mnemonicToSeedSync(NEW_MNEMONIC)
    const hdkey = HDKey.fromMasterSeed(seed)
    const path = `m/44'/60'/0'/0/0`
    const derivedKey = hdkey.derive(path)
    
    const privateKeyBytes = derivedKey.privateKey
    const privateKeyHex = Array.from(privateKeyBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    const privateKey = `0x${privateKeyHex}`
    
    const account = privateKeyToAccount(privateKey)
    const newAddress = account.address
    
    console.log(`✅ 派生路径: ${path}（ETH 标准）`)
    console.log(`✅ 新地址: ${newAddress}`)
    console.log(`✅ 私钥: ${privateKey.substring(0, 10)}...${privateKey.substring(60)}\n`)

    // 3. 检查链上类型
    console.log('📋 步骤 3：检查链上地址类型')
    console.log('───────────────────────────────────────────────────\n')
    
    console.log('⏳ 查询 BSC 主网...')
    const bytecode = await client.getBytecode({ address: newAddress })
    
    if (!bytecode || bytecode === '0x' || bytecode === '0x0') {
      console.log('\n🎉🎉🎉 验证成功：这是纯正的 EOA 钱包！\n')
      
      console.log('═══════════════════════════════════════════════════')
      console.log('✅ 钱包特性')
      console.log('═══════════════════════════════════════════════════\n')
      
      console.log('  ✅ 类型：EOA（外部拥有账户）')
      console.log('  ✅ Bytecode：无（纯 EOA）')
      console.log('  ✅ 私钥签名：直接签名')
      console.log('  ✅ Gas 支付：BNB')
      console.log('  ✅ 架构：简单、安全、标准')
      console.log('  ✅ 兼容性：可导入到任何以太坊钱包\n')
      
      console.log('═══════════════════════════════════════════════════')
      console.log('💰 余额检查')
      console.log('═══════════════════════════════════════════════════\n')
      
      const balance = await client.getBalance({ address: newAddress })
      const bnbBalance = Number(balance) / 1e18
      
      console.log(`BNB 余额: ${bnbBalance.toFixed(6)} BNB`)
      
      if (bnbBalance === 0) {
        console.log('ℹ️  余额为 0（新钱包）')
        console.log('\n建议：')
        console.log('  1. 充值 0.01 BNB 测试')
        console.log('  2. 测试转账功能')
        console.log('  3. 测试兑换功能')
        console.log('  4. 确认无问题后充值更多\n')
      } else {
        console.log(`✅ 当前余额: ${bnbBalance} BNB\n`)
      }
      
      console.log('═══════════════════════════════════════════════════')
      console.log('🎯 下一步')
      console.log('═══════════════════════════════════════════════════\n')
      
      console.log('1. ✅ 确认助记词已安全保存（手写3份）')
      console.log('2. ✅ 充值小额 BNB 测试（0.01 BNB）')
      console.log('3. ✅ 测试转账功能')
      console.log('4. ✅ 测试兑换功能')
      console.log('5. ✅ 验证余额更新正常')
      console.log('6. ✅ 全部正常后，可以正常使用\n')
      
      console.log('🎉 恭喜！您现在有一个纯正的 EOA 钱包了！')
      
    } else {
      console.log('\n❌❌❌ 验证失败：检测到智能合约！\n')
      
      console.log('═══════════════════════════════════════════════════')
      console.log('⚠️  问题分析')
      console.log('═══════════════════════════════════════════════════\n')
      
      console.log(`  类型：智能合约`)
      console.log(`  Bytecode：${bytecode}`)
      console.log(`  长度：${bytecode.length} 字符\n`)
      
      console.log('可能原因：')
      console.log('  1. 这个助记词之前创建过 AA 钱包')
      console.log('  2. 或者这个地址被部署过合约')
      console.log('  3. 或者填入的不是新助记词\n')
      
      console.log('🚨 解决方案：')
      console.log('  1. 在应用中重新创建钱包（生成新助记词）')
      console.log('  2. 确保使用完全新的助记词')
      console.log('  3. 重新运行本脚本验证\n')
    }

    console.log('═══════════════════════════════════════════════════\n')

  } catch (error) {
    console.error('❌ 验证失败:', error.message)
    console.log('\n可能的原因：')
    console.log('  1. 助记词格式错误')
    console.log('  2. RPC 节点不可用')
    console.log('  3. 网络连接问题\n')
  }
}

verifyNewWallet()
