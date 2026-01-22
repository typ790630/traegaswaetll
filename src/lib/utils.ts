import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * ⚠️⚠️⚠️ DEPRECATED - 已废弃 ⚠️⚠️⚠️
 * 
 * 此函数生成假的私钥，不应在生产环境使用！
 * 
 * Pure EOA 钱包应该：
 * 1. 从助记词派生真实私钥
 * 2. 使用 useAppStore.getPrivateKey(walletId)
 * 
 * 此函数保留仅用于旧代码兼容性，但不会被调用。
 * 废弃日期：2026-01-22
 */
export const generateMockKey = (addr: string) => {
  console.error('⚠️ generateMockKey is deprecated! Use getPrivateKey from useAppStore instead.')
  if (!addr) return "0x0000000000000000000000000000000000000000000000000000000000000000"
  const seed = addr.toLowerCase().replace('0x', '')
  const part1 = seed.substring(0, 16)
  const part2 = seed.substring(16, 32)
  const part3 = seed.substring(32)
  return `0x${part3}${part1}${part2}9d1e5f4a`.padEnd(66, '0')
}
