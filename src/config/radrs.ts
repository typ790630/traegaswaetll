import { parseAbi } from 'viem'

export const RADRS_CONFIG = {
  chainId: 56,
  rpcUrl: 'https://bsc-dataseed1.defibit.io/', // Changed to more reliable RPC
  rpcUrls: [
    'https://bsc-dataseed1.defibit.io/',
    'https://bsc.publicnode.com',
    'https://bsc-dataseed1.ninicoin.io/',
    'https://bsc-dataseed.binance.org/'
  ],
  paymasterAddress: '0xD0D46B98dFf2ee93Dfe708d4434f180383B2B939',
  referralRegistryAddress: '0x086dEaa48841918f132ad0489feb32DcC3913147',
  radrsTokenAddress: '0xe2188a2e0a41a50f09359e5fe714d5e643036f2a',
  paymasterApiUrl: 'https://radrs-paymaster.vercel.app/api/paymaster/sponsor',
  bundlerUrl: 'https://api.pimlico.io/v2/56/rpc?apikey=pim_j1e5J7xjKxr2vnXQ14g3Ws', // Fixed: Using verified valid API Key
  entryPointAddress: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789', // EntryPoint v0.6
  factoryAddress: '0x9406Cc6185a346906296840746125a0E44976454' // SimpleAccountFactory
} as const

export const PAYMASTER_ABI = parseAbi([
  'function isActivated(address account) external view returns (bool)',
  'function getExpectedRadrsCharge(uint256 gasCostWei, address sender) view returns (uint256)',
  'function totalCommissions(address referrer) external view returns (uint256)'
])

export const REFERRAL_ABI = parseAbi([
  'function bindReferrer(address referrer)',
  'function claimReward()',
  'function getReferrer(address) view returns (address)',
  'function getInviteCount(address) view returns (uint256)',
  'function rewardClaimed(address) view returns (bool)',
  'function totalRewardsEarned(address referrer) external view returns (uint256)',
  'function getInvitees(address referrer) external view returns ((address wallet, uint256 bindTime)[])'
])

export const ERC20_ABI = parseAbi([
  'function approve(address spender, uint256 amount) returns (bool)',
  'function balanceOf(address account) view returns (uint256)',
  'function transfer(address recipient, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)'
])
