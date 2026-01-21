import { ArrowDownLeft, ArrowUpRight, ArrowRightLeft } from "lucide-react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"

export function ActionButtons() {
  const { t } = useTranslation()
  const actions = [
    { name: t('wallet.receive'), icon: ArrowDownLeft, path: "/receive" },
    { name: t('wallet.send'), icon: ArrowUpRight, path: "/send" },
    { name: t('wallet.swap'), icon: ArrowRightLeft, path: "/swap" },
  ]

  return (
    <div className="grid grid-cols-3 gap-4 mt-6">
      {actions.map((action) => (
        <Link
          key={action.name}
          to={action.path}
          className="flex flex-col items-center gap-2 group"
        >
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-accent/10 text-accent transition-colors group-hover:bg-accent group-hover:text-background-primary">
            <action.icon className="w-6 h-6" />
          </div>
          <span className="text-sm font-medium text-text-secondary group-hover:text-text-primary transition-colors">
            {action.name}
          </span>
        </Link>
      ))}
    </div>
  )
}
