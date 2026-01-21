/**
 * 终极清除脚本 - 彻底清除所有缓存和旧数据
 * 在浏览器控制台运行
 */

(function() {
  console.log('%c' + '='.repeat(70), 'color: #e91e63; font-weight: bold')
  console.log('%c💣 终极清除脚本', 'color: #e91e63; font-size: 24px; font-weight: bold')
  console.log('%c' + '='.repeat(70), 'color: #e91e63; font-weight: bold')
  console.log('')
  
  console.log('%c步骤 1: 清除所有本地存储', 'color: #ff9800; font-size: 16px; font-weight: bold')
  console.log('-'.repeat(70))
  
  // 清除所有 localStorage
  const beforeKeys = Object.keys(localStorage)
  console.log('清除前的键:', beforeKeys)
  
  localStorage.clear()
  
  console.log('%c✅ localStorage 已完全清除', 'color: #4caf50; font-weight: bold')
  console.log('')
  
  // 清除所有 sessionStorage
  console.log('%c步骤 2: 清除会话存储', 'color: #ff9800; font-size: 16px; font-weight: bold')
  console.log('-'.repeat(70))
  sessionStorage.clear()
  console.log('%c✅ sessionStorage 已清除', 'color: #4caf50; font-weight: bold')
  console.log('')
  
  // 清除所有 cookies
  console.log('%c步骤 3: 清除 Cookies', 'color: #ff9800; font-size: 16px; font-weight: bold')
  console.log('-'.repeat(70))
  document.cookie.split(";").forEach(function(c) { 
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
  })
  console.log('%c✅ Cookies 已清除', 'color: #4caf50; font-weight: bold')
  console.log('')
  
  console.log('%c步骤 4: 准备刷新', 'color: #ff9800; font-size: 16px; font-weight: bold')
  console.log('-'.repeat(70))
  console.log('页面将在 2 秒后刷新...')
  console.log('刷新后，应用会使用最新的代码生成正确的地址')
  console.log('')
  
  let countdown = 2
  const timer = setInterval(() => {
    if (countdown > 0) {
      console.log(`⏱️ ${countdown} 秒...`)
      countdown--
    } else {
      clearInterval(timer)
      console.log('%c' + '='.repeat(70), 'color: #4caf50; font-weight: bold')
      console.log('%c🚀 正在刷新...', 'color: #4caf50; font-size: 20px; font-weight: bold')
      console.log('%c' + '='.repeat(70), 'color: #4caf50; font-weight: bold')
      console.log('')
      console.log('%c刷新后请等待 3 秒，然后运行验证脚本', 'color: #2196f3; font-size: 14px')
      console.log('')
      
      setTimeout(() => {
        location.reload(true) // 强制刷新
      }, 500)
    }
  }, 1000)
  
})()
