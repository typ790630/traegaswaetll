import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Lock, Fingerprint } from "lucide-react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Card, CardContent } from "../ui/card"
import { useAppStore } from "../../store/useAppStore"
import { motion, AnimatePresence } from "framer-motion"

interface SecurityGateProps {
  onUnlock: () => void
  title?: string
  description?: string
}

export function SecurityGate({ onUnlock, title, description }: SecurityGateProps) {
  const { t } = useTranslation()
  const { verifyPassword, biometricsEnabled } = useAppStore()
  const [password, setPassword] = useState("")
  const [error, setError] = useState(false)

  const handleUnlock = () => {
    if (verifyPassword(password)) {
      onUnlock()
      setPassword("")
    } else {
      setError(true)
      setPassword("")
      setTimeout(() => setError(false), 500)
    }
  }

  const handleBiometricUnlock = () => {
    // TODO: 在生产环境中，这里应该调用原生生物识别 API
    // 例如：window.ReactNativeWebView?.postMessage({ type: 'biometric' })
    // 这里为了演示，我们模拟成功
    setTimeout(() => {
      alert(t('security.biometricSuccess') || '生物识别验证成功！\n（这是模拟功能）')
      onUnlock()
    }, 500)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleUnlock()
    }
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-6 text-center">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-20 h-20 rounded-full bg-background-tertiary flex items-center justify-center text-accent"
      >
        <Lock className="w-10 h-10" />
      </motion.div>
      
      <div className="space-y-2 max-w-xs">
        <h2 className="text-2xl font-bold">{title || t('security.enterPassword') || '输入密码'}</h2>
        <p className="text-text-secondary">{description || t('security.passwordDesc') || '请输入密码以解锁'}</p>
      </div>
      
      <div className="w-full max-w-xs space-y-4">
        <motion.div 
          animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.4 }}
        >
          <Input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t('security.passwordPlaceholder') || '请输入密码'} 
            className={`text-center text-lg tracking-widest ${error ? 'border-status-error focus-visible:ring-status-error' : ''}`}
            autoFocus
          />
        </motion.div>
        
        <AnimatePresence>
          {error && (
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-status-error text-sm"
            >
              {t('security.wrongPassword') || '密码错误'}
            </motion.p>
          )}
        </AnimatePresence>

        <Button className="w-full h-12" onClick={handleUnlock}>
          {t('common.unlock') || '解锁'}
        </Button>

        {/* 生物识别按钮 */}
        {biometricsEnabled && (
          <Button 
            variant="outline" 
            className="w-full h-12 gap-2 border-divider" 
            onClick={handleBiometricUnlock}
          >
            <Fingerprint className="w-5 h-5" />
            {t('security.useBiometrics') || '使用生物识别'}
          </Button>
        )}
      </div>
    </div>
  )
}
