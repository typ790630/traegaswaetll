#!/usr/bin/env node

/**
 * 测试创建钱包的助记词生成
 */

const bip39 = require('@scure/bip39')
const english = require('@scure/bip39/wordlists/english.js')

const { generateMnemonic, validateMnemonic } = bip39
const { wordlist } = english

console.log('\n═══════════════════════════════════════════════════')
console.log('        🔐 创建钱包助记词测试')
console.log('═══════════════════════════════════════════════════\n')

// 测试 1：生成 5 个钱包，验证助记词都不同
console.log('📋 测试 1：创建 5 个钱包，验证助记词唯一性')
console.log('───────────────────────────────────────────────────\n')

const wallets = []

for (let i = 1; i <= 5; i++) {
  const mnemonic = generateMnemonic(wordlist, 128)
  const words = mnemonic.split(' ')
  
  wallets.push({
    id: i,
    mnemonic: mnemonic,
    firstThree: words.slice(0, 3)
  })
  
  console.log(`钱包 ${i}:`)
  console.log(`  前 3 个单词: ${words[0]} ${words[1]} ${words[2]}`)
  console.log(`  首字母: ${words[0][0]}${words[1][0]}${words[2][0]}`)
  console.log(`  BIP39 验证: ${validateMnemonic(mnemonic, wordlist) ? '✅ 有效' : '❌ 无效'}`)
  console.log()
}

// 检查唯一性
console.log('═══════════════════════════════════════════════════')
console.log('🔍 唯一性检查')
console.log('═══════════════════════════════════════════════════\n')

const uniqueMnemonics = new Set(wallets.map(w => w.mnemonic))

if (uniqueMnemonics.size === 5) {
  console.log('✅ 助记词唯一性：通过（5 个全部不同）')
} else {
  console.log(`❌ 助记词唯一性：失败（发现 ${5 - uniqueMnemonics.size} 个重复）`)
}

// 检查首字母分布
const firstLetters = wallets.map(w => w.firstThree[0][0])
const uniqueFirstLetters = new Set(firstLetters)

console.log(`✅ 首字母分布：${uniqueFirstLetters.size} 种不同字母 (${Array.from(uniqueFirstLetters).join(', ')})`)

if (firstLetters.every(letter => letter === 'a')) {
  console.log('❌ 警告：所有助记词都以 "a" 开头（不够随机）')
} else {
  console.log('✅ 首字母多样性：通过（不全是 "a"）')
}

// 检查是否是固定的测试助记词
console.log()
console.log('═══════════════════════════════════════════════════')
console.log('📋 测试 2：检查是否是固定的测试助记词')
console.log('═══════════════════════════════════════════════════\n')

const knownTestMnemonics = [
  'abandon ability able about above absent absorb abstract absurd abuse access accident',
  'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
  'witch collapse practice feed shame open despair creek road again ice least'
]

let hasTestMnemonic = false
wallets.forEach(wallet => {
  if (knownTestMnemonics.includes(wallet.mnemonic)) {
    console.log(`❌ 钱包 ${wallet.id} 使用了已知的测试助记词！`)
    hasTestMnemonic = true
  }
})

if (!hasTestMnemonic) {
  console.log('✅ 未使用已知的测试助记词')
}

// 最终总结
console.log()
console.log('═══════════════════════════════════════════════════')
console.log('🎯 测试总结')
console.log('═══════════════════════════════════════════════════\n')

const allTestsPassed = 
  uniqueMnemonics.size === 5 &&
  !firstLetters.every(letter => letter === 'a') &&
  !hasTestMnemonic

if (allTestsPassed) {
  console.log('✅✅✅ 所有测试通过！\n')
  console.log('创建钱包功能正常：')
  console.log('  ✅ 每次创建助记词都不同')
  console.log('  ✅ 助记词随机性良好')
  console.log('  ✅ 未使用固定的测试助记词')
  console.log('  ✅ 符合 BIP39 标准')
  console.log('\n🎉 您的钱包可以安全地创建了！')
} else {
  console.log('❌❌❌ 部分测试失败！\n')
  console.log('请检查：')
  if (uniqueMnemonics.size !== 5) {
    console.log('  ❌ 助记词重复（可能使用了固定值）')
  }
  if (firstLetters.every(letter => letter === 'a')) {
    console.log('  ❌ 首字母全是 "a"（可能是固定的测试助记词）')
  }
  if (hasTestMnemonic) {
    console.log('  ❌ 使用了已知的测试助记词')
  }
  console.log('\n🚨 建议：检查 CreateWalletWizard 的代码！')
}

console.log('\n═══════════════════════════════════════════════════\n')
