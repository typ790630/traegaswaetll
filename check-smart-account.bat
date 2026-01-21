@echo off
chcp 65001 >nul
echo.
echo ╔══════════════════════════════════════════════════════════╗
echo ║         🔍 智能賬戶餘額檢查工具                            ║
echo ╚══════════════════════════════════════════════════════════╝
echo.
echo 此工具會檢查您的智能賬戶 BNB 和 RADRS 餘額
echo.
echo 📝 使用說明：
echo    請準備好您的私鑰（從錢包應用中導出）
echo.
set /p PRIVATE_KEY="請輸入您的私鑰（0x開頭）: "
echo.
echo 正在檢查餘額...
echo.

node check-smart-account-balance.js %PRIVATE_KEY%

echo.
echo ════════════════════════════════════════════════════════════
echo.
pause
