import { useTranslation } from "react-i18next"
import { ArrowLeft, Globe, Check, Signal } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Button } from "../../components/ui/button"
import { useAppStore } from "../../store/useAppStore"
import { cn } from "../../lib/utils"

export default function NetworkSettings() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { networks, currentNetworkId, setNetwork, fetchRealBalances } = useAppStore()

  const handleNetworkSwitch = async (networkId: string) => {
    if (networkId === currentNetworkId) return

    const confirmed = window.confirm(t('settings.networkSwitchConfirm', 'Switch network? This will refresh your balance.'))
    if (!confirmed) return

    setNetwork(networkId)
    await fetchRealBalances()
  }

  return (
    <div className="min-h-screen bg-background-primary text-text-primary p-4 max-w-md mx-auto">
      <div className="flex items-center mb-6 pt-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-xl font-bold ml-2">{t('settings.network', 'Network')}</h1>
      </div>

      <div className="space-y-4">
        <p className="text-sm text-text-secondary px-1">{t('settings.networkDesc')}</p>
        
        <div className="space-y-3">
            {networks.map(network => (
                <div 
                    key={network.id}
                    onClick={() => handleNetworkSwitch(network.id)}
                    className={cn(
                        "flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer",
                        currentNetworkId === network.id 
                            ? "bg-accent/10 border-accent" 
                            : "bg-background-secondary border-divider hover:border-text-secondary/50"
                    )}
                >
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center",
                            currentNetworkId === network.id ? "bg-accent text-white" : "bg-background-tertiary text-text-secondary"
                        )}>
                            <Globe className="w-5 h-5" />
                        </div>
                        <div>
                            <p className={cn("font-bold", currentNetworkId === network.id ? "text-accent" : "text-text-primary")}>
                                {network.name}
                            </p>
                            <p className="text-xs text-text-secondary">Chain ID: {network.chainId}</p>
                        </div>
                    </div>
                    
                    {currentNetworkId === network.id && (
                        <div className="flex items-center gap-2 text-accent">
                            <span className="text-xs font-medium">{t('settings.connected')}</span>
                            <Signal className="w-4 h-4" />
                        </div>
                    )}
                </div>
            ))}
        </div>
      </div>
    </div>
  )
}
