#!/usr/bin/env node

/**
 * 检查交易真实状态
 */

const { createPublicClient, http } = require('viem')
const { bscTestnet, bsc } = require('viem/chains')

// 交易哈希（用户提供的截图）
const TX_HASH = '0x77d9ba60e0d3f5f652d70baa0a2b961bde1578b55cbc16ec3b2fb5bc01be5338'

// 当前钱包地址
const CURRENT_ADDRESS = '0xbc9e12183389ad7096a6406485f3e69bf2675d41'

// RADRS 合约地址（使用交易中的实际地址）
const RADRS_ADDRESS = '0xe2188a2e0a41a50f09359e5fe714d5e643036f2a'

// 创建 BSC 主网客户端
const client = createPublicClient({
  chain: bsc,
  transport: http('https://bsc-dataseed.binance.org/')
})

async function checkTransaction() {
  console.log('\n═══════════════════════════════════════════════════')
  console.log('          🔍 交易状态检查')
  console.log('═══════════════════════════════════════════════════\n')

  try {
    console.log(`📋 交易哈希: ${TX_HASH}`)
    console.log(`📋 当前钱包: ${CURRENT_ADDRESS}\n`)

    // 1. 获取交易收据
    console.log('⏳ 正在查询交易收据...')
    const receipt = await client.getTransactionReceipt({ hash: TX_HASH })

    console.log(`✅ 交易状态: ${receipt.status === 'success' ? '✅ 成功' : '❌ 失败'}`)
    console.log(`📦 区块高度: ${receipt.blockNumber}`)
    console.log(`⛽ Gas 使用: ${receipt.gasUsed}`)
    console.log(`📤 发送地址: ${receipt.from}`)
    console.log(`📥 接收地址: ${receipt.to}\n`)

    // 2. 检查是否是当前钱包发送的
    if (receipt.from.toLowerCase() !== CURRENT_ADDRESS.toLowerCase()) {
      console.log('⚠️  警告：此交易不是由当前钱包发送的！')
      console.log(`   发送者: ${receipt.from}`)
      console.log(`   当前钱包: ${CURRENT_ADDRESS}`)
      console.log('\n❌ 这可能是历史交易记录错误显示\n')
    }

    // 3. 检查交易日志（查找 Transfer 事件）
    console.log('───────────────────────────────────────────────────')
    console.log('📜 交易日志分析')
    console.log('───────────────────────────────────────────────────\n')

    if (receipt.logs && receipt.logs.length > 0) {
      console.log(`✅ 找到 ${receipt.logs.length} 个事件\n`)
      
      receipt.logs.forEach((log, index) => {
        console.log(`事件 ${index + 1}:`)
        console.log(`  合约: ${log.address}`)
        console.log(`  主题数: ${log.topics.length}`)
        
        // 检查是否是 RADRS Transfer 事件
        if (log.address.toLowerCase() === RADRS_ADDRESS.toLowerCase()) {
          console.log(`  ✅ 这是 RADRS 代币事件！`)
          if (log.topics[0] === '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef') {
            console.log(`  📤 Transfer 事件`)
            console.log(`  From: 0x${log.topics[1].slice(26)}`)
            console.log(`  To: 0x${log.topics[2].slice(26)}`)
          }
        }
        console.log('')
      })
    } else {
      console.log('❌ 没有找到任何事件日志')
      console.log('   这可能是 BNB 转账而非代币转账\n')
    }

    // 4. 查询当前 RADRS 余额
    console.log('───────────────────────────────────────────────────')
    console.log('💰 当前 RADRS 余额')
    console.log('───────────────────────────────────────────────────\n')

    const radrsBalance = await client.readContract({
      address: RADRS_ADDRESS,
      abi: [{
        constant: true,
        inputs: [{ name: '_owner', type: 'address' }],
        name: 'balanceOf',
        outputs: [{ name: 'balance', type: 'uint256' }],
        type: 'function'
      }],
      functionName: 'balanceOf',
      args: [CURRENT_ADDRESS]
    })

    const balanceFormatted = Number(radrsBalance) / 1e18
    console.log(`✅ ${CURRENT_ADDRESS}`)
    console.log(`   RADRS 余额: ${balanceFormatted.toFixed(4)}\n`)

  } catch (error) {
    console.error('❌ 查询失败:', error.message)
    console.log('\n⚠️  可能的原因：')
    console.log('   1. 交易哈希不完整（请提供完整的 0x 开头的 66 位哈希）')
    console.log('   2. RPC 节点暂时不可用')
    console.log('   3. 交易还未上链\n')
  }

  console.log('═══════════════════════════════════════════════════\n')
}

// 检查是否提供了完整交易哈希
if (TX_HASH.length < 66) {
  console.log('\n❌ 错误：交易哈希不完整！')
  console.log(`   当前: ${TX_HASH} (${TX_HASH.length} 位)`)
  console.log('   需要: 66 位（0x + 64 个十六进制字符）\n')
  console.log('📋 请从截图中复制完整的交易哈希\n')
  process.exit(1)
}

checkTransaction()
