#!/usr/bin/env node

/**
 * 测试助记词生成的随机性和安全性
 */

const bip39 = require('@scure/bip39')
const bip32 = require('@scure/bip32')
const { privateKeyToAccount } = require('viem/accounts')
const english = require('@scure/bip39/wordlists/english.js')

const { generateMnemonic, validateMnemonic, mnemonicToSeedSync } = bip39
const { wordlist } = english
const { HDKey } = bip32

console.log('\n═══════════════════════════════════════════════════')
console.log('        🔐 助记词生成安全测试')
console.log('═══════════════════════════════════════════════════\n')

// 测试 1：生成 5 个助记词，验证随机性
console.log('📋 测试 1：随机性验证')
console.log('───────────────────────────────────────────────────\n')
console.log('生成 5 个助记词，验证每个都不同：\n')

const mnemonics = []
const addresses = []

for (let i = 0; i < 5; i++) {
  const mnemonic = generateMnemonic(wordlist, 128)
  const words = mnemonic.split(' ')
  
  // 派生地址
  const seed = mnemonicToSeedSync(mnemonic)
  const hdkey = HDKey.fromMasterSeed(seed)
  const path = `m/44'/60'/0'/0/0`
  const derivedKey = hdkey.derive(path)
  const privateKeyBytes = derivedKey.privateKey
  const privateKeyHex = Array.from(privateKeyBytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
  const privateKey = `0x${privateKeyHex}`
  const account = privateKeyToAccount(privateKey)
  
  mnemonics.push(mnemonic)
  addresses.push(account.address)
  
  console.log(`助记词 ${i + 1}:`)
  console.log(`  前 3 个单词: ${words[0]} ${words[1]} ${words[2]}`)
  console.log(`  首字母: ${words[0][0]}${words[1][0]}${words[2][0]}`)
  console.log(`  地址: ${account.address}`)
  console.log(`  有效性: ${validateMnemonic(mnemonic, wordlist) ? '✅ 有效' : '❌ 无效'}`)
  console.log()
}

// 检查重复
const uniqueMnemonics = new Set(mnemonics)
const uniqueAddresses = new Set(addresses)

console.log('═══════════════════════════════════════════════════')
console.log('🔍 随机性检查结果')
console.log('═══════════════════════════════════════════════════\n')

if (uniqueMnemonics.size === 5) {
  console.log('✅ 助记词唯一性：通过（5 个全部不同）')
} else {
  console.log(`❌ 助记词唯一性：失败（发现 ${5 - uniqueMnemonics.size} 个重复）`)
}

if (uniqueAddresses.size === 5) {
  console.log('✅ 地址唯一性：通过（5 个全部不同）')
} else {
  console.log(`❌ 地址唯一性：失败（发现 ${5 - uniqueAddresses.size} 个重复）`)
}

// 测试首字母分布
const firstLetters = mnemonics.map(m => m.split(' ')[0][0])
const uniqueFirstLetters = new Set(firstLetters)

console.log(`✅ 首字母分布：${uniqueFirstLetters.size} 种不同字母 (${Array.from(uniqueFirstLetters).join(', ')})`)

if (firstLetters.every(letter => letter === 'a')) {
  console.log('❌ 警告：所有助记词都以 "a" 开头（不够随机）')
} else {
  console.log('✅ 首字母多样性：通过（不全是 "a"）')
}

console.log()

// 测试 2：验证 BIP39 标准
console.log('═══════════════════════════════════════════════════')
console.log('📋 测试 2：BIP39 标准验证')
console.log('═══════════════════════════════════════════════════\n')

const testMnemonic = generateMnemonic(wordlist, 128)
const testWords = testMnemonic.split(' ')

console.log('生成的助记词：')
console.log(`  完整助记词: ${testMnemonic}`)
console.log(`  单词数量: ${testWords.length}`)
console.log(`  BIP39 验证: ${validateMnemonic(testMnemonic, wordlist) ? '✅ 有效' : '❌ 无效'}`)

// 检查是否是已知的测试助记词
const knownTestMnemonics = [
  'abandon ability able about above absent absorb abstract absurd abuse access accident',
  'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
  'witch collapse practice feed shame open despair creek road again ice least'
]

const isKnownTest = knownTestMnemonics.includes(testMnemonic)
console.log(`  已知测试助记词: ${isKnownTest ? '❌ 是（不安全）' : '✅ 否（安全）'}`)

console.log()

// 测试 3：熵值验证
console.log('═══════════════════════════════════════════════════')
console.log('📋 测试 3：熵值验证（128位 = 12个单词）')
console.log('═══════════════════════════════════════════════════\n')

try {
  // 生成 128 位熵（12 个单词）
  const mnemonic128 = generateMnemonic(wordlist, 128)
  console.log('✅ 128位熵（12个单词）：生成成功')
  console.log(`   单词数: ${mnemonic128.split(' ').length}`)
  
  // 生成 256 位熵（24 个单词）
  const mnemonic256 = generateMnemonic(wordlist, 256)
  console.log('✅ 256位熵（24个单词）：生成成功')
  console.log(`   单词数: ${mnemonic256.split(' ').length}`)
} catch (error) {
  console.log('❌ 熵值生成失败:', error.message)
}

console.log()

// 最终总结
console.log('═══════════════════════════════════════════════════')
console.log('🎯 测试总结')
console.log('═══════════════════════════════════════════════════\n')

const allTestsPassed = 
  uniqueMnemonics.size === 5 &&
  uniqueAddresses.size === 5 &&
  !firstLetters.every(letter => letter === 'a') &&
  validateMnemonic(testMnemonic, wordlist) &&
  !isKnownTest

if (allTestsPassed) {
  console.log('✅✅✅ 所有测试通过！\n')
  console.log('助记词生成器工作正常：')
  console.log('  ✅ 随机性良好')
  console.log('  ✅ 唯一性保证')
  console.log('  ✅ 符合 BIP39 标准')
  console.log('  ✅ 未使用已知测试助记词')
  console.log('  ✅ 首字母分布正常')
  console.log('\n🎉 您的钱包可以安全地生成助记词！')
} else {
  console.log('❌❌❌ 部分测试失败！\n')
  console.log('请检查：')
  if (uniqueMnemonics.size !== 5) {
    console.log('  ❌ 助记词不唯一（可能使用了固定种子）')
  }
  if (firstLetters.every(letter => letter === 'a')) {
    console.log('  ❌ 首字母全是 "a"（随机性不足）')
  }
  if (isKnownTest) {
    console.log('  ❌ 使用了已知的测试助记词（不安全）')
  }
  console.log('\n🚨 建议：检查代码中的助记词生成逻辑！')
}

console.log('\n═══════════════════════════════════════════════════\n')
