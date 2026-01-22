/**
 * 检查钱包地址是否匹配
 */

const { generateMnemonic, mnemonicToSeedSync } = require('@scure/bip39')
const { HDKey } = require('@scure/bip32')
const { privateKeyToAccount } = require('viem/accounts')
const { createPublicClient, http, formatEther } = require('viem')
const { bsc } = require('viem/chains')

// 默认助记词
const MNEMONIC = 'witch collapse practice feed shame open despair creek road again ice least'
const EXPECTED_ADDRESS = '0x739Ee5E0CD7Ee3EfEAe2796E9C4dC5b2916Cd9f1'

console.log('========================================')
console.log('  🔍 检查钱包地址和余额')
console.log('========================================\n')

// 1. 从助记词派生
console.log('1️⃣ 从助记词派生地址和私钥...')
const seed = mnemonicToSeedSync(MNEMONIC)
const hdkey = HDKey.fromMasterSeed(seed)
const path = `m/44'/60'/0'/0/0` // ETH standard path
const derivedKey = hdkey.derive(path)
// Node.js 环境可以用 Buffer
const privateKey = `0x${Buffer.from(derivedKey.privateKey).toString('hex')}`
const account = privateKeyToAccount(privateKey)

console.log(`   助记词: ${MNEMONIC}`)
console.log(`   派生地址: ${account.address}`)
console.log(`   预期地址: ${EXPECTED_ADDRESS}`)
console.log(`   是否匹配: ${account.address.toLowerCase() === EXPECTED_ADDRESS.toLowerCase() ? '✅ YES' : '❌ NO'}`)
console.log(`   私钥: ${privateKey.substring(0, 10)}...${privateKey.substring(60)}`)
console.log()

// 2. 检查链上余额
console.log('2️⃣ 检查链上 BNB 余额...')
const publicClient = createPublicClient({
    chain: bsc,
    transport: http('https://bsc-rpc.publicnode.com')
})

async function checkBalance() {
    try {
        const balanceWei = await publicClient.getBalance({ address: account.address })
        const balance = parseFloat(formatEther(balanceWei))
        
        console.log(`   地址: ${account.address}`)
        console.log(`   BNB 余额: ${balance.toFixed(6)} BNB`)
        
        if (balance > 0) {
            console.log(`   ✅ 余额正常，可以进行交易`)
        } else {
            console.log(`   ❌ 余额为 0，需要充值`)
        }
    } catch (error) {
        console.error(`   ❌ 查询失败:`, error.message)
    }
    
    console.log()
    console.log('========================================')
    console.log('  ✅ 检查完成')
    console.log('========================================')
}

checkBalance()
