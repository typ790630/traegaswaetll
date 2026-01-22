import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, ClipboardPaste, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { useAppStore } from "../../store/useAppStore"
import { useTranslation } from "react-i18next"
import { validateMnemonic } from "@scure/bip39"
import { wordlist } from "@scure/bip39/wordlists/english.js"
import { Clipboard } from '@capacitor/clipboard'

export default function ImportWallet() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { importWallet } = useAppStore()

  const [words, setWords] = useState<string[]>(Array(12).fill(""))
  const [name, setName] = useState("Imported Wallet")
  const [error, setError] = useState("")
  const [isImporting, setIsImporting] = useState(false)

  const handleWordChange = (index: number, value: string) => {
    const newWords = [...words]
    newWords[index] = value.toLowerCase().trim()
    setWords(newWords)
    setError("")
  }

  const handlePaste = async () => {
    try {
      // Try Capacitor Clipboard first (Native)
      let text = ""
      try {
        const { value } = await Clipboard.read()
        text = value || ""
      } catch (nativeError) {
        console.warn('Native clipboard failed, trying Web API', nativeError)
        // Fallback to Web API
        text = await navigator.clipboard.readText()
      }

      if (!text) {
        setError(t('import.pasteError', 'Failed to read from clipboard or empty'))
        return
      }

      // Handle various delimiters (space, newline, comma)
      const pastedWords = text.trim().split(/[\s,\n]+/).filter(w => w.length > 0)
      
      if (pastedWords.length === 12) {
        setWords(pastedWords.map(w => w.toLowerCase()))
        setError("")
      } else {
        setError(t('import.invalidLength', 'Clipboard must contain exactly 12 words'))
      }
    } catch (e) {
      console.error("Paste failed", e)
      // Fallback prompt for user
      setError(t('import.pasteFailPrompt', 'Paste failed. Please paste manually or check permissions.'))
    }
  }

  const handleImport = async () => {
    setError("")
    
    // 1. Basic Validation
    if (words.some(w => !w)) {
      setError(t('import.fillAll', 'Please fill in all 12 words'))
      return
    }

    // 2. BIP39 Validation
    const mnemonic = words.join(" ")
    if (!validateMnemonic(mnemonic, wordlist)) {
      setError(t('import.invalidMnemonic', 'Invalid mnemonic phrase'))
      return
    }

    setIsImporting(true)
    
    // Small delay to show loading state
    setTimeout(async () => {
        // Need to clear navigation stack or handle auth flow
        const success = await importWallet(name, mnemonic)
        
        if (success) {
            // Force immediate balance refresh
            const { fetchRealBalances } = useAppStore.getState()
            
            // Trigger background fetch immediately without awaiting
            fetchRealBalances().catch(console.error)
            
            // Navigate immediately to Wallet page (Wallet page will handle price fetching)
            // Use replace: true to prevent going back to import page
            navigate("/wallet", { replace: true })
        } else {
            // Since duplicate wallets now return true (switching to them),
            // a false result means an actual error occurred during generation/import.
            setError(t('import.genericError', '导入失败，请检查网络连接或助记词是否正确'))
        }
        setIsImporting(false)
    }, 500)
  }

  return (
    <div className="min-h-screen bg-background-primary text-text-primary p-4 pb-8 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pt-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-xl font-bold">{t('import.title', 'Import Wallet')}</h1>
        <div className="w-10" />
      </div>

      <div className="space-y-6">
        
        {/* Wallet Name */}
        <div className="space-y-2">
            <label className="text-sm text-text-secondary ml-1">{t('import.walletName', 'Wallet Name')}</label>
            <Input 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Wallet"
                className="bg-background-secondary border-divider"
            />
        </div>

        {/* Mnemonic Input Grid */}
        <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
                <label className="text-sm text-text-secondary">{t('import.enterMnemonic', 'Enter 12-word Seed Phrase')}</label>
                <Button variant="ghost" size="sm" onClick={handlePaste} className="h-8 text-accent hover:text-accent/80 hover:bg-accent/10">
                    <ClipboardPaste className="w-3 h-3 mr-1.5" />
                    {t('common.paste', 'Paste')}
                </Button>
            </div>

            <div className="grid grid-cols-3 gap-3">
                {words.map((word, index) => (
                    <div key={index} className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-text-secondary select-none pointer-events-none">
                            {index + 1}.
                        </span>
                        <Input
                            value={word}
                            onChange={(e) => handleWordChange(index, e.target.value)}
                            className="pl-6 h-10 text-sm bg-background-secondary border-divider text-center pr-2"
                        />
                    </div>
                ))}
            </div>
        </div>

        {/* Error Message */}
        {error && (
            <div className="bg-status-error/10 p-3 rounded-lg flex items-center gap-2 text-status-error text-sm animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
            </div>
        )}

        {/* Info Box */}
        <div className="bg-background-tertiary p-4 rounded-xl text-xs text-text-secondary space-y-2 border border-divider/50">
            <p className="flex gap-2">
                <CheckCircle className="w-3 h-3 text-status-success shrink-0 mt-0.5" />
                {t('import.info1', 'Your mnemonic is encrypted and stored locally on your device.')}
            </p>
            <p className="flex gap-2">
                <CheckCircle className="w-3 h-3 text-status-success shrink-0 mt-0.5" />
                {t('import.info2', 'Trae Wallet cannot recover your funds if you lose your mnemonic.')}
            </p>
        </div>

        {/* Action Button */}
        <div className="pt-4">
            <Button 
                className="w-full" 
                size="lg" 
                variant="primary"
                onClick={handleImport}
                isLoading={isImporting}
                disabled={words.some(w => !w) || !name}
            >
                {t('import.button', 'Import Wallet')}
            </Button>
        </div>

      </div>
    </div>
  )
}
