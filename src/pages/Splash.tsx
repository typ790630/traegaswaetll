import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Logo } from "../components/Logo"
import { useTranslation } from "react-i18next"

export default function Splash() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/wallet")
    }, 3000)

    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background-primary">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col items-center"
      >
        <Logo className="w-24 h-24 text-accent mb-6" />
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold text-text-primary mb-2 tracking-tight">
            雷达钱包
          </h1>
          <p className="text-xl text-text-secondary font-medium tracking-wide">
            Radar Wallet
          </p>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="absolute bottom-12 text-center"
      >
        <p className="text-xs text-text-secondary/50 uppercase tracking-[0.2em]">
          {t('splash.slogan')}
        </p>
      </motion.div>
    </div>
  )
}
