@echo off
chcp 65001 >nul
echo ======================================
echo 本地构建 Android APK
echo ======================================
echo.

echo [1/5] 清理旧的构建...
if exist dist rmdir /s /q dist
echo ✅ 清理完成
echo.

echo [2/5] 构建 Web 资源...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Web 构建失败
    pause
    exit /b 1
)
echo ✅ Web 构建成功
echo.

echo [3/5] 同步 Capacitor...
call npx cap sync android
if %errorlevel% neq 0 (
    echo ❌ Capacitor 同步失败
    pause
    exit /b 1
)
echo ✅ Capacitor 同步成功
echo.

echo [4/5] 构建 Android APK...
echo 正在编译 APK（需要 2-5 分钟）...
cd android
call gradlew.bat assembleRelease
if %errorlevel% neq 0 (
    echo ❌ APK 构建失败
    cd ..
    pause
    exit /b 1
)
cd ..
echo ✅ APK 构建成功！
echo.

echo [5/5] APK 位置：
echo.
echo 📱 未签名 APK：
echo    android\app\build\outputs\apk\release\app-release-unsigned.apk
echo.
echo ✅ 您可以将此 APK 传输到手机进行测试！
echo.
echo 注意：这是未签名的 APK，适合测试。
echo       如需正式发布，请使用签名版本。
echo.
echo ======================================
echo 🎉 构建完成！
echo ======================================
pause
