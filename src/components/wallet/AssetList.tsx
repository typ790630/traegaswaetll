import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAppStore } from "../../store/useAppStore"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Sheet } from "../ui/sheet"
import { useTranslation } from "react-i18next"
import { Loader2, Plus } from "lucide-react"
import { createPublicClient, http, parseAbi } from 'viem'
import { bsc } from 'viem/chains'

// Simple ERC20 ABI for fetching metadata
const ERC20_METADATA_ABI = parseAbi([
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)'
])

export function AssetList() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { getCurrentNetwork, isLoadingBalances, addToken, currentNetworkId } = useAppStore()
  const network = getCurrentNetwork()

  // Add Token State
  const [isAddTokenOpen, setIsAddTokenOpen] = useState(false)
  const [contractAddress, setContractAddress] = useState("")
  const [tokenInfo, setTokenInfo] = useState<{name: string, symbol: string, decimals: number} | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState("")

  const handleSearchToken = async () => {
      if (!contractAddress || !contractAddress.startsWith('0x') || contractAddress.length !== 42) {
          setSearchError(t('wallet.invalidAddress', 'Invalid contract address'))
          return
      }
      
      setIsSearching(true)
      setSearchError("")
      setTokenInfo(null)

      try {
          // TODO: Use dynamic chain RPC based on currentNetworkId
          // For now defaulting to BSC public node as per current project config
          const publicClient = createPublicClient({
              chain: bsc,
              transport: http('https://bsc-dataseed.binance.org/')
          })

          const [name, symbol, decimals] = await Promise.all([
              publicClient.readContract({
                  address: contractAddress as `0x${string}`,
                  abi: ERC20_METADATA_ABI,
                  functionName: 'name'
              }),
              publicClient.readContract({
                  address: contractAddress as `0x${string}`,
                  abi: ERC20_METADATA_ABI,
                  functionName: 'symbol'
              }),
              publicClient.readContract({
                  address: contractAddress as `0x${string}`,
                  abi: ERC20_METADATA_ABI,
                  functionName: 'decimals'
              })
          ])

          setTokenInfo({ name, symbol, decimals })
      } catch (error) {
          console.error("Token search failed", error)
          setSearchError(t('wallet.tokenNotFound', 'Token not found or network error'))
      } finally {
          setIsSearching(false)
      }
  }

  const handleAddToken = () => {
      if (tokenInfo && currentNetworkId) {
          addToken(currentNetworkId, contractAddress, tokenInfo.name, tokenInfo.symbol, tokenInfo.decimals)
          setIsAddTokenOpen(false)
          setContractAddress("")
          setTokenInfo(null)
      }
  }

  return (
    <div className="mt-8 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-text-primary">{t('wallet.assets')}</h3>
        {isLoadingBalances && (
          <Loader2 className="w-4 h-4 animate-spin text-accent" />
        )}
      </div>
      <div className="space-y-3">
        {network?.assets.map((asset) => (
          <div
            key={asset.symbol}
            onClick={() => navigate(`/asset/${asset.symbol}`)}
            className="flex items-center justify-between p-4 rounded-xl bg-card border border-divider/50 hover:border-accent/50 transition-colors cursor-pointer active:scale-[0.99]"
          >
            <div className="flex items-center gap-4">
              {/* Token Icon Placeholder */}
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-background-secondary text-text-primary font-bold border border-divider">
                {asset.symbol[0]}
              </div>
              
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-text-primary">{asset.symbol}</span>
                  {asset.isGas && (
                    <Badge variant="warning" className="text-[10px] h-5 px-1.5">Gas</Badge>
                  )}
                </div>
                {!asset.isGas && (
                  <div className="flex flex-col">
                    <span className="text-xs text-text-secondary">{asset.name}</span>
                    {asset.price && <span className="text-[10px] text-status-success font-medium">${Number(asset.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</span>}
                  </div>
                )}
                {asset.isGas && (
                  <div className="flex flex-col">
                     <span className="text-xs text-status-warning/80">{t('wallet.usedForGas')}</span>
                     {asset.price && <span className="text-[10px] text-status-success font-medium">${Number(asset.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</span>}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col items-end">
              <span className="font-semibold text-lg tabular-nums text-text-primary">
                {asset.balance}
              </span>
              {asset.price && (
                <span className="text-xs text-text-secondary tabular-nums">
                  ≈ ${ (parseFloat(asset.balance) * asset.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }
                </span>
              )}
            </div>
          </div>
        ))}

        {/* Add Token Button */}
        <button 
            onClick={() => setIsAddTokenOpen(true)}
            className="w-full py-3 flex items-center justify-center gap-2 rounded-xl border border-dashed border-divider text-text-secondary hover:text-accent hover:border-accent hover:bg-background-secondary/50 transition-all"
        >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">{t('wallet.addToken', 'Add Token')}</span>
        </button>
      </div>

      {/* Add Token Sheet */}
      <Sheet isOpen={isAddTokenOpen} onClose={() => setIsAddTokenOpen(false)} title={t('wallet.addCustomToken', 'Add Custom Token')}>
          <div className="space-y-6 pt-4">
              <div className="space-y-2">
                  <label className="text-sm text-text-secondary">{t('wallet.contractAddress', 'Contract Address')}</label>
                  <div className="flex gap-2">
                      <Input 
                          placeholder="0x..." 
                          value={contractAddress}
                          onChange={(e) => setContractAddress(e.target.value)}
                          className="font-mono"
                      />
                      <Button onClick={handleSearchToken} isLoading={isSearching} disabled={!contractAddress}>
                          {t('wallet.search', 'Search')}
                      </Button>
                  </div>
                  {searchError && <p className="text-xs text-status-error">{searchError}</p>}
              </div>

              {tokenInfo && (
                  <div className="p-4 rounded-xl bg-background-secondary border border-divider space-y-3">
                      <div className="flex justify-between">
                          <span className="text-sm text-text-secondary">{t('wallet.symbol', 'Symbol')}</span>
                          <span className="font-bold">{tokenInfo.symbol}</span>
                      </div>
                      <div className="flex justify-between">
                          <span className="text-sm text-text-secondary">{t('wallet.name', 'Name')}</span>
                          <span className="font-medium">{tokenInfo.name}</span>
                      </div>
                      <div className="flex justify-between">
                          <span className="text-sm text-text-secondary">{t('wallet.decimals', 'Decimals')}</span>
                          <span className="font-mono">{tokenInfo.decimals}</span>
                      </div>
                  </div>
              )}

              <Button 
                  className="w-full" 
                  size="lg" 
                  variant="primary" 
                  disabled={!tokenInfo}
                  onClick={handleAddToken}
              >
                  {t('wallet.addToken', 'Add Token')}
              </Button>
          </div>
      </Sheet>
    </div>
  )
}
