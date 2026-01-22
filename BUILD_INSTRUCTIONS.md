# 🏗️ APK 构建指南

## ⚠️ GitHub Actions 当前状态

**问题：** GitHub Actions 因账户计费问题被锁定

**错误信息：** "The job was not started because your account is locked due to a billing issue."

---

## 📱 方案 1：本地构建（推荐 - 立即可用）

### ✅ 优点
- ✅ 立即可用，无需等待
- ✅ 不依赖 GitHub 账户
- ✅ 完全免费
- ✅ 已测试成功

### 📋 步骤

#### 前提条件（一次性设置）

1. **安装 Java JDK 17**
   - 下载：https://adoptium.net/temurin/releases/
   - 选择版本：JDK 17 (LTS)
   - 安装后设置环境变量 `JAVA_HOME`

2. **验证环境**
   ```bash
   java -version    # 应显示 17.x.x
   node --version   # 应显示 20.x.x
   ```

#### 构建 APK

**简单方式（推荐）：**

双击运行：`build-apk-local.bat`

**手动方式：**

```bash
# 1. 构建 Web 资源
npm run build

# 2. 同步到 Android
npx cap sync android

# 3. 构建 APK
cd android
gradlew.bat assembleRelease
cd ..
```

#### 📤 获取 APK

构建完成后，APK 位置：
```
android\app\build\outputs\apk\release\app-release-unsigned.apk
```

传输到手机：
1. 通过 USB 连接手机
2. 复制 APK 文件到手机
3. 在手机上安装（需要启用"未知来源"）

---

## 🌐 方案 2：修复 GitHub Actions（用于自动化）

### ⚠️ 需要解决的问题

GitHub Actions 被锁定，需要处理计费问题。

### 🔧 解决步骤

#### 选项 A：将仓库改为公开（推荐）

1. 访问仓库设置：
   ```
   https://github.com/typ790630/traegaswaetll/settings
   ```

2. 滚动到底部 "Danger Zone"

3. 点击 "Change visibility" → "Make public"

4. 公开仓库的 GitHub Actions 是免费的！

#### 选项 B：处理计费问题

1. 访问计费设置：
   ```
   https://github.com/settings/billing
   ```

2. 检查：
   - 是否有未支付的账单
   - Actions 使用额度
   - 付款方式

3. 根据提示处理计费问题

### ✅ 解决后

一旦 GitHub Actions 可用：

1. 推送代码到 GitHub
2. Actions 会自动运行
3. 5-10 分钟后下载 APK

---

## 🎯 推荐流程

### 开发/测试阶段（现在）

**使用本地构建：**
- 运行 `build-apk-local.bat`
- 快速迭代测试

### 发布阶段（将来）

**使用 GitHub Actions：**
- 解决计费问题
- 推送到 GitHub
- 自动构建和签名
- 下载发布版本

---

## ❓ 常见问题

### Q: 本地构建失败，提示 "JAVA_HOME is not set"
A: 需要安装 Java JDK 17 并设置环境变量

### Q: gradlew.bat 找不到
A: 确保先运行 `npx cap sync android`

### Q: APK 无法安装到手机
A: 
1. 确保启用"允许安装未知来源应用"
2. 使用的是未签名版本，仅供测试

### Q: GitHub Actions 什么时候能用？
A: 需要先解决账户计费问题或将仓库改为公开

---

## 📞 技术支持

如有问题，请检查：
1. `diagnose-build.bat` - 本地环境诊断
2. `test-npm-install.bat` - 依赖安装测试
3. GitHub Actions 日志 - 在线构建问题

---

**更新日期：** 2026-01-22
