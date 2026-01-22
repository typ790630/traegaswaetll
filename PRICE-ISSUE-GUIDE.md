# Custom Token Price Display Issue - Diagnostic Guide

## Problem Fixed

✅ **Code errors fixed:**
- Missing `tokenToDelete` state variable
- Missing `confirmDelete` function  
- Missing imports (`removeToken`, `updateRealtimePrices`)
- Dialog error resolved

✅ **Logic optimized:**
- Individual API requests per token (one failure won't affect others)
- Timeout increased: 8s → 10s
- Added retry logic for rate limits (429) and server errors (5xx)
- Price fetched immediately after adding token (no 60s wait)
- Detailed logging for debugging

## Quick Test

**Run this first:**

```bash
# Double-click to run
quick-test.bat
```

This will test if your network can access the price APIs.

## Expected Results

### ✅ All Success (3/3)

```
SUCCESS ✓ - DexScreener RADRS
SUCCESS ✓ - GeckoTerminal RADRS  
SUCCESS ✓ - Binance BNB
```

→ APIs working normally, prices should display

### ⚠️ Partial Success (1-2/3)

```
FAILED ✗ - DexScreener RADRS
SUCCESS ✓ - GeckoTerminal RADRS
SUCCESS ✓ - Binance BNB
```

→ Backup APIs available, should work

### ❌ All Failed (0/3)

```
FAILED ✗ - DexScreener RADRS (ERR_CONNECTION_CLOSED)
FAILED ✗ - GeckoTerminal RADRS (TIMEOUT)
FAILED ✗ - Binance BNB (ERR_CONNECTION_REFUSED)
```

→ Network restrictions detected, see solutions below

## Solutions

### 1. Change Network ⭐⭐⭐⭐⭐

Try different networks:
- WiFi (home/office)
- 4G/5G mobile data
- VPN (Hong Kong/Singapore)
- Another phone's hotspot

### 2. Change DNS ⭐⭐⭐⭐

On your phone:
1. Settings → WiFi
2. Long press network → Modify
3. Advanced → IP: Static
4. DNS 1: `8.8.8.8`
5. DNS 2: `1.1.1.1`

### 3. Disable Security Software ⭐⭐⭐

Temporarily disable:
- Firewall
- Antivirus
- Phone security apps
- VPN (if it blocks certain domains)

### 4. Use VPN ⭐⭐⭐⭐⭐

Recommended locations:
- Hong Kong
- Singapore
- Japan
- US (California)

### 5. Wait and Retry ⭐⭐

If API rate-limited (HTTP 429):
- Wait 5-10 minutes
- Run test again
- Restart app

## How to Add Token (Updated Flow)

1. Click "Add Token"
2. Enter contract address
3. Click "Search"
4. Click "Add Token"
5. **Wait 10 seconds** (price fetches automatically)
6. If still 0, click refresh button 🔄
7. If still 0, run `quick-test.bat`

## Check Console Logs

Press F12 in browser to open DevTools.

**Normal logs:**
```
[App] Fetching prices...
[PriceService] Fetching price for CustomToken (0x...)
[PriceService] CustomToken Price (DexScreener): $0.0234
[AssetList] Got price for CustomToken: $0.0234
```

**Error logs:**
```
[PriceService] Attempt 1/2 failed: ERR_CONNECTION_CLOSED
[PriceService] Attempt 2/2 failed: ERR_CONNECTION_CLOSED
[AssetList] No price found for CustomToken
```

## Important Notes

**Not all tokens can get prices:**
- Token must be traded on a DEX (PancakeSwap, Uniswap, etc.)
- Token must have liquidity
- Newly launched tokens with no trading may show $0

**This is normal - not a bug!**

## Files Created

| File | Purpose |
|------|---------|
| `quick-test.bat` | Quick API test (recommended) |
| `quick-test.js` | Test script |
| `test-api-simple.bat` | Simple test with error checking |
| `test-api-connection.js` | Detailed test script |
| `PRICE-ISSUE-GUIDE.md` | This guide (English) |
| `价格显示问题诊断.md` | Detailed guide (Chinese) |

## Next Steps

1. Run `quick-test.bat`
2. Check results
3. Try solutions based on results
4. Restart app and wait 10 seconds
5. If still issues, provide test results

---

Last Updated: 2026-01-21
