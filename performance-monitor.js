/**
 * 📱 手机端性能监控工具
 * 
 * 使用方法：
 * 1. 在手机浏览器中打开控制台（开发者工具）
 * 2. 复制并粘贴此脚本到控制台
 * 3. 按回车执行
 * 4. 开始测试兑换和转账功能
 * 5. 查看性能报告
 */

(function() {
  console.log('═══════════════════════════════════════════════════════════')
  console.log('        📱 手机端性能监控工具已启动')
  console.log('═══════════════════════════════════════════════════════════')
  
  // 性能数据存储
  const performanceData = {
    swaps: [],
    transfers: [],
    pageLoads: [],
    apiCalls: []
  }
  
  // 计时器
  let timers = {}
  
  // 监控原始 fetch
  const originalFetch = window.fetch
  window.fetch = function(...args) {
    const url = args[0]
    const startTime = Date.now()
    
    return originalFetch.apply(this, args).then(response => {
      const endTime = Date.now()
      const duration = endTime - startTime
      
      performanceData.apiCalls.push({
        url: typeof url === 'string' ? url : url.url,
        duration,
        timestamp: new Date().toISOString(),
        status: response.status
      })
      
      console.log(`[API] ${typeof url === 'string' ? url : url.url} - ${duration}ms`)
      
      return response
    }).catch(error => {
      const endTime = Date.now()
      const duration = endTime - startTime
      
      performanceData.apiCalls.push({
        url: typeof url === 'string' ? url : url.url,
        duration,
        timestamp: new Date().toISOString(),
        status: 'error',
        error: error.message
      })
      
      console.error(`[API Error] ${typeof url === 'string' ? url : url.url} - ${duration}ms - ${error.message}`)
      
      throw error
    })
  }
  
  // 监控页面性能
  const monitorPageLoad = () => {
    if (performance && performance.timing) {
      const timing = performance.timing
      const loadTime = timing.loadEventEnd - timing.navigationStart
      
      performanceData.pageLoads.push({
        loadTime,
        domReady: timing.domContentLoadedEventEnd - timing.navigationStart,
        timestamp: new Date().toISOString()
      })
      
      console.log(`[Page Load] 总耗时: ${loadTime}ms, DOM Ready: ${timing.domContentLoadedEventEnd - timing.navigationStart}ms`)
    }
  }
  
  // 页面加载完成后执行
  if (document.readyState === 'complete') {
    monitorPageLoad()
  } else {
    window.addEventListener('load', monitorPageLoad)
  }
  
  // 工具函数
  window.perfMonitor = {
    // 开始计时
    start: (name) => {
      timers[name] = Date.now()
      console.log(`[Timer] 开始: ${name}`)
    },
    
    // 结束计时
    end: (name, type = 'operation') => {
      if (!timers[name]) {
        console.warn(`[Timer] 未找到计时器: ${name}`)
        return
      }
      
      const duration = Date.now() - timers[name]
      delete timers[name]
      
      // 根据类型存储数据
      if (type === 'swap') {
        performanceData.swaps.push({ name, duration, timestamp: new Date().toISOString() })
      } else if (type === 'transfer') {
        performanceData.transfers.push({ name, duration, timestamp: new Date().toISOString() })
      }
      
      console.log(`[Timer] 结束: ${name} - ${duration}ms`)
      
      return duration
    },
    
    // 记录兑换
    recordSwap: (from, to, amount, duration, success = true, error = null) => {
      const record = {
        from,
        to,
        amount,
        duration,
        success,
        error,
        timestamp: new Date().toISOString()
      }
      
      performanceData.swaps.push(record)
      
      const status = success ? '✅' : '❌'
      console.log(`[Swap ${status}] ${from} → ${to} (${amount}) - ${duration}ms`)
      
      if (error) {
        console.error(`[Swap Error] ${error}`)
      }
    },
    
    // 记录转账
    recordTransfer: (asset, amount, to, duration, success = true, error = null) => {
      const record = {
        asset,
        amount,
        to,
        duration,
        success,
        error,
        timestamp: new Date().toISOString()
      }
      
      performanceData.transfers.push(record)
      
      const status = success ? '✅' : '❌'
      console.log(`[Transfer ${status}] ${asset} (${amount}) → ${to.slice(0, 10)}... - ${duration}ms`)
      
      if (error) {
        console.error(`[Transfer Error] ${error}`)
      }
    },
    
    // 获取性能报告
    getReport: () => {
      console.log('\n═══════════════════════════════════════════════════════════')
      console.log('        📊 性能测试报告')
      console.log('═══════════════════════════════════════════════════════════\n')
      
      // 兑换统计
      if (performanceData.swaps.length > 0) {
        console.log('🔄 兑换功能统计：')
        console.log(`   总次数: ${performanceData.swaps.length}`)
        
        const successfulSwaps = performanceData.swaps.filter(s => s.success)
        console.log(`   成功: ${successfulSwaps.length}`)
        console.log(`   失败: ${performanceData.swaps.length - successfulSwaps.length}`)
        
        if (successfulSwaps.length > 0) {
          const avgDuration = successfulSwaps.reduce((sum, s) => sum + s.duration, 0) / successfulSwaps.length
          const minDuration = Math.min(...successfulSwaps.map(s => s.duration))
          const maxDuration = Math.max(...successfulSwaps.map(s => s.duration))
          
          console.log(`   平均耗时: ${avgDuration.toFixed(0)}ms`)
          console.log(`   最快: ${minDuration}ms`)
          console.log(`   最慢: ${maxDuration}ms`)
          
          // 性能评级
          if (avgDuration < 15000) {
            console.log('   评级: ✅ 优秀（< 15s）')
          } else if (avgDuration < 25000) {
            console.log('   评级: ⚠️ 良好（< 25s）')
          } else {
            console.log('   评级: ❌ 需改进（≥ 25s）')
          }
        }
        
        console.log('\n   详细记录:')
        performanceData.swaps.forEach((swap, index) => {
          const status = swap.success ? '✅' : '❌'
          console.log(`   ${index + 1}. ${status} ${swap.from} → ${swap.to} - ${swap.duration}ms`)
        })
        console.log('')
      }
      
      // 转账统计
      if (performanceData.transfers.length > 0) {
        console.log('💸 转账功能统计：')
        console.log(`   总次数: ${performanceData.transfers.length}`)
        
        const successfulTransfers = performanceData.transfers.filter(t => t.success)
        console.log(`   成功: ${successfulTransfers.length}`)
        console.log(`   失败: ${performanceData.transfers.length - successfulTransfers.length}`)
        
        if (successfulTransfers.length > 0) {
          const avgDuration = successfulTransfers.reduce((sum, t) => sum + t.duration, 0) / successfulTransfers.length
          const minDuration = Math.min(...successfulTransfers.map(t => t.duration))
          const maxDuration = Math.max(...successfulTransfers.map(t => t.duration))
          
          console.log(`   平均耗时: ${avgDuration.toFixed(0)}ms`)
          console.log(`   最快: ${minDuration}ms`)
          console.log(`   最慢: ${maxDuration}ms`)
          
          // 性能评级
          if (avgDuration < 12000) {
            console.log('   评级: ✅ 优秀（< 12s）')
          } else if (avgDuration < 18000) {
            console.log('   评级: ⚠️ 良好（< 18s）')
          } else {
            console.log('   评级: ❌ 需改进（≥ 18s）')
          }
        }
        
        console.log('\n   详细记录:')
        performanceData.transfers.forEach((transfer, index) => {
          const status = transfer.success ? '✅' : '❌'
          console.log(`   ${index + 1}. ${status} ${transfer.asset} (${transfer.amount}) - ${transfer.duration}ms`)
        })
        console.log('')
      }
      
      // API 调用统计
      if (performanceData.apiCalls.length > 0) {
        console.log('🌐 API 调用统计：')
        console.log(`   总次数: ${performanceData.apiCalls.length}`)
        
        const successfulCalls = performanceData.apiCalls.filter(c => c.status !== 'error')
        console.log(`   成功: ${successfulCalls.length}`)
        console.log(`   失败: ${performanceData.apiCalls.length - successfulCalls.length}`)
        
        if (successfulCalls.length > 0) {
          const avgDuration = successfulCalls.reduce((sum, c) => sum + c.duration, 0) / successfulCalls.length
          console.log(`   平均耗时: ${avgDuration.toFixed(0)}ms`)
        }
        
        // 慢速 API（> 3s）
        const slowCalls = performanceData.apiCalls.filter(c => c.duration > 3000)
        if (slowCalls.length > 0) {
          console.log('\n   ⚠️ 慢速 API（> 3s）:')
          slowCalls.forEach((call, index) => {
            console.log(`   ${index + 1}. ${call.url} - ${call.duration}ms`)
          })
        }
        console.log('')
      }
      
      console.log('═══════════════════════════════════════════════════════════\n')
      
      return performanceData
    },
    
    // 清空数据
    clear: () => {
      performanceData.swaps = []
      performanceData.transfers = []
      performanceData.pageLoads = []
      performanceData.apiCalls = []
      timers = {}
      console.log('[Monitor] 性能数据已清空')
    },
    
    // 导出数据
    export: () => {
      const data = JSON.stringify(performanceData, null, 2)
      console.log('\n═══════════════════════════════════════════════════════════')
      console.log('        📥 导出性能数据')
      console.log('═══════════════════════════════════════════════════════════\n')
      console.log(data)
      console.log('\n═══════════════════════════════════════════════════════════\n')
      
      // 尝试下载
      try {
        const blob = new Blob([data], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `performance-data-${Date.now()}.json`
        a.click()
        URL.revokeObjectURL(url)
        console.log('[Export] 数据已下载')
      } catch (e) {
        console.warn('[Export] 自动下载失败，请手动复制上面的 JSON 数据')
      }
      
      return data
    }
  }
  
  // 使用说明
  console.log('\n使用说明：')
  console.log('1. 手动记录兑换：')
  console.log('   perfMonitor.recordSwap("BNB", "USDT", "0.001", 12000, true)')
  console.log('\n2. 手动记录转账：')
  console.log('   perfMonitor.recordTransfer("BNB", "0.001", "0x123...", 10000, true)')
  console.log('\n3. 查看报告：')
  console.log('   perfMonitor.getReport()')
  console.log('\n4. 导出数据：')
  console.log('   perfMonitor.export()')
  console.log('\n5. 清空数据：')
  console.log('   perfMonitor.clear()')
  console.log('\n提示：监控工具会自动记录所有 API 调用！')
  console.log('═══════════════════════════════════════════════════════════\n')
})()
