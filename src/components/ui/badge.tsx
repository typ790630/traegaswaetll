import * as React from "react"
import { cn } from "../../lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "destructive" | "success" | "warning" | "info"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "border-transparent bg-accent text-[#0B0D12] hover:bg-accent/80",
    secondary: "border-transparent bg-background-secondary text-text-secondary hover:bg-background-secondary/80",
    destructive: "border-transparent bg-status-error text-white hover:bg-status-error/80",
    outline: "text-text-primary border-divider",
    success: "border-transparent bg-status-success/20 text-status-success",
    warning: "border-transparent bg-status-warning/20 text-status-warning",
    info: "border-transparent bg-status-info/20 text-status-info",
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge }
