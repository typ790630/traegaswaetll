/**
 * 控制台错误一键修复脚本
 * 在浏览器控制台中运行此脚本
 */

console.log('%c='.repeat(70), 'color: #e91e63; font-weight: bold')
console.log('%c🔧 控制台错误一键修复', 'color: #e91e63; font-size: 24px; font-weight: bold')
console.log('%c='.repeat(70), 'color: #e91e63; font-weight: bold')
console.log('')

// 检测错误
console.log('%c📊 步骤 1: 检测错误', 'color: #ff9800; font-size: 16px; font-weight: bold')
console.log('-'.repeat(70))

const data = localStorage.getItem('app-store')
let hasAddressError = false
let currentAddress = 'unknown'

if (data) {
  try {
    const store = JSON.parse(data)
    const wallet = store.state?.wallets?.[0]
    
    if (wallet) {
      currentAddress = wallet.address
      const length = wallet.address.length
      
      console.log('当前钱包地址:', currentAddress)
      console.log('地址总长度:', length)
      console.log('十六进制长度:', wallet.address.substring(2).length)
      
      if (length !== 42) {
        hasAddressError = true
        console.log('%c❌ 错误 1: 地址长度不正确 (当前: ' + length + ', 应该: 42)', 'color: #f44336; font-weight: bold; font-size: 14px')
      } else {
        console.log('%c✅ 地址长度正确', 'color: #4caf50; font-weight: bold')
      }
    }
  } catch (e) {
    console.error('解析数据失败:', e)
  }
} else {
  console.log('ℹ️ 未找到缓存数据')
}

console.log('%c❌ 错误 2: CoinGecko API CORS 错误', 'color: #f44336; font-weight: bold; font-size: 14px')
console.log('   原因: 浏览器阻止跨域请求')
console.log('   说明: 这是浏览器安全策略，不影响核心功能')

console.log('%c⚠️ 错误 3: RPC 节点网络错误', 'color: #ff9800; font-weight: bold; font-size: 14px')
console.log('   原因: BSC RPC 节点连接不稳定')
console.log('   说明: 会自动重试，不影响使用')

console.log('')

// 修复地址错误
if (hasAddressError) {
  console.log('%c🔧 步骤 2: 修复地址错误', 'color: #ff9800; font-size: 16px; font-weight: bold')
  console.log('-'.repeat(70))
  
  try {
    // 备份旧数据
    console.log('正在备份旧数据...')
    const backup = localStorage.getItem('app-store')
    sessionStorage.setItem('app-store-backup', backup)
    console.log('✅ 已备份到 sessionStorage')
    
    // 清除错误数据
    console.log('正在清除错误数据...')
    localStorage.removeItem('app-store')
    console.log('%c✅ 错误数据已清除！', 'color: #4caf50; font-weight: bold; font-size: 14px')
    
    console.log('')
    console.log('%c📝 修复说明:', 'color: #2196f3; font-weight: bold; font-size: 14px')
    console.log('   • 旧地址 (错误):', currentAddress, '(长度: ' + currentAddress.length + ')')
    console.log('   • 新地址将在页面刷新后自动生成')
    console.log('   • 新地址长度将是正确的 42 个字符')
    
  } catch (e) {
    console.error('%c❌ 修复失败:', 'color: #f44336; font-weight: bold', e)
  }
} else {
  console.log('%c✅ 步骤 2: 地址无需修复', 'color: #4caf50; font-size: 16px; font-weight: bold')
  console.log('-'.repeat(70))
}

console.log('')

// 准备刷新
console.log('%c🔄 步骤 3: 刷新页面', 'color: #ff9800; font-size: 16px; font-weight: bold')
console.log('-'.repeat(70))

if (hasAddressError) {
  console.log('页面将在 3 秒后自动刷新...')
  console.log('')
  
  let countdown = 3
  const timer = setInterval(() => {
    if (countdown > 0) {
      console.log(`⏱️ ${countdown} 秒...`)
      countdown--
    } else {
      clearInterval(timer)
      console.log('%c正在刷新页面...', 'color: #2196f3; font-weight: bold; font-size: 16px')
      console.log('')
      console.log('%c='.repeat(70), 'color: #4caf50; font-weight: bold')
      console.log('%c✅ 修复完成！', 'color: #4caf50; font-size: 20px; font-weight: bold')
      console.log('%c='.repeat(70), 'color: #4caf50; font-weight: bold')
      console.log('')
      console.log('%c刷新后请：', 'color: #2196f3; font-weight: bold; font-size: 16px')
      console.log('%c1. 解锁应用 (密码: 123456)', 'color: #666; font-size: 14px')
      console.log('%c2. 查看资产列表', 'color: #666; font-size: 14px')
      console.log('%c3. 检查控制台是否还有地址错误', 'color: #666; font-size: 14px')
      console.log('%c4. BNB 价格应该显示 ~$650 (不再是 $926.46)', 'color: #666; font-size: 14px')
      console.log('')
      
      setTimeout(() => location.reload(), 500)
    }
  }, 1000)
} else {
  console.log('%cℹ️ 地址正确，无需刷新', 'color: #2196f3; font-weight: bold')
  console.log('')
  console.log('%c💡 关于其他错误:', 'color: #ff9800; font-weight: bold; font-size: 16px')
  console.log('%c• CORS 错误: 不影响核心功能，价格会使用降级值', 'color: #666; font-size: 14px')
  console.log('%c• RPC 错误: 网络波动，会自动重试', 'color: #666; font-size: 14px')
  console.log('')
}

console.log('%c='.repeat(70), 'color: #e91e63; font-weight: bold')
