
// Mock Interfaces matching the Store
interface Asset {
  symbol: string
  balance: string
}

interface CacheEntry {
  data: Asset[]
  timestamp: number
}

// Mock Data
const ZERO_ASSETS: Asset[] = [
    { symbol: 'BNB', balance: '0.0000' },
    { symbol: 'USDT', balance: '0.0000' },
    { symbol: 'RADRS', balance: '0.00' }
]

const POSITIVE_ASSETS: Asset[] = [
    { symbol: 'BNB', balance: '0.0500' },
    { symbol: 'USDT', balance: '0.0000' },
    { symbol: 'RADRS', balance: '0.00' }
]

// Configuration
const CACHE_DURATION = 10000 // 10 seconds

// The Logic to Test
function shouldLoadFromCache(cached: CacheEntry | undefined): boolean {
    if (!cached) return false
    
    const now = Date.now()
    
    // Logic from useAppStore.ts
    const isCacheValid = (now - cached.timestamp) < CACHE_DURATION
    // FIX: Check if all assets are zero
    const isCacheEmpty = cached.data.every(a => parseFloat(a.balance) === 0)
    
    // Log for debugging
    console.log(`[Check] Valid: ${isCacheValid}, Empty(All Zeros): ${isCacheEmpty}`)
    
    return isCacheValid && !isCacheEmpty
}

// --- Test Suite ---
console.log("=== Asset Display Logic Test ===\n")

// Test 1: Cache has only 0 balances (The Bug Scenario)
console.log("Test 1: Cache contains only 0 balances")
const badCache: CacheEntry = {
    data: ZERO_ASSETS,
    timestamp: Date.now()
}
const result1 = shouldLoadFromCache(badCache)
if (result1 === false) {
    console.log("✅ PASS: Ignored 0-balance cache. Will fetch fresh data.\n")
} else {
    console.error("❌ FAIL: Used 0-balance cache! User will see 0 assets.\n")
}

// Test 2: Cache has positive balance (Normal Scenario)
console.log("Test 2: Cache contains positive balance")
const goodCache: CacheEntry = {
    data: POSITIVE_ASSETS,
    timestamp: Date.now()
}
const result2 = shouldLoadFromCache(goodCache)
if (result2 === true) {
    console.log("✅ PASS: Used valid cache. User sees assets immediately.\n")
} else {
    console.error("❌ FAIL: Ignored valid cache! Unnecessary RPC call.\n")
}

// Test 3: Cache is expired
console.log("Test 3: Cache is expired")
const expiredCache: CacheEntry = {
    data: POSITIVE_ASSETS,
    timestamp: Date.now() - 15000 // 15s ago
}
const result3 = shouldLoadFromCache(expiredCache)
if (result3 === false) {
    console.log("✅ PASS: Ignored expired cache. Will fetch fresh data.\n")
} else {
    console.error("❌ FAIL: Used expired cache! Data might be stale.\n")
}

console.log("=== Test Complete ===")
