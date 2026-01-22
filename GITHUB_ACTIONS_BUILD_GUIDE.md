# 🚀 使用 GitHub Actions 构建 APK

## ✅ 优势
- **完全免费** - GitHub Actions 对公开仓库完全免费
- **可靠稳定** - 标准的 Android 构建环境
- **自动化** - Push 代码自动触发构建
- **易于调试** - 详细的构建日志

## 📋 设置步骤

### 1. 推送代码到 GitHub
```bash
git remote add origin https://github.com/你的用户名/traegaswaetll.git
git push -u origin main
```

### 2. 设置签名密钥（可选，推荐）
在 GitHub 仓库设置中添加以下 Secrets：
- `SIGNING_KEY`: 你的 keystore 文件的 base64 编码
- `ALIAS`: keystore 别名
- `KEY_STORE_PASSWORD`: keystore 密码
- `KEY_PASSWORD`: 密钥密码

获取 base64 编码：
```bash
base64 android/app/release-key.keystore
```

### 3. 触发构建
方式 1：推送代码
```bash
git push
```

方式 2：手动触发
- 在 GitHub 仓库页面
- 点击 "Actions" 标签
- 选择 "Build Android APK"
- 点击 "Run workflow"

### 4. 下载 APK
- 构建完成后，在 Actions 页面
- 点击完成的 workflow
- 下载 "app-release" artifact

## ⚡ 替代方案：不使用签名

如果不需要签名（测试用），修改 workflow 文件，删除签名步骤：

```yaml
# 删除这部分
- name: Sign APK
  uses: r0adkll/sign-android-release@v1
  ...
```

然后上传的就是未签名的 APK。

## 🎯 为什么不用 EAS Build？

EAS Build 主要是为 **Expo 项目** 设计的，对纯 **Capacitor 项目** 支持有限：
- ❌ 依赖安装经常失败
- ❌ 需要复杂的配置
- ❌ 免费版有并发限制
- ✅ GitHub Actions 更适合 Capacitor

## 📝 构建时间

预计 5-10 分钟，比 EAS Build 更快更稳定。

## 🔧 故障排除

如果构建失败，查看 Actions 日志：
1. 点击失败的 workflow
2. 查看具体失败的步骤
3. 根据错误信息调整

常见问题：
- **依赖安装失败** → 检查 package.json
- **Gradle 构建失败** → 检查 android/build.gradle
- **签名失败** → 检查 Secrets 配置是否正确
