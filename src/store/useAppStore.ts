import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { ActivityItem, CardPartner, UserCard } from '../types'
import { generateMnemonic, mnemonicToSeedSync } from '@scure/bip39'
import { wordlist } from '@scure/bip39/wordlists/english.js'
import { HDKey } from '@scure/bip32'
import { privateKeyToAccount } from 'viem/accounts'
import { getAddress } from 'viem'

export interface Asset {
  symbol: string
  name: string
  balance: string
  isGas?: boolean
  price?: number // Mock price for total balance calculation
  contractAddress?: string
}

export interface Network {
  id: string
  name: string
  symbol: string
  chainId: number
  assets: Asset[]
}

export interface Wallet {
  id: string
  name: string
  address: string // EOA Address (Pure EOA Mode)
  eoaAddress?: string // Same as address in Pure EOA mode
  totalBalance?: string // Mock total balance for display in list
  mnemonic?: string // Mnemonic for backup
}

interface AppState {
  wallets: Wallet[]
  networks: Network[]
  cardPartners: CardPartner[]
  userCards: UserCard[]
  currentWalletId: string
  currentNetworkId: string
  
  // Actions
  setWallet: (id: string) => void
  setNetwork: (id: string) => void
  
  createWallet: (name: string, mnemonic?: string) => void
  importWallet: (name: string, mnemonic: string) => Promise<boolean>
  deleteWallet: (id: string) => void
  addToken: (networkId: string, contractAddress: string, name: string, symbol: string, decimals: number) => void
  updateAssetBalance: (networkId: string, symbol: string, amount: string, mode: 'set' | 'add' | 'subtract') => void

  addUserCard: (card: Omit<UserCard, 'id' | 'createdAt' | 'favorite'>) => void
  removeUserCard: (id: string) => void
  updateUserCard: (id: string, updates: Partial<UserCard>) => void
  toggleCardFavorite: (id: string) => void
  
  // Activity
  activities: ActivityItem[]
  addActivity: (activity: Omit<ActivityItem, 'id' | 'date'>) => void
  setActivities: (activities: ActivityItem[]) => void

  // Referral State
  referral: {
    referrer: string
    inviteCount: number
    totalRewards: string
    totalCommissions: string
    isClaimed: boolean
    invitees: { wallet: string, bindTime: number }[]
  }
  setReferralData: (data: Partial<AppState['referral']>) => void
  
  getCurrentWallet: () => Wallet | undefined
  getCurrentNetwork: () => Network | undefined

  // Price Actions
  updateRealtimePrices: (prices: Record<string, number>) => void
  
  // Real Chain Actions
  fetchRealBalances: () => Promise<void>
  isLoadingBalances: boolean
  
  // Security
  getPrivateKey: (walletId: string) => string
  appLockEnabled: boolean
  biometricsEnabled: boolean
  setAppLockEnabled: (enabled: boolean) => void
  setBiometricsEnabled: (enabled: boolean) => void
  
  appPassword: string | null
  setAppPassword: (password: string) => void
  verifyPassword: (password: string) => boolean

  agreedTermsVersion: string | null
  agreedPrivacyVersion: string | null
  agreeToLegal: (type: 'terms' | 'privacy', version: string) => void
}

// Mock Data
import { ChainService } from '../services/ChainService'

const MOCK_CARD_PARTNERS: CardPartner[] = [
  { id: 'payoneer', name: 'Payoneer', link: 'https://www.payoneer.com', tags: ['CN Friendly', 'Recommended'], icon: 'Briefcase', color: '#FF4800' },
  { id: 'advcash', name: 'Advcash', link: 'https://advcash.com', tags: ['CN Friendly', 'Fast Setup'], icon: 'Shield', color: '#2B3990' },
  { id: 'capitalist', name: 'Capitalist', link: 'https://capitalist.net', tags: ['CN Friendly'], icon: 'Gem', color: '#D4AF37' },
  { id: 'skrill', name: 'Skrill', link: 'https://www.skrill.com', tags: ['CN Friendly'], icon: 'CreditCard', color: '#811E5B' },
  { id: 'neteller', name: 'Neteller', link: 'https://www.neteller.com', tags: ['CN Friendly'], icon: 'Landmark', color: '#88C64B' },
  { id: 'wise', name: 'Wise', link: 'https://wise.com', tags: ['Limited', 'Passport'], icon: 'Globe', color: '#9FE870' },
  { id: 'paysera', name: 'Paysera', link: 'https://www.paysera.com', tags: ['Passport Required'], icon: 'Euro', color: '#00AEEF' },
  { id: 'crypto', name: 'Crypto.com', link: 'https://crypto.com/cards', tags: ['Region Dependent'], icon: 'Zap', color: '#002D74' },
  { id: 'other', name: 'Other', link: '', tags: ['Custom'], icon: 'Plus', color: '#333333' },
]

const MOCK_NETWORKS: Network[] = [
  {
    id: 'bsc',
    name: 'BSC',
    symbol: 'BNB',
    chainId: 56,
    assets: [
      { symbol: 'BNB', name: 'Binance Coin', balance: '0.0000', price: 650, contractAddress: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c' },
      { symbol: 'USDT', name: 'Tether USD', balance: '0.00', price: 1.0, contractAddress: '0x55d398326f99059fF775485246999027B3197955' },
      { symbol: 'RADRS', name: 'Radar Token', balance: '0.00', price: 0.14505, contractAddress: '0xe2188a2e0a41a50f09359e5fe714d5e643036f2a' },
    ]
  },
  {
    id: 'eth',
    name: 'Ethereum',
    symbol: 'ETH',
    chainId: 1,
    assets: [
      { symbol: 'ETH', name: 'Ethereum', balance: '0.00', price: 3000 },
      { symbol: 'USDT', name: 'Tether USD', balance: '0.00', price: 1.0 },
      { symbol: 'RADRS', name: 'Radar Token', balance: '200.00', price: 0.05 },
    ]
  },
  {
    id: 'polygon',
    name: 'Polygon',
    symbol: 'MATIC',
    chainId: 137,
    assets: [
      { symbol: 'MATIC', name: 'Polygon', balance: '0.00', price: 0.8 },
      { symbol: 'USDT', name: 'Tether USD', balance: '0.00', price: 1.0 },
      { symbol: 'RADRS', name: 'Radar Token', balance: '200.00', price: 0.05 },
    ]
  }
]

// ⚡⚡⚡ Pure EOA 钱包地址生成
// 直接从助记词派生 EOA 地址，不再使用 AA 架构
const generateWalletFromMnemonic = (mnemonic: string) => {
    const seed = mnemonicToSeedSync(mnemonic)
    const hdkey = HDKey.fromMasterSeed(seed)
    const path = `m/44'/60'/0'/0/0` // ETH standard path
    const derivedKey = hdkey.derive(path)
    // 浏览器兼容：使用 Array.from 代替 Buffer
    const privateKeyBytes = derivedKey.privateKey!
    const privateKeyHex = Array.from(privateKeyBytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
    const privateKey = `0x${privateKeyHex}`
    const account = privateKeyToAccount(privateKey as `0x${string}`)
    return {
        address: account.address,
        privateKey
    }
}

// ⚡⚡⚡ 生成随机的默认钱包（安全）
// 每次应用首次启动时，生成全新的随机助记词

let DEFAULT_WALLET: Wallet

try {
    // ✅ 生成真正的随机助记词（12 个单词）
    const randomMnemonic = generateMnemonic(wordlist, 128)
    const walletData = generateWalletFromMnemonic(randomMnemonic)
    
    console.log('[useAppStore] 🔐 默认钱包初始化（随机助记词）:')
    console.log(`  助记词: ${randomMnemonic}`)
    console.log(`  地址: ${walletData.address}`)
    console.log(`  私钥: ${walletData.privateKey.substring(0, 10)}...${walletData.privateKey.substring(60)}`)
    
    console.warn('⚠️⚠️⚠️ 重要提醒 ⚠️⚠️⚠️')
    console.warn('这是一个随机生成的默认钱包！')
    console.warn('请立即在【安全中心】查看并保存助记词！')
    console.warn('或者创建新钱包/导入已有钱包！')
    
    DEFAULT_WALLET = {
        id: 'w1',
        name: 'My Wallet',
        eoaAddress: walletData.address,
        address: walletData.address, // Pure EOA
        totalBalance: '$0.00',
        mnemonic: randomMnemonic  // ✅ 真正的随机助记词
    }
} catch (error) {
    console.error('[useAppStore] ❌ 默认钱包初始化失败:', error)
    
    // 🚨 如果随机生成失败，使用一个测试助记词但警告用户
    const fallbackMnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'
    const walletData = generateWalletFromMnemonic(fallbackMnemonic)
    
    console.error('🚨🚨🚨 警告：使用测试助记词！请立即创建新钱包！')
    
    DEFAULT_WALLET = {
        id: 'w1',
        name: 'UNSAFE Wallet',
        eoaAddress: walletData.address,
        address: walletData.address,
        totalBalance: '$0.00',
        mnemonic: fallbackMnemonic
    }
}

const MOCK_WALLETS: Wallet[] = [DEFAULT_WALLET]

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      wallets: MOCK_WALLETS,
      networks: MOCK_NETWORKS,
      cardPartners: MOCK_CARD_PARTNERS,
      userCards: [],
      currentWalletId: MOCK_WALLETS[0].id,
      currentNetworkId: MOCK_NETWORKS[0].id,

      updateRealtimePrices: (prices) => set((state) => {
          const updatedNetworks = state.networks.map(n => ({
              ...n,
              assets: n.assets.map(a => {
                  if (prices[a.symbol]) {
                      return { ...a, price: prices[a.symbol] }
                  }
                  return a
              })
          }))
          return { networks: updatedNetworks }
      }),

      isLoadingBalances: false,

      fetchRealBalances: async () => {
        set({ isLoadingBalances: true })
        try {
            const state = get()
            const wallet = state.getCurrentWallet()
            const network = state.getCurrentNetwork()
            
            if (!wallet || !network) return

            // Dynamically support different chains
            if (network.id !== 'bsc' && network.id !== 'eth' && network.id !== 'polygon') return

            // Pure EOA: Address is wallet.address
            const targetAddress = wallet.address
            console.log(`[useAppStore] Fetching balances for EOA Address: ${targetAddress} on ${network.id}`)

            const updatedAssets = await Promise.all(network.assets.map(async (asset) => {
                let balance = asset.balance
                
                try {
                    if (network.id === 'bsc') {
                         if (asset.symbol === 'BNB') {
                             balance = await ChainService.getNativeBalance(targetAddress)
                             console.log(`[useAppStore] BNB Balance for ${targetAddress}: ${balance}`)
                         } else if (asset.contractAddress) {
                             balance = await ChainService.getErc20Balance(asset.contractAddress, targetAddress)
                             console.log(`[useAppStore] ${asset.symbol} Balance for ${targetAddress}: ${balance}`)
                         }
                    } else {
                        // Other chains placeholder
                    }
                    
                } catch (err) {
                    console.error(`Failed to fetch balance for ${asset.symbol}`, err)
                }
                
                const formatted = parseFloat(balance).toFixed(4)
                
                return { ...asset, balance: formatted }
            }))

            set((state) => ({
                networks: state.networks.map(n => 
                    n.id === network.id ? { ...n, assets: updatedAssets } : n
                )
            }))
        } finally {
            set({ isLoadingBalances: false })
        }
      },

      setWallet: (id) => set({ currentWalletId: id }),
      setNetwork: (id: string) => set({ currentNetworkId: id }),
      
      createWallet: async (name, providedMnemonic) => {
        // ⚡ Pure EOA: 使用提供的助记词或生成新的随机助记词
        const mnemonic = providedMnemonic || generateMnemonic(wordlist, 128)
        const { address: eoaAddress } = generateWalletFromMnemonic(mnemonic)
        
        console.log('[useAppStore] 🔐 创建新钱包（Pure EOA）:')
        console.log(`  助记词来源: ${providedMnemonic ? '向导提供' : '自动生成'}`)
        console.log(`  助记词: ${mnemonic}`)
        console.log(`  EOA 地址: ${eoaAddress}`)
        
        const newWallet: Wallet = {
          id: Math.random().toString(36).substring(2, 9),
          name,
          address: eoaAddress,      // ✅ Pure EOA 地址
          eoaAddress: eoaAddress,   // ✅ 相同的 EOA 地址
          totalBalance: '$0.00',
          mnemonic
        }
        
        set((state) => ({ wallets: [...state.wallets, newWallet], currentWalletId: newWallet.id }))
      },

      importWallet: async (name, mnemonic) => {
        try {
          // ⚡ Pure EOA: 从助记词派生 EOA 地址
          console.log('[useAppStore] 🔐 导入钱包（Pure EOA）...')
          
          const { address: eoaAddress } = generateWalletFromMnemonic(mnemonic)
          
          console.log(`  助记词: ${mnemonic}`)
          console.log(`  派生 EOA 地址: ${eoaAddress}`)
          
          // 检查是否已存在
          const existingWallet = get().wallets.find(
            w => w.address.toLowerCase() === eoaAddress.toLowerCase()
          )
          
          if (existingWallet) {
            console.log('[useAppStore] ⚠️ 钱包已存在，切换到该钱包')
            set({ currentWalletId: existingWallet.id })
            return true
          }
          
          // 创建新钱包
          const newWallet: Wallet = {
            id: Math.random().toString(36).substring(2, 9),
            name,
            address: eoaAddress,      // ✅ Pure EOA 地址
            eoaAddress: eoaAddress,   // ✅ 相同的 EOA 地址
            totalBalance: '$0.00',
            mnemonic
          }
          
          console.log('[useAppStore] ✅ 钱包导入成功')
          
          set((state) => ({ 
            wallets: [...state.wallets, newWallet], 
            currentWalletId: newWallet.id 
          }))
          
          return true
        } catch (error) {
          console.error('[useAppStore] ❌ 导入钱包失败:', error)
          return false
        }
      },

      deleteWallet: (id) => set((state) => {
        const newWallets = state.wallets.filter(w => w.id !== id)
        if (newWallets.length === 0) return state 
        return { 
          wallets: newWallets, 
          currentWalletId: state.currentWalletId === id ? newWallets[0].id : state.currentWalletId,
        }
      }),

      addToken: (networkId, contractAddress, name, symbol, decimals) => set((state) => {
        const updatedNetworks = state.networks.map(n => {
          if (n.id === networkId) {
            if (n.assets.some(a => a.symbol === symbol || a.contractAddress?.toLowerCase() === contractAddress.toLowerCase())) {
                return n
            }
            
            const newAsset: Asset = {
                symbol,
                name,
                balance: '0.0000',
                contractAddress,
                price: 0 
            }
            
            return { ...n, assets: [...n.assets, newAsset] }
          }
          return n
        })
        return { networks: updatedNetworks }
      }),

      updateAssetBalance: (networkId, symbol, amount, mode) => set((state) => {
        const updatedNetworks = state.networks.map(n => {
          if (n.id === networkId) {
            const updatedAssets = n.assets.map(a => {
              if (a.symbol === symbol) {
                let newBalance = parseFloat(a.balance)
                const change = parseFloat(amount)
                if (mode === 'set') newBalance = change
                if (mode === 'add') newBalance += change
                if (mode === 'subtract') newBalance -= change
                return { ...a, balance: Math.max(0, newBalance).toFixed(4) } 
              }
              return a
            })
            return { ...n, assets: updatedAssets }
          }
          return n
        })
        return { networks: updatedNetworks }
      }),

      addUserCard: (card) => set((state) => ({
        userCards: [...state.userCards, { 
          ...card, 
          id: Math.random().toString(36).substring(2, 9), 
          createdAt: Date.now(),
          favorite: false,
          status: 'pending' 
        }]
      })),
      removeUserCard: (id) => set((state) => ({
        userCards: state.userCards.filter(c => c.id !== id)
      })),
      updateUserCard: (id, updates) => set((state) => ({
        userCards: state.userCards.map(c => c.id === id ? { ...c, ...updates } : c)
      })),
      toggleCardFavorite: (id) => set((state) => ({
        userCards: state.userCards.map(c => c.id === id ? { ...c, favorite: !c.favorite } : c)
      })),

      activities: [],
      
      addActivity: (activity) => set((state) => ({
        activities: [{ 
            ...activity, 
            id: Math.random().toString(36).substring(2, 9), 
            date: new Date().toLocaleString(),
            timestamp: Date.now() 
        }, ...state.activities]
      })),
      setActivities: (activities) => set({ activities }),

      referral: {
        referrer: "0x0000000000000000000000000000000000000000",
        inviteCount: 0,
        totalRewards: "0",
        totalCommissions: "0",
        isClaimed: false,
        invitees: []
      },
      setReferralData: (data) => set((state) => ({ referral: { ...state.referral, ...data } })),

      getCurrentWallet: () => get().wallets.find(w => w.id === get().currentWalletId),
      getCurrentNetwork: () => get().networks.find(n => n.id === get().currentNetworkId),
      
      getPrivateKey: (walletId: string) => {
          const wallet = get().wallets.find(w => w.id === walletId)
          if (!wallet) {
              console.error("[Security] ❌ Wallet not found:", walletId)
              return ""
          }
          
          if (wallet.mnemonic) {
              try {
                  const { privateKey } = generateWalletFromMnemonic(wallet.mnemonic)
                  return privateKey
              } catch (e) {
                  console.error("[Security] ❌ Failed to derive key from mnemonic:", e)
                  return ""
              }
          }
          
          // ❌ 生产环境：必须有助记词
          console.error("[Security] ❌ No mnemonic found for wallet. Cannot derive private key!")
          console.error("[Security] ❌ Wallet ID:", walletId)
          console.error("[Security] ❌ This should never happen in production!")
          return ""
      },

      appLockEnabled: false,
      biometricsEnabled: false,
      setAppLockEnabled: (enabled) => set({ appLockEnabled: enabled }),
      setBiometricsEnabled: (enabled) => set({ biometricsEnabled: enabled }),

      appPassword: null, 
      setAppPassword: (password) => {
          const hashed = btoa(password)
          set({ appPassword: hashed })
      },
      verifyPassword: (password) => {
          const state = get()
          if (!state.appPassword) return password === "123456"
          return btoa(password) === state.appPassword
      },

      agreedTermsVersion: null,
      agreedPrivacyVersion: null,
      agreeToLegal: (type, version) => set((state) => ({
          [type === 'terms' ? 'agreedTermsVersion' : 'agreedPrivacyVersion']: version
      }))
    }),
    {
      name: 'radrs-wallet-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        wallets: state.wallets,
        networks: state.networks, 
        userCards: state.userCards,
        activities: state.activities,
        referral: state.referral,
        currentWalletId: state.currentWalletId,
        currentNetworkId: state.currentNetworkId,
        appLockEnabled: state.appLockEnabled,
        biometricsEnabled: state.biometricsEnabled,
        appPassword: state.appPassword,
        agreedTermsVersion: state.agreedTermsVersion,
        agreedPrivacyVersion: state.agreedPrivacyVersion
      }),
      version: 8, // Incremented to 8 to force reset to correct EOA address
      migrate: (persistedState: any, version) => {
          if (version < 8) {
              // Force reset to use Pure EOA MOCK_WALLETS with new address
              return { 
                  ...persistedState, 
                  wallets: MOCK_WALLETS, 
                  networks: MOCK_NETWORKS, 
                  currentWalletId: MOCK_WALLETS[0].id
              }
          }
          return persistedState
      }
    }
  )
)
