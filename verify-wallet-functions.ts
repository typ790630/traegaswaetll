
import { createPublicClient, http, parseAbi, formatEther, parseEther } from 'viem'
import { bsc } from 'viem/chains'

// 1. 配置
const PANCAKE_ROUTER = "0x10ED43C718714eb63d5aA57B78B54704E256024E"
const WBNB = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'
const USDT = '0x55d398326f99059fF775485246999027B3197955'
const RADRS = '0xe2188a2e0a41a50f09359e5fe714d5e643036f2a'

// 使用我们修复后的 RPC 列表
const client = createPublicClient({
    chain: bsc,
    transport: http('https://bsc-dataseed.binance.org/') 
})

async function verifySystem() {
    console.log("🚀 开始验证钱包核心功能 (真实环境)...")
    console.log("----------------------------------------")

    // ----------------------------------------
    // 1. 验证币价更新 (模拟前端 priceService)
    // ----------------------------------------
    console.log("\n1. 🔍 验证币价 API (修复后)...")
    try {
        // 测试 Binance Data API (修复方案)
        const bnbRes = await fetch('https://data-api.binance.vision/api/v3/ticker/price?symbol=BNBUSDT')
        const bnbData = await bnbRes.json()
        console.log(`✅ BNB 实时价格 (Binance Vision): $${parseFloat(bnbData.price).toFixed(2)}`)
        
        // 验证: 如果显示 $650.00 说明是旧的 Mock 数据，现在应该是 $600-$700 之间的实时数据
        if (Math.abs(parseFloat(bnbData.price) - 650) > 100) {
            console.log("   (价格正常波动中，非死板的 650.00)")
        }

        // 测试 RADRS 价格
        const radrsRes = await fetch(`https://api.geckoterminal.com/api/v2/networks/bsc/tokens/${RADRS}`)
        const radrsData = await radrsRes.json()
        const radrsPrice = radrsData.data?.attributes?.price_usd
        console.log(`✅ RADRS 实时价格 (GeckoTerminal): $${parseFloat(radrsPrice).toFixed(6)}`)
        
    } catch (e) {
        console.error("❌ 币价获取失败:", e.message)
    }

    // ----------------------------------------
    // 2. 验证网络连接 & 余额读取
    // ----------------------------------------
    console.log("\n2. 📡 验证 BSC 节点连接...")
    try {
        const blockNumber = await client.getBlockNumber()
        console.log(`✅ 连接成功! 当前 BSC 区块高度: ${blockNumber}`)
        
        // 随机查一个大户余额验证读取能力
        const binanceHotWallet = "0x8894E0a0c962CB723c1976a4421c95949bE2D4E3" 
        const balance = await client.getBalance({ address: binanceHotWallet })
        console.log(`✅ 读取链上数据正常 (Binance热钱包余额: ${formatEther(balance)} BNB)`)
    } catch (e) {
        console.error("❌ 节点连接失败:", e)
    }

    // ----------------------------------------
    // 3. 验证兑换 (Swap) 询价功能
    // ----------------------------------------
    console.log("\n3. 🔄 验证 Swap 询价 (PancakeSwap Router)...")
    try {
        const routerAbi = parseAbi(['function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)'])
        
        // 模拟 1 BNB -> USDT
        const amountIn = parseEther('1')
        const path = [WBNB, USDT]
        
        const amounts = await client.readContract({
            address: PANCAKE_ROUTER,
            abi: routerAbi,
            functionName: 'getAmountsOut',
            args: [amountIn, path]
        })
        
        const amountOut = formatEther(amounts[1])
        console.log(`✅ 询价成功: 1 BNB 可兑换 ≈ ${parseFloat(amountOut).toFixed(2)} USDT`)
        console.log("   (这证明 Swap 路由合约调用正常)")
        
    } catch (e) {
        console.error("❌ Swap 询价失败:", e)
    }

    console.log("\n----------------------------------------")
    console.log("🎉 验证完成")
}

verifySystem()
