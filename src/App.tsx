import { useEffect, Suspense, lazy, useState } from "react"
import { priceService } from "./services/priceService"
import { useAppStore } from "./store/useAppStore"
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from "react-router-dom"
import { BottomTabs } from "./components/BottomTabs"
import { Loader2 } from "lucide-react"
import { SecurityGate } from "./components/security/SecurityGate"

// Lazy Load Pages
const Splash = lazy(() => import("./pages/Splash"))
const Wallet = lazy(() => import("./pages/Wallet"))
const Swap = lazy(() => import("./pages/Swap"))
const Activity = lazy(() => import("./pages/Activity"))
const Settings = lazy(() => import("./pages/Settings"))
const Receive = lazy(() => import("./pages/Receive"))
const Send = lazy(() => import("./pages/Send"))
const AssetDetail = lazy(() => import("./pages/AssetDetail"))
const WalletSecurity = lazy(() => import("./pages/WalletSecurity"))
const Cards = lazy(() => import("./pages/Cards"))
const Referral = lazy(() => import("./pages/Referral"))
const SecuritySettings = lazy(() => import("./pages/settings/Security"))
const NetworkSettings = lazy(() => import("./pages/settings/NetworkSettings"))
const Terms = lazy(() => import("./pages/settings/Terms"))
const Privacy = lazy(() => import("./pages/settings/Privacy"))

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-background-primary flex items-center justify-center text-accent">
      <Loader2 className="w-8 h-8 animate-spin" />
    </div>
  )
}

function AppLayout() {
  return (
    <div className="min-h-screen bg-background-primary text-text-primary pb-20">
      <Suspense fallback={<div className="p-4"><div className="h-32 bg-card/50 rounded-xl animate-pulse" /></div>}>
        <Outlet />
      </Suspense>
      <BottomTabs />
    </div>
  )
}

function App() {
  const { updateRealtimePrices, appLockEnabled, appPassword } = useAppStore()
  const [isUnlocked, setIsUnlocked] = useState(false)

  // 检查是否需要显示锁屏
  const shouldShowLock = appLockEnabled && appPassword && !isUnlocked
  
  // 初始化时检查是否已解锁（防止刷新后重新锁定）
  useEffect(() => {
    // 如果没有启用应用锁，自动标记为已解锁
    if (!appLockEnabled || !appPassword) {
      setIsUnlocked(true)
    }
  }, [appLockEnabled, appPassword])

  useEffect(() => {
      // Initial fetch
      const fetchAndSetPrices = async () => {
          const prices = await priceService.fetchPrices()
          if (Object.keys(prices).length > 0) {
              updateRealtimePrices(prices)
          }
      }
      fetchAndSetPrices()

      // Poll every 60 seconds
      const interval = setInterval(fetchAndSetPrices, 60000)
      return () => clearInterval(interval)
  }, [])

  // 监听页面可见性变化（切换应用时重新锁定）
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && appLockEnabled && appPassword) {
        // 应用进入后台，标记为需要重新解锁
        setTimeout(() => {
          if (document.hidden) {
            setIsUnlocked(false)
          }
        }, 5000) // 5秒后锁定
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [appLockEnabled, appPassword])

  // 如果应用已锁定，显示解锁界面
  if (shouldShowLock) {
    return (
      <div className="min-h-screen bg-background-primary text-text-primary flex items-center justify-center">
        <SecurityGate onUnlock={() => setIsUnlocked(true)} />
      </div>
    )
  }

  return (
    <Router>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/" element={<Splash />} />
          
          {/* Pages with Bottom Tabs */}
          <Route element={<AppLayout />}>
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/swap" element={<Swap />} />
            <Route path="/cards" element={<Cards />} />
            <Route path="/activity" element={<Activity />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          
          {/* Pages without Bottom Tabs */}
          <Route path="/asset/:symbol" element={<AssetDetail />} />
          <Route path="/receive" element={<Receive />} />
          <Route path="/send" element={<Send />} />
          <Route path="/settings/security" element={<WalletSecurity />} />
          <Route path="/settings/app-security" element={<SecuritySettings />} />
          <Route path="/settings/network" element={<NetworkSettings />} />
          <Route path="/settings/terms" element={<Terms />} />
          <Route path="/settings/privacy" element={<Privacy />} />
          <Route path="/referral" element={<Referral />} />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Router>
  )
}

export default App
