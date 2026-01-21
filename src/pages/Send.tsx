import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { ArrowLeft, ArrowRight, ScanLine, AlertCircle, ChevronDown, Info } from "lucide-react"
import { useAppStore } from "../store/useAppStore"
import { FEES, GAS_TOKEN_SYMBOL } from "../config/fees"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Select } from "../components/ui/select"
import { Sheet } from "../components/ui/sheet"
import { Badge } from "../components/ui/badge"
import { useTranslation } from "react-i18next"
import { ReferralPromo } from "../components/ReferralPromo"
import { AAService } from "../services/AAService"
import { generateMockKey } from "../lib/utils"
import { parseEther, formatEther, createPublicClient, http } from "viem"
import { bsc } from "viem/chains"
import { toSimpleSmartAccount } from "permissionless/accounts"
import { RADRS_CONFIG } from "../config/radrs"

export default function Send() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const assetParam = searchParams.get('asset')
  
  const { getCurrentNetwork, addActivity, updateAssetBalance, getCurrentWallet, getPrivateKey: getStorePrivateKey } = useAppStore()
  const network = getCurrentNetwork()
  const wallet = getCurrentWallet()
  
  // Single page mode, default to asset param or first asset
  const [selectedAssetSymbol, setSelectedAssetSymbol] = useState(assetParam || network?.assets[0].symbol || "")
  
  const [address, setAddress] = useState("")
  const [addressError, setAddressError] = useState("")
  
  const [amount, setAmount] = useState("")
  const [showConfirm, setShowConfirm] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [smartAccountBnbBalance, setSmartAccountBnbBalance] = useState<string>("")
  const [smartAccountAddress, setSmartAccountAddress] = useState<string>("")
  const [isCheckingBalance, setIsCheckingBalance] = useState(false)

  const selectedAsset = network?.assets.find(a => a.symbol === selectedAssetSymbol)
  const gasAsset = network?.assets.find(a => a.symbol === GAS_TOKEN_SYMBOL)
  const hasEnoughGas = gasAsset ? parseFloat(gasAsset.balance) >= FEES.SEND_RADRS : false
  const hasEnoughBnbInSmartAccount = parseFloat(smartAccountBnbBalance || "0") >= 0.001

  const assetOptions = network?.assets.map(a => ({
    value: a.symbol,
    label: a.symbol,
    icon: <div className="flex items-center justify-center w-5 h-5 rounded-full bg-background-primary text-[10px] font-bold border border-divider">{a.symbol[0]}</div>
  })) || []

  // 檢查智能賬戶餘額
  useEffect(() => {
    const checkSmartAccountBalance = async () => {
      try {
        const pk = getPrivateKey()
        if (!pk) return
        
        setIsCheckingBalance(true)
        
        const publicClient = createPublicClient({
          chain: bsc,
          transport: http(RADRS_CONFIG.rpcUrl)
        })
        
        const signer = AAService.getSigner(pk as `0x${string}`)
        const simpleAccount = await toSimpleSmartAccount({
          client: publicClient,
          owner: signer,
          entryPoint: {
            address: RADRS_CONFIG.entryPointAddress as `0x${string}`,
            version: "0.6"
          },
          factoryAddress: RADRS_CONFIG.factoryAddress as `0x${string}`,
        })
        
        const balance = await publicClient.getBalance({ address: simpleAccount.address })
        setSmartAccountBnbBalance(formatEther(balance))
        setSmartAccountAddress(simpleAccount.address)
        
        console.log('智能賬戶地址:', simpleAccount.address)
        console.log('智能賬戶 BNB 餘額:', formatEther(balance), 'BNB')
      } catch (error) {
        console.error('檢查智能賬戶餘額失敗:', error)
      } finally {
        setIsCheckingBalance(false)
      }
    }
    
    checkSmartAccountBalance()
  }, [])

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
    if (!hasEnoughBnbInSmartAccount) {
      alert(t('send.insufficientSmartAccountBnb', `智能賬戶 BNB 餘額不足！\n\n當前餘額: ${smartAccountBnbBalance} BNB\n需要至少: 0.001 BNB\n\n請向智能賬戶地址轉入至少 0.005 BNB：\n${smartAccountAddress}`))
      return
    }
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
    
    try {
        const pk = getPrivateKey()
        if (!pk) throw new Error("No private key found")

        // Construct UserOperation via AAService
        let txHash = ""
        const signer = AAService.getSigner(pk as `0x${string}`)
        
        // Convert amount to BigInt (assuming 18 decimals for now)
        const amountWei = parseEther(amount)

        if (selectedAsset.contractAddress) {
            // ERC20 Transfer (Now handles approve internally in sendToken)
            txHash = await AAService.sendToken(
                signer, 
                selectedAsset.contractAddress, 
                address, 
                amountWei
            )
        } else {
            // Native Token Transfer (BNB/ETH)
            // Supported now via sendNative
             if (selectedAssetSymbol === 'BNB' || selectedAssetSymbol === 'ETH' || selectedAssetSymbol === 'MATIC') {
                  txHash = await AAService.sendNative(
                      signer,
                      address,
                      amountWei
                  )
             } else {
                 throw new Error(`Unsupported asset type: ${selectedAssetSymbol}`)
             }
        }

        console.log('Send Transaction Submitted:', txHash)

        // Optimistic Update
        updateAssetBalance(network.id, selectedAssetSymbol, amount, 'subtract')
        updateAssetBalance(network.id, GAS_TOKEN_SYMBOL, FEES.SEND_RADRS.toString(), 'subtract')

        addActivity({
            type: "Send",
            asset: selectedAssetSymbol,
            amount: `-${amount}`,
            status: "Pending",
            hash: txHash,
            timestamp: Date.now()
        })

        alert(t('send.success', 'Transaction submitted successfully!'))

        setIsSending(false)
        setShowConfirm(false)
        navigate("/wallet") 

    } catch (error: any) {
        console.error("Send failed", error)
        
        // 檢查是否是 AA21 錯誤
        const errorMessage = error.message || error.toString()
        if (errorMessage.includes("AA21") || errorMessage.includes("didn't pay prefund")) {
          alert(t('send.aa21Error', `❌ 智能賬戶餘額不足\n\n錯誤：智能賬戶沒有足夠的 BNB 來支付 prefund（預付費）\n\n當前智能賬戶 BNB 餘額: ${smartAccountBnbBalance} BNB\n需要至少: 0.001 BNB\n\n解決方案：\n請向智能賬戶地址轉入至少 0.005 BNB：\n${smartAccountAddress}\n\n然後重試轉賬。`))
        } else {
          alert(errorMessage || "Transaction failed")
        }
        
        setIsSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-background-primary text-text-primary p-4 pb-8 max-w-md mx-auto">
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
            <Button variant="ghost" size="icon" className="absolute right-1 top-1 h-10 w-10 text-text-secondary">
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
                <span className="text-text-secondary">{t('common.networkFee')}</span>
                <div className="text-right">
                    <span className="block font-medium">{FEES.SEND_RADRS} {GAS_TOKEN_SYMBOL}</span>
                    <span className="text-xs text-text-secondary">
                        ≈ ${(parseFloat(FEES.SEND_RADRS.toString()) * 0.145).toFixed(2)}
                    </span>
                </div>
            </div>
            <div className="flex justify-end flex-col items-end gap-1">
                    <Badge variant="warning" className="text-[10px]">{t('common.paidIn', { token: GAS_TOKEN_SYMBOL })}</Badge>
                    {!hasEnoughGas && (
                    <div className="flex items-center gap-1 text-status-error text-xs">
                        <AlertCircle className="w-3 h-3" />
                        <span>{t('common.insufficientBalance', { token: GAS_TOKEN_SYMBOL })}</span>
                    </div>
                    )}
            </div>
        </div>

        {/* 智能賬戶 BNB 餘額警告 */}
        {smartAccountAddress && (
          <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-xl space-y-2 order-3">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
              <div className="space-y-1 text-xs">
                <p className="text-blue-400 font-medium">智能賬戶 BNB 餘額</p>
                <p className="text-text-secondary">
                  當前: <span className={`font-mono ${!hasEnoughBnbInSmartAccount ? 'text-status-error font-semibold' : 'text-status-success'}`}>
                    {isCheckingBalance ? '檢查中...' : `${parseFloat(smartAccountBnbBalance || "0").toFixed(6)} BNB`}
                  </span>
                </p>
                <p className="text-text-secondary">需要: <span className="font-mono">≥ 0.001 BNB</span></p>
                {!hasEnoughBnbInSmartAccount && smartAccountAddress && (
                  <div className="mt-2 pt-2 border-t border-blue-500/20">
                    <p className="text-status-error font-medium mb-1">⚠️ 餘額不足！</p>
                    <p className="text-text-secondary">請向智能賬戶轉入至少 0.005 BNB：</p>
                    <p className="font-mono text-[10px] text-blue-400 break-all mt-1 bg-background-primary/50 p-2 rounded">{smartAccountAddress}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>

      <div className="fixed bottom-8 left-0 right-0 px-4 max-w-md mx-auto z-10 bg-background-primary pt-2 flex flex-col gap-4">
        <Button 
            className="w-full order-1" 
            size="lg" 
            onClick={handleNext}
            disabled={!address || !amount || !hasEnoughGas || !!addressError || !hasEnoughBnbInSmartAccount || isCheckingBalance}
        >
            {isCheckingBalance ? t('common.loading', '檢查中...') : t('wallet.send')} <ArrowRight className="ml-2 w-4 h-4" />
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
                    <span className="text-text-secondary text-sm">{t('common.networkFee')}</span>
                    <div className="text-right">
                        <span className="block text-sm font-medium">{FEES.SEND_RADRS} {GAS_TOKEN_SYMBOL}</span>
                        <Badge variant="warning" className="mt-1 text-[10px]">{t('common.paidIn', { token: GAS_TOKEN_SYMBOL })}</Badge>
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