import { useParams, useNavigate } from "react-router-dom"
import { useAppStore } from "../store/useAppStore"
import { useTranslation } from "react-i18next"
import { ArrowLeft, Copy, ArrowUpRight, ArrowDownLeft, ArrowRightLeft, Sparkles } from "lucide-react"
import { Button } from "../components/ui/button"
import { useState } from "react"
import { Badge } from "../components/ui/badge"
import { ReferralPromo } from "../components/ReferralPromo"

export default function AssetDetail() {
  const { symbol } = useParams<{ symbol: string }>()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const { getCurrentNetwork, getCurrentWallet } = useAppStore()
  const network = getCurrentNetwork()
  const wallet = getCurrentWallet()
  
  const [copied, setCopied] = useState(false)

  const asset = network?.assets.find(a => a.symbol === symbol)

  if (!asset || !wallet) {
      return (
          <div className="min-h-screen flex items-center justify-center text-text-secondary">
              Asset not found
          </div>
      )
  }

  const handleCopy = () => {
      navigator.clipboard.writeText(wallet.address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
  }

  const handleSend = () => navigate(`/send?asset=${asset.symbol}`)
  const handleReceive = () => navigate(`/receive?asset=${asset.symbol}`)
  const handleSwap = () => navigate(`/swap?from=${asset.symbol}`)

  return (
    <div className="min-h-screen bg-background-primary text-text-primary p-4 pb-8 max-w-md mx-auto flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pt-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-xl font-bold">{asset.name}</h1>
        <div className="w-10" />
      </div>

      {/* Balance Card */}
      <div className="flex flex-col items-center py-8 space-y-2">
          <div className="w-16 h-16 rounded-full bg-background-secondary border border-divider flex items-center justify-center text-2xl font-bold mb-2">
              {asset.symbol[0]}
          </div>
          <h2 className="text-4xl font-bold tabular-nums">{asset.balance} {asset.symbol}</h2>
          {asset.price && (
              <p className="text-text-secondary text-lg">
                  ≈ ${(parseFloat(asset.balance) * asset.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
          )}
          {/* {asset.isGas && (
              <Badge variant="warning" className="mt-2">Gas Token</Badge>
          )} */}
      </div>

      {/* Address */}
      <div className="bg-background-secondary p-4 rounded-xl border border-divider mb-8 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-transform" onClick={handleCopy}>
          <div className="overflow-hidden">
              <p className="text-xs text-text-secondary mb-1">{t('wallet.address', 'Wallet Address')}</p>
              <p className="font-mono text-sm truncate">{wallet.address}</p>
          </div>
          <div className="pl-4">
              {copied ? (
                  <span className="text-xs text-status-success font-medium">{t('common.copied', 'Copied')}</span>
              ) : (
                  <Copy className="w-4 h-4 text-text-secondary" />
              )}
          </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="flex flex-col items-center gap-2">
          <button 
            onClick={handleReceive}
            className="w-12 h-12 rounded-full bg-background-secondary border border-divider flex items-center justify-center text-accent hover:bg-accent/10 transition-colors"
          >
            <ArrowDownLeft className="w-5 h-5" />
          </button>
          <span className="text-xs font-medium">{t('wallet.receive')}</span>
        </div>

        <div className="flex flex-col items-center gap-2">
          <button 
            onClick={handleSend}
            className="w-14 h-14 -mt-1 rounded-full bg-accent text-background-primary flex items-center justify-center shadow-lg shadow-accent/20 hover:scale-105 transition-transform"
          >
            <ArrowUpRight className="w-6 h-6" />
          </button>
          <span className="text-xs font-medium">{t('wallet.send')}</span>
        </div>

        <div className="flex flex-col items-center gap-2">
          <button 
            onClick={handleSwap}
            className="w-12 h-12 rounded-full bg-background-secondary border border-divider flex items-center justify-center text-accent hover:bg-accent/10 transition-colors"
          >
            <ArrowRightLeft className="w-5 h-5" />
          </button>
          <span className="text-xs font-medium">{t('wallet.swap')}</span>
        </div>
      </div>

      {/* Contract Info */}
      {asset.contractAddress && (
           <div className="mb-8 p-4 rounded-xl bg-background-tertiary/50 border border-divider/50">
               <p className="text-xs text-text-secondary mb-1">{t('common.contract', 'Contract Address')}</p>
               <p className="font-mono text-xs break-all select-all text-text-muted">{asset.contractAddress}</p>
           </div>
      )}

      <div className="flex-1" />

      {/* Referral Promo Banner */}
      <div className="mt-auto">
          <ReferralPromo variant="card" />
      </div>
    </div>
  )
}