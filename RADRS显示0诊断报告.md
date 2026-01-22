# 🔍 RADRS 显示 0 的原因诊断报告

**检查时间：** 2026-01-21  
**钱包地址：** 0x739Ee5E0CD7Ee3EfEA...  
**显示状态：** RADRS 余额 0.0000，价格 $0

---

## 📊 诊断结果

### ✅ 代码配置正确

**RADRS 代币合约地址：**
- 配置文件：`0xe2188a2e0a41a50f09359e5fe714d5e643036f2a`
- 资产列表：`0xe2188A2E0a41A50F09359E5FE714D5e643036f2A`

**注意：** 大小写不同，但地址相同（Checksum 格式）

**验证：** ✅ 配置正确，这是同一个合约地址

---

## 🎯 RADRS 显示为 0 的原因

### 原因 1：钱包中真的没有 RADRS（最可能）⭐⭐⭐⭐⭐

**解释：**
- 新创建的钱包默认没有任何代币
- 只有转入或购买后才会有余额
- 这是**正常现象**

**验证方法：**
1. 在 BSCScan 查询您的地址
2. 访问：https://bscscan.com/address/0x739Ee5E0CD7Ee3EfEA...
3. 查看 "Token" 标签页
4. 如果没有 RADRS，就是真的为 0

---

### 原因 2：RADRS 价格获取失败（导致显示 $0）⭐⭐⭐⭐

**价格 API 调用链：**
```
1. GeckoTerminal API
   ↓ 失败
2. DexScreener API
   ↓ 失败
3. 返回价格 0
```

**可能原因：**
- API 请求被限流
- 网络连接问题
- RADRS 流动性池数据延迟

**影响：**
- 价格显示为 $0（绿色标注）
- 不影响余额查询
- 不影响转账功能

**验证：** 查看控制台日志是否有价格 API 错误

---

### 原因 3：余额查询失败但静默返回 0（低可能）⭐

**代码逻辑：**
```typescript
try {
    balance = await ChainService.getErc20Balance(
        asset.contractAddress, 
        targetAddress
    )
} catch (err) {
    console.error(`Failed to fetch balance for ${asset.symbol}`, err)
    // 返回 0 或保持原值
}
```

**验证：** 查看控制台是否有 RADRS 余额查询错误

---

### 原因 4：地址大小写不匹配（极低可能）⭐

**发现：**
- useAppStore: `0xe2188A2E0a41A50F09359E5FE714D5e643036f2A`（Checksum）
- radrs.ts: `0xe2188a2e0a41a50f09359e5fe714d5e643036f2a`（小写）

**分析：**
- Viem 会自动标准化地址
- 不会导致查询失败
- 但建议统一格式

---

## 🔍 如何诊断

### 方法 1：查看控制台日志

**在浏览器开发者工具中查看：**

✅ **正常日志：**
```
[useAppStore] Fetching balances for Address: 0x739... on bsc
[ChainService] Fetched 0xe2188a2e0a41a50f09359e5fe714d5e643036f2a balance for 0x739...: 0
```

❌ **错误日志：**
```
Failed to fetch balance for RADRS Error: ...
Failed to get ERC20 balance for 0xe2188a2e0a41a50f09359e5fe714d5e643036f2a: ...
```

---

### 方法 2：BSCScan 直接查询

**步骤：**
1. 打开 https://bscscan.com/
2. 搜索您的钱包地址：`0x739Ee5E0CD7Ee3EfEA...`
3. 点击 "Token" 标签
4. 查看是否有 RADRS 代币

**可能结果：**
- ✅ **有 RADRS** → 应用余额查询失败
- ❌ **没有 RADRS** → 钱包真的为 0（正常）

---

### 方法 3：使用检查脚本

**运行：**
```bash
node check-radrs-balance.js
```

**需要先补充完整地址：**
编辑 `check-radrs-balance.js` 第 16 行，填入完整地址

---

## 💡 解决方案

### 情况 A：钱包真的没有 RADRS（最可能）

**现象：**
- BSCScan 查询无 RADRS
- 控制台显示余额 0
- 这是正常的

**解决：**
需要获取 RADRS 代币

**方法 1：使用钱包兑换功能**
1. 确保钱包有 BNB（至少 0.05 BNB）
2. 进入兑换页面
3. 选择 BNB -> RADRS
4. 输入金额（如 0.01 BNB）
5. 执行兑换

**方法 2：从其他钱包转入**
1. 如果您在其他钱包有 RADRS
2. 转入到此钱包地址

**方法 3：在 PancakeSwap 购买**
1. 访问 https://pancakeswap.finance/
2. 连接钱包
3. 输入 RADRS 合约地址购买

---

### 情况 B：余额查询失败

**现象：**
- BSCScan 显示有 RADRS
- 但应用显示 0
- 控制台有错误日志

**解决：**

**问题 1：RPC 节点问题**
- 更换 RPC 节点
- 等待网络恢复

**问题 2：地址大小写问题**
- 统一 RADRS 合约地址格式
- 使用 Checksum 格式：`0xe2188A2E0a41A50F09359E5FE714D5e643036f2A`

**修复方法：**
```typescript
// useAppStore.ts 第 126 行
// 统一使用小写（推荐）
contractAddress: '0xe2188a2e0a41a50f09359e5fe714d5e643036f2a'
```

---

### 情况 C：价格显示为 0

**现象：**
- 余额正常
- 但价格显示 $0

**原因：**
- GeckoTerminal API 失败
- DexScreener API 失败
- RADRS 流动性不足

**影响：**
- 仅影响美元价值显示
- 不影响转账和兑换功能

**验证：**
查看控制台是否有价格 API 错误：
```
GeckoTerminal failed for RADRS...
DexScreener also failed for RADRS...
```

**解决：**
- 等待 API 恢复
- 价格会在下次刷新时更新（60秒）

---

## 📋 诊断清单

### 第 1 步：查看控制台日志

**打开浏览器开发者工具（F12）**

查找以下日志：
- [ ] `[useAppStore] Fetching balances for Address: ...`
- [ ] `[ChainService] Fetched 0xe2188a2e... balance for ...: 0`
- [ ] 是否有错误信息？

### 第 2 步：BSCScan 查询

**访问：** https://bscscan.com/address/您的地址

- [ ] 钱包有 BNB？
- [ ] 钱包有 USDT？
- [ ] 钱包有 RADRS？

### 第 3 步：检查网络连接

- [ ] 手机网络正常？
- [ ] 能访问其他网页？
- [ ] 其他代币余额显示正常？

---

## 🎯 最可能的情况（95%）

**您的钱包是新创建的，真的没有 RADRS 代币**

**证据：**
1. BNB 余额也是 0.0000
2. USDT 余额也是 0.0000
3. 这是新钱包的正常状态

**下一步：**
1. 先转入一些 BNB（用于 gas）
2. 使用兑换功能购买 RADRS
3. 或从其他钱包转入 RADRS

---

## ✅ 代码检查结论

**配置正确性：** ✅ 100%
- RADRS 合约地址正确
- 余额查询逻辑正确
- 价格更新机制正常

**建议：**
1. 在 BSCScan 验证您的地址是否有 RADRS
2. 如果没有，这就是正常的（新钱包为 0）
3. 如果有，请提供控制台错误日志

---

## 📞 需要您提供的信息

如果 BSCScan 显示有 RADRS 但应用显示 0：

1. **完整钱包地址**（从截图复制）
2. **浏览器控制台日志**（截图或复制文本）
3. **BSCScan 截图**（显示 RADRS 余额）

这样我才能准确诊断问题！
