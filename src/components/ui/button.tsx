import * as React from "react"
import { cn } from "../../lib/utils"
import { Loader2 } from "lucide-react"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  isLoading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "default", isLoading, children, disabled, ...props }, ref) => {
    const variants = {
      primary: "bg-accent text-[#0B0D12] hover:bg-accent-hover shadow-md",
      secondary: "bg-background-secondary text-text-primary hover:bg-card",
      outline: "border border-divider bg-transparent hover:bg-background-secondary text-text-primary",
      ghost: "hover:bg-background-secondary text-text-primary",
      destructive: "bg-status-error text-white hover:bg-status-error/90",
      link: "text-accent underline-offset-4 hover:underline",
    }

    const sizes = {
      default: "h-12 px-6 py-2", // Taller for mobile touch
      sm: "h-9 rounded-md px-3",
      lg: "h-14 rounded-md px-8 text-lg",
      icon: "h-10 w-10",
    }

    return (
      <button
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button }
