import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { ArrowDown, Info, AlertCircle } from "lucide-react"
import { useAppStore } from "../store/useAppStore"
import { FEES, GAS_TOKEN_SYMBOL } from "../config/fees"
import { radrsService } from "../services/radrsService"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Select } from "../components/ui/select"
import { Badge } from "../components/ui/badge"
import { Card, CardContent } from "../components/ui/card"
import { useTranslation } from "react-i18next"
import { ChainService } from "../services/ChainService"
import { ReferralPromo } from "../components/ReferralPromo"
import { AAService } from "../services/AAService"
import { generateMockKey } from "../lib/utils"
import { parseEther } from "viem"

export default function Swap() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const fromParam = searchParams.get('from')

  const { getCurrentNetwork, addActivity, updateAssetBalance, getCurrentWallet, getPrivateKey: getStorePrivateKey } = useAppStore()
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

  // --- Real Balance Fetching ---
  const [realFromBalance, setRealFromBalance] = useState("0.00")
  const [realToBalance, setRealToBalance] = useState("0.00")

  useEffect(() => {
      const fetchBalances = async () => {
          if (wallet?.address && network?.id === 'bsc') {
              if (fromAsset) {
                  let bal = "0"
                  if (fromAsset.symbol === 'BNB') {
                      bal = await ChainService.getNativeBalance(wallet.address)
                  } else if (fromAsset.contractAddress) {
                      bal = await ChainService.getErc20Balance(fromAsset.contractAddress, wallet.address)
                  }
                  // Round to 4 decimals
                  setRealFromBalance(parseFloat(bal).toFixed(4))
              }
              
              if (toAsset) {
                  let bal = "0"
                  if (toAsset.symbol === 'BNB') {
                      bal = await ChainService.getNativeBalance(wallet.address)
                  } else if (toAsset.contractAddress) {
                      bal = await ChainService.getErc20Balance(toAsset.contractAddress, wallet.address)
                  }
                  setRealToBalance(parseFloat(bal).toFixed(4))
              }
          }
      }
      fetchBalances()
      // Poll every 10s
      const interval = setInterval(fetchBalances, 10000)
      return () => clearInterval(interval)
  }, [wallet?.address, fromAssetSymbol, toAssetSymbol, network?.id])

  // Paymaster State
  const [isActivated, setIsActivated] = useState(false)
  const [estimatedRadrsFee, setEstimatedRadrsFee] = useState(FEES.SWAP_RADRS)

  useEffect(() => {
    const checkActivation = async () => {
      if (wallet?.address) {
        const status = await radrsService.isActivated(wallet.address)
        setIsActivated(status)
      }
    }
    checkActivation()
  }, [wallet?.address])

  useEffect(() => {
    const checkFee = async () => {
      if (wallet?.address) {
         // Mock gas cost for swap: 150000 gas * 3 gwei
         const mockGasCostWei = 150000n * 3000000000n
         const fee = await radrsService.getExpectedRadrsCharge(mockGasCostWei, wallet.address)
         setEstimatedRadrsFee(fee)
      }
    }
    checkFee()
  }, [wallet?.address, amount])

  const gasAsset = network?.assets.find(a => a.symbol === GAS_TOKEN_SYMBOL)
  const finalFee = !isActivated ? "0" : estimatedRadrsFee
  const hasEnoughGas = gasAsset ? parseFloat(gasAsset.balance) >= parseFloat(finalFee) : false

  const assetOptions = network?.assets.map(a => ({
    value: a.symbol,
    label: a.symbol,
    icon: <div className="flex items-center justify-center w-5 h-5 rounded-full bg-background-primary text-[10px] font-bold border border-divider">{a.symbol[0]}</div>
  })) || []

  // Mock estimated amount
  const estimatedAmount = amount ? (parseFloat(amount) * 0.98).toFixed(4) : ""

  const getPrivateKey = () => {
      if (wallet?.id) {
          return getStorePrivateKey(wallet.id)
      }
      return ""
  }

  const handleSwap = async () => {
    if (!network || !fromAsset || !toAsset) return
    setIsSwapping(true)

    try {
      const pk = getPrivateKey()
      if (!pk) throw new Error("No private key found")

      // 2. Real Swap using AAService (Batch: Approve + Swap)
      // PancakeSwap Router Address
      const PANCAKE_ROUTER = "0x10ED43C718714eb63d5aA57B78B54704E256024E"
      
      const amountWei = parseEther(amount)
      
      // Calculate min amount out (Slippage protection)
      // Since we don't have a read function yet, we'll use a loose slippage (e.g. 5% or just rely on estimated)
      // In production, fetch `getAmountsOut` from router first.
      const amountOutMin = parseEther((parseFloat(estimatedAmount) * 0.95).toString()) // 5% slippage
      
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 1200) // 20 mins

      const txHash = await AAService.swapTokens(
        signer,
        PANCAKE_ROUTER,
        fromAsset.contractAddress || "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", // WBNB if native? Actually our setup is ERC20 centric for now.
        toAsset.contractAddress || "0x55d398326f99059fF775485246999027B3197955", // USDT default?
        amountWei,
        amountOutMin,
        deadline
      )

      console.log('Swap Transaction Submitted:', txHash)

      // 3. Optimistic Update (Optional, or wait for receipt)
      // Ideally we wait for receipt to confirm status
      // const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash })
      
      // For UX speed, we update local balance optimistically, but maybe just clear form
      setAmount("")
      
      // Record Activity
      addActivity({
        type: "Swap",
        asset: `${fromAssetSymbol} -> ${toAssetSymbol}`,
        amount: `${amount} ${fromAssetSymbol}`,
        status: "Pending", // Set to pending initially
        hash: txHash,
        timestamp: Date.now()
      })

      alert(t('swap.success', 'Swap transaction submitted!'))

    } catch (error: any) {
        console.error("Swap failed", error)
        alert(error.message || "Swap failed")
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
              {t('swap.rate')} <Info className="w-3 h-3" />
            </span>
            <span className="font-mono">1 {fromAssetSymbol} ≈ 0.98 {toAssetSymbol}</span>
          </div>
          
          <div className="flex justify-between items-start text-sm">
            <span className="text-text-secondary">{t('common.networkFee')}</span>
            <div className="flex flex-col items-end gap-1">
              <div className="flex flex-col items-end">
                <span className="font-medium">
                    {finalFee} {GAS_TOKEN_SYMBOL}
                    {!isActivated && <span className="text-status-success text-[10px] ml-1">(First Tx Free)</span>}
                </span>
                <span className="text-xs text-text-secondary">
                    ≈ ${isActivated ? (parseFloat(finalFee) * 0.145).toFixed(2) : '0.00'}
                </span>
              </div>
              <Badge variant="warning" className="text-[10px] h-5">{t('common.paidIn', { token: GAS_TOKEN_SYMBOL })}</Badge>
            </div>
          </div>
          
          {!hasEnoughGas && (
             <div className="flex items-center gap-1 text-status-error text-xs">
                 <AlertCircle className="w-3 h-3" />
                 <span>{t('common.insufficientBalance', { token: GAS_TOKEN_SYMBOL })}</span>
             </div>
          )}
          
          <div className="flex justify-between items-center text-sm">
             <span className="text-text-secondary">{t('swap.priceImpact')}</span>
             <span className="text-status-success">{'<'} 0.01%</span>
          </div>
        </div>

        <Button 
          className="w-full" 
          size="lg" 
          variant="primary"
          onClick={handleSwap}
          isLoading={isSwapping}
          disabled={!amount || !hasEnoughGas}
        >
          {t('swap.button')}
        </Button>

        {/* Promo Banner */}
        <div className="pt-2">
            <ReferralPromo variant="card" />
        </div>
      </div>
    </div>
  )
}