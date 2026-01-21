import { Link } from "react-router-dom"
import { Shield, Key, Wallet, ChevronRight, Lock, Globe, FileText, User, Languages, Gift } from "lucide-react"
import { Card, CardContent } from "../components/ui/card"
import { useTranslation } from "react-i18next"

export default function Settings() {
  const { t, i18n } = useTranslation()

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'zh' : 'en')
  }

  const sections = [
    {
      title: t('settings.account'),
      items: [
        { 
            icon: Gift, 
            label: t('settings.referral', 'Referral Program'), 
            description: t('settings.referralDesc', 'Invite friends and earn rewards'),
            path: "/referral" 
        },
        { 
            icon: Shield, 
            label: t('settings.securityCenter', 'Security Center'), 
            description: t('settings.securityDesc', 'Manage your seed phrase and private key'),
            path: "/settings/security" 
        },
      ]
    },
    {
      title: t('settings.security'),
      items: [
        { 
            icon: Lock, 
            label: t('settings.appSecurity', 'App Security'), 
            description: t('settings.appSecurityDesc', 'App lock and biometric authentication'),
            path: "/settings/app-security" 
        },
      ]
    },
    {
      title: t('settings.network'),
      items: [
        { 
            icon: Globe, 
            label: t('settings.network'), 
            description: t('settings.networkDescShort', 'Manage blockchain networks'),
            path: "/settings/network" 
        },
      ]
    },
    {
      title: t('settings.legal'),
      items: [
        { 
            icon: FileText, 
            label: t('settings.terms'), 
            description: t('settings.termsDesc', 'Terms of Service'),
            path: "/settings/terms" 
        },
        { 
            icon: FileText, 
            label: t('settings.privacy'), 
            description: t('settings.privacyDesc', 'Privacy Policy'),
            path: "/settings/privacy" 
        },
      ]
    }
  ]

  return (
    <div className="p-4 pt-8 pb-24 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('settings.title')}</h1>
        <button 
          onClick={toggleLanguage}
          className="px-3 py-1.5 rounded-lg bg-accent/10 text-accent hover:bg-accent hover:text-white transition-all flex items-center gap-2 text-sm font-medium"
        >
          <Languages className="w-4 h-4" />
          <span>{i18n.language === 'en' ? '中文' : 'EN'}</span>
        </button>
      </div>

      <div className="space-y-6">
        {sections.map((section) => (
          <div key={section.title} className="space-y-2">
            <h2 className="text-sm font-semibold text-text-secondary ml-1 uppercase tracking-wider">{section.title}</h2>
            <Card className="bg-card border-divider/50 overflow-hidden">
              <div className="divide-y divide-divider/50">
                {section.items.map((item) => (
                  <Link 
                    key={item.label} 
                    to={item.path}
                    className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-background-secondary text-text-primary">
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-text-primary">
                            {item.label}
                        </span>
                        {item.description && (
                            <span className="text-xs text-text-secondary mt-0.5">{item.description}</span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-text-secondary" />
                  </Link>
                ))}
              </div>
            </Card>
          </div>
        ))}
      </div>
    </div>
  )
}
