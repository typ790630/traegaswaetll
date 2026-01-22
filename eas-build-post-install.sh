#!/usr/bin/env bash

# This script runs after EAS Build installs dependencies
set -e

echo "Running post-install hook for Capacitor project..."
echo "Building web assets..."
npm run build

echo "Copying web assets to Android..."
# 直接复制构建的资源，不使用 cap sync
rm -rf android/app/src/main/assets/public
cp -r dist android/app/src/main/assets/public

echo "Build preparation complete!"
