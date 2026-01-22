@echo off
echo ===================================================
echo RPC Speed Test Tool
echo ===================================================
echo Testing connection speed to BSC RPC nodes...
echo.

set "RPC1=https://bsc-dataseed.binance.org/"
set "RPC2=https://bsc-rpc.publicnode.com"
set "RPC3=https://rpc.ankr.com/bsc"
set "RPC4=https://bsc.publicnode.com"

echo [1/4] Testing Binance Official (%RPC1%)...
powershell -Command "$start = Get-Date; try { Invoke-WebRequest -Uri '%RPC1%' -Method POST -Body '{\"jsonrpc\":\"2.0\",\"method\":\"eth_blockNumber\",\"params\":[],\"id\":1}' -ContentType 'application/json' -TimeoutSec 5 | Out-Null; $end = Get-Date; $ms = ($end - $start).TotalMilliseconds; Write-Host \"Success: $($ms.ToString('0')) ms\" -ForegroundColor Green } catch { Write-Host \"Failed: $_\" -ForegroundColor Red }"

echo.
echo [2/4] Testing PublicNode RPC (%RPC2%)...
powershell -Command "$start = Get-Date; try { Invoke-WebRequest -Uri '%RPC2%' -Method POST -Body '{\"jsonrpc\":\"2.0\",\"method\":\"eth_blockNumber\",\"params\":[],\"id\":1}' -ContentType 'application/json' -TimeoutSec 5 | Out-Null; $end = Get-Date; $ms = ($end - $start).TotalMilliseconds; Write-Host \"Success: $($ms.ToString('0')) ms\" -ForegroundColor Green } catch { Write-Host \"Failed: $_\" -ForegroundColor Red }"

echo.
echo [3/4] Testing Ankr (%RPC3%)...
powershell -Command "$start = Get-Date; try { Invoke-WebRequest -Uri '%RPC3%' -Method POST -Body '{\"jsonrpc\":\"2.0\",\"method\":\"eth_blockNumber\",\"params\":[],\"id\":1}' -ContentType 'application/json' -TimeoutSec 5 | Out-Null; $end = Get-Date; $ms = ($end - $start).TotalMilliseconds; Write-Host \"Success: $($ms.ToString('0')) ms\" -ForegroundColor Green } catch { Write-Host \"Failed: $_\" -ForegroundColor Red }"

echo.
echo [4/4] Testing PublicNode Backup (%RPC4%)...
powershell -Command "$start = Get-Date; try { Invoke-WebRequest -Uri '%RPC4%' -Method POST -Body '{\"jsonrpc\":\"2.0\",\"method\":\"eth_blockNumber\",\"params\":[],\"id\":1}' -ContentType 'application/json' -TimeoutSec 5 | Out-Null; $end = Get-Date; $ms = ($end - $start).TotalMilliseconds; Write-Host \"Success: $($ms.ToString('0')) ms\" -ForegroundColor Green } catch { Write-Host \"Failed: $_\" -ForegroundColor Red }"

echo.
echo ===================================================
echo Test Complete.
echo Recommended Order: Lowest latency first.
echo Current App Config Order:
echo 1. Binance Official (Usually fastest)
echo 2. PublicNode RPC
echo 3. Ankr
echo 4. PublicNode Backup
echo ===================================================
pause
