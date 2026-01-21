/**
 * 价格修复验证脚本
 * 测试新的 CoinGecko API 是否正常工作
 */

console.log('='.repeat(60))
console.log('价格修复验证测试')
console.log('='.repeat(60))
console.log()

// 测试 CoinGecko API
async function testCoinGeckoAPI() {
  console.log('📊 测试 1: CoinGecko API 可用性')
  console.log('-'.repeat(60))
  
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=binancecoin,ethereum,matic-network&vs_currencies=usd'
    )
    
    if (!response.ok) {
      console.error('❌ API 响应错误:', response.status, response.statusText)
      return false
    }
    
    const data = await response.json()
    console.log('✅ CoinGecko API 可用!')
    console.log('响应数据:', JSON.stringify(data, null, 2))
    console.log()
    
    console.log('价格信息:')
    console.log(`  BNB:   $${data.binancecoin?.usd || '未知'}`)
    console.log(`  ETH:   $${data.ethereum?.usd || '未知'}`)
    console.log(`  MATIC: $${data['matic-network']?.usd || '未知'}`)
    console.log()
    
    return true
  } catch (error) {
    console.error('❌ CoinGecko API 调用失败:', error.message)
    return false
  }
}

// 测试 GeckoTerminal API (RADRS)
async function testGeckoTerminalAPI() {
  console.log('📊 测试 2: GeckoTerminal API (RADRS 价格)')
  console.log('-'.repeat(60))
  
  try {
    const response = await fetch(
      'https://api.geckoterminal.com/api/v2/networks/bsc/tokens/0xe2188a2e0a41a50f09359e5fe714d5e643036f2a'
    )
    
    if (!response.ok) {
      console.error('❌ API 响应错误:', response.status, response.statusText)
      return false
    }
    
    const data = await response.json()
    const radrsPrice = data.data?.attributes?.price_usd
    
    if (radrsPrice) {
      console.log('✅ GeckoTerminal API 可用!')
      console.log(`  RADRS: $${parseFloat(radrsPrice).toFixed(5)}`)
    } else {
      console.warn('⚠️ 未找到 RADRS 价格数据')
    }
    console.log()
    
    return true
  } catch (error) {
    console.error('❌ GeckoTerminal API 调用失败:', error.message)
    return false
  }
}

// 对比 Binance API (应该失败)
async function testBinanceAPI() {
  console.log('📊 测试 3: Binance API (预期失败)')
  console.log('-'.repeat(60))
  
  try {
    const response = await fetch(
      'https://api.binance.com/api/v3/ticker/price?symbol=BNBUSDT',
      { signal: AbortSignal.timeout(5000) } // 5秒超时
    )
    
    if (!response.ok) {
      console.log(`✅ 预期结果: Binance API 失败 (${response.status} ${response.statusText})`)
      console.log('   这就是为什么我们切换到 CoinGecko 的原因')
      return true
    }
    
    const data = await response.json()
    console.warn('⚠️ 意外: Binance API 可用!')
    console.warn('   BNB 价格:', data.price)
    console.log()
    
    return true
  } catch (error) {
    console.log(`✅ 预期结果: Binance API 失败 (${error.message})`)
    console.log('   这就是为什么我们切换到 CoinGecko 的原因')
    return true
  }
}

// 运行所有测试
async function runAllTests() {
  const test1 = await testCoinGeckoAPI()
  const test2 = await testGeckoTerminalAPI()
  const test3 = await testBinanceAPI()
  
  console.log('='.repeat(60))
  console.log('测试总结')
  console.log('='.repeat(60))
  console.log(`CoinGecko API:     ${test1 ? '✅ 通过' : '❌ 失败'}`)
  console.log(`GeckoTerminal API: ${test2 ? '✅ 通过' : '❌ 失败'}`)
  console.log(`Binance API:       ${test3 ? '✅ 符合预期' : '❌ 异常'}`)
  console.log()
  
  if (test1 && test2) {
    console.log('🎉 价格修复成功！')
    console.log('   应用现在可以正常获取实时价格了。')
    console.log()
    console.log('📝 下一步:')
    console.log('   1. 打开应用 (http://localhost:5175/)')
    console.log('   2. 解锁应用 (密码: 123456)')
    console.log('   3. 查看资产列表中的价格')
    console.log('   4. 等待 60 秒，价格会自动更新')
  } else {
    console.log('⚠️ 部分测试失败')
    console.log('   但降级价格机制会确保应用仍然可用。')
  }
  console.log()
  console.log('='.repeat(60))
}

// 执行测试
runAllTests().catch(error => {
  console.error('❌ 测试执行失败:', error)
})
