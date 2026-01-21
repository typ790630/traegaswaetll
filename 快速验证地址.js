// 快速验证地址是否已修复
const data = localStorage.getItem('app-store')
if (!data) {
  console.log('❌ 没有数据')
} else {
  const store = JSON.parse(data)
  const wallet = store.state?.wallets?.[0]
  console.log('='.repeat(60))
  console.log('📊 当前钱包状态')
  console.log('='.repeat(60))
  console.log('地址:', wallet.address)
  console.log('长度:', wallet.address.length)
  console.log('状态:', wallet.address.length === 42 ? '✅ 正确' : '❌ 错误')
  console.log('='.repeat(60))
}
