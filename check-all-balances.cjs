#!/usr/bin/env node

/**
 * 紧急：检查钱包所有代币余额
 */

const { createPublicClient, http, formatEther } = require('viem')
const { bsc } = require('viem/chains')

const WALLET = '0xbc9e12183389ad7096a6406485f3e69bf2675d41'

const TOKENS = {
  'BNB': 'native',
  'USDT': '0x55d398326f99059fF775485246999027B3197955',
  'USDC': '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
  'BUSD': '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
  'RADRS': '0xe2188a2e0a41a50f09359e5fe714d5e643036f2a',
  'CAKE': '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82',
  'ETH': '0x2170Ed0880ac9A755fd29B2688956BD959F933F8',
}

const client = createPublicClient({
  chain: bsc,
  transport: http('https://bsc-dataseed.binance.org/')
})

async function checkAllBalances() {
  console.log('\n🚨═══════════════════════════════════════════════════')
  console.log('        紧急资产检查 - 扫描所有代币')
  console.log('═══════════════════════════════════════════════════\n')
  
  console.log(`📋 钱包地址: ${WALLET}\n`)
  
  let totalValue = 0
  let hasAssets = false

  for (const [symbol, address] of Object.entries(TOKENS)) {
    try {
      let balance = '0'
      
      if (address === 'native') {
        // BNB
        const bnbBalance = await client.getBalance({ address: WALLET })
        balance = formatEther(bnbBalance)
      } else {
        // ERC20
        const tokenBalance = await client.readContract({
          address: address,
          abi: [{
            constant: true,
            inputs: [{ name: '_owner', type: 'address' }],
            name: 'balanceOf',
            outputs: [{ name: 'balance', type: 'uint256' }],
            type: 'function'
          }],
          functionName: 'balanceOf',
          args: [WALLET]
        })
        balance = formatEther(tokenBalance)
      }

      const balanceNum = parseFloat(balance)
      
      if (balanceNum > 0) {
        console.log(`✅ ${symbol.padEnd(6)} : ${balance} （有余额！）`)
        hasAssets = true
      } else {
        console.log(`❌ ${symbol.padEnd(6)} : 0.0000`)
      }
      
    } catch (error) {
      console.log(`⚠️  ${symbol.padEnd(6)} : 查询失败`)
    }
  }

  console.log('\n═══════════════════════════════════════════════════')
  
  if (hasAssets) {
    console.log('🚨 警告：钱包中还有资产！')
    console.log('🚨 立即转移到新钱包！')
  } else {
    console.log('✅ 钱包已清空，无资产损失风险')
  }
  
  console.log('═══════════════════════════════════════════════════\n')
}

checkAllBalances()
