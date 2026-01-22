import { useTranslation } from 'react-i18next'
import { CreditCard, Construction } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Cards() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-background-primary text-text-primary pb-24 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background-primary/95 backdrop-blur-md border-b border-divider px-4 py-4">
        <h1 className="text-xl font-bold">{t('cards.title', '虚拟卡')}</h1>
      </div>

      {/* Coming Soon Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6 max-w-sm"
        >
          {/* Icon */}
          <div className="relative">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-accent/20 to-accent/5 rounded-3xl flex items-center justify-center border border-accent/20">
              <CreditCard className="w-12 h-12 text-accent" />
            </div>
            <div className="absolute -top-2 -right-2">
              <div className="w-10 h-10 bg-status-warning/20 rounded-full flex items-center justify-center border border-status-warning/30">
                <Construction className="w-5 h-5 text-status-warning" />
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-text-primary">
              对接银行中
            </h2>
            <div className="flex items-center justify-center gap-1">
              <motion.span
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-accent text-lg"
              >
                搭建中
              </motion.span>
              <motion.span
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                className="text-accent text-lg"
              >
                .
              </motion.span>
              <motion.span
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                className="text-accent text-lg"
              >
                .
              </motion.span>
              <motion.span
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
                className="text-accent text-lg"
              >
                .
              </motion.span>
              <motion.span
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.8 }}
                className="text-accent text-lg"
              >
                .
              </motion.span>
              <motion.span
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 1.0 }}
                className="text-accent text-lg"
              >
                .
              </motion.span>
              <motion.span
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 1.2 }}
                className="text-accent text-lg"
              >
                .
              </motion.span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <p className="text-text-secondary leading-relaxed">
              虚拟卡功能正在与银行进行对接，敬请期待
            </p>
            
            {/* Features Coming Soon */}
            <div className="bg-background-secondary border border-divider rounded-2xl p-4 space-y-2 text-left">
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
                即将推出
              </p>
              <div className="space-y-2 text-sm text-text-secondary">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent"></div>
                  <span>多种虚拟卡服务商选择</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent"></div>
                  <span>快速申请与激活</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent"></div>
                  <span>安全的卡片管理</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent"></div>
                  <span>全球支付支持</span>
                </div>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/20 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-warning opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-status-warning"></span>
            </span>
            <span className="text-xs font-medium text-accent">
              开发进行中
            </span>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="p-6 text-center">
        <p className="text-xs text-text-muted">
          感谢您的耐心等待，我们将尽快为您带来更好的服务
        </p>
      </div>
    </div>
  )
}
