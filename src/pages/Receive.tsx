import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { ArrowLeft, Copy, Share2 } from "lucide-react"
import QRCode from "react-qr-code"
import { useAppStore } from "../store/useAppStore"
import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import { Select } from "../components/ui/select"
import { cn } from "../lib/utils"
import { useTranslation } from "react-i18next"
import { Logo } from "../components/Logo"
import { publicClient } from "../services/radrsService"
import { ERC20_ABI } from "../config/radrs"
import { formatEther } from "viem"

export default function Receive() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const assetParam = searchParams.get('asset')
  
  const { getCurrentWallet, getCurrentNetwork, fetchRealBalances } = useAppStore()
  const wallet = getCurrentWallet()
  const network = getCurrentNetwork()
  const [selectedAsset, setSelectedAsset] = useState(assetParam || network?.assets[0].symbol || "")
  const [copied, setCopied] = useState(false)
  const [receivedAmount, setReceivedAmount] = useState<string | null>(null)

  useEffect(() => {
      if (assetParam) setSelectedAsset(assetParam)
  }, [assetParam])

  // Listen for real-time Transfer events
  useEffect(() => {
    if (!wallet?.address || !selectedAsset || !network) return

    const asset = network.assets.find(a => a.symbol === selectedAsset)
    if (!asset?.contractAddress) return

    const unwatch = publicClient.watchContractEvent({
      address: asset.contractAddress as `0x${string}`,
      abi: ERC20_ABI,
      eventName: 'Transfer',
      args: { to: wallet.address as `0x${string}` },
      onLogs: (logs) => {
        try {
            const amount = formatEther(logs[0].args.value || 0n)
            setReceivedAmount(amount)
            fetchRealBalances() // Refresh balances immediately
            
            // Clear notification after 5 seconds
            setTimeout(() => setReceivedAmount(null), 5000)
        } catch (e) {
            console.error("Error processing transfer log", e)
        }
      }
    })

    return () => unwatch()
  }, [wallet?.address, selectedAsset, network, fetchRealBalances])

  const assetOptions = network?.assets.map(a => ({
    value: a.symbol,
    label: a.name,
    icon: <div className="flex items-center justify-center w-5 h-5 rounded-full bg-background-primary text-[10px] font-bold border border-divider">{a.symbol[0]}</div>
  })) || []

  const handleCopy = () => {
    if (wallet?.address) {
      navigator.clipboard.writeText(wallet.address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="min-h-screen bg-background-primary text-text-primary p-4 pb-20 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pt-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-xl font-bold">{t('wallet.receive')}</h1>
        <div className="w-10" /> {/* Spacer */}
      </div>

      {/* Received Notification */}
      {receivedAmount && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-status-success text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-bounce flex items-center gap-2">
           <span className="text-xl">✅</span>
           <span className="font-medium">{t('common.received', 'Received')} {receivedAmount} {selectedAsset}</span>
        </div>
      )}

      <div className="space-y-6">
        {/* Token Selector */}
        <div className="space-y-2">
          <label className="text-sm text-text-secondary ml-1">{t('send.selectAsset')}</label>
          <Select
            value={selectedAsset}
            onChange={setSelectedAsset}
            options={assetOptions}
          />
        </div>

        {/* QR Code Card */}
        <Card className="bg-white text-black border-none overflow-hidden">
          <CardContent className="flex flex-col items-center p-8 space-y-6">
            <div className="relative">
               {/* Real QR Code */}
              <div className="p-2">
                 <QRCode
                    value={wallet?.address || "0x00"}
                    size={200}
                    level="Q"
                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                    viewBox={`0 0 256 256`}
                 />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Center Logo Overlay */}
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-white">
                   <Logo className="w-8 h-8" variant="dark" />
                </div>
              </div>
            </div>
            
            <div className="text-center space-y-1">
              <p className="text-sm font-medium opacity-60">{t('receive.scanQr')}</p>
            </div>
          </CardContent>
        </Card>

        {/* Address Display */}
        <div className="space-y-3">
            <p className="text-sm text-text-secondary ml-1">{t('common.paidIn', { token: network?.name })} Address</p>
            <div className="p-4 bg-background-secondary rounded-xl border border-divider break-all font-mono text-center text-sm">
                {wallet?.address}
            </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
            <Button 
                variant="primary" 
                className={cn("w-full", copied && "bg-status-success text-white hover:bg-status-success")}
                onClick={handleCopy}
            >
                <Copy className="w-4 h-4 mr-2" />
                {copied ? t('common.copied') : t('common.copy')}
            </Button>
            <Button variant="secondary" className="w-full">
                <Share2 className="w-4 h-4 mr-2" />
                {t('receive.share')}
            </Button>
        </div>

        <div className="bg-status-info/10 p-4 rounded-xl flex items-start gap-3">
             <div className="mt-1 w-1.5 h-1.5 rounded-full bg-status-info shrink-0" />
             <p className="text-xs text-text-secondary leading-relaxed">
                 Send only <span className="text-status-info font-medium">{network?.name} ({network?.symbol})</span> and related tokens to this address. Sending any other coins may result in permanent loss.
             </p>
        </div>
      </div>
    </div>
  )
}
