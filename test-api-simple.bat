@echo off
cd /d "%~dp0"
echo.
echo ========================================
echo   API Connection Test Tool
echo ========================================
echo.
echo Current Directory: %CD%
echo.
echo Testing API connections...
echo.

if not exist test-api-connection.cjs (
    echo ERROR: test-api-connection.cjs not found!
    echo Please make sure you are in the correct directory.
    pause
    exit /b 1
)

node test-api-connection.cjs

if errorlevel 1 (
    echo.
    echo ERROR: Node.js execution failed!
    echo Please make sure Node.js is installed.
)

echo.
echo Test completed.
echo.
pause
