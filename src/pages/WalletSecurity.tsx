import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Copy, Eye, ShieldCheck, Key } from "lucide-react"
import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import { useAppStore } from "../store/useAppStore"
import { useTranslation } from "react-i18next"
import { SecurityGate } from "../components/security/SecurityGate"
import { mnemonicToSeedSync } from '@scure/bip39'
import { HDKey } from '@scure/bip32'

export default function WalletSecurity() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { getCurrentWallet } = useAppStore()
  const wallet = getCurrentWallet()
  
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [activeTab, setActiveTab] = useState<'mnemonic' | 'privateKey'>('mnemonic')
  const [showSensitive, setShowSensitive] = useState(false)
  const [copied, setCopied] = useState(false)

  // ⚡ Pure EOA: 从助记词派生真实私钥
  // 🚨 如果没有助记词，显示错误而不是假的助记词
  const mnemonic = wallet?.mnemonic?.split(" ") || null
  
  // 使用 useMemo 缓存派生结果（避免重复计算）
  const privateKey = useMemo(() => {
    if (!wallet?.mnemonic) {
      console.warn('[WalletSecurity] ⚠️ No mnemonic found')
      return ""
    }
    
    try {
      // ⚡ 从助记词派生真实私钥
      const seed = mnemonicToSeedSync(wallet.mnemonic)
      const hdkey = HDKey.fromMasterSeed(seed)
      const path = `m/44'/60'/0'/0/0` // ETH 标准路径
      const derivedKey = hdkey.derive(path)
      
      // 浏览器兼容：使用 Array.from 代替 Buffer
      const privateKeyBytes = derivedKey.privateKey!
      const privateKeyHex = Array.from(privateKeyBytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
      
      const pk = `0x${privateKeyHex}`
      console.log('[WalletSecurity] ✅ Private key derived from mnemonic')
      return pk
    } catch (error) {
      console.error('[WalletSecurity] ❌ Failed to derive private key:', error)
      return ""
    }
  }, [wallet?.mnemonic])

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!isUnlocked) {
      return (
        <div className="min-h-screen bg-background-primary text-text-primary p-4">
            <div className="flex items-center mb-6 pt-4">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                    <ArrowLeft className="w-6 h-6" />
                </Button>
            </div>
            <SecurityGate onUnlock={() => setIsUnlocked(true)} />
        </div>
      )
  }

  return (
    <div className="min-h-screen bg-background-primary text-text-primary p-4 pb-8 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-6 pt-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-xl font-bold">{t('settings.securityCenter', 'Security Center')}</h1>
        <div className="w-10" />
      </div>

      <div className="space-y-6">
        {/* Custom Tabs */}
        <div className="flex p-1 bg-background-tertiary rounded-xl">
            <button 
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === 'mnemonic' ? 'bg-background-secondary shadow-sm text-text-primary' : 'text-text-secondary'}`}
                onClick={() => { setActiveTab('mnemonic'); setShowSensitive(false); }}
            >
                <ShieldCheck className="w-4 h-4" />
                {t('security.mnemonic', 'Seed Phrase')}
            </button>
            <button 
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === 'privateKey' ? 'bg-background-secondary shadow-sm text-text-primary' : 'text-text-secondary'}`}
                onClick={() => { setActiveTab('privateKey'); setShowSensitive(false); }}
            >
                <Key className="w-4 h-4" />
                {t('security.privateKey', 'Private Key')}
            </button>
        </div>

        {activeTab === 'mnemonic' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                {!mnemonic ? (
                    // 🚨 没有助记词的警告
                    <div className="space-y-4">
                        <div className="bg-status-error/10 p-6 rounded-xl flex flex-col gap-4 border-2 border-status-error/30">
                            <div className="flex items-center gap-3">
                                <ShieldCheck className="w-6 h-6 text-status-error shrink-0" />
                                <h3 className="text-lg font-bold text-status-error">
                                    {t('security.noMnemonic', '未找到助记词')}
                                </h3>
                            </div>
                            <div className="space-y-2 text-sm text-text-secondary">
                                <p>⚠️ 此钱包没有助记词，无法恢复！</p>
                                <p>可能的原因：</p>
                                <ul className="list-disc list-inside space-y-1 ml-2">
                                    <li>钱包数据来自旧版本</li>
                                    <li>使用了浏览器缓存的数据</li>
                                    <li>钱包创建时出错</li>
                                </ul>
                                <p className="font-bold text-status-error mt-3">
                                    🚨 强烈建议：创建新钱包或导入已有助记词！
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Button 
                                variant="primary" 
                                className="flex-1"
                                onClick={() => navigate('/settings/create-wallet')}
                            >
                                创建新钱包
                            </Button>
                            <Button 
                                variant="secondary" 
                                className="flex-1"
                                onClick={() => navigate('/settings/import-wallet')}
                            >
                                导入钱包
                            </Button>
                        </div>
                    </div>
                ) : (
                    // ✅ 正常显示助记词
                    <>
                        <div className="bg-status-warning/10 p-4 rounded-xl flex gap-3 border border-status-warning/20">
                            <ShieldCheck className="w-5 h-5 text-status-warning shrink-0" />
                            <p className="text-xs text-text-secondary leading-relaxed">
                                {t('security.mnemonicWarning', 'This Secret Recovery Phrase is the master key to your wallet. It can recover all accounts. Never share it with anyone.')}
                            </p>
                        </div>

                        <div className="relative group">
                            <div className={`grid grid-cols-3 gap-3 p-4 bg-background-tertiary rounded-xl border border-divider ${!showSensitive ? 'blur-md' : ''}`}>
                                {mnemonic.map((word, index) => (
                                    <div key={index} className="flex gap-2 items-center bg-background-primary/50 p-2 rounded-lg">
                                        <span className="text-xs text-text-secondary w-4">{index + 1}.</span>
                                        <span className="font-mono font-medium text-sm">{word}</span>
                                    </div>
                                ))}
                            </div>
                            
                            {!showSensitive && (
                                <div className="absolute inset-0 flex items-center justify-center z-10 cursor-pointer" onClick={() => setShowSensitive(true)}>
                                    <div className="bg-background-primary px-4 py-2 rounded-full shadow-lg border border-divider flex items-center gap-2">
                                        <Eye className="w-4 h-4" />
                                        <span className="text-sm font-bold">{t('security.tapToReveal', 'Tap to Reveal')}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {showSensitive && (
                            <Button variant="secondary" className="w-full" onClick={() => handleCopy(mnemonic.join(" "))}>
                                <Copy className="w-4 h-4 mr-2" />
                                {copied ? t('common.copied', 'Copied') : t('security.copyMnemonic', 'Copy Seed Phrase')}
                            </Button>
                        )}
                    </>
                )}
            </div>
        )}

        {activeTab === 'privateKey' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="bg-status-error/10 p-4 rounded-xl flex gap-3 border border-status-error/20">
                    <Key className="w-5 h-5 text-status-error shrink-0" />
                    <p className="text-xs text-text-secondary leading-relaxed">
                        {t('security.privateKeyWarning', { defaultValue: 'This Private Key controls ONLY the current account ({{name}}). Do not share it.', name: wallet?.name })}
                    </p>
                </div>

                <Card className="bg-background-tertiary border-divider">
                    <CardContent className="p-6">
                        <div className="relative">
                            <p className={`font-mono break-all text-text-primary text-lg ${!showSensitive ? 'blur-md select-none' : ''}`}>
                                {privateKey}
                            </p>
                            {!showSensitive && (
                                <div className="absolute inset-0 flex items-center justify-center z-10 cursor-pointer" onClick={() => setShowSensitive(true)}>
                                    <div className="bg-background-primary px-4 py-2 rounded-full shadow-lg border border-divider flex items-center gap-2">
                                        <Eye className="w-4 h-4" />
                                        <span className="text-sm font-bold">{t('security.tapToReveal', 'Tap to Reveal')}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {showSensitive && (
                    <Button variant="secondary" className="w-full" onClick={() => handleCopy(privateKey)}>
                        <Copy className="w-4 h-4 mr-2" />
                        {copied ? t('common.copied', 'Copied') : t('security.copyPrivateKey', 'Copy Private Key')}
                    </Button>
                )}
            </div>
        )}
      </div>
    </div>
  )
}
