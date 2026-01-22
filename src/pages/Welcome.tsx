import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Logo } from "../components/Logo"
import { Button } from "../components/ui/button"
import { CreateWalletWizard } from "../components/wallet/CreateWalletWizard"
import { SecurityGate } from "../components/security/SecurityGate"
import { motion, AnimatePresence } from "framer-motion"
import { useTranslation } from "react-i18next"
import { useAppStore } from "../store/useAppStore"

export default function Welcome() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { appPassword, setAppPassword, setAppLockEnabled } = useAppStore()
  
  // Default to null, letting user choose
  const [wizardMode, setWizardMode] = useState<'create' | 'import' | null>(null)

  const handleComplete = () => {
    // Navigate to main wallet page after creation
    navigate('/wallet', { replace: true })
  }

  const handlePasswordSetup = (password: string) => {
      setAppPassword(password)
      setAppLockEnabled(true)
      // Password set, component will re-render
  }

  // If no password set, force SecurityGate in setup mode
  if (!appPassword) {
      return (
          <div className="min-h-screen bg-background-primary flex items-center justify-center p-4">
              <SecurityGate 
                  mode="setup" 
                  onSetup={handlePasswordSetup}
                  onUnlock={() => {}} // Not used in setup mode
              />
          </div>
      )
  }

  return (
    <div className="min-h-screen bg-background-primary flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-accent/5 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/5 rounded-full blur-[100px]" />
      </div>

      <div className="z-10 w-full max-w-md flex flex-col h-full justify-center">
        <AnimatePresence mode="wait">
          {!wizardMode ? (
            <motion.div 
                key="intro"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center text-center space-y-12"
            >
              <div className="space-y-6 flex flex-col items-center">
                <Logo className="w-24 h-24 text-accent" />
                <div>
                    <h1 className="text-4xl font-bold text-text-primary mb-2">{t('welcome.title', 'Radar Wallet')}</h1>
                    <p className="text-text-secondary text-lg">{t('welcome.subtitle', 'Your Gateway to Web3')}</p>
                </div>
              </div>

              <div className="w-full space-y-4">
                <Button 
                    className="w-full h-14 text-lg font-bold shadow-lg shadow-accent/20" 
                    onClick={() => setWizardMode('create')}
                >
                  {t('welcome.create', 'Create New Wallet')}
                </Button>
                <Button 
                    variant="outline" 
                    className="w-full h-14 text-lg border-divider hover:bg-background-tertiary"
                    onClick={() => navigate('/settings/import-wallet')} 
                >
                  {t('welcome.import', 'Import Wallet')}
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
                key="wizard"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full bg-background-secondary p-6 rounded-2xl border border-divider shadow-xl h-[600px] flex flex-col"
            >
                <div className="mb-4">
                    <Button variant="ghost" size="sm" onClick={() => setWizardMode(null)} className="-ml-2 text-text-secondary">
                        ← Back
                    </Button>
                </div>
                <div className="flex-1 overflow-hidden">
                    <CreateWalletWizard 
                        onClose={() => setWizardMode(null)} 
                        onComplete={handleComplete} 
                    />
                </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
