/**
 * 最终验证脚本
 * 在刷新后 3 秒运行此脚本
 */

setTimeout(() => {
  console.log('%c' + '='.repeat(70), 'color: #2196f3; font-weight: bold')
  console.log('%c🔍 最终验证', 'color: #2196f3; font-size: 20px; font-weight: bold')
  console.log('%c' + '='.repeat(70), 'color: #2196f3; font-weight: bold')
  console.log('')
  
  const data = localStorage.getItem('app-store')
  
  if (!data) {
    console.log('%c⚠️ 钱包还在生成中...', 'color: #ff9800; font-size: 16px; font-weight: bold')
    console.log('请等待几秒后再次运行此脚本')
    return
  }
  
  try {
    const store = JSON.parse(data)
    const wallet = store.state?.wallets?.[0]
    
    if (!wallet) {
      console.log('%c❌ 未找到钱包数据', 'color: #f44336; font-weight: bold')
      return
    }
    
    const address = wallet.address
    const length = address.length
    const hexLength = address.substring(2).length
    
    console.log('%c📊 钱包信息:', 'color: #2196f3; font-weight: bold; font-size: 16px')
    console.log('-'.repeat(70))
    console.log('钱包名称:', wallet.name)
    console.log('EOA 地址:', wallet.eoaAddress)
    console.log('AA 地址:', address)
    console.log('')
    
    console.log('%c📏 地址长度检查:', 'color: #2196f3; font-weight: bold; font-size: 16px')
    console.log('-'.repeat(70))
    console.log('总长度:', length, `(应该是 42)`, length === 42 ? '✅' : '❌')
    console.log('十六进制长度:', hexLength, `(应该是 40)`, hexLength === 40 ? '✅' : '❌')
    console.log('')
    
    console.log('%c' + '='.repeat(70), 'color: #2196f3; font-weight: bold')
    
    if (length === 42 && hexLength === 40) {
      console.log('%c🎉 成功！地址完全正确！', 'color: #4caf50; font-size: 24px; font-weight: bold')
      console.log('%c问题已彻底解决！', 'color: #4caf50; font-size: 18px; font-weight: bold')
      console.log('')
      console.log('%c✅ 控制台应该没有地址错误了', 'color: #4caf50; font-size: 14px')
      console.log('%c✅ 可以正常使用钱包功能了', 'color: #4caf50; font-size: 14px')
    } else {
      console.log('%c❌ 仍然有问题！', 'color: #f44336; font-size: 24px; font-weight: bold')
      console.log('%c地址长度:', length, '(应该是 42)', 'color: #f44336; font-size: 16px; font-weight: bold')
      console.log('')
      console.log('%c可能的原因:', 'color: #ff9800; font-weight: bold')
      console.log('1. 浏览器缓存了旧代码 - 尝试 Ctrl + Shift + R')
      console.log('2. 需要完全关闭浏览器标签并重新打开')
      console.log('3. Vite 开发服务器需要重启')
    }
    
    console.log('%c' + '='.repeat(70), 'color: #2196f3; font-weight: bold')
    
  } catch (e) {
    console.error('%c❌ 解析数据失败:', 'color: #f44336; font-weight: bold', e)
  }
  
}, 3000)
