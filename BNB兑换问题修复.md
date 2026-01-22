# BNB 兑换 RADRS 问题修复

## 🔍 问题诊断

### 错误信息
```
兑换失败！
Unknown signature.

Details: function swapExactETHForTokensSupportingFeeOnTransferTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) payable external
Version: abitype@1.2.3
```

### 问题原因

**ABI 函数签名不兼容 viem**

具体问题：
1. ❌ 使用了 `calldata` 关键字 - viem 的 `parseAbi` 不支持
2. ❌ 使用了 `external` 关键字 - 不需要
3. ❌ 使用了 `uint` - 应该使用 `uint256`（更标准）

---

## ✅ 修复内容

### 修改的 ABI 格式

#### BNB → Token（修复前）
```typescript
❌ 'function swapExactETHForTokensSupportingFeeOnTransferTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) payable external'
```

#### BNB → Token（修复后）
```typescript
✅ 'function swapExactETHForTokensSupportingFeeOnTransferTokens(uint256 amountOutMin, address[] path, address to, uint256 deadline) payable'
```

---

#### Token → BNB（修复前）
```typescript
❌ 'function swapExactTokensForETHSupportingFeeOnTransferTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external'
```

#### Token → BNB（修复后）
```typescript
✅ 'function swapExactTokensForETHSupportingFeeOnTransferTokens(uint256 amountIn, uint256 amountOutMin, address[] path, address to, uint256 deadline)'
```

---

#### Token → Token（修复前）
```typescript
❌ 'function swapExactTokensForTokensSupportingFeeOnTransferTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external'
```

#### Token → Token（修复后）
```typescript
✅ 'function swapExactTokensForTokensSupportingFeeOnTransferTokens(uint256 amountIn, uint256 amountOutMin, address[] path, address to, uint256 deadline)'
```

---

## 🔧 具体修改

### 文件：`src/pages/Swap.tsx`

**修改位置：** 第 286-327 行

**主要改动：**
1. 将 `calldata` 改为省略（viem 会自动处理）
2. 将 `uint` 改为 `uint256`
3. 去掉 `external` 关键字

---

## 🚀 现在测试

### 步骤 1: 停止应用

按 `Ctrl+C` 停止当前运行的应用

### 步骤 2: 重启应用

```bash
npm run dev
```

或双击：`启动应用.bat`

### 步骤 3: 刷新浏览器

按 `Ctrl+R` 或 `F5` 刷新页面

### 步骤 4: 重新测试 BNB → RADRS

**建议测试金额：**
- BNB: 0.0005（小额测试）
- 预期获得：约 4-5 RADRS

**操作：**
1. 选择 BNB → RADRS
2. 输入 0.0005 BNB
3. 点击"兑换"
4. 等待确认

---

## 📊 预期结果

### 成功的情况

#### 控制台日志：
```javascript
[Swap] Using Multi-hop Path: BNB -> USDT -> RADRS
[Swap] Quote: X RADRS
[Swap] Min Out (5% slippage): X
[Swap] Waiting for approve confirmation...
[Swap] Approve confirmed!
[Swap] Swap Transaction Submitted: 0x...
[Swap] Waiting for swap confirmation...
[Swap] Receipt status: success
[Swap] ✅ Swap confirmed successfully!
[Swap] Fetching updated balances...
```

#### 提示消息：
```
兑换成功！

交易已确认，余额即将更新。
```

#### 余额变化：
- BNB 减少约 0.0005
- RADRS 增加约 4-5
- 自动跳转回钱包页面

---

## ⚠️ 注意事项

### 1. 多跳路由

BNB → RADRS 使用多跳路由：
```
BNB → USDT → RADRS
```

**原因：**
- RADRS/BNB 直接池子流动性低
- 通过 USDT 中转流动性更好
- 价格更优，滑点更小

### 2. 交易时间

**预计时间：**
- Approve 交易：5-15 秒
- Swap 交易：10-30 秒
- 总共：15-45 秒

**耐心等待：**
- 不要关闭浏览器
- 不要刷新页面
- 等待提示消息

### 3. Gas 费用

**总 Gas 费用约：**
- Approve: ~0.0002 BNB
- Swap: ~0.0005 BNB
- 总计: ~0.0007 BNB

**确保余额：**
- 兑换金额 + Gas 费 < BNB 余额
- 建议至少保留 0.001 BNB

---

## 🔍 可能的其他错误

### 错误 1: "INSUFFICIENT_OUTPUT_AMOUNT"

**原因：** 滑点设置过低或流动性不足

**解决：**
- 减少兑换金额
- 或等待几分钟后重试

### 错误 2: "insufficient funds"

**原因：** BNB 余额不足（包括 Gas 费）

**解决：**
- 检查 BNB 余额
- 减少兑换金额
- 或充值更多 BNB

### 错误 3: "Transaction timeout"

**原因：** 网络拥堵或 RPC 节点慢

**解决：**
- 等待几分钟后重试
- 检查网络连接
- 或更换时间段

---

## 📝 技术说明

### 为什么会有 "Unknown signature" 错误？

**viem 的 parseAbi 要求：**
1. 函数签名必须是标准的 Solidity 类型
2. 不支持某些修饰符如 `calldata`, `external`
3. 推荐使用完整的类型名如 `uint256` 而不是 `uint`

**PancakeSwap Router V2 ABI：**
```solidity
function swapExactETHForTokensSupportingFeeOnTransferTokens(
    uint amountOutMin,
    address[] calldata path,
    address to,
    uint deadline
) external payable;
```

**viem 兼容格式：**
```typescript
'function swapExactETHForTokensSupportingFeeOnTransferTokens(uint256 amountOutMin, address[] path, address to, uint256 deadline) payable'
```

---

## ✅ 修复验证

### 检查清单

- [ ] 应用已重启
- [ ] 浏览器已刷新
- [ ] BNB 余额充足（> 0.001）
- [ ] 输入了小额测试金额
- [ ] 点击"兑换"
- [ ] 等待 loading
- [ ] 查看控制台日志
- [ ] 是否看到成功提示？
- [ ] 余额是否更新？

---

## 🎯 常见测试场景

### 场景 1: BNB → RADRS（小额）

**输入：** 0.0005 BNB  
**预期输出：** 约 4-5 RADRS  
**Gas 费：** 约 0.0007 BNB  
**所需 BNB：** 至少 0.0015 BNB

### 场景 2: RADRS → BNB（小额）

**输入：** 5 RADRS  
**预期输出：** 约 0.0005 BNB  
**Gas 费：** 约 0.0005 BNB  
**所需 BNB：** 至少 0.001 BNB（Gas）

### 场景 3: RADRS ↔ USDT

**BNB 作为 Gas：**
- 确保有 0.001 BNB 以上
- 用于支付 Approve + Swap Gas

---

## 📞 如果还有问题

### 请提供以下信息：

1. **完整的错误消息**（截图）
2. **控制台所有日志**
   - 按 F12 → Console → 复制全部
3. **当前余额**
   - BNB 余额
   - RADRS 余额
4. **兑换参数**
   - 从什么兑换到什么
   - 输入金额是多少

---

## 🎉 总结

### ✅ 已修复

- BNB → Token ABI 格式
- Token → BNB ABI 格式  
- Token → Token ABI 格式
- "Unknown signature" 错误

### 🚀 现在可以

- BNB → RADRS 兑换
- RADRS → BNB 兑换
- 所有其他代币兑换
- 正常提示和余额更新

### 📝 下一步

1. 重启应用
2. 刷新浏览器
3. 测试 BNB → RADRS
4. 验证成功提示
5. 检查余额更新

---

**修复完成时间：** 2026-01-21  
**修复文件：** `src/pages/Swap.tsx`  
**修复状态：** ✅ 完成  
**测试状态：** ⏳ 等待用户测试
