@echo off
cd /d "%~dp0"
chcp 65001 >nul
echo.
echo ========================================
echo   API Connection Test
echo ========================================
echo.
echo Testing API connections...
echo.

node "%~dp0test-api-connection.cjs"

echo.
pause
