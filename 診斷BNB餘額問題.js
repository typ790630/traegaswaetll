/**
 * 診斷腳本：檢查 Smart Account 的 BNB 餘額
 * 
 * 問題：AA 錢包中，EOA 有 BNB 不等於 Smart Account 有 BNB
 */

console.log('='.repeat(80))
console.log('🔍 Smart Account BNB 餘額診斷')
console.log('='.repeat(80))
console.log()

console.log('📋 請在瀏覽器控制台（F12）中運行以下命令：')
console.log()
console.log('='.repeat(80))
console.log()

console.log(`
// ======== 診斷命令：檢查 Smart Account BNB 餘額 ========

(async function() {
  console.log('%c='.repeat(60), 'color: #f44336; font-weight: bold')
  console.log('%c🔍 診斷 Smart Account BNB 餘額', 'color: #f44336; font-size: 18px; font-weight: bold')
  console.log('%c='.repeat(60), 'color: #f44336; font-weight: bold')
  
  const data = localStorage.getItem('app-store')
  if (!data) {
    console.log('%c❌ 沒有錢包數據', 'color: #f44336; font-weight: bold')
    return
  }
  
  const store = JSON.parse(data)
  const wallet = store.state?.wallets?.[0]
  
  console.log('%c📍 地址信息', 'color: #2196f3; font-weight: bold')
  console.log('  EOA 地址（簽名者）:', wallet.eoaAddress || '未找到')
  console.log('  Smart Account 地址（執行者）:', wallet.address)
  console.log()
  
  // 檢查 Smart Account 的 BNB 餘額
  try {
    const rpcUrl = 'https://bsc-dataseed.binance.org/'
    
    console.log('%c⏳ 查詢 Smart Account 的鏈上 BNB 餘額...', 'color: #ff9800; font-weight: bold')
    
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getBalance',
        params: [wallet.address, 'latest'],
        id: 1
      })
    })
    
    const result = await response.json()
    
    if (result.error) {
      console.log('%c❌ 查詢失敗:', 'color: #f44336; font-weight: bold', result.error)
      return
    }
    
    const balanceWei = BigInt(result.result)
    const balanceBNB = Number(balanceWei) / 1e18
    
    console.log('%c💰 Smart Account BNB 餘額', 'color: #4caf50; font-weight: bold')
    console.log('  Wei:', balanceWei.toString())
    console.log('  BNB:', balanceBNB.toFixed(6))
    console.log()
    
    // 判斷是否足夠
    const minGasFee = 0.001 // 最小 gas 費用（估算）
    
    console.log('%c🎯 診斷結果', 'color: #9c27b0; font-weight: bold')
    
    if (balanceBNB >= minGasFee) {
      console.log('  ✅ Smart Account 有足夠的 BNB (' + balanceBNB.toFixed(6) + ' BNB)')
      console.log('  ✅ 理論上應該可以使用 BNB 支付 gas')
      console.log()
      console.log('%c⚠️ 如果仍然失敗，問題可能是:', 'color: #ff9800; font-weight: bold')
      console.log('  1. Gas 估算過高')
      console.log('  2. sendTransaction 方法在 AA 錢包上的兼容性問題')
      console.log('  3. Bundler 不支持用戶自付 gas 模式')
    } else {
      console.log('  ❌ Smart Account BNB 不足！(' + balanceBNB.toFixed(6) + ' BNB)')
      console.log('  ❌ 這就是 BNB 回退失敗的原因')
      console.log()
      console.log('%c💡 解決方案:', 'color: #4caf50; font-weight: bold')
      console.log('  方案 1: 從其他地址轉一些 BNB 到 Smart Account')
      console.log('         目標地址: ' + wallet.address)
      console.log('         建議金額: 0.01 BNB')
      console.log()
      console.log('  方案 2: 修復 Paymaster 對接（推薦）')
      console.log('         - 檢查 RADRS 餘額和授權')
      console.log('         - 確保 Paymaster API 正常工作')
      console.log('         - 驗證合約地址正確')
    }
    
    console.log()
    console.log('%c📊 應用內顯示的餘額（可能是 EOA 的）', 'color: #607d8b; font-weight: bold')
    const network = store.state?.networks?.find(n => n.id === 'bsc')
    network?.assets.forEach(asset => {
      console.log('  ' + asset.symbol + ': ' + asset.balance)
    })
    
    console.log()
    console.log('%c⚠️ 重要提示:', 'color: #f44336; font-weight: bold')
    console.log('  在 AA 錢包架構中：')
    console.log('  - EOA（' + (wallet.eoaAddress || 'N/A') + '）是簽名者')
    console.log('  - Smart Account（' + wallet.address + '）是執行者')
    console.log('  - 交易 gas 從 Smart Account 扣除，不是從 EOA！')
    
  } catch (error) {
    console.log('%c❌ 查詢出錯:', 'color: #f44336; font-weight: bold', error)
  }
  
  console.log()
  console.log('%c='.repeat(60), 'color: #f44336; font-weight: bold')
})()
`)

console.log()
console.log('='.repeat(80))
console.log('📝 說明')
console.log('='.repeat(80))
console.log()

console.log('這個診斷腳本會：')
console.log('1. ✅ 顯示 EOA 地址和 Smart Account 地址')
console.log('2. ✅ 查詢 Smart Account 的實際 BNB 餘額（鏈上數據）')
console.log('3. ✅ 判斷餘額是否足夠支付 gas')
console.log('4. ✅ 提供具體的解決方案')
console.log()

console.log('='.repeat(80))
console.log('🎯 可能的問題和解決方案')
console.log('='.repeat(80))
console.log()

console.log('問題 1: Smart Account 沒有 BNB（最可能）')
console.log('  現象: EOA 有 BNB，但 Smart Account 餘額為 0')
console.log('  原因: AA 錢包的 gas 從 Smart Account 扣，不是從 EOA')
console.log('  解決: 轉一些 BNB 到 Smart Account 地址')
console.log()

console.log('問題 2: sendTransaction 在 AA 架構中不工作')
console.log('  現象: Smart Account 有 BNB，但仍然報 AA21 錯誤')
console.log('  原因: sendTransaction 可能不適合 AA 錢包')
console.log('  解決: 使用 sendUserOperation，但不提供 paymasterAndData')
console.log()

console.log('問題 3: Paymaster 對接有問題（根本原因）')
console.log('  現象: Paymaster 總是失敗')
console.log('  原因: 可能是 RADRS 餘額不足、授權不足、或 API 錯誤')
console.log('  解決: 修復 Paymaster 對接（推薦）')
console.log()

console.log('='.repeat(80))
console.log('✅ 請運行診斷命令並告訴我結果')
console.log('='.repeat(80))
console.log()
