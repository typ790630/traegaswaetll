# 🔍 真实 EOA 钱包全面检查报告

**检查时间：** 2026-01-21  
**环境：** 真实环境 / 手机端应用  
**钱包类型：** EOA（非 AA 智能账户）

---

## ✅ 总体评估

### 🎯 当前状态：**基本可用，但存在架构混乱问题**

**好消息：**
- ✅ 核心功能已切换为 EOA 模式
- ✅ 转账（Send）已改为标准 EOA 交易
- ✅ 兑换（Swap）已改为标准 EOA 交易
- ✅ 余额查询使用正确的 EOA 地址
- ✅ 收款地址使用正确的 EOA 地址

**坏消息：**
- ❌ **存在 AA/EOA 混合架构**，代码不统一
- ⚠️ **推荐系统仍使用 AA Service**（可能失败）
- ⚠️ **配置文件有冲突**（GAS_TOKEN_SYMBOL 仍为 RADRS）
- ⚠️ **未清理的 AA 相关代码**可能引起混淆
- ⚠️ **Send.tsx 中仍导入 AAService**（虽未使用）

---

## 📋 详细检查结果

### 1️⃣ **钱包地址配置** ⚠️

**文件：** `src/store/useAppStore.ts`

```typescript
export interface Wallet {
  id: string
  name: string
  address: string        // ✅ 现在存储 EOA 地址
  // eoaAddress 已移除   // ✅ 正确
  totalBalance?: string
  mnemonic?: string
}
```

**状态：** ✅ **正确** - 所有 wallet.address 现在是 EOA 地址

**问题：**
- ⚠️ 仍有 `deriveAAAddress()` 函数存在（第 154 行），但未被使用
- ⚠️ 注释中提到 "AA Address"，可能引起误解

---

### 2️⃣ **转账功能 (Send.tsx)** ⚠️

**文件：** `src/pages/Send.tsx`

**实现方式：** ✅ 标准 EOA 交易（使用 wallet client）

**优点：**
- ✅ 使用 `createWalletClient` 进行标准交易
- ✅ 使用 BNB 支付 gas（不再依赖 Paymaster）
- ✅ 支持 ERC20 和原生币转账
- ✅ 动态 gas price 优化（+10%）

**问题：**
- ❌ **仍导入 AAService**（第 13 行）但未使用 → **应删除**
- ❌ **仍导入 toSimpleSmartAccount**（第 17 行）但未使用 → **应删除**
- ⚠️ UI 显示 "~ 0.0001 BNB" gas 费，但实际 gas 可能不同
- ⚠️ 没有真实的 BNB 余额检查（`hasEnoughGas = true`）

**代码片段：**
```typescript
// ❌ 问题：未使用的导入
import { AAService } from "../services/AAService"
import { toSimpleSmartAccount } from "permissionless/accounts"

// ✅ 正确：EOA 模式
const walletClient = createWalletClient({
    account,
    chain: bsc,
    transport: bscTransport
})
```

---

### 3️⃣ **兑换功能 (Swap.tsx)** ⚠️

**文件：** `src/pages/Swap.tsx`

**实现方式：** ✅ 标准 EOA 交易

**优点：**
- ✅ 使用 PancakeSwap Router
- ✅ 实时报价
- ✅ 5% 滑点保护
- ✅ 标准 approve + swap 流程

**问题：**
- ❌ **仍导入 AAService**（第 15 行）但未使用 → **应删除**
- ⚠️ approve 交易没有等待确认就执行 swap
- ⚠️ 没有处理 approve 失败的情况

---

### 4️⃣ **推荐系统 (Referral)** ❌ **严重问题**

**文件：**
- `src/pages/Referral.tsx`
- `src/services/ReferralService.ts`

**当前状态：** ❌ **仍使用 AA Service**

**问题分析：**

```typescript
// ReferralService.ts 第 54-55 行
const signer = AAService.getSigner(privateKey as `0x${string}`)
const txHash = await AAService.bindReferrer(signer, referrerAddress)
```

**这会导致什么问题：**

1. **架构不一致：**
   - Send/Swap 使用 EOA 交易
   - Referral 使用 AA 交易
   - 用户会混淆

2. **AA21 错误风险：**
   - 如果用户的智能账户没有 BNB prefund
   - 绑定推荐人/领取奖励会失败
   - 错误信息：`AA21 didn't pay prefund`

3. **地址混乱：**
   - 推荐系统使用 `identityAddress`（EOA）
   - 但交易通过 AA 智能账户发送
   - 链上记录的地址不一致

**修复建议：** 🔧
- 将 `ReferralService.bindReferrer()` 改为 EOA 交易
- 将 `ReferralService.claimReward()` 改为 EOA 交易
- 或者明确告知用户需要先充值智能账户

---

### 5️⃣ **Gas 费配置** ⚠️ **混乱**

**文件：** `src/config/fees.ts`

```typescript
export const FEES = {
  SEND_RADRS: 0.001,  // ⚠️ 已不再使用 RADRS 支付 gas
  SWAP_RADRS: 0.002,  // ⚠️ 已不再使用 RADRS 支付 gas
}

export const GAS_TOKEN_SYMBOL = 'RADRS'  // ❌ 错误：现在用 BNB 支付 gas
```

**问题：**
- ❌ **配置文件与实际不符**
- ❌ **GAS_TOKEN_SYMBOL 应该是 'BNB'**
- ⚠️ UI 可能显示错误的 gas 代币

**影响范围：**
- `Referral.tsx` 第 34 行：使用 `GAS_TOKEN_SYMBOL` 查找资产
- 可能导致显示错误的余额要求

---

### 6️⃣ **余额查询** ✅

**文件：**
- `src/store/useAppStore.ts` - `fetchRealBalances()`
- `src/services/ChainService.ts`

**实现方式：** ✅ 正确

```typescript
// useAppStore.ts 第 259 行
const targetAddress = wallet.address  // ✅ 使用 EOA 地址
```

**状态：** ✅ **完全正确** - 所有余额查询都使用 EOA 地址

---

### 7️⃣ **收款功能 (Receive.tsx)** ✅

**文件：** `src/pages/Receive.tsx`

**实现方式：** ✅ 正确

**检查项：**
- ✅ QR 码显示 `wallet.address`（EOA）
- ✅ 地址文本显示 `wallet.address`（EOA）
- ✅ 复制功能复制 `wallet.address`（EOA）
- ✅ 实时监听转账事件

---

### 8️⃣ **活动历史 (Activity)** ✅

**文件：** `src/pages/Activity.tsx`

**实现方式：** ✅ 使用 EOA 地址查询

**状态：** ✅ 正确

---

### 9️⃣ **依赖包** ⚠️

**文件：** `package.json`

```json
{
  "permissionless": "^0.3.2",  // ⚠️ AA 相关包，仍在依赖中
}
```

**问题：**
- ⚠️ `permissionless` 包只用于 AA，但仍在项目中
- 如果完全切换到 EOA，可以移除此依赖

---

## 🚨 **关键问题总结**

### ❌ 高优先级问题（必须修复）

1. **推荐系统使用 AA Service**
   - **影响：** 绑定推荐人/领取奖励可能失败
   - **错误：** `AA21 didn't pay prefund`
   - **修复：** 改为 EOA 交易

2. **GAS_TOKEN_SYMBOL 配置错误**
   - **影响：** UI 显示错误的 gas 代币
   - **当前：** `'RADRS'`
   - **应为：** `'BNB'`

3. **Send.tsx 导入未使用的 AA 模块**
   - **影响：** 代码混乱，可能误用
   - **修复：** 删除 AAService 和 toSimpleSmartAccount 导入

### ⚠️ 中优先级问题（建议修复）

4. **未清理的 AA 相关代码**
   - `deriveAAAddress()` 函数（未使用）
   - AAService 相关导入（Swap.tsx）

5. **Gas 费估算不准确**
   - Send 显示固定 "~ 0.0001 BNB"
   - Swap 没有显示预估 gas
   - 建议：动态估算 gas 费用

6. **BNB 余额检查缺失**
   - `hasEnoughGas = true`（固定值）
   - 应检查实际 BNB 余额是否足够

### 💡 低优先级问题（可选优化）

7. **Swap 交易流程优化**
   - approve 应等待确认
   - 添加错误处理

8. **依赖包清理**
   - 考虑移除 `permissionless` 包

---

## 📊 **兼容性矩阵**

| 功能 | EOA 模式 | AA 模式 | 当前状态 | 问题 |
|------|---------|---------|---------|------|
| **创建钱包** | ✅ | ❌ | ✅ EOA | 无 |
| **导入钱包** | ✅ | ❌ | ✅ EOA | 无 |
| **查询余额** | ✅ | ❌ | ✅ EOA | 无 |
| **转账 (Send)** | ✅ | ❌ | ✅ EOA | ⚠️ 未清理 AA 导入 |
| **收款 (Receive)** | ✅ | ❌ | ✅ EOA | 无 |
| **兑换 (Swap)** | ✅ | ❌ | ✅ EOA | ⚠️ 未清理 AA 导入 |
| **推荐系统** | ✅ | ✅ | ❌ **AA** | ❌ **仍使用 AA** |
| **活动历史** | ✅ | ❌ | ✅ EOA | 无 |

---

## 🔧 **推荐修复优先级**

### 🔴 P0 - 立即修复（影响核心功能）

1. **修复推荐系统使用 AA 的问题**
   - 改为 EOA 交易
   - 或明确提示用户

2. **修复 GAS_TOKEN_SYMBOL 配置**
   - 改为 `'BNB'`

### 🟡 P1 - 尽快修复（代码质量）

3. **清理未使用的 AA 导入**
   - Send.tsx
   - Swap.tsx

4. **添加真实的 BNB 余额检查**

### 🟢 P2 - 后续优化（用户体验）

5. **动态 gas 费估算**
6. **Swap 交易流程优化**
7. **清理 deriveAAAddress 等未使用函数**

---

## 🎯 **手机端使用建议**

### ✅ 可以安全使用的功能：

1. **创建/导入钱包** - 完全可用
2. **查询余额** - 完全可用
3. **转账 (Send)** - 可用（需要 BNB 支付 gas）
4. **收款 (Receive)** - 完全可用
5. **兑换 (Swap)** - 可用（需要 BNB 支付 gas）
6. **活动历史** - 完全可用

### ⚠️ 可能有问题的功能：

1. **绑定推荐人** - ❌ 可能失败（AA21 错误）
2. **领取推荐奖励** - ❌ 可能失败（AA21 错误）

### 📝 用户注意事项：

1. **必须有 BNB 余额**
   - 用于支付 gas 费
   - 建议至少保留 0.01 BNB

2. **推荐功能可能失败**
   - 如果失败，错误信息会提示 "AA21"
   - 这是已知问题，等待修复

3. **Gas 费显示可能不准确**
   - UI 显示的 gas 费是估算值
   - 实际费用可能略有不同

---

## 📚 **技术债务清单**

1. ❌ **架构混乱** - EOA/AA 混合使用
2. ❌ **推荐系统 AA 依赖**
3. ❌ **Gas 配置错误**
4. ⚠️ **未清理的 AA 代码**
5. ⚠️ **Gas 估算不准确**
6. ⚠️ **BNB 余额检查缺失**

---

## 📞 **后续行动建议**

### 立即行动：

1. 确认是否要完全切换到 EOA 模式
2. 如果是，按 P0 优先级修复关键问题
3. 测试推荐功能，记录失败案例

### 待讨论：

1. 是否要保留 AA 功能作为高级选项？
2. 是否要支持 Paymaster（RADRS 支付 gas）？
3. 如何处理已有的 AA 智能账户用户？

---

## ✅ **检查完成**

**总体评估：** 📊 **60/100 分**

- ✅ 核心功能可用（Send, Swap, Receive, Balance）
- ❌ 推荐功能有问题
- ⚠️ 代码质量需要改进
- ⚠️ 配置不一致

**建议：** 先修复 P0 问题，确保手机端核心流程稳定，然后逐步优化代码质量。
