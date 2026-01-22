#!/usr/bin/env node

/**
 * 查询 RADRS 完整交易历史
 */

const { createPublicClient, http, formatEther, parseAbiItem } = require('viem')
const { bsc } = require('viem/chains')

const WALLET_ADDRESS = '0xbc9e12183389ad7096a6406485f3e69bf2675d41'
const RADRS_ADDRESS = '0xe2188a2e0a41a50f09359e5fe714d5e643036f2a'

const client = createPublicClient({
  chain: bsc,
  transport: http('https://bsc-dataseed.binance.org/')
})

async function checkHistory() {
  console.log('\n═══════════════════════════════════════════════════')
  console.log('          📜 RADRS 交易历史查询')
  console.log('═══════════════════════════════════════════════════\n')

  try {
    console.log(`📋 钱包地址: ${WALLET_ADDRESS}`)
    console.log(`📋 RADRS 合约: ${RADRS_ADDRESS}\n`)

    const currentBlock = await client.getBlockNumber()
    console.log(`📦 当前区块: ${currentBlock}\n`)

    // 查询最近 1000 个区块的历史（约 50 分钟）
    const fromBlock = currentBlock - 1000n

    console.log('⏳ 正在查询接收记录...')
    // 接收记录
    const receiveLogs = await client.getLogs({
      address: RADRS_ADDRESS,
      event: parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 value)'),
      args: { to: WALLET_ADDRESS },
      fromBlock
    })

    console.log('⏳ 正在查询发送记录...\n')
    // 发送记录
    const sendLogs = await client.getLogs({
      address: RADRS_ADDRESS,
      event: parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 value)'),
      args: { from: WALLET_ADDRESS },
      fromBlock
    })

    console.log('───────────────────────────────────────────────────')
    console.log(`📥 接收记录（共 ${receiveLogs.length} 笔）`)
    console.log('───────────────────────────────────────────────────\n')

    let totalReceived = 0n
    for (const log of receiveLogs) {
      const amount = formatEther(log.args.value || 0n)
      totalReceived += log.args.value || 0n
      const block = await client.getBlock({ blockNumber: log.blockNumber })
      const time = new Date(Number(block.timestamp) * 1000).toLocaleString()
      
      console.log(`✅ 接收 ${amount} RADRS`)
      console.log(`   从: ${log.args.from}`)
      console.log(`   时间: ${time}`)
      console.log(`   哈希: ${log.transactionHash}`)
      console.log(`   区块: ${log.blockNumber}\n`)
    }

    console.log('───────────────────────────────────────────────────')
    console.log(`📤 发送记录（共 ${sendLogs.length} 笔）`)
    console.log('───────────────────────────────────────────────────\n')

    let totalSent = 0n
    for (const log of sendLogs) {
      const amount = formatEther(log.args.value || 0n)
      totalSent += log.args.value || 0n
      const block = await client.getBlock({ blockNumber: log.blockNumber })
      const time = new Date(Number(block.timestamp) * 1000).toLocaleString()
      
      console.log(`❌ 发送 ${amount} RADRS`)
      console.log(`   到: ${log.args.to}`)
      console.log(`   时间: ${time}`)
      console.log(`   哈希: ${log.transactionHash}`)
      console.log(`   区块: ${log.blockNumber}\n`)
    }

    console.log('═══════════════════════════════════════════════════')
    console.log('💰 余额计算')
    console.log('═══════════════════════════════════════════════════\n')

    const received = formatEther(totalReceived)
    const sent = formatEther(totalSent)
    const calculated = formatEther(totalReceived - totalSent)

    console.log(`📥 总接收: ${received} RADRS`)
    console.log(`📤 总发送: ${sent} RADRS`)
    console.log(`💰 计算余额: ${calculated} RADRS\n`)

    // 查询实际余额
    const actualBalance = await client.readContract({
      address: RADRS_ADDRESS,
      abi: [{
        constant: true,
        inputs: [{ name: '_owner', type: 'address' }],
        name: 'balanceOf',
        outputs: [{ name: 'balance', type: 'uint256' }],
        type: 'function'
      }],
      functionName: 'balanceOf',
      args: [WALLET_ADDRESS]
    })

    const actual = formatEther(actualBalance)
    console.log(`🔍 链上实际余额: ${actual} RADRS\n`)

    if (parseFloat(actual) === 0 && parseFloat(received) > 0) {
      console.log('❌ 结论：代币已全部转出！\n')
    } else if (parseFloat(actual) > 0) {
      console.log('✅ 结论：钱包中还有 RADRS 余额\n')
    } else {
      console.log('ℹ️  结论：从未收到过 RADRS（或已全部转出）\n')
    }

  } catch (error) {
    console.error('❌ 查询失败:', error.message)
  }

  console.log('═══════════════════════════════════════════════════\n')
}

checkHistory()
