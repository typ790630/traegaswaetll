// 地址验证脚本
// 运行此脚本来验证所有地址配置

const expectedSmartAccountAddress = '0x2139366909c41d7fAdd2c3701db57Ca4B5f0224B'
const expectedRadrsTokenAddress = '0xe2188a2e0a41a50f09359e5fe714d5e643036f2a'

console.log('\n╔════════════════════════════════════════════════════════╗')
console.log('║          🔍 钱包地址配置验证                             ║')
console.log('╚════════════════════════════════════════════════════════╝\n')

console.log('✅ 期望的智能账户地址（您的钱包地址）：')
console.log(`   ${expectedSmartAccountAddress}`)
console.log('')
console.log('✅ 期望的 RADRS 代币合约地址：')
console.log(`   ${expectedRadrsTokenAddress}`)
console.log('')

console.log('─────────────────────────────────────────────────────────')
console.log('📋 配置说明：')
console.log('─────────────────────────────────────────────────────────\n')

console.log('1. 智能账户地址（显示在界面上）：')
console.log('   • 这是您的钱包地址')
console.log('   • 用于接收和发送资产')
console.log('   • 显示在所有页面（收款、转账、钱包主页等）')
console.log(`   • 地址：${expectedSmartAccountAddress}\n`)

console.log('2. RADRS 代币合约地址（不显示在界面上）：')
console.log('   • 这是 RADRS 代币的智能合约地址')
console.log('   • 仅用于后台调用（查询余额、转账等）')
console.log('   • 不会显示给用户')
console.log(`   • 地址：${expectedRadrsTokenAddress}\n`)

console.log('─────────────────────────────────────────────────────────')
console.log('🎯 如何验证：')
console.log('─────────────────────────────────────────────────────────\n')

console.log('1. 启动应用')
console.log('2. 进入钱包主页，查看显示的地址是否为：')
console.log(`   ${expectedSmartAccountAddress}`)
console.log('3. 进入收款页面，查看 QR 码和地址是否为：')
console.log(`   ${expectedSmartAccountAddress}`)
console.log('4. 点击复制地址，粘贴查看是否为：')
console.log(`   ${expectedSmartAccountAddress}`)
console.log('')

console.log('✅ 如果以上地址都匹配，说明配置正确！')
console.log('❌ 如果看到不同的地址，请截图并告知。\n')

console.log('═════════════════════════════════════════════════════════\n')
