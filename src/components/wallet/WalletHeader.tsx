import { useAppStore } from "../../store/useAppStore"
import { Select } from "../ui/select"
import { Wallet, User, Globe, Plus, Trash2, HelpCircle } from "lucide-react"
import { Logo } from "../Logo"
import { Settings } from "lucide-react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useState } from "react"
import { Button } from "../ui/button"
import { Sheet } from "../ui/sheet"
import { Input } from "../ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog"

import { CreateWalletWizard } from "./CreateWalletWizard"

export function WalletHeader() {
  const { t } = useTranslation()
  const { 
    wallets, networks, 
    currentWalletId, currentNetworkId,
    setWallet, setNetwork,
    createWallet, deleteWallet,
    getCurrentWallet
  } = useAppStore()

  const [isManageWalletOpen, setIsManageWalletOpen] = useState(false)
  const [isCreateWizardOpen, setIsCreateWizardOpen] = useState(false)
  
  const walletOptions = wallets.map(w => ({
    value: w.id,
    label: w.name,
    icon: <Wallet className="w-4 h-4" />
  }))

  const networkOptions = networks.map(n => ({
    value: n.id,
    label: n.name,
    icon: <Globe className="w-4 h-4" />
  }))

  return (
    <div className="space-y-4">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Logo className="w-8 h-8 text-accent" />
          <span className="font-bold text-lg">{t('common.splash.slogan').includes('雷达') ? '雷达钱包' : 'Radar Wallet'}</span>
        </div>
        <div className="flex items-center gap-1">
            <Link to="/settings" className="p-2 text-text-primary hover:text-accent transition-colors">
            <Settings className="w-5 h-5" />
            </Link>
        </div>
      </div>

      {/* Selectors */}
      <div className="flex gap-3">
        {/* Wallet Selector (Full Width) */}
        <div className="relative flex-1">
            <Select
              value={currentWalletId}
              onChange={setWallet}
              options={walletOptions}
              variant="default"
            />
            <div className="absolute -top-2 -right-2 z-10">
                 <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full bg-background-tertiary border border-divider shadow-sm hover:bg-accent hover:text-white transition-colors" onClick={() => setIsManageWalletOpen(true)}>
                     <Plus className="w-3 h-3" />
                 </Button>
            </div>
        </div>
      </div>
      
      <Select
        value={currentNetworkId}
        onChange={setNetwork}
        options={networkOptions}
        variant="default"
        className="w-full"
      />

      {/* Manage Wallet Sheet */}
      <Sheet isOpen={isManageWalletOpen} onClose={() => setIsManageWalletOpen(false)} title={t('wallet.manageWallets', 'Manage Wallets')}>
        <div className="space-y-6">
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-text-secondary">{t('wallet.yourWallets', 'Your Wallets')}</h3>
                </div>
                
                <div className="space-y-3">
                    {wallets.map(w => (
                        <div 
                            key={w.id} 
                            onClick={() => {
                                setWallet(w.id)
                                setIsManageWalletOpen(false)
                            }}
                            className={`flex flex-col p-4 rounded-xl border transition-all cursor-pointer ${currentWalletId === w.id ? 'bg-background-tertiary border-accent/50' : 'bg-background-secondary border-divider hover:border-text-secondary/50'}`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentWalletId === w.id ? 'bg-accent/10 text-accent' : 'bg-background-tertiary text-text-secondary'}`}>
                                        <Wallet className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className={`font-bold ${currentWalletId === w.id ? 'text-accent' : 'text-text-primary'}`}>{w.name}</p>
                                        <p className="text-xs text-text-secondary font-mono truncate max-w-[150px]">{w.address.substring(0, 6)}...{w.address.substring(w.address.length - 4)}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                     <p className="font-bold text-text-primary">{w.totalBalance || '$0.00'}</p>
                                </div>
                            </div>
                            
                            {wallets.length > 1 && (
                                <div className="flex justify-end mt-2 pt-2 border-t border-divider/30">
                                    <button 
                                        className="text-xs text-status-error hover:text-status-error/80 flex items-center gap-1 px-2 py-1"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            deleteWallet(w.id)
                                        }}
                                    >
                                        <Trash2 className="w-3 h-3" /> {t('common.delete', 'Delete')}
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="pt-4 border-t border-divider">
                <h3 className="text-sm font-medium text-text-secondary mb-3">{t('wallet.addNew', 'Add New')}</h3>
                <div className="grid grid-cols-2 gap-3">
                    <Button 
                        variant="outline" 
                        className="h-auto py-4 flex flex-col gap-2 border-dashed border-divider hover:border-accent hover:bg-accent/5"
                        onClick={() => setIsCreateWizardOpen(true)}
                    >
                        <Plus className="w-6 h-6 text-accent" />
                        <span className="text-xs font-medium">{t('wallet.createWallet', 'Create Wallet')}</span>
                    </Button>
                    <Button 
                        variant="outline" 
                        className="h-auto py-4 flex flex-col gap-2 border-dashed border-divider hover:border-accent hover:bg-accent/5"
                        onClick={() => {
                            // Using the same wizard for now but conceptually it's adding an account
                            // In a real app, this would be a separate "Import" flow
                            setIsCreateWizardOpen(true)
                        }}
                    >
                        <User className="w-6 h-6 text-text-secondary" />
                        <span className="text-xs font-medium">{t('wallet.addAccount', 'Add Account')}</span>
                    </Button>
                </div>
            </div>
        </div>
      </Sheet>

      {/* Create Wallet Wizard Sheet */}
      <Sheet isOpen={isCreateWizardOpen} onClose={() => setIsCreateWizardOpen(false)} title="">
          <CreateWalletWizard 
            onClose={() => setIsCreateWizardOpen(false)}
            onComplete={() => {
                setIsCreateWizardOpen(false)
                setIsManageWalletOpen(false)
            }}
          />
      </Sheet>
    </div>
  )
}
