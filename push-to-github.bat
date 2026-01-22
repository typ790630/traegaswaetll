@echo off
echo.
echo ========================================
echo    推送代码到 GitHub
echo ========================================
echo.

REM 请先在 GitHub 创建仓库，然后替换下面的网址
set REPO_URL=https://github.com/你的用户名/traegaswaetll.git

echo 1. 添加远程仓库...
git remote remove origin 2>nul
git remote add origin %REPO_URL%

echo.
echo 2. 检查当前分支...
git branch

echo.
echo 3. 推送到 GitHub...
git push -u origin HEAD:main

echo.
echo ========================================
echo 完成！现在访问你的 GitHub 仓库查看
echo ========================================
echo.
pause
