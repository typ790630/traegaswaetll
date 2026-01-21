import { Link, useLocation } from "react-router-dom"
import { Wallet, ArrowRightLeft, Activity, Settings, CreditCard } from "lucide-react"
import { cn } from "../lib/utils"
import { useTranslation } from "react-i18next"

export function BottomTabs() {
  const location = useLocation()
  const { t } = useTranslation()
  
  const tabs = [
    { name: t('wallet.title'), path: "/wallet", icon: Wallet },
    { name: t('swap.title'), path: "/swap", icon: ArrowRightLeft },
    { name: t('cards.title'), path: "/cards", icon: CreditCard },
    { name: t('activity.title'), path: "/activity", icon: Activity },
    { name: t('settings.title'), path: "/settings", icon: Settings },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background-secondary/95 backdrop-blur-md border-t border-divider safe-area-bottom z-40">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto">
        {tabs.map((tab) => {
          const isActive = location.pathname.startsWith(tab.path)
          const Icon = tab.icon
          
          return (
            <Link
              key={tab.name}
              to={tab.path}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                isActive ? "text-accent" : "text-text-secondary hover:text-text-primary"
              )}
            >
              <Icon className={cn("w-6 h-6", isActive && "stroke-[2.5px]")} />
              <span className="text-[10px] font-medium">{tab.name}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
