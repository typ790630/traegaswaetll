#!/usr/bin/env bash

# This script runs after EAS Build installs dependencies
set -e

echo "Running post-install hook for Capacitor project..."
echo "Building web assets..."
npm run build

echo "Syncing Capacitor..."
npx cap sync android --no-build

echo "Build preparation complete!"
