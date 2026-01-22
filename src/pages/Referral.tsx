import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { ArrowLeft, Copy, Users, Gift, Share2, CheckCircle, AlertCircle, Coins, Flame } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Card, CardContent } from "../components/ui/card"
import { useAppStore } from "../store/useAppStore"
import { ReferralService } from "../services/ReferralService" // Import the new service
import { GAS_TOKEN_SYMBOL } from "../config/fees"
import { Badge } from "../components/ui/badge"

export default function Referral() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { getCurrentWallet, getCurrentNetwork, addActivity, referral, setReferralData, updateAssetBalance, getPrivateKey: getStorePrivateKey } = useAppStore()
  const wallet = getCurrentWallet()
  const network = getCurrentNetwork()

  // Use local state for service data to ensure reactivity from "backend"
  const [serviceData, setServiceData] = useState(referral)
  
  // Data State (Merging Store with potentially fresher Service data)
  const { referrer: myReferrer, inviteCount, totalRewards, isClaimed: isRewardClaimed, invitees, totalCommissions } = serviceData

  // UI State
  const [inviteCode, setInviteCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isBinding, setIsBinding] = useState(false)
  const [isClaiming, setIsClaiming] = useState(false)

  // Derived State
  const radrsAsset = network?.assets.find(a => a.symbol === GAS_TOKEN_SYMBOL)
  const radrsBalance = parseFloat(radrsAsset?.balance || "0")
  const hasReferrer = myReferrer && myReferrer !== "0x0000000000000000000000000000000000000000"
  const isSelf = inviteCode.toLowerCase() === wallet?.address.toLowerCase()
  const isValidAddress = inviteCode.startsWith("0x") && inviteCode.length === 42

  useEffect(() => {
    if (wallet?.address) {
      loadReferralData()
    }
  }, [wallet?.address])

  const loadReferralData = async () => {
    if (!wallet) return
    setIsLoading(true)
    try {
      // Fetch latest data from Service (Paymaster Backend)
      const data = await ReferralService.getData(wallet.address)
      
      // Update local state
      setServiceData({
          referrer: data.referrer || "",
          inviteCount: data.inviteCount,
          totalRewards: data.totalRewards,
          totalCommissions: data.totalCommissions,
          invitees: data.invitees,
          isClaimed: data.isRewardClaimed
      })
      
      // Sync with Global Store (Optional, but good for persistence)
      setReferralData({
          referrer: data.referrer || "",
          inviteCount: data.inviteCount,
          totalRewards: data.totalRewards,
          totalCommissions: data.totalCommissions,
          invitees: data.invitees,
          isClaimed: data.isRewardClaimed
      })
    } catch (error) {
      console.error("Error loading referral data", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getPrivateKey = () => {
      if (wallet?.id) {
          return getStorePrivateKey(wallet.id)
      }
      return ""
  }

  const handleBind = async () => {
    if (!inviteCode || !wallet || !isValidAddress || isSelf) return
    setIsBinding(true)
    
    try {
        const pk = getPrivateKey()
        if (!pk) throw new Error("No private key found")

        // Call Service to Bind (Paymaster Transaction)
        const result = await ReferralService.bindReferrer(pk, inviteCode)
        
        if (result.success) {
             // Refresh Data
             await loadReferralData()
             
             addActivity({
                type: "Contract",
                asset: "Referral",
                amount: "Bind",
                status: "Success",
                hash: result.txHash || `0x${Math.random().toString(16).substr(2, 16)}`,
                timestamp: Date.now()
            })
        } else {
            alert(result.error || "Bind failed")
        }
    } catch (e: any) {
        console.error(e)
        alert(e.message || "Transaction failed")
    } finally {
        setIsBinding(false)
    }
  }

  const handleClaim = async () => {
    if (radrsBalance < 200) return
    setIsClaiming(true)
    
    try {
        const pk = getPrivateKey()
        if (!pk) throw new Error("No private key found")

        // Call Service to Claim (Paymaster Transaction)
        const result = await ReferralService.claimReward(pk)
        
        if (result.success) {
            // Refresh Data
            await loadReferralData()
            
            // Update Balance in Store (Since service updated "chain" balance)
            // Note: In real world, we would wait for indexer, but here we optimistically update or re-fetch
            if (network) {
                 // Force re-fetch real balances instead of manually adding
                 // But for immediate UI feedback we can add it
                 updateAssetBalance(network.id, GAS_TOKEN_SYMBOL, "5", 'add')
            }
    
            addActivity({
                type: "Receive",
                asset: "RADRS",
                amount: "+5.00",
                status: "Success",
                hash: result.txHash || `0x${Math.random().toString(16).substr(2, 16)}`,
                timestamp: Date.now()
            })
        } else {
            alert(result.error || "Claim failed")
        }
    } catch (e: any) {
        console.error(e)
        alert(e.message || "Transaction failed")
    } finally {
        setIsClaiming(false)
    }
  }

  const copyAddress = () => {
      if (wallet?.address) {
          navigator.clipboard.writeText(wallet.address)
          // Toast or feedback could go here
      }
  }

  const formatAddress = (addr: string) => `${addr.substring(0, 6)}...${addr.substring(38)}`

  return (
    <div className="min-h-screen bg-background-primary text-text-primary p-4 pb-24 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pt-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-xl font-bold">{t('referral.title', 'Referral System')}</h1>
        <div className="w-10" />
      </div>

      <div className="space-y-6">
        
        {/* Module 1: Referral Dashboard */}
        <section className="space-y-3">
            <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider ml-1">{t('referral.dashboard', 'Dashboard')}</h2>
            
            {/* Earnings Card */}
            <Card className="bg-gradient-to-br from-background-secondary to-background-tertiary border-divider">
                <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <span className="text-text-secondary text-sm">{t('referral.totalEarnings', 'Total Earnings')}</span>
                            <div className="text-3xl font-bold mt-1 text-accent">
                                {(parseFloat(totalRewards) + parseFloat(totalCommissions)).toFixed(2)} <span className="text-sm text-text-primary">RADRS</span>
                            </div>
                        </div>
                        <Coins className="w-8 h-8 text-accent/50" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-divider/50">
                        <div>
                            <span className="text-xs text-text-secondary block mb-1">{t('referral.bindingBonus', 'Binding Bonus')}</span>
                            <span className="font-mono font-medium">{parseFloat(totalRewards).toFixed(2)}</span>
                        </div>
                        <div>
                            <span className="text-xs text-text-secondary block mb-1">{t('referral.gasCommission', 'Gas Commission')}</span>
                            <span className="font-mono font-medium flex items-center gap-1">
                                {parseFloat(totalCommissions).toFixed(4)} <Flame className="w-3 h-3 text-status-warning" />
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Invite Stats */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-background-secondary p-4 rounded-xl border border-divider">
                    <span className="text-xs text-text-secondary block mb-1">{t('referral.invitedUsers', 'Invited Users')}</span>
                    <span className="text-xl font-bold">{inviteCount}</span>
                </div>
                <div className="bg-background-secondary p-4 rounded-xl border border-divider">
                     <span className="text-xs text-text-secondary block mb-1">{t('referral.activeUsers', 'Active Users')}</span>
                     <span className="text-xl font-bold">{invitees.length}</span>
                </div>
            </div>

            {/* Invitees List */}
            {invitees.length > 0 && (
                <div className="bg-background-secondary rounded-xl border border-divider overflow-hidden">
                    <div className="p-3 border-b border-divider/50 text-xs font-semibold text-text-secondary">
                        {t('referral.recentInvites', 'Recent Invites')}
                    </div>
                    <div className="max-h-[200px] overflow-y-auto">
                        {invitees.map((invitee, i) => (
                            <div key={i} className="flex justify-between items-center p-3 border-b border-divider/50 last:border-0 text-sm">
                                <span className="font-mono">{formatAddress(invitee.wallet)}</span>
                                <span className="text-text-secondary text-xs">
                                    {new Date(invitee.bindTime * 1000).toLocaleDateString()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </section>

        {/* Module 2: Bind Referrer */}
        {!hasReferrer && (
            <section className="space-y-3">
                <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider ml-1">{t('referral.bindReferrer', 'Bind Referrer')}</h2>
                <Card className="bg-background-secondary border-divider">
                    <CardContent className="p-5 space-y-4">
                        <div className="flex items-start gap-3">
                            <Users className="w-5 h-5 text-accent shrink-0 mt-1" />
                            <p className="text-sm text-text-secondary">
                                {t('referral.bindDesc', 'Bind a referrer to activate your account and unlock the 5 RADRS welcome bonus.')}
                            </p>
                        </div>
                        
                        <div className="space-y-2">
                            <div className="flex gap-2">
                                <Input 
                                    placeholder={t('referral.referrerPlaceholder', '0x... (Referrer Address)')} 
                                    value={inviteCode}
                                    onChange={(e) => setInviteCode(e.target.value)}
                                    className={isSelf ? "border-status-error" : ""}
                                />
                                <Button 
                                    onClick={handleBind} 
                                    isLoading={isBinding} 
                                    disabled={!inviteCode || !isValidAddress || isSelf}
                                >
                                    {t('referral.bind', 'Bind')}
                                </Button>
                            </div>
                            {isSelf && <p className="text-xs text-status-error ml-1">{t('referral.cannotBindSelf', 'Cannot bind yourself')}</p>}
                        </div>
                    </CardContent>
                </Card>
            </section>
        )}

        {hasReferrer && (
             <div className="bg-background-tertiary/50 border border-status-success/20 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-status-success" />
                    <div>
                        <p className="text-sm font-medium text-status-success">{t('referral.referrerBound', 'Referrer Bound')}</p>
                        <p className="text-xs text-text-secondary font-mono">{formatAddress(myReferrer)}</p>
                    </div>
                </div>
            </div>
        )}

        {/* Module 3: Claim Bonus */}
        <section className="space-y-3">
            <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider ml-1">{t('referral.newUserBonus', 'New User Bonus')}</h2>
            <Card className="bg-background-secondary border-divider relative overflow-hidden">
                {/* Progress Bar Background */}
                <div 
                    className="absolute bottom-0 left-0 h-1 bg-accent/20" 
                    style={{ width: `${Math.min((radrsBalance / 200) * 100, 100)}%` }}
                />
                
                <CardContent className="p-5 space-y-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-bold text-lg">{t('referral.claimTitle', 'Claim 5 RADRS')}</h3>
                            <p className="text-xs text-text-secondary mt-1">
                                {t('referral.claimRequirement', 'Requirement: Hold ≥ 200 RADRS')}
                            </p>
                        </div>
                        <Gift className={`w-8 h-8 ${radrsBalance >= 200 ? 'text-accent' : 'text-text-secondary'}`} />
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-xs text-text-secondary">
                            <span>{t('referral.currentBalance', 'Current Balance')}</span>
                            <span>{radrsBalance.toFixed(2)} / 200 RADRS</span>
                        </div>
                        <div className="h-2 bg-background-primary rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-accent transition-all duration-500"
                                style={{ width: `${Math.min((radrsBalance / 200) * 100, 100)}%` }}
                            />
                        </div>
                    </div>

                    {isRewardClaimed ? (
                        <Button className="w-full" variant="outline" disabled>
                            {t('referral.claimed', 'Claimed')} <CheckCircle className="ml-2 w-4 h-4" />
                        </Button>
                    ) : (
                        <Button 
                            className="w-full" 
                            variant="primary" 
                            onClick={handleClaim}
                            isLoading={isClaiming}
                            disabled={!hasReferrer || radrsBalance < 200}
                        >
                            {!hasReferrer ? t('referral.bindFirst', 'Bind Referrer First') : 
                             radrsBalance < 200 ? t('referral.insufficientBalance', 'Insufficient Balance') : t('referral.claimReward', 'Claim Reward')}
                        </Button>
                    )}
                </CardContent>
            </Card>
        </section>

        {/* Module 4: Promotion Tools */}
        <section className="space-y-3">
            <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider ml-1">{t('referral.promotionTools', 'Promotion Tools')}</h2>
            <div className="bg-background-secondary p-4 rounded-xl border border-divider space-y-4">
                <div className="flex items-center justify-between gap-2 p-3 bg-background-primary rounded-lg border border-divider border-dashed">
                    <div className="truncate text-sm text-text-secondary font-mono">
                        {wallet?.address}
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={copyAddress}>
                        <Copy className="w-4 h-4" />
                    </Button>
                </div>
                
                <div className="flex gap-2">
                    <Button className="flex-1" variant="outline" onClick={copyAddress}>
                        <Copy className="w-4 h-4 mr-2" /> {t('referral.copyLink', 'Copy Link')}
                    </Button>
                    <Button className="flex-1" variant="outline">
                        <Share2 className="w-4 h-4 mr-2" /> {t('referral.sharePoster', 'Share Poster')}
                    </Button>
                </div>
                
                <p className="text-xs text-text-secondary text-center px-4">
                    {t('referral.rulesDesc', 'Earn 10 RADRS for each referral + 10% Gas Commission permanently.')}
                </p>
            </div>
        </section>

      </div>
    </div>
  )
}