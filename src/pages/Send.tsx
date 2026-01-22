import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { ArrowLeft, ArrowRight, ScanLine, AlertCircle } from "lucide-react"
import { useAppStore } from "../store/useAppStore"
import { FEES, GAS_TOKEN_SYMBOL } from "../config/fees"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Select } from "../components/ui/select"
import { Sheet } from "../components/ui/sheet"
import { Badge } from "../components/ui/badge"
import { useTranslation } from "react-i18next"
import { ReferralPromo } from "../components/ReferralPromo"
import { QrScanner } from "../components/QrScanner"
import { parseEther, formatEther, createWalletClient, http, encodeFunctionData } from "viem"
import { privateKeyToAccount } from "viem/accounts"
import { bsc } from "viem/chains"
import { RADRS_CONFIG } from "../config/radrs"
import { publicClient } from "../services/radrsService"

// ⚡⚡⚡ 极速配置  
const MIN_GAS_BNB = 0.0005 // 实际需要 ~0.0003-0.0005 BNB

export default function Send() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const assetParam = searchParams.get('asset')
  
  const { getCurrentNetwork, addActivity, updateAssetBalance, getCurrentWallet, getPrivateKey: getStorePrivateKey, fetchRealBalances } = useAppStore()
  const network = getCurrentNetwork()
  const wallet = getCurrentWallet()
  
  // Single page mode, default to asset param or first asset
  const [selectedAssetSymbol, setSelectedAssetSymbol] = useState(assetParam || network?.assets[0].symbol || "")
  
  const [address, setAddress] = useState("")
  const [addressError, setAddressError] = useState("")
  
  const [amount, setAmount] = useState("")
  const [showConfirm, setShowConfirm] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [showScanner, setShowScanner] = useState(false)

  const selectedAsset = network?.assets.find(a => a.symbol === selectedAssetSymbol)
  
  // ⚡⚡⚡ Gas 费检查
  const gasAsset = network?.assets.find(a => a.symbol === 'BNB')
  const hasEnoughGas = gasAsset ? parseFloat(gasAsset.balance) >= MIN_GAS_BNB : false
  const selectedAssetBalance = selectedAsset?.balance || "0"

  const assetOptions = network?.assets.map(a => ({
    value: a.symbol,
    label: a.symbol,
    icon: <div className="flex items-center justify-center w-5 h-5 rounded-full bg-background-primary text-[10px] font-bold border border-divider">{a.symbol[0]}</div>
  })) || []

  const validateAddress = (addr: string) => {
    if (!addr) return false
    // Basic EVM address validation: 0x + 40 hex chars
    const re = /^0x[a-fA-F0-9]{40}$/
    if (!re.test(addr)) {
      setAddressError(t('send.invalidAddress', 'Invalid wallet address'))
      return false
    }
    setAddressError("")
    return true
  }

  const handleNext = () => {
    const isValid = validateAddress(address)
    if (isValid && amount && hasEnoughGas) setShowConfirm(true)
  }

  const getPrivateKey = () => {
      if (wallet?.id) {
          return getStorePrivateKey(wallet.id)
      }
      return ""
  }

  const handleSend = async () => {
    if (!network || !selectedAssetSymbol || !selectedAsset) return
    
    setIsSending(true)
    const totalStartTime = Date.now()
    console.log('[Send] ⚡⚡⚡ Starting send transaction...')
    
    try {
        const pk = getPrivateKey()
        if (!pk) throw new Error("私钥未找到")
        
        const account = privateKeyToAccount(pk as `0x${string}`)
        
        // ⚡⚡⚡ 安全检查：确认地址匹配
        console.log(`[Send] 🔐 Security check:`)
        console.log(`[Send]   Account address: ${account.address}`)
        console.log(`[Send]   Wallet address:  ${wallet?.address}`)
        if (account.address.toLowerCase() !== wallet?.address.toLowerCase()) {
            throw new Error(`❌ 地址不匹配！\n\n派生地址: ${account.address}\n存储地址: ${wallet?.address}\n\n请检查助记词是否正确`)
        }
        console.log(`[Send] ✅ Address verified`)
        
        // ⚡⚡⚡ 实时获取 BNB 余额（避免使用缓存数据）
        console.log('[Send] ⚡ Fetching real-time BNB balance...')
        const bnbBalanceWei = await publicClient.getBalance({ address: account.address })
        const bnbBalance = parseFloat(formatEther(bnbBalanceWei))
        console.log(`[Send] Real BNB balance: ${bnbBalance.toFixed(6)} BNB`)
        
        // ⚡⚡⚡ 预检查 Gas 费（防止链上失败）
        const estimatedGasLimit = selectedAsset.contractAddress ? (selectedAssetSymbol === 'RADRS' ? 120000 : 80000) : 21000
        const baseGasPrice = await publicClient.getGasPrice()
        const fastGasPrice = (baseGasPrice * 200n) / 100n
        const estimatedGasCost = parseFloat(formatEther(BigInt(estimatedGasLimit) * fastGasPrice))
        
        console.log(`[Send] Estimated Gas: ${estimatedGasLimit}, Price: ${formatEther(fastGasPrice)} Gwei, Cost: ${estimatedGasCost.toFixed(6)} BNB`)
        
        if (bnbBalance < estimatedGasCost) {
            throw new Error(`BNB 余额不足支付 Gas 费\n\n当前 BNB: ${bnbBalance.toFixed(6)}\n需要 Gas: ${estimatedGasCost.toFixed(6)} BNB\n缺少: ${(estimatedGasCost - bnbBalance).toFixed(6)} BNB\n\n建议: 充值至少 ${Math.ceil((estimatedGasCost - bnbBalance + 0.001) * 1000) / 1000} BNB`)
        }
        
        if (bnbBalance < estimatedGasCost * 1.2) {
            console.warn(`[Send] ⚠️ BNB balance is tight: ${bnbBalance.toFixed(6)} BNB, estimated cost: ${estimatedGasCost.toFixed(6)} BNB`)
        }
        
        // ⚡⚡⚡ 极速钱包客户端
        const client = createWalletClient({
            account,
            chain: bsc,
            transport: http(RADRS_CONFIG.rpcUrl)
        })

        const amountWei = parseEther(amount)
        const selectedAssetBalance = parseFloat(selectedAsset.balance || "0")
        let txHash: `0x${string}`

        if (selectedAsset.contractAddress) {
             // ===== ERC20 Transfer =====
             console.log('[Send] ERC20 transfer')
             
             // ⚡⚡⚡ 使用已获取的 Gas Price（200% 加速）
             console.log(`[Send] ⚡ Using 200% Gas: ${formatEther(fastGasPrice)} Gwei`)
             
             // ⚡⚡⚡ 优化 Gas Limit（RADRS 税收代币需要更高）
             const erc20GasLimit = BigInt(estimatedGasLimit)
             
             // Encode Transfer
             const data = encodeFunctionData({
                abi: [{
                    name: 'transfer',
                    type: 'function',
                    stateMutability: 'nonpayable',
                    inputs: [{ name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }],
                    outputs: [{ name: '', type: 'bool' }]
                }],
                functionName: 'transfer',
                args: [address as `0x${string}`, amountWei]
             })
             
             // ⚡⚡⚡ OPTIMIZATION: Skip simulation for small transfers to save ~300ms
             const shouldSimulate = parseFloat(amount) > selectedAssetBalance * 0.5
             
             if (shouldSimulate) {
                 try {
                     const simStartTime = Date.now()
                     await publicClient.call({
                         account,
                         to: selectedAsset.contractAddress as `0x${string}`,
                         data,
                         value: 0n,
                         gas: erc20GasLimit,
                         gasPrice: fastGasPrice
                     })
                     console.log(`[Send] ⚡ Simulation passed (${Date.now() - simStartTime}ms)`)
                 } catch (simError: any) {
                     console.warn("[Send] Simulation failed", simError)
                     if (simError.message.includes('insufficient funds')) {
                          throw new Error(`${selectedAssetSymbol} 余额不足或 BNB Gas 费不足`)
                     }
                 }
             } else {
                 console.log(`[Send] ⚡ Skipped simulation (amount < 50% of balance, saved ~300ms)`)
             }

             // Send Transaction
             const txStartTime = Date.now()
             txHash = await client.sendTransaction({
                to: selectedAsset.contractAddress as `0x${string}`,
                data,
                value: 0n,
                gas: erc20GasLimit,
                gasPrice: fastGasPrice
             })
             console.log(`[Send] ⚡ ERC20 tx sent (${Date.now() - txStartTime}ms):`, txHash)

        } else {
             // ===== Native BNB Transfer =====
             console.log('[Send] Native BNB transfer')
             
             // ⚡⚡⚡ 使用已获取的 Gas Price（200% 加速）
             console.log(`[Send] ⚡ Using 200% Gas: ${formatEther(fastGasPrice)} Gwei`)
             
             // ⚡⚡⚡ 固定 Gas Limit
             const nativeGasLimit = BigInt(estimatedGasLimit)
             
             // Send Transaction
             const txStartTime = Date.now()
             txHash = await client.sendTransaction({
                to: address as `0x${string}`,
                value: amountWei,
                gas: nativeGasLimit,
                gasPrice: fastGasPrice
             })
             console.log(`[Send] ⚡ BNB tx sent (${Date.now() - txStartTime}ms):`, txHash)
        }

        // ⚡⚡⚡ Wait for confirmation with 0 confirmations for maximum speed
        console.log('[Send] ⚡⚡⚡ Waiting for confirmation (0 conf, 500ms polling)...')
        const confirmStartTime = Date.now()
        const receipt = await publicClient.waitForTransactionReceipt({
            hash: txHash,
            confirmations: 0, // ⚡⚡⚡ 0 confirmations for fastest speed
            timeout: 15_000, // ⚡⚡⚡ Reduced timeout to 15s (BSC is fast)
            pollingInterval: 500 // ⚡⚡⚡ Explicit 500ms polling (matches publicClient config)
        })
        const confirmTime = Date.now() - confirmStartTime
        console.log(`[Send] ⚡ Confirmation received (${confirmTime}ms / ${(confirmTime/1000).toFixed(2)}s)`)
        
        if (receipt.status !== 'success') {
            throw new Error('交易已回退，请检查余额和网络状态')
        }
        
        console.log('[Send] ✅ Transaction confirmed successfully!')

        // ⚡⚡⚡ CRITICAL OPTIMIZATION: Do everything in parallel after confirmation
        const totalTime = ((Date.now() - totalStartTime) / 1000).toFixed(2)
        console.log(`[Send] ⚡⚡⚡ TOTAL SEND TIME: ${totalTime}s`)

        // Optimistic Update (immediate)
        updateAssetBalance(network.id, selectedAssetSymbol, amount, 'subtract')

        // Add activity (immediate)
        addActivity({
            type: "Send",
            asset: selectedAssetSymbol,
            amount: `-${amount}`,
            status: "Success",
            hash: txHash,
            from: wallet?.address, // ✅ 添加发送方地址
            to: address,           // ✅ 添加接收方地址
            timestamp: Date.now()
        })

        // ⚡⚡⚡ Show alert immediately (don't wait for balance refresh)
        alert(`转账成功！\n\n交易已确认，余额即将更新。\n\n⚡ 完成时间: ${totalTime}秒`)

        // ⚡⚡⚡ Navigate immediately (don't wait for balance refresh)
        setIsSending(false)
        setShowConfirm(false)
        navigate("/wallet")
        
        // ⚡⚡⚡ Fetch balances in background (async, don't await)
        console.log('[Send] ⚡ Fetching updated balances in background...')
        fetchRealBalances().catch(e => console.warn('[Send] Background balance fetch failed:', e))

    } catch (error: any) {
        console.error('[Send] ❌ Send failed:', error)
        
        let errorMsg = '转账失败！\n\n'
        
        if (error.message?.includes('BNB 余额不足支付 Gas 费')) {
            // 已经包含详细信息的错误（从预检查抛出）
            errorMsg += error.message
        } else if (error.message?.includes('insufficient funds')) {
            // 链上返回的余额不足错误
            errorMsg += `🔴 余额不足\n\n可能原因:\n`
            errorMsg += `1. ${selectedAssetSymbol} 代币余额不足\n`
            errorMsg += `2. BNB Gas 费不足\n\n`
            errorMsg += `您的 BNB: ${gasAsset?.balance || '0'}\n`
            errorMsg += `转账资产: ${selectedAssetSymbol}\n\n`
            errorMsg += `建议: 确保 BNB 余额 > 0.001`
        } else if (error.message?.includes('timeout') || error.message?.includes('timed out')) {
            errorMsg += `🔴 网络超时\n\n建议:\n- 切换到更好的网络（WiFi）\n- 稍后重试`
        } else {
            errorMsg += `${error.message || '未知错误'}\n\n建议: 检查网络连接后重试`
        }
        
        alert(errorMsg)
        setIsSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-background-primary text-text-primary p-4 pb-8 max-w-md mx-auto">
      {/* Scanner Modal */}
      {showScanner && (
        <QrScanner 
            onScan={(val) => {
                if (val) {
                    setAddress(val)
                    validateAddress(val)
                    setShowScanner(false)
                }
            }}
            onClose={() => setShowScanner(false)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6 pt-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-xl font-bold">{t('wallet.send')}</h1>
        <div className="w-10" />
      </div>

      <div className="space-y-6 flex flex-col pb-72">
        {/* Recipient Address */}
        <div className="space-y-2">
            <label className="text-sm text-text-secondary ml-1">{t('send.toAddress')}</label>
            <div className="relative">
            <Input 
                placeholder="0x..." 
                value={address}
                onChange={(e) => {
                    setAddress(e.target.value)
                    if (addressError) setAddressError("")
                }}
                onBlur={() => validateAddress(address)}
                className={`pr-10 ${addressError ? 'border-status-error focus-visible:ring-status-error' : ''}`}
            />
            <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-1 top-1 h-10 w-10 text-text-secondary"
                onClick={() => setShowScanner(true)}
            >
                <ScanLine className="w-5 h-5" />
            </Button>
            </div>
            {addressError && (
                <p className="text-xs text-status-error flex items-center gap-1 ml-1">
                    <AlertCircle className="w-3 h-3" /> {addressError}
                </p>
            )}
        </div>

        {/* Amount & Asset Selection */}
        <div className="space-y-2">
            <label className="text-sm text-text-secondary ml-1">{t('send.amount')}</label>
            <div className="relative flex gap-2">
                <Input 
                    type="number"
                    placeholder="0.00" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="flex-1 font-mono text-lg"
                />
                <div className="w-32 shrink-0">
                    <Select
                        value={selectedAssetSymbol}
                        onChange={setSelectedAssetSymbol}
                        options={assetOptions}
                        className="bg-background-secondary border-divider h-12"
                    />
                </div>
            </div>
            <div className="flex justify-between px-1">
                <span className="text-xs text-text-secondary">
                    {selectedAsset?.price && amount ? `≈ $${(parseFloat(amount) * selectedAsset.price).toFixed(2)}` : '≈ $0.00'}
                </span>
                <div className="flex gap-2 text-xs">
                    <span className="text-text-secondary">
                        {t('send.available')}: {selectedAsset?.balance} {selectedAsset?.symbol}
                    </span>
                    <button className="text-accent font-medium hover:underline" onClick={() => setAmount(selectedAsset?.balance || "")}>
                        {t('send.max')}
                    </button>
                </div>
            </div>
        </div>

        {/* Network Fee */}
        <div className="bg-background-secondary p-4 rounded-xl space-y-2 order-2">
            <div className="flex justify-between text-sm">
                <span className="text-text-secondary">网络费用 (Gas)</span>
                <div className="text-right">
                    <span className="block font-medium">
                      ~{selectedAssetSymbol === 'RADRS' ? '0.0007' : selectedAsset?.contractAddress ? '0.0005' : '0.0003'} BNB
                    </span>
                    <span className="text-xs text-text-secondary">
                        ≈ $0.{selectedAsset?.contractAddress ? '15' : '08'}
                    </span>
                </div>
            </div>
            <div className="flex justify-end flex-col items-end gap-1">
                    <Badge variant="warning" className="text-[10px]">极速 Gas (200%)</Badge>
                    {!hasEnoughGas && (
                    <div className="flex items-center gap-2 p-2 bg-status-error/10 border border-status-error/20 rounded-lg mt-2">
                        <AlertCircle className="w-4 h-4 text-status-error flex-shrink-0" />
                        <span className="text-status-error text-xs">BNB 余额不足 (Gas)</span>
                    </div>
                    )}
            </div>
        </div>

      </div>

      <div className="fixed bottom-8 left-0 right-0 px-4 max-w-md mx-auto z-10 bg-background-primary pt-2 flex flex-col gap-4">
        <Button 
            className="w-full order-1" 
            size="lg" 
            onClick={handleNext}
            disabled={!address || !amount || !hasEnoughGas || !!addressError || isSending || parseFloat(amount) > parseFloat(selectedAssetBalance)}
        >
            {isSending ? '发送中...' : 
             !address ? '请输入地址' :
             !amount ? '请输入金额' :
             parseFloat(amount) > parseFloat(selectedAssetBalance) ? `${selectedAssetSymbol} 余额不足` :
             !hasEnoughGas ? 'BNB 余额不足 (Gas)' :
             '发送'} <ArrowRight className="ml-2 w-4 h-4" />
        </Button>

        {/* Referral Banner */}
        <div className="w-full order-2">
            <ReferralPromo variant="card" />
        </div>
      </div>

      {/* Confirm Sheet */}
      <Sheet isOpen={showConfirm} onClose={() => setShowConfirm(false)} title={t('send.confirmTitle')}>
        <div className="space-y-6 pb-6">
            <div className="flex flex-col items-center py-6 border-b border-divider/50">
                <span className="text-3xl font-bold tabular-nums mb-1">
                    -{amount} {selectedAssetSymbol}
                </span>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-start">
                    <span className="text-text-secondary text-sm">{t('send.from')}</span>
                    <div className="text-right">
                        <span className="block text-sm font-medium">{wallet?.name}</span>
                        <span className="text-xs text-text-secondary font-mono">{wallet?.address}</span>
                    </div>
                </div>
                
                <div className="flex justify-between items-start">
                    <span className="text-text-secondary text-sm">{t('send.to')}</span>
                    <div className="text-right">
                        <span className="text-xs text-text-secondary font-mono block max-w-[200px] truncate">{address}</span>
                    </div>
                </div>

                <div className="flex justify-between items-start">
                    <span className="text-text-secondary text-sm">网络费用 (Gas)</span>
                    <div className="text-right">
                        <span className="block text-sm font-medium">
                          ~{selectedAssetSymbol === 'RADRS' ? '0.0007' : selectedAsset?.contractAddress ? '0.0005' : '0.0003'} BNB
                        </span>
                        <Badge variant="warning" className="mt-1 text-[10px]">极速 Gas (200%)</Badge>
                    </div>
                </div>
            </div>

            <Button 
                className="w-full mt-4" 
                size="lg" 
                variant="primary"
                onClick={handleSend}
                isLoading={isSending}
            >
                {t('send.confirmSend')}
            </Button>
        </div>
      </Sheet>
    </div>
  )
}
