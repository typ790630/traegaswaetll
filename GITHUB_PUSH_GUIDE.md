# 🚀 推送到 GitHub 并启动自动构建

## 第一步：创建 GitHub 仓库

1. 访问：https://github.com/new
2. 填写信息：
   - Repository name: `traegaswaetll`
   - Description: `Cryptocurrency Wallet App`
   - 选择 **Public**（公开才能免费使用 Actions）
   - **不要**勾选任何初始化选项
3. 点击 "Create repository"

## 第二步：推送代码

### 方式 1：使用脚本（推荐）
1. 打开 `push-to-github.bat`
2. 修改第 8 行的仓库地址为你的地址，例如：
   ```
   set REPO_URL=https://github.com/typ7906301/traegaswaetll.git
   ```
3. 保存并双击运行

### 方式 2：手动命令
```bash
# 1. 添加远程仓库（替换为你的地址）
git remote add origin https://github.com/你的用户名/traegaswaetll.git

# 2. 推送代码
git push -u origin HEAD:main
```

## 第三步：查看构建进度

1. 访问你的仓库：`https://github.com/你的用户名/traegaswaetll`
2. 点击顶部的 **"Actions"** 标签
3. 你会看到 "Build Android APK" 工作流正在运行
4. 点击可以查看详细日志

## 第四步：下载 APK

构建完成后（约 5-10 分钟）：
1. 在 Actions 页面找到成功的构建（绿色✓）
2. 点击进入详情页
3. 滚动到底部 **"Artifacts"** 部分
4. 下载 `app-release` 文件
5. 解压即可得到 APK

## 📱 测试 APK

下载的 APK 可以直接安装到 Android 设备：
1. 传输到手机
2. 允许安装未知来源应用
3. 安装并测试

## 🔧 常见问题

### Q: 推送代码时要求登录？
**A**: 使用 Personal Access Token（个人访问令牌）：
1. 访问：https://github.com/settings/tokens
2. 点击 "Generate new token (classic)"
3. 选择权限：`repo`
4. 生成后复制令牌
5. 推送时用令牌代替密码

### Q: 构建失败了怎么办？
**A**: 
1. 点击失败的构建查看日志
2. 找到错误信息
3. 根据错误调整配置

### Q: 需要签名吗？
**A**: 
- **测试用**：不需要，GitHub Actions 会生成未签名的 APK
- **发布用**：需要配置签名密钥（见 GITHUB_ACTIONS_BUILD_GUIDE.md）

## 📊 预期结果

✅ 推送成功  
✅ 自动触发构建  
✅ 5-10 分钟后完成  
✅ 下载 APK（约 50-80 MB）  
✅ 可直接安装测试  

## 🎯 重要提示

- 仓库**必须是 Public**才能免费使用 GitHub Actions
- 每次推送到 main 分支都会自动构建
- 也可以手动触发：Actions → Build Android APK → Run workflow

## 📞 需要帮助？

如果遇到问题，查看：
- GitHub Actions 日志
- 本项目的 GITHUB_ACTIONS_BUILD_GUIDE.md
- GitHub Actions 文档：https://docs.github.com/actions
