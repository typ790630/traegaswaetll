import { useNavigate } from "react-router-dom"
import { Sparkles, Gift, Zap } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Button } from "../components/ui/button"

interface ReferralPromoProps {
    compact?: boolean
    variant?: 'default' | 'card'
}

export function ReferralPromo({ compact = false, variant = 'default' }: ReferralPromoProps) {
    const { t, i18n } = useTranslation()
    const navigate = useNavigate()

    const isZh = i18n.language === 'zh'

    if (variant === 'card') {
        return (
            <div className="bg-gradient-to-br from-background-secondary to-background-tertiary border border-accent/20 rounded-xl p-5 relative overflow-hidden">
                {/* Background decorative elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
                
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                        <Gift className="w-5 h-5 text-accent" />
                        <h3 className="font-bold text-lg text-text-primary">
                            {isZh ? '推荐奖励计划' : 'Referral Rewards'}
                        </h3>
                    </div>

                    <div className="space-y-3 mb-4">
                        <div className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                            <p className="text-sm text-text-secondary leading-relaxed">
                                {isZh 
                                    ? '邀请好友首次充值 ≥ 200 RADRS，您获得 10 RADRS，好友获得 5 RADRS。' 
                                    : 'Invite friends to deposit ≥ 200 RADRS. You get 10 RADRS, they get 5 RADRS.'}
                            </p>
                        </div>
                        <div className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                            <p className="text-sm text-text-secondary leading-relaxed">
                                {isZh 
                                    ? '使用 RADRS 支付 Gas 费，永久享受 10% 手续费折扣。' 
                                    : 'Pay gas with RADRS to get 10% discount permanently.'}
                            </p>
                        </div>
                    </div>

                    <Button 
                        className="w-full bg-accent/10 hover:bg-accent hover:text-background-primary text-accent border border-accent/50" 
                        onClick={() => navigate('/referral')}
                    >
                        {isZh ? '立即邀请赚取奖励' : 'Invite & Earn Now'}
                    </Button>
                </div>
            </div>
        )
    }

    // Default compact banner style
    return (
        <div className="bg-gradient-to-r from-accent/10 to-transparent p-4 rounded-xl border border-accent/20 flex flex-col gap-3">
            <div className="flex items-start gap-3">
                <div className="bg-accent/20 p-2 rounded-full shrink-0">
                    <Sparkles className="w-4 h-4 text-accent" />
                </div>
                <div>
                    <h4 className="text-sm font-bold text-accent mb-1">
                        {isZh ? '限时推荐福利' : 'Exclusive Referral Offer'}
                    </h4>
                    <p className="text-xs text-text-secondary leading-relaxed">
                        {isZh 
                            ? '好友首充 ≥ 200 RADRS，双方均得奖励！用 RADRS 付 Gas 再省 10%。' 
                            : 'Get rewards when friends deposit ≥ 200 RADRS. Plus 10% off gas fees with RADRS.'}
                    </p>
                </div>
            </div>
            <button 
                onClick={() => navigate('/referral')}
                className="text-xs font-medium text-accent hover:text-accent/80 flex items-center gap-1 self-end"
            >
                {isZh ? '查看详情 >' : 'View Details >'}
            </button>
        </div>
    )
}