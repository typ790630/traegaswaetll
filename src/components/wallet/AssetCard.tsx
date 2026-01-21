import { useAppStore } from "../../store/useAppStore"
import { Copy, QrCode } from "lucide-react"
import { Card, CardContent } from "../ui/card"
import { Button } from "../ui/button"
import { useState } from "react"
import { cn } from "../../lib/utils"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"

export function AssetCard() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { getCurrentWallet, getCurrentNetwork } = useAppStore()
  const wallet = getCurrentWallet()
  const network = getCurrentNetwork()
  const [copied, setCopied] = useState(false)

  // Calculate total balance (mock calculation)
  const totalBalance = network?.assets.reduce((acc, asset) => {
    return acc + (parseFloat(asset.balance) * (asset.price || 0))
  }, 0) || 0

  const formattedBalance = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(totalBalance)

  const handleCopy = () => {
    if (wallet?.address) {
      navigator.clipboard.writeText(wallet.address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <Card className="bg-card border-none shadow-lg mt-6">
      <CardContent className="p-6 space-y-4">
        <div className="space-y-1">
          <p className="text-sm text-text-secondary font-medium">{t('wallet.totalBalance')}</p>
          <h2 className="text-4xl font-bold text-accent tracking-tight tabular-nums">
            {formattedBalance}
          </h2>
        </div>

        <div className="flex items-center justify-between bg-background-primary/50 p-3 rounded-lg border border-divider/50">
          <div className="space-y-1 overflow-hidden flex-1">
            <p className="text-xs text-text-secondary">{t('wallet.account')} Address</p>
            <p className="text-sm font-mono text-text-primary truncate">
              {wallet?.address || t('common.loading')}
            </p>
          </div>
          <div className="flex items-center gap-1 ml-2 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8 hover:bg-background-tertiary", copied && "text-status-success")}
              onClick={handleCopy}
            >
              <Copy className="w-4 h-4" />
            </Button>
            <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 hover:bg-background-tertiary"
                onClick={() => navigate('/receive')}
            >
              <QrCode className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
