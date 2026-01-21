import * as React from "react"
import { cn } from "../lib/utils"

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  className?: string
  variant?: 'gold' | 'white' | 'dark'
}

export function Logo({ className, variant = 'gold', ...props }: LogoProps) {
  // Color mapping
  const colors = {
    gold: "#C9A24D",
    white: "#FFFFFF",
    dark: "#0B0D12"
  }
  
  const fillColor = colors[variant] || colors.gold

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      fill="none"
      stroke={fillColor}
      strokeWidth="6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("w-12 h-12", className)}
      {...props}
    >
      {/* 
        Radar Wallet Logo - FINAL
        Symbol: Uppercase R + Symmetrical Deer Antlers
        Meaning: Protection, Strength, Stability
      */}

      {/* The R */}
      {/* Vertical Bar */}
      <path d="M 38 40 V 85" />
      {/* Top Loop */}
      <path d="M 38 40 H 62 C 75 40 75 62 62 62 H 38" />
      {/* Leg */}
      <path d="M 52 62 L 72 85" />

      {/* The Antlers (Symmetrical) */}
      {/* Left Antler */}
      <path d="M 42 35 C 38 25 30 20 20 15" /> {/* Main beam */}
      <path d="M 32 24 L 24 28" /> {/* Lower branch */}
      <path d="M 25 18 L 22 8" />  {/* Upper tip */}

      {/* Right Antler */}
      <path d="M 58 35 C 62 25 70 20 80 15" /> {/* Main beam */}
      <path d="M 68 24 L 76 28" /> {/* Lower branch */}
      <path d="M 75 18 L 78 8" />  {/* Upper tip */}
      
    </svg>
  )
}
