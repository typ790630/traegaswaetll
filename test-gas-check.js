/**
 * Gas 费用检查测试脚本
 * 测试转账和兑换的 Gas 计算是否正确
 */

const { createPublicClient, http, formatEther, parseEther } = require('viem')
const { bsc } = require('viem/chains')

// 配置
const RPC_URL = 'https://bsc-rpc.publicnode.com'
const TEST_ADDRESS = '0x739Ee5E0CD7Ee3EfEAe2796E9C4dC5b2916Cd9f1' // 用户地址

// RADRS 配置
const RADRS_ADDRESS = '0x2139366909c41d7fAdd2c3701db57Ca4B5f0224B'
const USDT_ADDRESS = '0x55d398326f99059fF775485246999027B3197955'

// 创建客户端
const publicClient = createPublicClient({
    chain: bsc,
    transport: http(RPC_URL)
})

console.log('========================================')
console.log('  🧪 Gas 费用检查测试')
console.log('========================================\n')

async function test() {
    try {
        // 1. 获取 BNB 余额
        console.log('1️⃣ 检查 BNB 余额...')
        const bnbBalanceWei = await publicClient.getBalance({ 
            address: TEST_ADDRESS 
        })
        const bnbBalance = parseFloat(formatEther(bnbBalanceWei))
        console.log(`   ✅ BNB 余额: ${bnbBalance.toFixed(6)} BNB\n`)

        // 2. 获取当前 Gas Price
        console.log('2️⃣ 获取当前 Gas Price...')
        const baseGasPrice = await publicClient.getGasPrice()
        const fastGasPrice = (baseGasPrice * 200n) / 100n
        console.log(`   Base Gas Price: ${formatEther(baseGasPrice)} Gwei`)
        console.log(`   Fast Gas Price (200%): ${formatEther(fastGasPrice)} Gwei\n`)

        // 3. 计算转账 Gas 费用
        console.log('3️⃣ 计算转账 Gas 费用...')
        
        const transferGasLimits = {
            BNB: 21000,
            'ERC20（普通）': 80000,
            'RADRS（税收）': 120000
        }

        for (const [type, gasLimit] of Object.entries(transferGasLimits)) {
            const gasCost = parseFloat(formatEther(BigInt(gasLimit) * fastGasPrice))
            const enough = bnbBalance >= gasCost
            console.log(`   ${type}:`)
            console.log(`     Gas Limit: ${gasLimit}`)
            console.log(`     Gas 费用: ${gasCost.toFixed(6)} BNB (~$${(gasCost * 300).toFixed(2)})`)
            console.log(`     ${enough ? '✅ 余额足够' : '❌ 余额不足'}`)
        }
        console.log()

        // 4. 计算兑换 Gas 费用
        console.log('4️⃣ 计算兑换 Gas 费用...')
        
        const swapScenarios = {
            'BNB → USDT': 300000,
            'BNB → RADRS': 400000,
            'RADRS → BNB': 400000,
            'USDT → RADRS (Direct)': 400000 + 60000,
            'USDT → RADRS (Multi-hop)': 550000 + 60000,
        }

        for (const [scenario, gasLimit] of Object.entries(swapScenarios)) {
            const gasCost = parseFloat(formatEther(BigInt(gasLimit) * fastGasPrice))
            const enough = bnbBalance >= gasCost
            console.log(`   ${scenario}:`)
            console.log(`     Gas Limit: ${gasLimit}`)
            console.log(`     Gas 费用: ${gasCost.toFixed(6)} BNB (~$${(gasCost * 300).toFixed(2)})`)
            console.log(`     ${enough ? '✅ 余额足够' : '❌ 余额不足'}`)
        }
        console.log()

        // 5. 分析结果
        console.log('5️⃣ 分析结果...')
        console.log(`   您的 BNB: ${bnbBalance.toFixed(6)}`)
        
        const minTransferGas = parseFloat(formatEther(BigInt(120000) * fastGasPrice))
        const minSwapGas = parseFloat(formatEther(BigInt(460000) * fastGasPrice))
        
        console.log(`   最小转账 Gas (RADRS): ${minTransferGas.toFixed(6)} BNB`)
        console.log(`   最小兑换 Gas (RADRS): ${minSwapGas.toFixed(6)} BNB`)
        
        if (bnbBalance >= minSwapGas) {
            console.log('   ✅ 余额足够进行 RADRS 兑换')
        } else if (bnbBalance >= minTransferGas) {
            console.log('   ⚠️  余额仅够进行 RADRS 转账，兑换可能失败')
        } else {
            console.log('   ❌ 余额不足，需要充值')
        }
        console.log()

        // 6. 充值建议
        console.log('6️⃣ 充值建议...')
        if (bnbBalance < 0.005) {
            const needed = 0.005 - bnbBalance
            console.log(`   💡 建议充值: ${Math.ceil(needed * 1000) / 1000} BNB`)
            console.log(`   💡 充值后余额: 0.005 BNB（可进行多次兑换）`)
        } else {
            console.log(`   ✅ 余额充足，无需充值`)
        }
        console.log()

        console.log('========================================')
        console.log('  ✅ 测试完成')
        console.log('========================================')

    } catch (error) {
        console.error('❌ 测试失败:', error.message)
        process.exit(1)
    }
}

// 运行测试
test()
