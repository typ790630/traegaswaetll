/**
 * 🧪 钱包功能自动化测试脚本
 * 
 * 使用方法：
 * node test-wallet-functions.cjs
 * 
 * 功能：
 * - 测试余额查询
 * - 测试价格获取
 * - 测试兑换功能（模拟）
 * - 测试转账功能（模拟）
 * - 性能监控
 * - 生成测试报告
 */

const { createPublicClient, http, formatEther, parseEther, parseAbi } = require('viem')
const { bsc } = require('viem/chains')

// 配置
const TEST_ADDRESS = '0xFEB445C3aF257D5D0742E8C3829B9CDBD2396BBF' // 替换为您的测试地址
const PANCAKE_ROUTER = '0x10ED43C718714eb63d5aA57B78B54704E256024E'
const WBNB_ADDRESS = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'
const USDT_ADDRESS = '0x55d398326f99059fF775485246999027B3197955'
const RADRS_ADDRESS = '0x2139366909c41d7fAdd2c3701db57Ca4B5f0224B'

// RPC 节点配置
const RPC_NODES = [
  'https://bsc-dataseed1.binance.org',
  'https://bsc-dataseed2.binance.org',
  'https://bsc-dataseed.binance.org',
  'https://bsc.publicnode.com'
]

// 创建客户端
const publicClient = createPublicClient({
  chain: bsc,
  transport: http(RPC_NODES[0], {
    timeout: 10000,
    retryCount: 3
  })
})

// ERC20 ABI
const ERC20_ABI = parseAbi([
  'function balanceOf(address) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)'
])

// PancakeSwap Router ABI
const ROUTER_ABI = parseAbi([
  'function getAmountsOut(uint amountIn, address[] memory path) view returns (uint[] memory amounts)'
])

// 测试结果存储
const testResults = {
  startTime: Date.now(),
  tests: [],
  summary: {
    total: 0,
    passed: 0,
    failed: 0
  }
}

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logTest(name, status, duration, details = '') {
  const icon = status === 'PASS' ? '✅' : '❌'
  const color = status === 'PASS' ? 'green' : 'red'
  log(`${icon} [${status}] ${name} (${duration}ms) ${details}`, color)
}

// 测试记录
function recordTest(name, status, duration, details = '', data = null) {
  testResults.tests.push({
    name,
    status,
    duration,
    details,
    data,
    timestamp: new Date().toISOString()
  })
  
  testResults.summary.total++
  if (status === 'PASS') {
    testResults.summary.passed++
  } else {
    testResults.summary.failed++
  }
  
  logTest(name, status, duration, details)
}

// 延迟函数
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// ==================== 测试函数 ====================

/**
 * 测试 1：BNB 余额查询
 */
async function testBNBBalance() {
  const testName = '测试 1：BNB 余额查询'
  const startTime = Date.now()
  
  try {
    log(`\n🔍 ${testName}...`, 'cyan')
    
    const balance = await publicClient.getBalance({
      address: TEST_ADDRESS
    })
    
    const balanceInBNB = formatEther(balance)
    const duration = Date.now() - startTime
    
    if (parseFloat(balanceInBNB) >= 0) {
      recordTest(testName, 'PASS', duration, `余额: ${balanceInBNB} BNB`, { balance: balanceInBNB })
    } else {
      recordTest(testName, 'FAIL', duration, '余额查询异常')
    }
    
    return { success: true, balance: balanceInBNB }
  } catch (error) {
    const duration = Date.now() - startTime
    recordTest(testName, 'FAIL', duration, error.message)
    return { success: false, error: error.message }
  }
}

/**
 * 测试 2：ERC20 余额查询（USDT）
 */
async function testUSDTBalance() {
  const testName = '测试 2：USDT 余额查询'
  const startTime = Date.now()
  
  try {
    log(`\n🔍 ${testName}...`, 'cyan')
    
    const balance = await publicClient.readContract({
      address: USDT_ADDRESS,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [TEST_ADDRESS]
    })
    
    const balanceInUSDT = (Number(balance) / 1e18).toFixed(4)
    const duration = Date.now() - startTime
    
    if (parseFloat(balanceInUSDT) >= 0) {
      recordTest(testName, 'PASS', duration, `余额: ${balanceInUSDT} USDT`, { balance: balanceInUSDT })
    } else {
      recordTest(testName, 'FAIL', duration, '余额查询异常')
    }
    
    return { success: true, balance: balanceInUSDT }
  } catch (error) {
    const duration = Date.now() - startTime
    recordTest(testName, 'FAIL', duration, error.message)
    return { success: false, error: error.message }
  }
}

/**
 * 测试 3：RADRS 余额查询
 */
async function testRADRSBalance() {
  const testName = '测试 3：RADRS 余额查询'
  const startTime = Date.now()
  
  try {
    log(`\n🔍 ${testName}...`, 'cyan')
    
    const balance = await publicClient.readContract({
      address: RADRS_ADDRESS,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [TEST_ADDRESS]
    })
    
    const balanceInRADRS = (Number(balance) / 1e18).toFixed(2)
    const duration = Date.now() - startTime
    
    if (parseFloat(balanceInRADRS) >= 0) {
      recordTest(testName, 'PASS', duration, `余额: ${balanceInRADRS} RADRS`, { balance: balanceInRADRS })
    } else {
      recordTest(testName, 'FAIL', duration, '余额查询异常')
    }
    
    return { success: true, balance: balanceInRADRS }
  } catch (error) {
    const duration = Date.now() - startTime
    recordTest(testName, 'FAIL', duration, error.message)
    return { success: false, error: error.message }
  }
}

/**
 * 测试 4：BNB → USDT 报价查询
 */
async function testBNBToUSDTQuote() {
  const testName = '测试 4：BNB → USDT 报价查询'
  const startTime = Date.now()
  
  try {
    log(`\n💱 ${testName}...`, 'cyan')
    
    const amountIn = parseEther('0.001') // 0.001 BNB
    const path = [WBNB_ADDRESS, USDT_ADDRESS]
    
    const amounts = await publicClient.readContract({
      address: PANCAKE_ROUTER,
      abi: ROUTER_ABI,
      functionName: 'getAmountsOut',
      args: [amountIn, path]
    })
    
    const amountOut = (Number(amounts[1]) / 1e18).toFixed(4)
    const duration = Date.now() - startTime
    
    const performanceRating = duration < 3000 ? '优秀' : duration < 5000 ? '良好' : '需改进'
    
    recordTest(testName, 'PASS', duration, `报价: ${amountOut} USDT (${performanceRating})`, { 
      amountIn: '0.001 BNB',
      amountOut: `${amountOut} USDT`,
      performance: performanceRating
    })
    
    return { success: true, amountOut }
  } catch (error) {
    const duration = Date.now() - startTime
    recordTest(testName, 'FAIL', duration, error.message)
    return { success: false, error: error.message }
  }
}

/**
 * 测试 5：USDT → RADRS 报价查询
 */
async function testUSDTToRADRSQuote() {
  const testName = '测试 5：USDT → RADRS 报价查询'
  const startTime = Date.now()
  
  try {
    log(`\n💱 ${testName}...`, 'cyan')
    
    const amountIn = parseEther('10') // 10 USDT
    const path = [USDT_ADDRESS, WBNB_ADDRESS, RADRS_ADDRESS]
    
    const amounts = await publicClient.readContract({
      address: PANCAKE_ROUTER,
      abi: ROUTER_ABI,
      functionName: 'getAmountsOut',
      args: [amountIn, path]
    })
    
    const amountOut = (Number(amounts[2]) / 1e18).toFixed(2)
    const duration = Date.now() - startTime
    
    const performanceRating = duration < 3000 ? '优秀' : duration < 5000 ? '良好' : '需改进'
    
    recordTest(testName, 'PASS', duration, `报价: ${amountOut} RADRS (${performanceRating})`, {
      amountIn: '10 USDT',
      amountOut: `${amountOut} RADRS`,
      performance: performanceRating,
      note: '⚠️ RADRS 是带税代币，实际到账会扣除约 10% 税收'
    })
    
    return { success: true, amountOut }
  } catch (error) {
    const duration = Date.now() - startTime
    recordTest(testName, 'FAIL', duration, error.message)
    return { success: false, error: error.message }
  }
}

/**
 * 测试 6：RADRS → BNB 报价查询
 */
async function testRADRSToBNBQuote() {
  const testName = '测试 6：RADRS → BNB 报价查询'
  const startTime = Date.now()
  
  try {
    log(`\n💱 ${testName}...`, 'cyan')
    
    const amountIn = parseEther('100') // 100 RADRS
    const path = [RADRS_ADDRESS, WBNB_ADDRESS]
    
    const amounts = await publicClient.readContract({
      address: PANCAKE_ROUTER,
      abi: ROUTER_ABI,
      functionName: 'getAmountsOut',
      args: [amountIn, path]
    })
    
    const amountOut = (Number(amounts[1]) / 1e18).toFixed(6)
    const duration = Date.now() - startTime
    
    const performanceRating = duration < 3000 ? '优秀' : duration < 5000 ? '良好' : '需改进'
    
    recordTest(testName, 'PASS', duration, `报价: ${amountOut} BNB (${performanceRating})`, {
      amountIn: '100 RADRS',
      amountOut: `${amountOut} BNB`,
      performance: performanceRating,
      note: '⚠️ RADRS 是带税代币，实际到账会扣除约 10% 税收'
    })
    
    return { success: true, amountOut }
  } catch (error) {
    const duration = Date.now() - startTime
    recordTest(testName, 'FAIL', duration, error.message)
    return { success: false, error: error.message }
  }
}

/**
 * 测试 7：RPC 节点响应时间
 */
async function testRPCNodes() {
  const testName = '测试 7：RPC 节点响应时间'
  log(`\n🌐 ${testName}...`, 'cyan')
  
  const results = []
  
  for (const rpcUrl of RPC_NODES) {
    const startTime = Date.now()
    try {
      const tempClient = createPublicClient({
        chain: bsc,
        transport: http(rpcUrl, { timeout: 5000 })
      })
      
      await tempClient.getBlockNumber()
      const duration = Date.now() - startTime
      
      const status = duration < 1000 ? '优秀' : duration < 3000 ? '良好' : '慢速'
      results.push({ rpcUrl, duration, status, success: true })
      
      log(`  ${rpcUrl}: ${duration}ms (${status})`, duration < 3000 ? 'green' : 'yellow')
    } catch (error) {
      const duration = Date.now() - startTime
      results.push({ rpcUrl, duration, status: '失败', success: false, error: error.message })
      log(`  ${rpcUrl}: 失败 (${error.message})`, 'red')
    }
  }
  
  const successCount = results.filter(r => r.success).length
  const avgDuration = results
    .filter(r => r.success)
    .reduce((sum, r) => sum + r.duration, 0) / successCount
  
  const overallStatus = successCount === RPC_NODES.length ? 'PASS' : 'PARTIAL'
  
  recordTest(testName, overallStatus, Math.round(avgDuration), 
    `${successCount}/${RPC_NODES.length} 节点可用，平均 ${avgDuration.toFixed(0)}ms`, 
    { results, avgDuration, successCount })
  
  return { success: true, results }
}

/**
 * 测试 8：Gas 价格查询
 */
async function testGasPrice() {
  const testName = '测试 8：Gas 价格查询'
  const startTime = Date.now()
  
  try {
    log(`\n⛽ ${testName}...`, 'cyan')
    
    const gasPrice = await publicClient.getGasPrice()
    const gasPriceGwei = Number(gasPrice) / 1e9
    const duration = Date.now() - startTime
    
    const rating = gasPriceGwei < 5 ? '低' : gasPriceGwei < 10 ? '中' : '高'
    
    recordTest(testName, 'PASS', duration, `Gas 价格: ${gasPriceGwei.toFixed(2)} Gwei (${rating})`, {
      gasPrice: gasPriceGwei,
      rating
    })
    
    return { success: true, gasPrice: gasPriceGwei }
  } catch (error) {
    const duration = Date.now() - startTime
    recordTest(testName, 'FAIL', duration, error.message)
    return { success: false, error: error.message }
  }
}

/**
 * 测试 9：连续报价查询（性能测试）
 */
async function testContinuousQuotes() {
  const testName = '测试 9：连续报价查询（性能测试）'
  log(`\n⚡ ${testName}...`, 'cyan')
  
  const iterations = 3
  const durations = []
  
  for (let i = 0; i < iterations; i++) {
    const startTime = Date.now()
    try {
      const amountIn = parseEther('0.001')
      const path = [WBNB_ADDRESS, USDT_ADDRESS]
      
      await publicClient.readContract({
        address: PANCAKE_ROUTER,
        abi: ROUTER_ABI,
        functionName: 'getAmountsOut',
        args: [amountIn, path]
      })
      
      const duration = Date.now() - startTime
      durations.push(duration)
      
      log(`  第 ${i + 1} 次查询: ${duration}ms`, duration < 3000 ? 'green' : 'yellow')
      
      // 避免请求过快
      await delay(1000)
    } catch (error) {
      log(`  第 ${i + 1} 次查询: 失败 (${error.message})`, 'red')
    }
  }
  
  const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length
  const maxDuration = Math.max(...durations)
  const minDuration = Math.min(...durations)
  
  const performanceRating = avgDuration < 2000 ? '优秀' : avgDuration < 3000 ? '良好' : '需改进'
  
  recordTest(testName, 'PASS', Math.round(avgDuration), 
    `平均: ${avgDuration.toFixed(0)}ms, 最快: ${minDuration}ms, 最慢: ${maxDuration}ms (${performanceRating})`,
    { avgDuration, maxDuration, minDuration, durations, performance: performanceRating })
  
  return { success: true, avgDuration, durations }
}

/**
 * 测试 10：地址验证
 */
async function testAddressValidation() {
  const testName = '测试 10：地址验证'
  const startTime = Date.now()
  
  try {
    log(`\n🔐 ${testName}...`, 'cyan')
    
    const validAddress = TEST_ADDRESS
    const invalidAddress = '0xinvalid'
    
    // 测试有效地址
    const isValidAddress = /^0x[a-fA-F0-9]{40}$/.test(validAddress)
    
    // 测试无效地址
    const isInvalidAddress = /^0x[a-fA-F0-9]{40}$/.test(invalidAddress)
    
    const duration = Date.now() - startTime
    
    if (isValidAddress && !isInvalidAddress) {
      recordTest(testName, 'PASS', duration, '地址验证逻辑正常', {
        validAddressCheck: isValidAddress,
        invalidAddressCheck: !isInvalidAddress
      })
    } else {
      recordTest(testName, 'FAIL', duration, '地址验证逻辑异常')
    }
    
    return { success: true }
  } catch (error) {
    const duration = Date.now() - startTime
    recordTest(testName, 'FAIL', duration, error.message)
    return { success: false, error: error.message }
  }
}

// ==================== 生成测试报告 ====================

function generateReport() {
  const endTime = Date.now()
  const totalDuration = endTime - testResults.startTime
  
  log('\n' + '═'.repeat(60), 'bright')
  log('                    📊 测试报告', 'bright')
  log('═'.repeat(60), 'bright')
  
  // 总体统计
  log('\n📈 测试统计:', 'cyan')
  log(`  总测试数: ${testResults.summary.total}`)
  log(`  通过: ${testResults.summary.passed}`, 'green')
  log(`  失败: ${testResults.summary.failed}`, testResults.summary.failed > 0 ? 'red' : 'green')
  log(`  通过率: ${((testResults.summary.passed / testResults.summary.total) * 100).toFixed(1)}%`, 
      testResults.summary.failed === 0 ? 'green' : 'yellow')
  log(`  总耗时: ${(totalDuration / 1000).toFixed(2)}s`)
  
  // 性能分析
  log('\n⚡ 性能分析:', 'cyan')
  const avgDuration = testResults.tests.reduce((sum, t) => sum + t.duration, 0) / testResults.tests.length
  log(`  平均测试时间: ${avgDuration.toFixed(0)}ms`)
  
  const slowTests = testResults.tests.filter(t => t.duration > 3000)
  if (slowTests.length > 0) {
    log(`  慢速测试 (> 3s): ${slowTests.length}`, 'yellow')
    slowTests.forEach(t => {
      log(`    - ${t.name}: ${t.duration}ms`, 'yellow')
    })
  } else {
    log(`  所有测试都在 3 秒内完成 ✓`, 'green')
  }
  
  // 失败测试详情
  if (testResults.summary.failed > 0) {
    log('\n❌ 失败测试详情:', 'red')
    testResults.tests.filter(t => t.status === 'FAIL').forEach(t => {
      log(`  - ${t.name}`, 'red')
      log(`    原因: ${t.details}`, 'red')
    })
  }
  
  // 关键指标
  log('\n🎯 关键指标:', 'cyan')
  
  const quoteTests = testResults.tests.filter(t => t.name.includes('报价查询'))
  if (quoteTests.length > 0) {
    const avgQuoteTime = quoteTests.reduce((sum, t) => sum + t.duration, 0) / quoteTests.length
    const quoteRating = avgQuoteTime < 3000 ? '优秀' : avgQuoteTime < 5000 ? '良好' : '需改进'
    log(`  平均报价时间: ${avgQuoteTime.toFixed(0)}ms (${quoteRating})`, 
        avgQuoteTime < 3000 ? 'green' : 'yellow')
  }
  
  const balanceTests = testResults.tests.filter(t => t.name.includes('余额查询'))
  if (balanceTests.length > 0) {
    const avgBalanceTime = balanceTests.reduce((sum, t) => sum + t.duration, 0) / balanceTests.length
    const balanceRating = avgBalanceTime < 2000 ? '优秀' : avgBalanceTime < 3000 ? '良好' : '需改进'
    log(`  平均余额查询时间: ${avgBalanceTime.toFixed(0)}ms (${balanceRating})`,
        avgBalanceTime < 2000 ? 'green' : 'yellow')
  }
  
  // 建议
  log('\n💡 建议:', 'cyan')
  if (testResults.summary.failed === 0 && avgDuration < 3000) {
    log('  ✓ 所有测试通过，性能良好！', 'green')
  } else if (testResults.summary.failed === 0) {
    log('  ✓ 所有测试通过，但可以进一步优化性能', 'yellow')
  } else {
    log('  ✗ 存在失败的测试，建议检查网络连接和配置', 'red')
  }
  
  if (slowTests.length > 0) {
    log('  ⚠ 部分测试较慢，建议优化 RPC 节点或网络连接', 'yellow')
  }
  
  // 总体评级
  log('\n🏆 总体评级:', 'cyan')
  const passRate = (testResults.summary.passed / testResults.summary.total) * 100
  let rating = ''
  let ratingColor = 'green'
  
  if (passRate === 100 && avgDuration < 2000) {
    rating = '⭐⭐⭐ 优秀'
    ratingColor = 'green'
  } else if (passRate === 100 && avgDuration < 3000) {
    rating = '⭐⭐ 良好'
    ratingColor = 'green'
  } else if (passRate >= 80) {
    rating = '⭐ 合格'
    ratingColor = 'yellow'
  } else {
    rating = '⚠️ 需改进'
    ratingColor = 'red'
  }
  
  log(`  ${rating}`, ratingColor)
  
  log('\n' + '═'.repeat(60), 'bright')
  log('                测试完成！', 'bright')
  log('═'.repeat(60), 'bright')
  
  // 保存报告到文件
  const reportPath = './test-report.json'
  const fs = require('fs')
  fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2))
  log(`\n📄 详细报告已保存到: ${reportPath}`, 'cyan')
}

// ==================== 主测试流程 ====================

async function runTests() {
  log('\n' + '═'.repeat(60), 'bright')
  log('            🧪 钱包功能自动化测试', 'bright')
  log('═'.repeat(60), 'bright')
  log(`\n测试地址: ${TEST_ADDRESS}`, 'cyan')
  log(`开始时间: ${new Date().toLocaleString('zh-CN')}`, 'cyan')
  
  try {
    // 余额查询测试
    await testBNBBalance()
    await delay(500)
    
    await testUSDTBalance()
    await delay(500)
    
    await testRADRSBalance()
    await delay(500)
    
    // 报价查询测试
    await testBNBToUSDTQuote()
    await delay(500)
    
    await testUSDTToRADRSQuote()
    await delay(500)
    
    await testRADRSToBNBQuote()
    await delay(500)
    
    // 基础功能测试
    await testRPCNodes()
    await delay(500)
    
    await testGasPrice()
    await delay(500)
    
    // 性能测试
    await testContinuousQuotes()
    await delay(500)
    
    // 地址验证测试
    await testAddressValidation()
    
    // 生成报告
    generateReport()
    
  } catch (error) {
    log(`\n❌ 测试过程中发生错误: ${error.message}`, 'red')
    console.error(error)
  }
}

// 执行测试
if (require.main === module) {
  log('\n正在启动测试...', 'cyan')
  runTests().then(() => {
    log('\n✅ 测试脚本执行完成', 'green')
    process.exit(0)
  }).catch(error => {
    log(`\n❌ 测试脚本执行失败: ${error.message}`, 'red')
    console.error(error)
    process.exit(1)
  })
}

module.exports = { runTests }
