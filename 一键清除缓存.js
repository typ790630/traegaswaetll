/**
 * 一键清除缓存脚本
 * 
 * 使用方法：
 * 1. 打开浏览器控制台 (F12)
 * 2. 切换到 Console 标签
 * 3. 复制整个文件内容
 * 4. 粘贴到控制台并回车
 */

(function() {
  console.log('%c='.repeat(60), 'color: #0066cc; font-weight: bold')
  console.log('%c一键清除缓存脚本', 'color: #0066cc; font-size: 20px; font-weight: bold')
  console.log('%c='.repeat(60), 'color: #0066cc; font-weight: bold')
  console.log('')
  
  // 步骤 1: 显示当前数据
  console.log('%c步骤 1: 检查当前数据', 'color: #ff9800; font-weight: bold')
  console.log('-'.repeat(60))
  
  const oldData = localStorage.getItem('app-store')
  if (oldData) {
    try {
      const store = JSON.parse(oldData)
      const wallet = store.state?.wallets?.[0]
      
      if (wallet) {
        console.log('当前钱包地址:', wallet.address)
        console.log('地址长度:', wallet.address.length, wallet.address.length === 42 ? '✅ 正确' : '❌ 错误')
        console.log('十六进制长度:', wallet.address.substring(2).length, wallet.address.substring(2).length === 40 ? '✅ 正确' : '❌ 错误')
        
        if (wallet.address.length !== 42) {
          console.log('%c⚠️ 检测到地址长度错误！需要清除缓存。', 'color: #f44336; font-weight: bold; font-size: 14px')
        }
      }
    } catch (e) {
      console.error('解析数据失败:', e)
    }
  } else {
    console.log('ℹ️ 没有找到缓存数据')
  }
  
  console.log('')
  
  // 步骤 2: 清除缓存
  console.log('%c步骤 2: 清除缓存', 'color: #ff9800; font-weight: bold')
  console.log('-'.repeat(60))
  
  try {
    localStorage.removeItem('app-store')
    console.log('%c✅ 缓存已成功清除！', 'color: #4caf50; font-weight: bold; font-size: 14px')
  } catch (e) {
    console.error('%c❌ 清除失败:', 'color: #f44336; font-weight: bold', e)
    return
  }
  
  console.log('')
  
  // 步骤 3: 准备刷新
  console.log('%c步骤 3: 刷新页面', 'color: #ff9800; font-weight: bold')
  console.log('-'.repeat(60))
  console.log('页面将在 2 秒后自动刷新...')
  console.log('')
  
  // 倒计时
  let countdown = 2
  const countdownInterval = setInterval(() => {
    console.log(`🔄 ${countdown} 秒...`)
    countdown--
    
    if (countdown < 0) {
      clearInterval(countdownInterval)
      console.log('%c正在刷新...', 'color: #2196f3; font-weight: bold')
      console.log('')
      console.log('%c='.repeat(60), 'color: #0066cc; font-weight: bold')
      console.log('%c刷新完成后，请：', 'color: #0066cc; font-size: 16px; font-weight: bold')
      console.log('%c1. 解锁应用 (密码: 123456)', 'color: #666; font-size: 14px')
      console.log('%c2. 查看资产列表中的价格', 'color: #666; font-size: 14px')
      console.log('%c3. 检查控制台是否还有错误', 'color: #666; font-size: 14px')
      console.log('%c='.repeat(60), 'color: #0066cc; font-weight: bold')
      
      setTimeout(() => {
        location.reload()
      }, 500)
    }
  }, 1000)
  
})()
