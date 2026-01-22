import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { ArrowDown, Info, AlertCircle } from "lucide-react"
import { useAppStore } from "../store/useAppStore"
import { FEES, GAS_TOKEN_SYMBOL } from "../config/fees"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Select } from "../components/ui/select"
import { Badge } from "../components/ui/badge"
import { Card, CardContent } from "../components/ui/card"
import { useTranslation } from "react-i18next"
import { ChainService } from "../services/ChainService"
import { ReferralPromo } from "../components/ReferralPromo"
import { parseEther, formatEther, createWalletClient, http, encodeFunctionData, parseAbi } from "viem"
import { privateKeyToAccount } from "viem/accounts"
import { bsc } from "viem/chains"
import { RADRS_CONFIG, ERC20_ABI } from "../config/radrs"
import { publicClient } from "../services/radrsService"
import { useNavigate } from "react-router-dom"

// PancakeSwap V2 Router
const PANCAKE_ROUTER = "0x10ED43C718714eb63d5aA57B78B54704E256024E"
const WBNB_ADDRESS = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"
const USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955"
const RADRS_ADDRESS = "0x2139366909c41d7fAdd2c3701db57Ca4B5f0224B"

// ⚡⚡⚡ 极速配置
const MIN_GAS_BNB = 0.0008 // 实际需要 ~0.0005-0.0008 BNB

// 🔥 RADRS 税收配置（反射代币 / 带税代币）
const RADRS_TAX_INFO = {
  hasTax: true,
  buyTax: 10,    // 买入税约 10%（估计值，实际以合约为准）
  sellTax: 10,   // 卖出税约 10%（估计值，实际以合约为准）
  slippage: 25,  // 推荐滑点 25%（覆盖税收 + 价格波动）
  warning: '⚠️ RADRS 是带税收的代币，买入/卖出时会自动扣除约 10% 作为税收，实际到账会比报价少'
}

export default function Swap() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const fromParam = searchParams.get('from')

  const { getCurrentNetwork, addActivity, getCurrentWallet, getPrivateKey: getStorePrivateKey, fetchRealBalances } = useAppStore()
  const network = getCurrentNetwork()
  const wallet = getCurrentWallet()
  
  const [fromAssetSymbol, setFromAssetSymbol] = useState(fromParam || network?.assets[0]?.symbol || "")
  const [toAssetSymbol, setToAssetSymbol] = useState(network?.assets[1]?.symbol || "")
  const [amount, setAmount] = useState("")
  const [isSwapping, setIsSwapping] = useState(false)

  const fromAsset = network?.assets.find(a => a.symbol === fromAssetSymbol)
  const toAsset = network?.assets.find(a => a.symbol === toAssetSymbol)

  useEffect(() => {
    if (fromParam) setFromAssetSymbol(fromParam)
  }, [fromParam])

  // --- ⚡⚡⚡ 极速余额获取（Cache-first 策略）---
  const [realFromBalance, setRealFromBalance] = useState("0.00")
  const [realToBalance, setRealToBalance] = useState("0.00")
  const [bnbBalance, setBnbBalance] = useState("0.00")

  useEffect(() => {
      const fetchBalances = async () => {
          if (!wallet?.address || network?.id !== 'bsc' || !fromAsset) return
          
          console.log('[Swap] Fetching FROM balance...')
          const balStartTime = Date.now()
          
          // ⚡ Cache-first: 先显示缓存
          const cachedBal = fromAsset.balance || "0"
          setRealFromBalance(parseFloat(cachedBal).toFixed(4))
          console.log(`[Swap] Using cached ${fromAsset.symbol} balance: ${cachedBal}`)
          
          // ⚡ 后台刷新（5秒超时）
          try {
              const freshBalPromise = fromAsset.symbol === 'BNB' 
                  ? ChainService.getNativeBalance(wallet.address)
                  : fromAsset.contractAddress 
                      ? ChainService.getErc20Balance(fromAsset.contractAddress, wallet.address)
                      : Promise.resolve("0")
              
              const freshBal = await Promise.race([
                  freshBalPromise,
                  new Promise<string>((_, reject) => 
                      setTimeout(() => reject(new Error('Balance fetch timeout')), 5000)
                  )
              ])
              
              setRealFromBalance(parseFloat(freshBal).toFixed(4))
              console.log(`[Swap] ✅ Fetched fresh ${fromAsset.symbol} balance: ${freshBal} (${Date.now() - balStartTime}ms)`)
          } catch (e: any) {
              console.warn(`[Swap] ⚠️ Balance fetch failed, using cached: ${e.message}`)
          }
      }
      
      const fetchToBalance = async () => {
          if (!wallet?.address || network?.id !== 'bsc' || !toAsset) return
          
          const cachedBal = toAsset.balance || "0"
          setRealToBalance(parseFloat(cachedBal).toFixed(4))
          
          try {
              const freshBalPromise = toAsset.symbol === 'BNB' 
                  ? ChainService.getNativeBalance(wallet.address)
                  : toAsset.contractAddress 
                      ? ChainService.getErc20Balance(toAsset.contractAddress, wallet.address)
                      : Promise.resolve("0")
              
              const freshBal = await Promise.race([
                  freshBalPromise,
                  new Promise<string>((_, reject) => 
                      setTimeout(() => reject(new Error('Balance fetch timeout')), 5000)
                  )
              ])
              
              setRealToBalance(parseFloat(freshBal).toFixed(4))
          } catch (e: any) {
              console.warn(`[Swap] ⚠️ TO balance fetch failed, using cached`)
          }
      }
      
      fetchBalances()
      fetchToBalance()
      
      // ⚡ 30秒轮询（而非10秒）
      const interval = setInterval(() => {
          fetchBalances()
          fetchToBalance()
      }, 30000)
      
      return () => clearInterval(interval)
  }, [wallet?.address, fromAssetSymbol, toAssetSymbol, network?.id])
  
  // ⚡⚡⚡ BNB Gas 余额检查
  useEffect(() => {
      const fetchBnbBalance = async () => {
          if (!wallet?.address || network?.id !== 'bsc') return
          
          const bnbAsset = network.assets.find(a => a.symbol === 'BNB')
          const cachedBnb = bnbAsset?.balance || "0"
          setBnbBalance(cachedBnb)
          console.log('[Swap] Using cached BNB balance:', cachedBnb)
          
          try {
              const freshBnbPromise = ChainService.getNativeBalance(wallet.address)
              const freshBnb = await Promise.race([
                  freshBnbPromise,
                  new Promise<string>((_, reject) => 
                      setTimeout(() => reject(new Error('BNB balance timeout')), 5000)
                  )
              ])
              
              setBnbBalance(freshBnb)
              console.log('[Swap] ✅ Fetched fresh BNB balance:', freshBnb)
          } catch (e: any) {
              console.warn('[Swap] ⚠️ BNB balance fetch failed, using cached:', e.message)
          }
      }
      
      fetchBnbBalance()
      const interval = setInterval(fetchBnbBalance, 30000)
      return () => clearInterval(interval)
  }, [wallet?.address, network?.id])
  
  const hasEnoughGas = parseFloat(bnbBalance) >= MIN_GAS_BNB

  const assetOptions = network?.assets.map(a => ({
    value: a.symbol,
    label: a.symbol,
    icon: <div className="flex items-center justify-center w-5 h-5 rounded-full bg-background-primary text-[10px] font-bold border border-divider">{a.symbol[0]}</div>
  })) || []

  // --- ⚡⚡⚡ 极速实时报价获取 ---
  const [quoteAmountOut, setQuoteAmountOut] = useState("")
  const [exchangeRate, setExchangeRate] = useState("0")
  const [quoteError, setQuoteError] = useState("")
  const [isQuoting, setIsQuoting] = useState(false)

  useEffect(() => {
      const fetchQuote = async () => {
          if (!amount || parseFloat(amount) <= 0 || !fromAsset || !toAsset || fromAsset.symbol === toAsset.symbol) {
              setQuoteAmountOut("")
              setExchangeRate("0")
              setQuoteError("")
              return
          }

          setIsQuoting(true)
          setQuoteError("")
          const quoteStartTime = Date.now()
          console.log(`[Swap] ⚡ Fetching quote for ${amount} ${fromAsset.symbol} → ${toAsset.symbol}`)

          try {
              const amountInWei = parseEther(amount)
              let path: `0x${string}`[] = []
              
              // ⚡⚡⚡ 优化路由：USDT ↔ RADRS 直接路由
              const isUsdtRadrs = (fromAsset.contractAddress === USDT_ADDRESS && toAsset.contractAddress === RADRS_ADDRESS) ||
                                  (fromAsset.contractAddress === RADRS_ADDRESS && toAsset.contractAddress === USDT_ADDRESS)

              if (isUsdtRadrs && fromAsset.contractAddress && toAsset.contractAddress) {
                  path = [fromAsset.contractAddress as `0x${string}`, toAsset.contractAddress as `0x${string}`]
                  console.log('[Swap] ⚡ Using direct USDT ↔ RADRS route')
              } else if (fromAsset.symbol === 'BNB' && toAsset.contractAddress) {
                  path = [WBNB_ADDRESS as `0x${string}`, toAsset.contractAddress as `0x${string}`]
              } else if (fromAsset.contractAddress && toAsset.symbol === 'BNB') {
                  path = [fromAsset.contractAddress as `0x${string}`, WBNB_ADDRESS as `0x${string}`]
              } else if (fromAsset.contractAddress && toAsset.contractAddress) {
                  path = [fromAsset.contractAddress as `0x${string}`, WBNB_ADDRESS as `0x${string}`, toAsset.contractAddress as `0x${string}`]
              } else {
                  return
              }

              // ⚡⚡⚡ 3秒超时（优化后）
              const quotePromise = publicClient.readContract({
                  address: PANCAKE_ROUTER as `0x${string}`,
                  abi: parseAbi(['function getAmountsOut(uint amountIn, address[] path) view returns (uint[] amounts)']),
                  functionName: 'getAmountsOut',
                  args: [amountInWei, path]
              }) as Promise<bigint[]>

              const data = await Promise.race([
                  quotePromise,
                  new Promise<bigint[]>((_, reject) => 
                      setTimeout(() => reject(new Error('报价超时')), 3000)
                  )
              ])

              if (data && data.length > 0) {
                  const outWei = data[data.length - 1]
                  const outFormatted = formatEther(outWei)
                  const outNum = parseFloat(outFormatted)
                  
                  setQuoteAmountOut(outNum.toFixed(6))
                  
                  const rate = outNum / parseFloat(amount)
                  setExchangeRate(rate.toFixed(6))
                  
                  const quoteTime = Date.now() - quoteStartTime
                  console.log(`[Swap] ✅ Quote success: ${outNum.toFixed(4)} ${toAsset.symbol} (${quoteTime}ms)`)
              }
              setIsQuoting(false)

          } catch (e: any) {
              console.error('[Swap] ❌ Quote error:', e.message)
              setQuoteError("报价失败，正在重试...")
              setIsQuoting(false)
              
              // ⚡ 自动重试（1秒后）
              setTimeout(() => {
                  if (amount && parseFloat(amount) > 0) {
                      console.log('[Swap] 🔄 Auto-retrying quote...')
                      fetchQuote()
                  }
              }, 1000)
          }
      }

      const timer = setTimeout(fetchQuote, 300) // ⚡ 300ms debounce
      return () => clearTimeout(timer)
  }, [amount, fromAssetSymbol, toAssetSymbol])


  // Use real quote if available, otherwise fallback (or empty)
  const estimatedAmount = quoteAmountOut || ""

  const getPrivateKey = () => {
      if (wallet?.id) {
          return getStorePrivateKey(wallet.id)
      }
      return ""
  }

  const handleSwap = async () => {
    if (!network || !fromAsset || !toAsset) return
    
    // ⚡⚡⚡ 预检查 1: 代币相同
    if (fromAsset.symbol === toAsset.symbol) {
        alert('⚠️ 无法兑换相同代币')
        return
    }
    
    // ⚡⚡⚡ 预检查 2: 代币余额
    if (parseFloat(amount) > parseFloat(realFromBalance)) {
        alert(`⚠️ ${fromAsset.symbol} 余额不足\n\n当前余额: ${realFromBalance}\n兑换数量: ${amount}`)
        return
    }
    
    // ⚡⚡⚡ 预检查 3: 报价
    if (!quoteAmountOut || quoteError) {
        alert('⚠️ 无法获取报价，请稍后重试')
        return
    }
    
    setIsSwapping(true)
    const totalStartTime = Date.now()
    console.log('[Swap] ⚡⚡⚡ Starting swap transaction...')
    
    let realBnbBalance = 0 // 用于错误提示

    try {
      const pk = getPrivateKey()
      if (!pk) throw new Error("私钥未找到")

      const account = privateKeyToAccount(pk as `0x${string}`)
      
      // ⚡⚡⚡ 安全检查：确认地址匹配
      console.log(`[Swap] 🔐 Security check:`)
      console.log(`[Swap]   Account address: ${account.address}`)
      console.log(`[Swap]   Wallet address:  ${wallet?.address}`)
      if (account.address.toLowerCase() !== wallet?.address.toLowerCase()) {
          throw new Error(`❌ 地址不匹配！\n\n派生地址: ${account.address}\n存储地址: ${wallet?.address}\n\n请检查助记词是否正确`)
      }
      console.log(`[Swap] ✅ Address verified`)
      
      // ⚡⚡⚡ 实时获取 BNB 余额（避免使用缓存数据）
      console.log('[Swap] ⚡ Fetching real-time BNB balance...')
      const bnbBalanceWei = await publicClient.getBalance({ address: account.address })
      realBnbBalance = parseFloat(formatEther(bnbBalanceWei))
      console.log(`[Swap] Real BNB balance: ${realBnbBalance.toFixed(6)} BNB`)
      
      // ⚡⚡⚡ 预检查 4: Gas 费用（使用实时余额）
      const isRadrsInvolved = fromAsset.symbol === 'RADRS' || toAsset.symbol === 'RADRS'
      let estimatedGasLimit = 300000 // 默认
      
      if (fromAsset.symbol === 'BNB' || toAsset.symbol === 'BNB') {
          // BNB ↔ Token: 300k 或 400k
          estimatedGasLimit = isRadrsInvolved ? 400000 : 300000
      } else {
          // Token ↔ Token: 400k 或 550k（含 Approve）
          const isDirect = (fromAsset.contractAddress === USDT_ADDRESS && toAsset.contractAddress === RADRS_ADDRESS) ||
                          (fromAsset.contractAddress === RADRS_ADDRESS && toAsset.contractAddress === USDT_ADDRESS)
          estimatedGasLimit = isDirect 
              ? (isRadrsInvolved ? 400000 : 300000)
              : (isRadrsInvolved ? 550000 : 450000)
          // 加上 Approve 的 60k
          estimatedGasLimit += 60000
      }
      
      const baseGasPrice = await publicClient.getGasPrice()
      const fastGasPrice = (baseGasPrice * 200n) / 100n
      const estimatedGasCost = parseFloat(formatEther(BigInt(estimatedGasLimit) * fastGasPrice))
      
      console.log(`[Swap] Estimated Gas: ${estimatedGasLimit}, Price: ${formatEther(fastGasPrice)} Gwei, Cost: ${estimatedGasCost.toFixed(6)} BNB`)
      
      if (realBnbBalance < estimatedGasCost) {
          throw new Error(`BNB 余额不足支付 Gas 费\n\n当前 BNB: ${realBnbBalance.toFixed(6)}\n需要 Gas: ${estimatedGasCost.toFixed(6)} BNB\n缺少: ${(estimatedGasCost - realBnbBalance).toFixed(6)} BNB\n\n建议: 充值至少 ${Math.ceil((estimatedGasCost - realBnbBalance + 0.002) * 1000) / 1000} BNB`)
      }
      
      if (realBnbBalance < estimatedGasCost * 1.2) {
          console.warn(`[Swap] ⚠️ BNB balance is tight: ${realBnbBalance.toFixed(6)} BNB, estimated cost: ${estimatedGasCost.toFixed(6)} BNB`)
      }
      
      // ⚡⚡⚡ 极速钱包客户端
      const client = createWalletClient({
          account,
          chain: bsc,
          transport: http(RADRS_CONFIG.rpcUrl)
      })
      
      const amountWei = parseEther(amount)
      
      // ⚡⚡⚡ 动态滑点（RADRS 25%，其他 5%）
      const isRadrsPair = fromAsset.symbol === 'RADRS' || toAsset.symbol === 'RADRS'
      const slippagePercent = isRadrsPair ? RADRS_TAX_INFO.slippage : 5
      const amountOutMin = parseEther((parseFloat(estimatedAmount) * (1 - slippagePercent/100)).toString())
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 1200)
      
      console.log(`[Swap] Slippage: ${slippagePercent}%${isRadrsPair ? ' (RADRS 带税代币)' : ''}, Min receive: ${formatEther(amountOutMin)}`)
      console.log(`[Swap] ⚡ Using 200% Gas Price: ${formatEther(fastGasPrice)} Gwei`)
      
      let swapTxHash: `0x${string}`

      // ===== 场景 1: BNB -> Token =====
      if (fromAsset.symbol === 'BNB') {
           console.log('[Swap] Scenario: BNB → Token')
           const path = [WBNB_ADDRESS, toAsset.contractAddress]
           
           // ⚡⚡⚡ 对于 RADRS 等带税代币，使用 SupportingFeeOnTransferTokens
           const isTargetTaxToken = toAsset.symbol === 'RADRS'
           const functionName = isTargetTaxToken 
               ? 'swapExactETHForTokensSupportingFeeOnTransferTokens'
               : 'swapExactETHForTokens'
           
           const abiString = isTargetTaxToken
               ? 'function swapExactETHForTokensSupportingFeeOnTransferTokens(uint amountOutMin, address[] path, address to, uint deadline) payable'
               : 'function swapExactETHForTokens(uint amountOutMin, address[] path, address to, uint deadline) payable returns (uint[] amounts)'
           
           console.log(`[Swap] Using ${functionName}${isTargetTaxToken ? ' (带税代币)' : ''}`)
           
           const data = encodeFunctionData({
             abi: parseAbi([abiString]),
             functionName,
             args: [amountOutMin, path, wallet?.address as `0x${string}`, deadline]
           })

           const txStartTime = Date.now()
           const bnbToTokenGas = toAsset.symbol === 'RADRS' ? 400000n : 300000n // ⚡ RADRS 税收代币需要更多
           swapTxHash = await client.sendTransaction({
             to: PANCAKE_ROUTER,
             data,
             value: amountWei,
             gas: bnbToTokenGas,
             gasPrice: fastGasPrice
           })
           console.log(`[Swap] ⚡ Swap tx sent (${Date.now() - txStartTime}ms, Gas: ${bnbToTokenGas}):`, swapTxHash)

      // ===== 场景 2: Token -> BNB =====
      } else if (toAsset.symbol === 'BNB') {
           console.log('[Swap] Scenario: Token → BNB (需要 Approve)')
           
           // 1️⃣ Approve
           const approveData = encodeFunctionData({
             abi: ERC20_ABI,
             functionName: 'approve',
             args: [PANCAKE_ROUTER, amountWei * 1000n] // ⚡ 大额授权
           })
           
           const approveStartTime = Date.now()
           const approveTxHash = await client.sendTransaction({
             to: fromAsset.contractAddress as `0x${string}`,
             data: approveData,
             gas: 60000n,
             gasPrice: fastGasPrice
           })
           console.log(`[Swap] ⚡ Approve tx sent (${Date.now() - approveStartTime}ms):`, approveTxHash)
           
           // ⚡⚡⚡ 等待 Approve 确认（0 确认，500ms 轮询）
           console.log('[Swap] ⚡⚡⚡ Waiting for Approve confirmation (0 conf, 500ms polling)...')
           const approveConfirmStart = Date.now()
           await publicClient.waitForTransactionReceipt({
               hash: approveTxHash,
               confirmations: 0,
               timeout: 15_000,
               pollingInterval: 500
           })
           console.log(`[Swap] ⚡ Approve confirmed (${Date.now() - approveConfirmStart}ms)`)
           
           // 2️⃣ Swap
           const path = [fromAsset.contractAddress, WBNB_ADDRESS]
           
           // ⚡⚡⚡ 对于 RADRS 等带税代币，使用 SupportingFeeOnTransferTokens
           const isSourceTaxToken = fromAsset.symbol === 'RADRS'
           const functionName = isSourceTaxToken
               ? 'swapExactTokensForETHSupportingFeeOnTransferTokens'
               : 'swapExactTokensForETH'
           
           const abiString = isSourceTaxToken
               ? 'function swapExactTokensForETHSupportingFeeOnTransferTokens(uint amountIn, uint amountOutMin, address[] path, address to, uint deadline)'
               : 'function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] path, address to, uint deadline) returns (uint[] amounts)'
           
           console.log(`[Swap] Using ${functionName}${isSourceTaxToken ? ' (带税代币)' : ''}`)
           
           const data = encodeFunctionData({
             abi: parseAbi([abiString]),
             functionName,
             args: [amountWei, amountOutMin, path, wallet?.address as `0x${string}`, deadline]
           })

           const txStartTime = Date.now()
           const tokenToBnbGas = fromAsset.symbol === 'RADRS' ? 400000n : 300000n // ⚡ RADRS 税收代币需要更多
           swapTxHash = await client.sendTransaction({
             to: PANCAKE_ROUTER,
             data,
             value: 0n,
             gas: tokenToBnbGas,
             gasPrice: fastGasPrice
           })
           console.log(`[Swap] ⚡ Swap tx sent (${Date.now() - txStartTime}ms, Gas: ${tokenToBnbGas}):`, swapTxHash)

      // ===== 场景 3: Token -> Token =====
      } else {
           console.log('[Swap] Scenario: Token → Token (需要 Approve)')
           
           // 1️⃣ Approve
           const approveData = encodeFunctionData({
             abi: ERC20_ABI,
             functionName: 'approve',
             args: [PANCAKE_ROUTER, amountWei * 1000n]
           })
           
           const approveStartTime = Date.now()
           const approveTxHash = await client.sendTransaction({
             to: fromAsset.contractAddress as `0x${string}`,
             data: approveData,
             gas: 60000n,
             gasPrice: fastGasPrice
           })
           console.log(`[Swap] ⚡ Approve tx sent (${Date.now() - approveStartTime}ms):`, approveTxHash)
           
           // ⚡⚡⚡ 等待 Approve 确认
           console.log('[Swap] ⚡⚡⚡ Waiting for Approve confirmation...')
           const approveConfirmStart = Date.now()
           await publicClient.waitForTransactionReceipt({
               hash: approveTxHash,
               confirmations: 0,
               timeout: 15_000,
               pollingInterval: 500
           })
           console.log(`[Swap] ⚡ Approve confirmed (${Date.now() - approveConfirmStart}ms)`)
           
          // ⚡⚡⚡ 优化路由（RADRS 税收代币需要更高 Gas）
          const isUsdtRadrs = (fromAsset.contractAddress === USDT_ADDRESS && toAsset.contractAddress === RADRS_ADDRESS) ||
                              (fromAsset.contractAddress === RADRS_ADDRESS && toAsset.contractAddress === USDT_ADDRESS)
          const isRadrsInvolved = fromAsset.symbol === 'RADRS' || toAsset.symbol === 'RADRS'
          
          let path: `0x${string}`[]
          let gas: bigint
          
          if (isUsdtRadrs && fromAsset.contractAddress && toAsset.contractAddress) {
              path = [fromAsset.contractAddress as `0x${string}`, toAsset.contractAddress as `0x${string}`]
              gas = isRadrsInvolved ? 400000n : 300000n // ⚡ RADRS 税收代币需要更多
              console.log(`[Swap] ⚡ Using direct USDT ↔ RADRS route (Gas: ${gas})`)
          } else if (fromAsset.contractAddress && toAsset.contractAddress) {
              path = [fromAsset.contractAddress as `0x${string}`, WBNB_ADDRESS as `0x${string}`, toAsset.contractAddress as `0x${string}`]
              gas = isRadrsInvolved ? 550000n : 450000n // ⚡ RADRS 多跳需要更多 gas
              console.log(`[Swap] Using multi-hop route via WBNB (Gas: ${gas})`)
          } else {
              throw new Error('无法构建交易路径')
          }
           
           // 2️⃣ Swap
           // ⚡⚡⚡ 对于 RADRS 等带税代币，使用 SupportingFeeOnTransferTokens
           const functionName = isRadrsInvolved
               ? 'swapExactTokensForTokensSupportingFeeOnTransferTokens'
               : 'swapExactTokensForTokens'
           
           const abiString = isRadrsInvolved
               ? 'function swapExactTokensForTokensSupportingFeeOnTransferTokens(uint amountIn, uint amountOutMin, address[] path, address to, uint deadline)'
               : 'function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] path, address to, uint deadline) returns (uint[] amounts)'
           
           console.log(`[Swap] Using ${functionName}${isRadrsInvolved ? ' (带税代币)' : ''}`)
           
           const data = encodeFunctionData({
             abi: parseAbi([abiString]),
             functionName,
             args: [amountWei, amountOutMin, path, wallet?.address as `0x${string}`, deadline]
           })

           const txStartTime = Date.now()
           swapTxHash = await client.sendTransaction({
             to: PANCAKE_ROUTER,
             data,
             value: 0n,
             gas,
             gasPrice: fastGasPrice
           })
           console.log(`[Swap] ⚡ Swap tx sent (${Date.now() - txStartTime}ms):`, swapTxHash)
      }

      // ⚡⚡⚡ 等待 Swap 确认（0 确认，500ms 轮询）
      console.log('[Swap] ⚡⚡⚡ Waiting for Swap confirmation (0 conf, 500ms polling)...')
      const swapConfirmStart = Date.now()
      const receipt = await publicClient.waitForTransactionReceipt({
          hash: swapTxHash,
          confirmations: 0,
          timeout: 15_000,
          pollingInterval: 500
      })
      const swapConfirmTime = Date.now() - swapConfirmStart
      console.log(`[Swap] ⚡ Swap confirmed (${swapConfirmTime}ms / ${(swapConfirmTime/1000).toFixed(2)}s)`)
      
      if (receipt.status !== 'success') {
          throw new Error('兑换交易已回退，请检查余额和网络状态')
      }
      
      console.log('[Swap] ✅ Swap confirmed successfully!')
      
      // ⚡⚡⚡ 计算总时间
      const totalSwapTime = ((Date.now() - totalStartTime)/1000).toFixed(2)
      console.log(`[Swap] ⚡⚡⚡ TOTAL SWAP TIME: ${totalSwapTime}s`)

      // 清空输入
      setAmount("")
      
      // 添加活动记录（成功状态）
      addActivity({
        type: "Swap",
        asset: `${fromAssetSymbol} → ${toAssetSymbol}`,
        amount: `${amount} ${fromAssetSymbol}`,
        status: "Success",
        hash: swapTxHash,
        from: wallet?.address, // ✅ 添加钱包地址（兑换是内部操作）
        to: wallet?.address,   // ✅ 同一钱包
        timestamp: Date.now()
      })

      // ⚡⚡⚡ 立即显示成功提示
      alert(`兑换成功！\n\n交易已确认，余额即将更新。\n\n⚡ 完成时间: ${totalSwapTime}秒`)
      
      // ⚡⚡⚡ 立即返回钱包页面
      navigate('/wallet')
      
      // ⚡⚡⚡ 后台异步刷新余额
      console.log('[Swap] ⚡ Fetching updated balances in background...')
      fetchRealBalances().catch(e => console.warn('[Swap] Background balance fetch failed:', e))

    } catch (error: any) {
        console.error('[Swap] ❌ Swap failed:', error)
        
        let errorMsg = '兑换失败！\n\n'
        
        if (error.message?.includes('BNB 余额不足支付 Gas 费')) {
            // 已经包含详细信息的错误（从预检查抛出）
            errorMsg += error.message
        } else if (error.message?.includes('insufficient funds')) {
            errorMsg += `🔴 余额不足\n\n当前余额:\n- ${fromAsset.symbol}: ${realFromBalance}\n- BNB (Gas): ${realBnbBalance > 0 ? realBnbBalance.toFixed(6) : bnbBalance}\n\n建议: 减少兑换数量或充值 BNB`
        } else if (error.message?.includes('INSUFFICIENT_OUTPUT_AMOUNT')) {
            const currentSlippage = isRadrsPair ? RADRS_TAX_INFO.slippage : 5
            errorMsg += `🔴 滑点过大\n\n当前滑点: ${currentSlippage}%\n预计获得: ${estimatedAmount} ${toAsset.symbol}\n\n`
            if (isRadrsPair) {
                errorMsg += `⚠️ RADRS 是带税代币（约 10% 税收）\n\n`
            }
            errorMsg += `建议: 等待几分钟后重试`
        } else if (error.message?.includes('timeout') || error.message?.includes('timed out')) {
            errorMsg += `🔴 网络超时\n\n当前网络较慢\n\n建议:\n- 切换到更好的网络（WiFi）\n- 稍后重试`
        } else {
            errorMsg += `${error.message || '未知错误'}\n\n建议: 检查网络连接后重试`
        }
        
        alert(errorMsg)
    } finally {
        setIsSwapping(false)
    }
  }

  const switchAssets = () => {
    setFromAssetSymbol(toAssetSymbol)
    setToAssetSymbol(fromAssetSymbol)
  }

  return (
    <div className="p-4 pt-8 pb-24 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">{t('swap.title')}</h1>

      <div className="space-y-2 relative">
        {/* From Card */}
        <Card className="bg-background-secondary border-divider">
          <CardContent className="p-4 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-secondary">{t('swap.from')}</span>
              <span className="text-sm text-text-secondary">Balance: {realFromBalance}</span>
            </div>
            <div className="flex gap-3">
              <div className="w-[140px]">
                <Select
                  value={fromAssetSymbol}
                  onChange={setFromAssetSymbol}
                  options={assetOptions}
                  className="bg-card border-none"
                />
              </div>
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-right border-none bg-transparent text-2xl font-mono focus-visible:ring-0 p-0 h-auto"
              />
            </div>
          </CardContent>
        </Card>

        {/* Switch Button */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <button 
            onClick={switchAssets}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-card border border-divider shadow-sm hover:border-accent transition-colors"
          >
            <ArrowDown className="w-5 h-5 text-accent" />
          </button>
        </div>

        {/* To Card */}
        <Card className="bg-background-secondary border-divider">
          <CardContent className="p-4 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-secondary">{t('swap.to')} ({t('swap.estimated')})</span>
              <span className="text-sm text-text-secondary">Balance: {realToBalance}</span>
            </div>
            <div className="flex gap-3">
              <div className="w-[140px]">
                <Select
                  value={toAssetSymbol}
                  onChange={setToAssetSymbol}
                  options={assetOptions}
                  className="bg-card border-none"
                />
              </div>
              <Input
                type="text"
                readOnly
                placeholder="0.00"
                value={estimatedAmount}
                className="text-right border-none bg-transparent text-2xl font-mono focus-visible:ring-0 p-0 h-auto text-text-secondary"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info & Fees */}
      <div className="mt-6 space-y-4">
        <div className="p-4 rounded-xl bg-card border border-divider/50 space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-text-secondary flex items-center gap-1">
              兑换汇率 <Info className="w-3 h-3" />
            </span>
            <span className="font-mono">
              {isQuoting ? '报价中...' : exchangeRate !== "0" ? `1 ${fromAssetSymbol} ≈ ${exchangeRate} ${toAssetSymbol}` : '-'}
            </span>
          </div>
          
          {estimatedAmount && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-text-secondary">最少获得（滑点后）</span>
              <span className="font-mono text-status-success">
                {(parseFloat(estimatedAmount) * (1 - (fromAsset?.symbol === 'RADRS' || toAsset?.symbol === 'RADRS' ? 0.25 : 0.05))).toFixed(4)} {toAssetSymbol}
              </span>
            </div>
          )}
          
          {estimatedAmount && (fromAsset?.symbol === 'RADRS' || toAsset?.symbol === 'RADRS') && (
            <div className="flex justify-between items-center text-xs text-status-warning">
              <span>实际到账（扣税后）</span>
              <span className="font-mono font-medium">
                约 {(parseFloat(estimatedAmount) * 0.75 * 0.9).toFixed(4)} {toAssetSymbol}
              </span>
            </div>
          )}
          
          <div className="flex justify-between items-start text-sm">
            <span className="text-text-secondary">网络费用 (Gas)</span>
            <div className="flex flex-col items-end gap-1">
              <div className="flex flex-col items-end">
                <span className="font-medium">
                    ~0.0005-0.0008 BNB
                </span>
                <span className="text-xs text-text-secondary">
                    ≈ $0.15-0.25
                </span>
              </div>
              <Badge variant="warning" className="text-[10px] h-5">极速 Gas (200%)</Badge>
            </div>
          </div>
          
          <div className="flex justify-between items-center text-sm">
             <span className="text-text-secondary">滑点保护</span>
             <span className="text-status-warning font-medium">
               {fromAsset?.symbol === 'RADRS' || toAsset?.symbol === 'RADRS' ? '25%' : '5%'}
             </span>
          </div>
          
          {(fromAsset?.symbol === 'RADRS' || toAsset?.symbol === 'RADRS') && (
             <div className="flex items-start gap-2 p-3 bg-status-warning/10 border border-status-warning/20 rounded-lg">
                 <AlertCircle className="w-4 h-4 text-status-warning flex-shrink-0 mt-0.5" />
                 <div className="text-status-warning text-xs leading-relaxed">
                   <div className="font-medium mb-1">🔥 RADRS 税收提示</div>
                   <div>RADRS 是带税代币，买入/卖出时会自动扣除约 <span className="font-bold">10%</span> 作为税收。</div>
                   <div className="mt-1">实际到账金额会比报价显示的<span className="font-bold">少 10% 左右</span>，这是正常的。</div>
                 </div>
             </div>
          )}
          
          {!hasEnoughGas && (
             <div className="flex items-center gap-2 p-2 bg-status-error/10 border border-status-error/20 rounded-lg">
                 <AlertCircle className="w-4 h-4 text-status-error flex-shrink-0" />
                 <span className="text-status-error text-xs">BNB 余额不足 (Gas)</span>
             </div>
          )}
          
          {quoteError && (
             <div className="flex items-center gap-2 p-2 bg-status-warning/10 border border-status-warning/20 rounded-lg">
                 <AlertCircle className="w-4 h-4 text-status-warning flex-shrink-0" />
                 <span className="text-status-warning text-xs">{quoteError}</span>
             </div>
          )}
        </div>

        <Button 
          className="w-full" 
          size="lg" 
          variant="primary"
          onClick={handleSwap}
          isLoading={isSwapping}
          disabled={!amount || !hasEnoughGas || !quoteAmountOut || !!quoteError}
        >
          {isSwapping ? '兑换中...' : !amount ? '请输入金额' : !hasEnoughGas ? 'BNB 余额不足 (Gas)' : !quoteAmountOut ? '获取报价中...' : '兑换'}
        </Button>

        {/* Promo Banner */}
        <div className="pt-2">
            <ReferralPromo variant="card" />
        </div>
      </div>
    </div>
  )
}
