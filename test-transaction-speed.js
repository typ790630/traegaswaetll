
const { createPublicClient, http, formatEther, parseEther, createWalletClient } = require('viem');
const { privateKeyToAccount } = require('viem/accounts');
const { bsc } = require('viem/chains');

// --- CONFIGURATION ---
// REPLACE WITH YOUR TEST WALLET PRIVATE KEY (For Send/Swap tests)
// WARNING: DO NOT COMMIT REAL KEYS TO GIT
const PRIVATE_KEY = process.env.TEST_PRIVATE_KEY || '0x0000000000000000000000000000000000000000000000000000000000000000'; 
const TEST_RECIPIENT = '0x000000000000000000000000000000000000dead';

const RPCS = [
    'https://bsc-dataseed.binance.org/',
    'https://bsc-rpc.publicnode.com',
    'https://rpc.ankr.com/bsc',
    'https://bsc.publicnode.com'
];

async function testRpcSpeed() {
    console.log('--- RPC Speed Test ---');
    for (const rpc of RPCS) {
        const client = createPublicClient({
            chain: bsc,
            transport: http(rpc)
        });
        const start = Date.now();
        try {
            await client.getBlockNumber();
            const end = Date.now();
            console.log(`${rpc}: ${end - start} ms`);
        } catch (e) {
            console.log(`${rpc}: FAILED (${e.message})`);
        }
    }
}

async function testTransactionSpeed() {
    if (PRIVATE_KEY === '0x0000000000000000000000000000000000000000000000000000000000000000') {
        console.log('\n[SKIP] Transaction test skipped. Set PRIVATE_KEY to run.');
        return;
    }

    console.log('\n--- Transaction Speed Test (Simulated) ---');
    const account = privateKeyToAccount(PRIVATE_KEY);
    const client = createPublicClient({
        chain: bsc,
        transport: http(RPCS[0]) // Use first RPC
    });
    const walletClient = createWalletClient({
        account,
        chain: bsc,
        transport: http(RPCS[0])
    });

    try {
        const balance = await client.getBalance({ address: account.address });
        console.log(`Wallet: ${account.address}`);
        console.log(`Balance: ${formatEther(balance)} BNB`);

        if (balance < parseEther('0.002')) {
            console.log('Insufficient balance for test.');
            return;
        }

        console.log('Preparing transaction...');
        const gasPrice = await client.getGasPrice();
        // 120% Gas Price Strategy
        const fastGasPrice = (gasPrice * 120n) / 100n;
        console.log(`Gas Price: ${formatEther(gasPrice)} -> ${formatEther(fastGasPrice)} (Fast)`);

        // Send 0.0001 BNB
        const start = Date.now();
        const hash = await walletClient.sendTransaction({
            to: TEST_RECIPIENT,
            value: parseEther('0.0001'),
            gasPrice: fastGasPrice
        });
        console.log(`Tx Sent: ${hash}`);
        console.log('Waiting for confirmation...');
        
        await client.waitForTransactionReceipt({ hash });
        const end = Date.now();
        console.log(`Confirmed in: ${(end - start) / 1000} seconds`);

    } catch (e) {
        console.error('Transaction failed:', e);
    }
}

async function main() {
    await testRpcSpeed();
    await testTransactionSpeed();
}

main();
