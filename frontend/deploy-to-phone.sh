#!/bin/bash
set -e

echo "🔨 Building Angular app..."
npm run build

echo "🔄 Syncing with Capacitor..."
npx cap sync android

echo "📱 Building and installing Android APK..."
cd android
./gradlew installDebug

echo "✅ Done! Check your phone for the MyAniLi app."
echo "   Launch it from your app drawer."
