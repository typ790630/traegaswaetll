/**
 * 测试地址生成逻辑
 */

console.log('='.repeat(70))
console.log('测试地址生成逻辑')
console.log('='.repeat(70))
console.log()

// 模拟 deriveAAAddress 函数 (修复后的版本)
function deriveAAAddress(eoa) {
    try {
        // Remove 0x prefix to get pure hex string (40 characters)
        const hexPart = eoa.substring(2)
        
        console.log('步骤 1: 移除 0x 前缀')
        console.log('  输入 EOA:', eoa)
        console.log('  十六进制部分:', hexPart)
        console.log('  长度:', hexPart.length, hexPart.length === 40 ? '✅' : '❌')
        console.log()
        
        // Reverse the hex string
        const reversed = hexPart.split('').reverse().join('')
        
        console.log('步骤 2: 反转十六进制字符串')
        console.log('  反转后:', reversed)
        console.log('  长度:', reversed.length, reversed.length === 40 ? '✅' : '❌')
        console.log()
        
        // Take first 38 characters of reversed string
        // Add 'AA' prefix to make it 40 characters total
        const reversed38 = reversed.substring(0, 38)
        const newHex = 'AA' + reversed38
        
        console.log('步骤 3: 构建新地址')
        console.log('  取前38个字符:', reversed38)
        console.log('  添加 AA 前缀:', newHex)
        console.log('  长度:', newHex.length, newHex.length === 40 ? '✅' : '❌')
        console.log()
        
        // Verify length
        if (newHex.length !== 40) {
            console.error('❌ 错误: 长度不是40!')
            return eoa
        }
        
        // Create address with 0x prefix
        const finalAddress = `0x${newHex}`
        
        console.log('步骤 4: 添加 0x 前缀')
        console.log('  最终地址:', finalAddress)
        console.log('  总长度:', finalAddress.length, finalAddress.length === 42 ? '✅' : '❌')
        console.log()
        
        return finalAddress
    } catch (e) {
        console.error('生成失败:', e)
        return eoa
    }
}

// 测试几个样例
console.log('='.repeat(70))
console.log('测试样例')
console.log('='.repeat(70))
console.log()

const testAddresses = [
    '0x3bD8e4F8d2c9A1b7E6a5D3C2f1E0B9a8c7D6e5F4',
    '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
    '0x1234567890abcdef1234567890abcdef12345678'
]

testAddresses.forEach((eoa, index) => {
    console.log(`\n测试 ${index + 1}:`)
    console.log('-'.repeat(70))
    const aaAddress = deriveAAAddress(eoa)
    
    console.log('='.repeat(70))
    console.log('结果:')
    console.log('  EOA 地址:', eoa)
    console.log('  AA 地址:', aaAddress)
    console.log('  长度检查:', aaAddress.length === 42 ? '✅ 通过' : '❌ 失败')
    console.log('='.repeat(70))
    console.log()
})

console.log('\n')
console.log('='.repeat(70))
console.log('✅ 测试完成！')
console.log('='.repeat(70))
