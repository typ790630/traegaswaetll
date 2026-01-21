import { useState, useEffect } from "react"
import { ArrowUpRight, ArrowDownLeft, ArrowRightLeft, FileText, ExternalLink, RefreshCw } from "lucide-react"
import { Badge } from "../components/ui/badge"
import { cn } from "../lib/utils"
import { useTranslation } from "react-i18next"
import { useAppStore } from "../store/useAppStore"
import { ActivityService } from "../services/ActivityService"
import { ActivityItem } from "../types"


type Filter = "All" | "Wallet" | "Swap"

export default function Activity() {
  const { t } = useTranslation()
  const { getCurrentWallet, activities, setActivities } = useAppStore()
  const wallet = getCurrentWallet()
  
  const [filter, setFilter] = useState<Filter>("All")
  // Remove local activities state, use store
  const [isLoading, setIsLoading] = useState(false)

  const loadActivities = async () => {
    if (!wallet) return
    setIsLoading(true)
    try {
      const data = await ActivityService.getActivities(wallet.address)
      if (Array.isArray(data)) {
        // Merge with existing activities to prevent clearing local pending ones?
        // Actually ActivityService.getActivities already tries to merge.
        // For now, let's trust the service or just overwrite since we want chain data.
        // But to keep it "instant", we just update the store.
        setActivities(data)
      } else {
        console.error("Activity data is not an array:", data)
      }
    } catch (error) {
      console.error("Failed to load activities", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (wallet?.address) {
      loadActivities()
      
      const interval = setInterval(() => {
        loadActivities()
      }, 30000)

      return () => clearInterval(interval)
    }
  }, [wallet?.address])

  const openExplorer = (hash: string) => {
      if (!hash) return
      // Default to BSC Scan for now
      window.open(`https://bscscan.com/tx/${hash}`, '_blank')
  }

  if (!wallet) {
      return <div className="p-8 text-center text-text-secondary">Wallet not connected</div>
  }

  const filteredActivities = activities.filter(a => {
    if (filter === "All") return true
    if (filter === "Wallet") return a.type === "Send" || a.type === "Receive"
    if (filter === "Swap") return a.type === "Swap"
    return true
  })

  const getIcon = (type: string) => {
    switch (type) {
      case "Send": return <ArrowUpRight className="w-5 h-5 text-text-primary" />
      case "Receive": return <ArrowDownLeft className="w-5 h-5 text-accent" />
      case "Swap": return <ArrowRightLeft className="w-5 h-5 text-status-info" />
      default: return <FileText className="w-5 h-5 text-text-secondary" />
    }
  }

  const getTranslatedType = (type: string) => {
    switch (type) {
      case "Send": return t('wallet.send')
      case "Receive": return t('wallet.receive')
      case "Swap": return t('wallet.swap')
      default: return type
    }
  }

  const formatTime = (timestamp: number) => {
      // Mock "Today/Yesterday" logic or just simple date
      const date = new Date(timestamp)
      return date.toLocaleString()
  }

  return (
    <div className="p-4 pt-8 pb-24 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">{t('activity.title')}</h1>
          <button onClick={loadActivities} className={`p-2 rounded-full hover:bg-white/5 transition-all ${isLoading ? 'animate-spin' : ''}`}>
              <RefreshCw className="w-5 h-5 text-text-secondary" />
          </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {(["All", "Wallet", "Swap"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap",
              filter === f 
                ? "bg-accent text-background-primary" 
                : "bg-card text-text-secondary hover:text-text-primary"
            )}
          >
            {f === 'All' ? t('activity.all') : f === 'Wallet' ? t('activity.wallet') : t('wallet.swap')}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {filteredActivities.length === 0 && !isLoading && (
          <div className="text-center py-12 text-text-secondary">
            {t('activity.noActivity')}
          </div>
        )}
        
        {isLoading && filteredActivities.length === 0 && (
             <div className="text-center py-12 text-text-secondary animate-pulse">
                {t('common.loading', 'Loading...')}
            </div>
        )}

        {filteredActivities.map((activity) => (
          <div 
            key={activity.id}
            onClick={() => openExplorer(activity.hash)}
            className="flex items-center justify-between p-4 rounded-xl bg-card border border-divider/50 hover:border-accent/30 transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className={cn(
                "flex items-center justify-center w-10 h-10 rounded-full bg-background-secondary border border-divider",
                activity.type === "Receive" && "bg-accent/10 border-accent/20"
              )}>
                {getIcon(activity.type)}
              </div>
              
              <div className="flex flex-col">
                <span className="font-semibold text-text-primary">{getTranslatedType(activity.type)}</span>
                <span className="text-xs text-text-secondary">{activity.date}</span>
              </div>
            </div>

            <div className="flex flex-col items-end">
              <span className={cn(
                "font-medium tabular-nums",
                activity.type === 'Receive' ? "text-status-success" : "text-text-primary"
              )}>
                {activity.type === 'Send' ? '-' : activity.type === 'Receive' ? '+' : ''}
                {activity.amount || activity.asset}
              </span>
              <div className="flex items-center gap-1.5 mt-1">
                <Badge variant={activity.status === "Success" ? "success" : activity.status === "Pending" ? "warning" : "destructive"} className="text-[10px] h-4 px-1">
                  {activity.status === "Success" ? t('common.success') : activity.status}
                </Badge>
                {activity.status !== "Pending" && (
                    <ExternalLink className="w-3 h-3 text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
