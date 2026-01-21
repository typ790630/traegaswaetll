# 🔧 Paymaster 修复说明

## 🔴 问题根源

**错误信息**:
```
TypeError: client.sendTransactions is not a function
```

**原因**:
- `permissionless` SDK 的 `smartAccountClient` **没有** `sendTransactions` 方法
- 导致 Paymaster 逻辑无法执行
- 系统回退到"用户自己付费"模式
- 但用户账户没有 BNB，所以交易失败

---

## ✅ 修复方案

### **修改前**（错误）
```typescript
const txHash = await client.sendTransactions({
    transactions: [...]  // ❌ 这个方法不存在
})
```

### **修改后**（正确）
```typescript
// 使用 sendUserOperation + calls 数组
const userOpHash = await client.sendUserOperation({
    calls: [...]  // ✅ 正确的方法
})

// 等待交易确认
const receipt = await client.waitForUserOperationReceipt({ 
    hash: userOpHash 
})

return receipt.receipt.transactionHash
```

---

## 🎯 修复内容

### 1. 修复 `sendToken` 方法 (第228行)
- ✅ 改用 `sendUserOperation` + `calls`
- ✅ 添加交易确认等待
- ✅ 返回实际的交易哈希

### 2. 修复 `swapTokens` 方法 (第311行)
- ✅ 改用 `sendUserOperation` + `calls`
- ✅ 添加交易确认等待
- ✅ 返回实际的交易哈希

---

## 💡 工作原理

### **正确的流程**

```
1. 用户发起转账
   ↓
2. 调用 client.sendUserOperation({ calls: [...] })
   ↓
3. Paymaster middleware 自动介入
   ↓
4. 检查：是否是首次交易？
   - 是 → Paymaster 赞助（免费）✅
   - 否 → 检查 RADRS 余额并扣费 ✅
   ↓
5. Bundler 打包并发送到链上
   ↓
6. 等待确认
   ↓
7. 返回交易哈希 ✅
```

---

## 🔍 Paymaster 逻辑

### **首次交易**
```typescript
// Paymaster 自动检测
if (isActivated(userAddress) === false) {
  // 🎁 完全免费，项目方赞助
  return sponsorTransaction()
}
```

### **后续交易**
```typescript
// 检查 RADRS 余额
const radrsBalance = getUserRadrsBalance(userAddress)
const gasCost = estimateGasCost(transaction)
const radrsCost = gasCost * 10000 // 1 BNB = 10000 RADRS

if (radrsBalance >= radrsCost) {
  // ✅ 用 RADRS 支付
  deductRadrs(userAddress, radrsCost)
  return sponsorTransaction()
} else {
  // ❌ RADRS 不足
  throw new Error('Insufficient RADRS balance')
}
```

---

## 📊 修复前 vs 修复后

| 项目 | 修复前 | 修复后 |
|------|--------|--------|
| **方法** | `sendTransactions` ❌ | `sendUserOperation` ✅ |
| **Paymaster** | 无法工作 ❌ | 正常工作 ✅ |
| **首次交易** | 需要 BNB ❌ | 免费 ✅ |
| **后续交易** | 需要 BNB ❌ | 用 RADRS 支付 ✅ |
| **错误** | TypeError ❌ | 无错误 ✅ |

---

## 🧪 测试步骤

### 1. 等待代码重新加载
- Vite 应该自动热更新
- 或手动刷新页面 (Ctrl + F5)

### 2. 尝试转账
- 发起一笔小额转账 (如 10 RADRS)
- 应该**不需要 BNB**
- Paymaster 应该自动赞助

### 3. 检查控制台
- 应该看到：`Paymaster sponsorship succeeded`
- 不应该有 `sendTransactions is not a function` 错误

### 4. 验证交易
- 交易应该成功
- 钱包余额应该更新
- Activity 列表应该显示新交易

---

## ⚠️ 注意事项

### **Paymaster API 可能的响应**

**成功**:
```json
{
  "paymasterAndData": "0x...",
  "callGasLimit": "0x...",
  "verificationGasLimit": "0x...",
  "preVerificationGas": "0x..."
}
```

**失败**:
```json
{
  "error": "Insufficient RADRS balance",
  "required": "1000",
  "available": "500"
}
```

---

## 🎉 预期效果

修复后：
- ✅ **首次转账**: 完全免费，不需要 BNB
- ✅ **后续转账**: 使用 RADRS 支付 gas
- ✅ **错误消失**: 不再有 `sendTransactions is not a function`
- ✅ **用户体验**: 无需担心 gas 费

---

## 📝 技术细节

### **sendUserOperation vs sendTransaction**

`sendUserOperation`:
- ✅ 支持批量调用 (`calls` 数组)
- ✅ 自动集成 Paymaster
- ✅ 返回 UserOperation 哈希
- ✅ 需要等待 `waitForUserOperationReceipt`

`sendTransaction`:
- ⚠️ 只支持单个调用
- ⚠️ 需要手动处理 Paymaster
- ⚠️ 返回交易哈希

**我们选择 `sendUserOperation`** 因为：
1. 支持批量操作（approve + transfer）
2. Paymaster 自动集成
3. 更符合 ERC-4337 标准

---

**修复完成时间**: 2026年1月20日  
**修复文件**: `src/services/AAService.ts`  
**影响行数**: 第 228-243 行，第 311-318 行
