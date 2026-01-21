import { useEffect } from "react"
import { WalletHeader } from "../components/wallet/WalletHeader"
import { AssetCard } from "../components/wallet/AssetCard"
import { ActionButtons } from "../components/wallet/ActionButtons"
import { AssetList } from "../components/wallet/AssetList"
import { useTranslation } from "react-i18next"
import { useAppStore } from "../store/useAppStore"

export default function Wallet() {
  const { t } = useTranslation()
  const { fetchRealBalances, currentWalletId, currentNetworkId } = useAppStore()

  useEffect(() => {
    // Immediate fetch
    fetchRealBalances()
    
    // Poll every 30 seconds
    const interval = setInterval(() => {
      fetchRealBalances()
    }, 30000)
    
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWalletId, currentNetworkId])

  return (
    <div className="p-4 pt-8 pb-24 max-w-md mx-auto">
      <WalletHeader />
      <AssetCard />
      <ActionButtons />
      <AssetList />
    </div>
  )
}
