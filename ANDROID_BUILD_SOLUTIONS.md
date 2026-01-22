# Android APK 构建指南

## 问题总结
EAS Build 持续失败，主要在依赖安装阶段。

## 推荐解决方案

### 方案 1: 使用 GitHub Actions（推荐）
1. 创建 `.github/workflows/android-build.yml`
2. 使用免费的 GitHub Actions 构建
3. 自动构建并上传 APK

### 方案 2: 本地构建（需要安装环境）
需要安装：
- Java JDK 17
- Android SDK (通过 Android Studio)
- Gradle

步骤：
```bash
# 1. 构建 Web 资产
npm run build

# 2. 同步到 Android
npx cap sync android

# 3. 构建 APK
cd android
./gradlew assembleRelease
```

输出位置：`android/app/build/outputs/apk/release/app-release.apk`

### 方案 3: 使用 Expo Application Services (付费)
升级到付费计划可获得：
- 更好的构建环境
- 优先队列
- 更详细的日志

## EAS Build 失败原因分析
1. **依赖问题** - node_modules 或 package.json 配置问题
2. **项目大小** - 上传的项目可能过大（24.8 MB）
3. **Capacitor 兼容性** - EAS 对纯 Capacitor 项目支持有限

## 下一步建议
建议使用 GitHub Actions 自动化构建，这是最可靠且免费的方案。
