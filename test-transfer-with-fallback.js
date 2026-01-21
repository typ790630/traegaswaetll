/**
 * 測試腳本：驗證轉賬功能和 Paymaster 回退邏輯
 * 
 * 測試場景：
 * 1. Paymaster 可用時使用 RADRS 支付
 * 2. Paymaster 失敗時回退到 BNB 支付
 */

console.log('='.repeat(80))
console.log('🧪 轉賬功能測試腳本')
console.log('='.repeat(80))
console.log()

// 測試步驟說明
console.log('📋 測試步驟：')
console.log('1. 打開應用（http://localhost:5174）')
console.log('2. 打開瀏覽器開發者工具（F12）')
console.log('3. 切換到 Console 標籤')
console.log('4. 粘貼下面的測試命令')
console.log('5. 觀察測試結果')
console.log()

console.log('='.repeat(80))
console.log('🔧 瀏覽器控制台測試命令')
console.log('='.repeat(80))
console.log()

// 測試命令 1：檢查錢包狀態
console.log('// ======== 測試 1: 檢查錢包狀態 ========')
console.log(`
(function() {
  console.log('%c='.repeat(60), 'color: #2196f3; font-weight: bold')
  console.log('%c📊 錢包狀態檢查', 'color: #2196f3; font-size: 18px; font-weight: bold')
  console.log('%c='.repeat(60), 'color: #2196f3; font-weight: bold')
  
  const data = localStorage.getItem('app-store')
  if (!data) {
    console.log('%c❌ 沒有錢包數據', 'color: #f44336; font-weight: bold')
    return
  }
  
  const store = JSON.parse(data)
  const wallet = store.state?.wallets?.[0]
  const network = store.state?.networks?.find(n => n.id === 'bsc')
  
  console.log('%c✅ 錢包信息', 'color: #4caf50; font-weight: bold')
  console.log('  地址:', wallet.address)
  console.log('  長度:', wallet.address.length, wallet.address.length === 42 ? '✅' : '❌')
  console.log()
  
  console.log('%c💰 資產餘額', 'color: #ff9800; font-weight: bold')
  network?.assets.forEach(asset => {
    console.log('  ' + asset.symbol + ': ' + asset.balance)
  })
  console.log()
  
  const bnb = network?.assets.find(a => a.symbol === 'BNB')
  const radrs = network?.assets.find(a => a.symbol === 'RADRS')
  
  console.log('%c🎯 支付方式預測', 'color: #9c27b0; font-weight: bold')
  
  if (parseFloat(radrs?.balance || '0') >= 1) {
    console.log('  ✅ 有 RADRS (' + radrs.balance + ') → 應該使用 Paymaster')
  } else if (parseFloat(bnb?.balance || '0') >= 0.001) {
    console.log('  ⚠️ 沒有足夠 RADRS，但有 BNB (' + bnb.balance + ') → 應該回退到 BNB 支付')
  } else {
    console.log('  ❌ 既沒有 RADRS 也沒有 BNB → 轉賬會失敗')
  }
  
  console.log('%c='.repeat(60), 'color: #2196f3; font-weight: bold')
})()
`)
console.log()

// 測試命令 2：模擬轉賬並觀察日誌
console.log('// ======== 測試 2: 發起轉賬（在應用中操作）========')
console.log('/*')
console.log('步驟：')
console.log('1. 在應用中點擊 RADRS 資產')
console.log('2. 點擊"轉賬"按鈕')
console.log('3. 輸入收款地址（任意有效地址）')
console.log('4. 輸入金額：10')
console.log('5. 點擊"確認交易"')
console.log()
console.log('預期日誌輸出：')
console.log()
console.log('--- 如果 Paymaster 可用 ---')
console.log('[AAService] 🎯 Step 1: Trying with Paymaster (RADRS Gas)...')
console.log('[AAService] Building batch transaction: Approve + Transfer')
console.log('[AAService] Sending UserOperation with Paymaster...')
console.log('[AAService] ✅ Paymaster sponsorship succeeded')
console.log('[AAService] ✅ UserOperation sent with Paymaster!')
console.log('[AAService] UserOp Hash: 0x...')
console.log('[AAService] Waiting for transaction confirmation...')
console.log('[AAService] 🎉 Transaction confirmed!')
console.log('[AAService] Transaction Hash: 0x...')
console.log()
console.log('--- 如果 Paymaster 失敗但有 BNB ---')
console.log('[AAService] 🎯 Step 1: Trying with Paymaster (RADRS Gas)...')
console.log('[AAService] ⚠️ Paymaster sponsorship failed, will fallback to user-paid mode')
console.log('[AAService] ⚠️ Paymaster failed, trying fallback with BNB...')
console.log('[AAService] 🔄 Step 2: Fallback to BNB payment...')
console.log('[AAService] Sending transaction with BNB as gas...')
console.log('[AAService] ✅ Transaction sent with BNB!')
console.log('[AAService] Transaction Hash: 0x...')
console.log('*/')
console.log()

// 測試命令 3：驗證交易狀態
console.log('// ======== 測試 3: 驗證交易狀態 ========')
console.log('// 等待交易完成後，運行這個命令查看活動記錄')
console.log(`
(function() {
  console.log('%c='.repeat(60), 'color: #4caf50; font-weight: bold')
  console.log('%c✅ 交易驗證', 'color: #4caf50; font-size: 18px; font-weight: bold')
  console.log('%c='.repeat(60), 'color: #4caf50; font-weight: bold')
  
  const data = localStorage.getItem('app-store')
  if (!data) {
    console.log('%c❌ 沒有錢包數據', 'color: #f44336; font-weight: bold')
    return
  }
  
  const store = JSON.parse(data)
  
  // 檢查是否有活動記錄（如果你的應用存儲交易歷史）
  console.log('%c📝 建議檢查:', 'color: #ff9800; font-weight: bold')
  console.log('  1. 餘額是否更新了？')
  console.log('  2. Activity 頁面是否顯示新交易？')
  console.log('  3. 在 BSCScan 上查看交易：')
  console.log('     https://bscscan.com/address/' + store.state?.wallets?.[0]?.address)
  console.log()
  
  console.log('%c='.repeat(60), 'color: #4caf50; font-weight: bold')
})()
`)
console.log()

console.log('='.repeat(80))
console.log('🎯 測試場景矩陣')
console.log('='.repeat(80))
console.log()

const testMatrix = [
  { scenario: 'Paymaster 可用 + 有 RADRS', expected: '✅ 使用 Paymaster，交易成功', radrs: '> 1', bnb: '任意', result: 'Paymaster' },
  { scenario: 'Paymaster 失敗 + 有 BNB', expected: '✅ 回退到 BNB，交易成功', radrs: '< 1 或不足', bnb: '> 0.001', result: 'BNB Fallback' },
  { scenario: 'Paymaster 失敗 + 無 BNB', expected: '❌ 交易失敗，提示需要充值', radrs: '< 1', bnb: '< 0.001', result: 'Fail' },
  { scenario: '首次用戶（無餘額）', expected: '✅ Paymaster 免費贊助', radrs: '0', bnb: '0', result: 'Paymaster Free' }
]

console.table(testMatrix)
console.log()

console.log('='.repeat(80))
console.log('📝 測試檢查清單')
console.log('='.repeat(80))
console.log()

const checklist = [
  { item: '地址長度正確（42個字符）', status: '⬜' },
  { item: 'Paymaster 嘗試成功或失敗', status: '⬜' },
  { item: 'BNB 回退邏輯觸發（如果需要）', status: '⬜' },
  { item: '交易成功發送', status: '⬜' },
  { item: '交易哈希返回', status: '⬜' },
  { item: '餘額更新', status: '⬜' },
  { item: '控制台日誌清晰', status: '⬜' },
  { item: '沒有 AA21 錯誤', status: '⬜' },
  { item: '沒有 callData 不匹配錯誤', status: '⬜' }
]

console.log('測試時請逐項檢查：')
console.log()
checklist.forEach((item, index) => {
  console.log('  ' + (index + 1) + '. ' + item.status + ' ' + item.item)
})
console.log()

console.log('='.repeat(80))
console.log('🐛 常見問題診斷')
console.log('='.repeat(80))
console.log()

console.log('問題 1: 仍然看到 AA21 錯誤')
console.log('  原因: Paymaster 簽名失敗或 callData 不匹配')
console.log('  解決: 確保使用最新代碼（已修復 callData 問題）')
console.log()

console.log('問題 2: Paymaster 失敗但 BNB 回退也失敗')
console.log('  原因: BNB 餘額不足或 gas 估算失敗')
console.log('  解決: 確保賬戶有至少 0.001 BNB')
console.log()

console.log('問題 3: 交易一直pending')
console.log('  原因: Bundler 或網絡問題')
console.log('  解決: 檢查 Bundler URL 和網絡連接')
console.log()

console.log('問題 4: paymasterAndData 是 0x（空）')
console.log('  原因: Paymaster middleware 沒有觸發')
console.log('  解決: 已修復，使用 SDK 的 sendUserOperation')
console.log()

console.log('='.repeat(80))
console.log('✅ 測試腳本準備完成')
console.log('='.repeat(80))
console.log()
console.log('請按照上述步驟進行測試，並觀察控制台日誌輸出。')
console.log('測試完成後，請告訴我結果！')
console.log()
