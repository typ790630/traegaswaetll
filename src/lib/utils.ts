import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const generateMockKey = (addr: string) => {
  if (!addr) return "0x0000000000000000000000000000000000000000000000000000000000000000"
  const seed = addr.toLowerCase().replace('0x', '')
  const part1 = seed.substring(0, 16)
  const part2 = seed.substring(16, 32)
  const part3 = seed.substring(32)
  return `0x${part3}${part1}${part2}9d1e5f4a`.padEnd(66, '0')
}
