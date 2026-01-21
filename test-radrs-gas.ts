
import { createPublicClient, http, formatEther, parseEther } from 'viem'
import { bsc } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'
import { AAService } from './src/services/AAService'
import { RADRS_CONFIG, ERC20_ABI } from './src/config/radrs'
import 'dotenv/config'

// --- Configuration ---
// REPLACE WITH YOUR TEST PRIVATE KEY (Ensure it has some RADRS and USDT/BNB)
// WARNING: DO NOT COMMIT REAL KEYS
const TEST_PRIVATE_KEY = process.env.TEST_PK as `0x${string}` || '0xYOUR_TEST_PRIVATE_KEY_HERE' 

// Addresses
const USDT_ADDRESS = '0x55d398326f99059fF775485246999027B3197955' // BSC USDT
const RECIPIENT_ADDRESS = '0xYourRecipientAddressHere' // Replace with a safe address you own

async function main() {
    if (!TEST_PRIVATE_KEY || TEST_PRIVATE_KEY.includes('YOUR_TEST')) {
        console.error('❌ Please set a valid TEST_PRIVATE_KEY in the script or .env')
        process.exit(1)
    }

    console.log('🚀 Starting RADRS Gas Fee Test Script...')

    // 1. Setup Client & Account
    const signer = privateKeyToAccount(TEST_PRIVATE_KEY)
    const client = await AAService.createClient(signer)
    const aaAddress = client.account.address
    
    const publicClient = createPublicClient({
        chain: bsc,
        transport: http(RADRS_CONFIG.rpcUrl)
    })

    console.log(`\n📋 Test Account Info:`)
    console.log(`- EOA Address: ${signer.address}`)
    console.log(`- AA Address: ${aaAddress}`)

    // 2. Check Initial Balances
    console.log(`\n💰 Checking Initial Balances...`)
    const initialRadrs = await publicClient.readContract({
        address: RADRS_CONFIG.radrsTokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [aaAddress]
    }) as bigint

    const initialBnb = await publicClient.getBalance({ address: aaAddress })

    console.log(`- Initial RADRS: ${formatEther(initialRadrs)}`)
    console.log(`- Initial BNB: ${formatEther(initialBnb)}`)

    if (initialRadrs < parseEther('10')) {
        console.warn('⚠️ Warning: Low RADRS balance. Test might fail if not sponsored fully.')
    }

    // 3. Test 1: ERC20 Transfer (USDT)
    console.log(`\n🧪 Test 1: Sending 0.001 USDT using RADRS for Gas...`)
    
    try {
        const transferAmount = parseEther('0.001') // Small amount
        const txHash = await AAService.sendToken(
            signer,
            USDT_ADDRESS,
            RECIPIENT_ADDRESS.includes('Your') ? aaAddress : RECIPIENT_ADDRESS, // Self-transfer if no recipient set
            transferAmount
        )

        console.log(`✅ Transaction Submitted! Hash: ${txHash}`)
        console.log(`⏳ Waiting for confirmation...`)
        
        const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash })
        console.log(`✅ Transaction Confirmed in block ${receipt.blockNumber}`)

        // 4. Verify Gas Payment
        console.log(`\n🕵️ Verifying Gas Payment...`)
        
        const finalRadrs = await publicClient.readContract({
            address: RADRS_CONFIG.radrsTokenAddress as `0x${string}`,
            abi: ERC20_ABI,
            functionName: 'balanceOf',
            args: [aaAddress]
        }) as bigint

        const finalBnb = await publicClient.getBalance({ address: aaAddress })

        const radrsSpent = initialRadrs - finalRadrs
        const bnbSpent = initialBnb - finalBnb

        console.log(`- Final RADRS: ${formatEther(finalRadrs)}`)
        console.log(`- Final BNB: ${formatEther(finalBnb)}`)
        
        console.log(`\n📊 Gas Analysis:`)
        console.log(`- RADRS Spent: ${formatEther(radrsSpent)}`)
        console.log(`- BNB Spent: ${formatEther(bnbSpent)}`)

        if (bnbSpent === 0n && radrsSpent > 0n) {
            console.log(`\n🎉 SUCCESS: Gas was paid in RADRS! BNB balance is unchanged.`)
        } else if (bnbSpent === 0n && radrsSpent === 0n) {
            console.log(`\n🎉 SUCCESS: Transaction was fully sponsored (Free)!`)
        } else {
            console.log(`\n❌ FAILURE: BNB was spent. Paymaster might not have worked.`)
        }

    } catch (error) {
        console.error(`\n❌ Test Failed:`, error)
    }
}

main()
