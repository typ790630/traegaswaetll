import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Shield, ArrowRight, Check, AlertTriangle, Eye, EyeOff, Copy } from "lucide-react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { useAppStore } from "../../store/useAppStore"
import { motion, AnimatePresence } from "framer-motion"

interface CreateWalletWizardProps {
  onClose: () => void
  onComplete: () => void
}

export function CreateWalletWizard({ onClose, onComplete }: CreateWalletWizardProps) {
  const { t } = useTranslation()
  const { createWallet, wallets } = useAppStore()
  
  const [step, setStep] = useState<'name' | 'warning' | 'mnemonic' | 'verify' | 'done'>('name')
  const [walletName, setWalletName] = useState(`Wallet ${wallets.length + 1}`)
  const [mnemonic, setMnemonic] = useState<string[]>([])
  const [shuffledMnemonic, setShuffledMnemonic] = useState<string[]>([])
  const [selectedWords, setSelectedWords] = useState<string[]>([])
  const [isCopied, setIsCopied] = useState(false)
  const [showMnemonic, setShowMnemonic] = useState(false)

  // Mock Mnemonic Generation (Consistent with Store logic)
  const generateMnemonic = () => {
    // In real app, this comes from the newly created wallet logic or a library
    // For wizard, we generate one to show, then pass it (or let store handle it)
    // Here we simulate the one that WILL be created
    return "abandon ability able about above absent absorb abstract absurd abuse access accident".split(" ")
  }

  useEffect(() => {
    if (step === 'mnemonic') {
        const words = generateMnemonic()
        setMnemonic(words)
        // Shuffle for verification step
        setShuffledMnemonic([...words].sort(() => Math.random() - 0.5))
    }
  }, [step])

  const handleNameSubmit = () => {
    if (walletName.trim()) setStep('warning')
  }

  const handleCreate = () => {
    // Finalize creation
    createWallet(walletName)
    setStep('done')
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(mnemonic.join(" "))
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  const toggleWord = (word: string) => {
    if (selectedWords.includes(word)) {
        setSelectedWords(selectedWords.filter(w => w !== word))
    } else {
        setSelectedWords([...selectedWords, word])
    }
  }

  const verifyMnemonic = () => {
    // Simple verification: check if selected words match original order
    // For UX, we might just check if all words are selected or matching first 3
    // Let's do a loose check for demo: just need to select 3 correct words in order or similar
    // Or simpler: Just "I have backed it up" checkbox for 'warning' step, 
    // and here we simulate a "Verify" by selecting the words in order.
    
    if (selectedWords.join(" ") === mnemonic.join(" ")) {
        handleCreate()
    } else {
        // Error or shake
        alert("Incorrect order! Please try again.")
        setSelectedWords([])
    }
  }

  // --- Step Components ---

  const StepName = () => (
    <div className="space-y-6">
        <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold">{t('wallet.create.nameTitle', 'Name Your Wallet')}</h2>
            <p className="text-text-secondary">{t('wallet.create.nameDesc', 'Give your new wallet a nickname to recognize it easily.')}</p>
        </div>
        <Input 
            value={walletName} 
            onChange={(e) => setWalletName(e.target.value)} 
            placeholder="Wallet Name" 
            className="h-14 text-lg"
            autoFocus
        />
        <Button className="w-full h-12 text-lg" onClick={handleNameSubmit} disabled={!walletName.trim()}>
            {t('common.next', 'Next')}
        </Button>
    </div>
  )

  const StepWarning = () => (
    <div className="space-y-6">
         <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-status-warning/10 flex items-center justify-center text-status-warning">
                <Shield className="w-10 h-10" />
            </div>
         </div>
         <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold">{t('wallet.create.secureTitle', 'Secure Your Wallet')}</h2>
            <p className="text-text-secondary">{t('wallet.create.secureDesc', 'Don\'t risk losing your funds. protect your wallet by saving your Secret Recovery Phrase in a place you trust.')}</p>
        </div>
        <div className="bg-background-tertiary p-4 rounded-xl space-y-3">
            <div className="flex gap-3">
                <AlertTriangle className="w-5 h-5 text-status-error shrink-0" />
                <p className="text-sm text-text-secondary">If you lose your secret phrase, your funds will be lost forever.</p>
            </div>
            <div className="flex gap-3">
                <Check className="w-5 h-5 text-status-success shrink-0" />
                <p className="text-sm text-text-secondary">Write it down and store it in a secure offline location.</p>
            </div>
        </div>
        <Button className="w-full h-12 text-lg" onClick={() => setStep('mnemonic')}>
            {t('common.iUnderstand', 'I Understand')}
        </Button>
    </div>
  )

  const StepMnemonic = () => (
    <div className="space-y-6">
        <div className="text-center space-y-2">
            <h2 className="text-xl font-bold">{t('wallet.create.backupTitle', 'Write Down Your Seed Phrase')}</h2>
            <p className="text-sm text-text-secondary">{t('wallet.create.backupDesc', 'This is your Secret Recovery Phrase. Write it down on a paper and keep it in a safe place.')}</p>
        </div>

        <div className="relative group">
            <div className={`grid grid-cols-3 gap-3 p-4 bg-background-tertiary rounded-xl border border-divider ${!showMnemonic ? 'blur-sm select-none' : ''}`}>
                {mnemonic.map((word, index) => (
                    <div key={index} className="flex gap-2 items-center bg-background-primary/50 p-2 rounded-lg">
                        <span className="text-xs text-text-secondary w-4">{index + 1}.</span>
                        <span className="font-mono font-medium">{word}</span>
                    </div>
                ))}
            </div>
            
            {!showMnemonic && (
                <div className="absolute inset-0 flex items-center justify-center z-10 cursor-pointer" onClick={() => setShowMnemonic(true)}>
                    <div className="bg-background-primary px-4 py-2 rounded-full shadow-lg border border-divider flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        <span className="text-sm font-bold">Tap to Reveal</span>
                    </div>
                </div>
            )}
        </div>

        <div className="flex gap-3">
             <Button variant="outline" className="flex-1" onClick={handleCopy} disabled={!showMnemonic}>
                <Copy className="w-4 h-4 mr-2" />
                {isCopied ? 'Copied' : 'Copy'}
            </Button>
             <Button className="flex-1" onClick={() => setStep('verify')} disabled={!showMnemonic}>
                {t('common.next', 'Next')}
            </Button>
        </div>
    </div>
  )

  const StepVerify = () => (
    <div className="space-y-6">
        <div className="text-center space-y-2">
            <h2 className="text-xl font-bold">{t('wallet.create.verifyTitle', 'Verify Seed Phrase')}</h2>
            <p className="text-sm text-text-secondary">{t('wallet.create.verifyDesc', 'Tap the words in the correct order to verify your Secret Recovery Phrase.')}</p>
        </div>

        {/* Selection Area */}
        <div className="min-h-[120px] p-4 bg-background-tertiary rounded-xl border border-divider flex flex-wrap gap-2 content-start">
             {selectedWords.map((word, index) => (
                <div key={index} className="px-3 py-1.5 bg-accent text-white rounded-lg text-sm font-medium animate-in zoom-in cursor-pointer" onClick={() => toggleWord(word)}>
                    {word}
                </div>
            ))}
        </div>

        {/* Options */}
        <div className="grid grid-cols-3 gap-2">
            {shuffledMnemonic.map((word, index) => (
                <button 
                    key={index} 
                    className={`p-2 rounded-lg text-sm font-medium border border-divider transition-all ${selectedWords.includes(word) ? 'bg-background-tertiary opacity-20 pointer-events-none' : 'bg-background-secondary hover:border-accent'}`}
                    onClick={() => toggleWord(word)}
                >
                    {word}
                </button>
            ))}
        </div>

        <Button className="w-full h-12" onClick={verifyMnemonic} disabled={selectedWords.length !== mnemonic.length}>
            {t('common.verify', 'Verify')}
        </Button>
    </div>
  )

  const StepDone = () => (
     <div className="space-y-8 py-8 text-center">
        <div className="flex justify-center">
            <div className="w-24 h-24 rounded-full bg-status-success/10 flex items-center justify-center text-status-success animate-in zoom-in duration-300">
                <Check className="w-12 h-12" />
            </div>
        </div>
        <div className="space-y-2">
            <h2 className="text-3xl font-bold text-status-success">{t('wallet.create.successTitle', 'All Done!')}</h2>
            <p className="text-text-secondary">{t('wallet.create.successDesc', 'Your wallet has been created and secured.')}</p>
        </div>
        <Button className="w-full h-14 text-lg" onClick={onComplete}>
            {t('common.getStarted', 'Get Started')}
        </Button>
    </div>
  )

  return (
    <div className="h-full flex flex-col justify-between">
        <div className="flex-1 overflow-y-auto py-2">
            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                >
                    {step === 'name' && <StepName />}
                    {step === 'warning' && <StepWarning />}
                    {step === 'mnemonic' && <StepMnemonic />}
                    {step === 'verify' && <StepVerify />}
                    {step === 'done' && <StepDone />}
                </motion.div>
            </AnimatePresence>
        </div>
        
        {step !== 'done' && (
             <div className="pt-4 mt-auto border-t border-divider flex justify-center">
                 <div className="flex gap-2">
                     {['name', 'warning', 'mnemonic', 'verify'].map((s, i) => (
                         <div key={s} className={`w-2 h-2 rounded-full transition-colors ${['name', 'warning', 'mnemonic', 'verify'].indexOf(step) >= i ? 'bg-accent' : 'bg-divider'}`} />
                     ))}
                 </div>
             </div>
        )}
    </div>
  )
}