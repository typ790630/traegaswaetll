import { useTranslation } from "react-i18next"
import { ArrowLeft, Check } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Button } from "../../components/ui/button"
import { TERMS_CONTENT, LEGAL_VERSION } from "../../constants/legal"
import { useAppStore } from "../../store/useAppStore"

export default function Terms() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { agreedTermsVersion, agreeToLegal } = useAppStore()
  
  const content = TERMS_CONTENT[i18n.language as keyof typeof TERMS_CONTENT] || TERMS_CONTENT['en']
  const isAgreed = agreedTermsVersion === LEGAL_VERSION.terms

  const handleAgree = () => {
      agreeToLegal('terms', LEGAL_VERSION.terms)
  }

  return (
    <div className="min-h-screen bg-background-primary text-text-primary p-4 max-w-md mx-auto">
      <div className="flex items-center mb-6 pt-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-xl font-bold ml-2">{t('settings.terms', 'Terms of Service')}</h1>
      </div>

      <div className="prose prose-invert prose-sm max-w-none text-text-secondary pb-24">
        <p>{i18n.language === 'zh' ? '最后更新与生效日期：2026年1月20日' : 'Last Updated and Effective Date: January 20, 2026'}</p>
        
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background-primary/95 backdrop-blur border-t border-divider flex justify-center">
          <div className="w-full max-w-md">
            {isAgreed ? (
                <div className="flex items-center justify-center gap-2 text-status-success font-medium py-3">
                    <Check className="w-5 h-5" />
                    <span>{t('legal.agreed', 'Agreed to current version')} ({LEGAL_VERSION.terms})</span>
                </div>
            ) : (
                <Button className="w-full" onClick={handleAgree}>
                    {t('legal.agree', 'Agree to Terms')}
                </Button>
            )}
          </div>
      </div>
    </div>
  )
}
