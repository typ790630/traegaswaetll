/**
 * 直接測試 Paymaster API
 * 檢查 Paymaster 為什麼失敗
 */

console.log('='.repeat(80))
console.log('🔍 Paymaster API 直接測試')
console.log('='.repeat(80))
console.log()

console.log('請在瀏覽器控制台運行以下代碼：')
console.log()
console.log('='.repeat(80))
console.log()

console.log(`
(async function() {
  console.log('%c='.repeat(60), 'color: #2196f3; font-weight: bold')
  console.log('%c🔍 Paymaster API 測試', 'color: #2196f3; font-size: 18px; font-weight: bold')
  console.log('%c='.repeat(60), 'color: #2196f3; font-weight: bold')
  
  const data = localStorage.getItem('app-store')
  if (!data) {
    console.log('%c❌ 沒有錢包數據', 'color: #f44336; font-weight: bold')
    return
  }
  
  const store = JSON.parse(data)
  const wallet = store.state?.wallets?.[0]
  
  console.log('%c📍 錢包地址', 'color: #2196f3; font-weight: bold')
  console.log('  Smart Account:', wallet.address)
  console.log()
  
  // 測試 1: 檢查是否已激活
  console.log('%c📋 測試 1: 檢查激活狀態', 'color: #ff9800; font-weight: bold')
  try {
    const paymasterAddress = '0xD0D46B98dFf2ee93Dfe708d4434f180383B2B939'
    const rpcUrl = 'https://bsc-dataseed.binance.org/'
    
    const checkActivatedResponse = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_call',
        params: [{
          to: paymasterAddress,
          data: '0x' + 
                'f3f43703' + // isActivated(address) function signature
                '000000000000000000000000' + wallet.address.slice(2).toLowerCase()
        }, 'latest'],
        id: 1
      })
    })
    
    const activatedResult = await checkActivatedResponse.json()
    console.log('  原始響應:', activatedResult)
    
    if (activatedResult.result) {
      const isActivated = activatedResult.result !== '0x0000000000000000000000000000000000000000000000000000000000000000'
      console.log('  ✅ 激活狀態:', isActivated ? '已激活' : '未激活（應該可以免費）')
    }
  } catch (e) {
    console.log('  ❌ 查詢失敗:', e)
  }
  console.log()
  
  // 測試 2: 檢查 RADRS 餘額
  console.log('%c📋 測試 2: 檢查 RADRS 餘額', 'color: #ff9800; font-weight: bold')
  try {
    const radrsTokenAddress = '0xe2188a2e0a41a50f09359e5fe714d5e643036f2a'
    const rpcUrl = 'https://bsc-dataseed.binance.org/'
    
    const balanceResponse = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_call',
        params: [{
          to: radrsTokenAddress,
          data: '0x' + 
                '70a08231' + // balanceOf(address) function signature
                '000000000000000000000000' + wallet.address.slice(2).toLowerCase()
        }, 'latest'],
        id: 2
      })
    })
    
    const balanceResult = await balanceResponse.json()
    
    if (balanceResult.result) {
      const balanceWei = BigInt(balanceResult.result)
      const balanceRADRS = Number(balanceWei) / 1e18
      console.log('  RADRS 餘額:', balanceRADRS.toFixed(4))
      
      if (balanceRADRS >= 1) {
        console.log('  ✅ RADRS 餘額充足，可以支付 gas')
      } else {
        console.log('  ⚠️ RADRS 餘額不足，需要依賴 Paymaster 免費贊助')
      }
    }
  } catch (e) {
    console.log('  ❌ 查詢失敗:', e)
  }
  console.log()
  
  // 測試 3: 直接調用 Paymaster API
  console.log('%c📋 測試 3: 直接調用 Paymaster API', 'color: #ff9800; font-weight: bold')
  try {
    const paymasterApiUrl = 'https://radrs-paymaster.vercel.app/api/paymaster/sponsor'
    
    // 構造一個最小的 UserOp
    const dummyUserOp = {
      sender: wallet.address,
      nonce: '0x0',
      initCode: '0x',
      callData: '0x',
      callGasLimit: '0x30d40',  // 200000
      verificationGasLimit: '0x30d40',  // 200000
      preVerificationGas: '0xc350',  // 50000
      maxFeePerGas: '0x59682f00',  // 1.5 gwei
      maxPriorityFeePerGas: '0x59682f00'  // 1.5 gwei
    }
    
    console.log('  發送請求到:', paymasterApiUrl)
    console.log('  UserOp sender:', dummyUserOp.sender)
    
    const response = await fetch(paymasterApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chainId: 56,
        userOp: dummyUserOp
      })
    })
    
    console.log('  HTTP 狀態:', response.status)
    
    const responseText = await response.text()
    console.log('  原始響應:', responseText)
    
    try {
      const result = JSON.parse(responseText)
      
      if (response.ok) {
        console.log('  ✅ Paymaster API 響應成功！')
        console.log('  paymasterAndData:', result.paymasterAndData?.slice(0, 66) + '...')
        console.log('  callGasLimit:', result.callGasLimit)
        console.log('  verificationGasLimit:', result.verificationGasLimit)
      } else {
        console.log('  ❌ Paymaster API 響應錯誤:', result)
        console.log()
        console.log('%c🔍 錯誤分析:', 'color: #f44336; font-weight: bold')
        
        if (result.message) {
          console.log('  錯誤信息:', result.message)
          
          if (result.message.includes('insufficient')) {
            console.log('  💡 可能原因: Paymaster 合約餘額不足')
          } else if (result.message.includes('signature')) {
            console.log('  💡 可能原因: 簽名驗證失敗')
          } else if (result.message.includes('activation')) {
            console.log('  💡 可能原因: 激活檢查邏輯問題')
          }
        }
      }
    } catch (e) {
      console.log('  ❌ 響應不是有效的 JSON:', responseText)
    }
  } catch (e) {
    console.log('  ❌ API 調用失敗:', e)
  }
  console.log()
  
  console.log('%c='.repeat(60), 'color: #2196f3; font-weight: bold')
  console.log('%c✅ 測試完成！', 'color: #4caf50; font-weight: bold')
  console.log()
  console.log('請將上述結果截圖或複製給開發者')
})()
`)

console.log()
console.log('='.repeat(80))
console.log('📝 這個測試會檢查：')
console.log('='.repeat(80))
console.log()
console.log('1. ✅ Smart Account 是否已激活（是否享受過免費）')
console.log('2. ✅ RADRS 餘額是否充足')
console.log('3. ✅ Paymaster API 是否正常工作')
console.log('4. ✅ 如果失敗，具體的錯誤原因')
console.log()
console.log('這將幫助我們找到 Paymaster 失敗的真正原因！')
console.log()
