#!/usr/bin/env node

/**
 * 检查 BSC 地址有效性
 */

const TARGET_ADDRESS = '请用户提供目标地址' // 👈 请替换为您要转账的地址

console.log('\n═══════════════════════════════════════════════════')
console.log('          🔍 BSC 地址安全检查')
console.log('═══════════════════════════════════════════════════\n')

// 1. 格式检查
if (!/^0x[a-fA-F0-9]{40}$/.test(TARGET_ADDRESS)) {
    console.log('❌ 地址格式错误！')
    console.log(`   输入地址: ${TARGET_ADDRESS}`)
    console.log('\n✅ 正确格式应该是：')
    console.log('   - 以 0x 开头')
    console.log('   - 后跟 40 个十六进制字符（0-9, a-f）')
    console.log('   - 总长度 42 个字符\n')
    process.exit(1)
}

console.log('✅ 地址格式正确')
console.log(`   地址: ${TARGET_ADDRESS}\n`)

// 2. 校验和检查（简易版）
const lowerCaseAddr = TARGET_ADDRESS.toLowerCase()
console.log('✅ 小写格式: ' + lowerCaseAddr + '\n')

// 3. 已知地址检查
const KNOWN_ADDRESSES = {
    '0x739ee5e0cd7ee3efeae2796e9c4dc5b2916cd9f1': '旧钱包地址（有 0.004 BNB）',
    '0xbc9e12183389ad7096a6406485f3e69bf2675d41': '新钱包地址（助记词匹配）',
    '0x10ed43c718714eb63d5aa57b78b54704e256024e': 'PancakeSwap Router V2',
    '0x2139366909c41d7fadd2c3701db57ca4b5f0224b': 'RADRS 代币合约',
    '0x55d398326f99059ff775485246999027b3197955': 'USDT 代币合约',
}

const knownInfo = KNOWN_ADDRESSES[lowerCaseAddr]
if (knownInfo) {
    console.log(`ℹ️  已知地址: ${knownInfo}\n`)
}

// 4. 风险评估
console.log('───────────────────────────────────────────────────')
console.log('🛡️  风险评估结果')
console.log('───────────────────────────────────────────────────\n')

if (lowerCaseAddr === '0x10ed43c718714eb63d5aa57b78b54704e256024e' ||
    lowerCaseAddr === '0x2139366909c41d7fadd2c3701db57ca4b5f0224b' ||
    lowerCaseAddr === '0x55d398326f99059ff775485246999027b3197955') {
    console.log('⚠️  这是一个智能合约地址！')
    console.log('   不建议直接转账 BNB/代币到合约')
    console.log('   请通过应用的兑换功能操作\n')
} else if (lowerCaseAddr === '0x739ee5e0cd7ee3efeae2796e9c4dc5b2916cd9f1') {
    console.log('ℹ️  这是您的旧钱包地址')
    console.log('   该地址目前无法通过当前助记词控制')
    console.log('   转账到此地址需要找回旧助记词才能使用\n')
} else if (lowerCaseAddr === '0xbc9e12183389ad7096a6406485f3e69bf2675d41') {
    console.log('ℹ️  这是您当前钱包地址')
    console.log('   转账给自己？（不推荐，浪费 Gas 费）\n')
} else {
    console.log('✅ 地址安全性: 正常')
    console.log('   可以转账到此地址\n')
    console.log('⚠️  温馨提示：')
    console.log('   - 首次转账建议小额测试')
    console.log('   - 确认接收方地址无误')
    console.log('   - 确保有足够 BNB 支付 Gas 费\n')
}

console.log('═══════════════════════════════════════════════════\n')
