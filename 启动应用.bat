@echo off
cd /d "%~dp0"
echo.
echo ========================================
echo   Starting Application
echo ========================================
echo.
echo Starting development server...
echo.
echo Browser will open at: http://localhost:5173/
echo.
echo Press Ctrl+C to stop the server
echo.
echo ========================================
echo.

npm run dev
