
import { AAService } from './src/services/AAService'
import { parseEther } from 'viem'

// --- Mock Setup ---
console.log('🧪 Starting RADRS Gas Logic Mock Test...')

// Valid Mock Addresses (checksummed)
const MOCK_ROUTER = '0x10ED43C718714eb63d5aA57B78B54704E256024E' // Pancake Router
const MOCK_TOKEN_IN = '0x55d398326f99059fF775485246999027B3197955' // USDT
const MOCK_TOKEN_OUT = '0xe2188a2e0a41a50f09359e5fe714d5e643036f2a' // RADRS
const MOCK_SIGNER = '0x0000000000000000000000000000000000000001' // Dummy EOA
const MOCK_RECIPIENT = '0x0000000000000000000000000000000000000002'

// Track calls
const calls: string[] = []

// Monkey-patch AAService.createClient
AAService.createClient = async (signer: any) => {
    return {
        account: { address: '0x00000000000000000000000000000000000000AA' },
        sendTransaction: async ({ to, data, value }: any) => {
            let action = 'Unknown'
            if (data.includes('095ea7b3')) action = 'Approve'
            if (data.includes('a9059cbb')) action = 'Transfer'
            
            console.log(`   [MockClient] Sending Transaction: ${action} to ${to}`)
            calls.push(action)
            return '0xMockTxHash'
        },
        sendTransactions: async ({ transactions }: any) => {
            console.log(`   [MockClient] Sending Batch Transaction (${transactions.length} ops)`)
            // Verify content of batch
            transactions.forEach((tx: any, i: number) => {
                let action = 'Unknown'
                if (tx.data.includes('095ea7b3')) action = 'Approve'
                if (tx.data.includes('38ed1739')) action = 'Swap' // swapExactTokensForTokens selector
                console.log(`     Op ${i+1}: ${action} -> ${tx.to}`)
            })
            
            calls.push('BatchSwap')
            return '0xMockTxHash'
        }
    } as any
}

async function testSwap() {
    console.log('\n🔄 Testing Swap Logic (Batch Approve + Swap)...')
    calls.length = 0 
    
    await AAService.swapTokens(
        MOCK_SIGNER,
        MOCK_ROUTER,
        MOCK_TOKEN_IN,
        MOCK_TOKEN_OUT,
        parseEther('1'),
        parseEther('0.9'),
        1234567890n
    )

    if (calls.includes('BatchSwap')) {
        console.log('✅ Swap logic correctly calls batch transaction')
    } else {
        console.error('❌ Swap logic failed to call batch transaction')
    }
}

async function testTransfer() {
    console.log('\n💸 Testing Transfer Logic...')
    calls.length = 0
    
    // Will warn about allowance check failing (expected), then send transfer
    await AAService.sendToken(
        MOCK_SIGNER,
        MOCK_TOKEN_IN,
        MOCK_RECIPIENT,
        parseEther('1')
    )

    if (calls.includes('Transfer')) {
        console.log('✅ Transfer logic sent transaction (Fallthrough worked)')
    } else {
        console.error('❌ Transfer logic failed to send transaction')
    }
}

async function run() {
    try {
        await testSwap()
        await testTransfer()
        console.log('\n🎉 Mock Logic Tests Completed!')
    } catch (e) {
        console.error('Test crashed:', e)
    }
}

run()
