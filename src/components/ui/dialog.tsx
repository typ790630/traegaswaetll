import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { cn } from "../../lib/utils"

// Simplified Dialog implementation using Framer Motion (similar to Sheet but centered)

interface DialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => onOpenChange?.(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            {/* Content Container (for positioning) */}
            <div className="relative z-50 w-full max-w-lg p-4">
               {children}
            </div>
        </div>
      )}
    </AnimatePresence>
  )
}

export function DialogContent({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className={cn(
                "w-full overflow-hidden rounded-2xl bg-card p-6 shadow-xl border border-divider",
                className
            )}
        >
            {children}
        </motion.div>
    )
}

export function DialogHeader({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left mb-4", className)}>
      {children}
    </div>
  )
}

export function DialogTitle({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <h3 className={cn("text-lg font-semibold leading-none tracking-tight", className)}>
      {children}
    </h3>
  )
}

export function DialogDescription({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <p className={cn("text-sm text-text-secondary", className)}>
      {children}
    </p>
  )
}

export function DialogFooter({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2 mt-6", className)}>
      {children}
    </div>
  )
}

// Placeholder for API compatibility
export const DialogTrigger = ({ children }: { children: React.ReactNode }) => <>{children}</>
