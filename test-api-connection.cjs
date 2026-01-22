// Test DexScreener API Connection - CommonJS version
// Usage: node test-api-connection.cjs

const https = require('https');
const http = require('http');

// Token addresses for testing
const RADRS_ADDRESS = '0xe2188a2e0a41a50f09359e5fe714d5e643036f2a';

// APIs to test
const APIs = [
    {
        name: 'DexScreener RADRS',
        url: `https://api.dexscreener.com/latest/dex/tokens/${RADRS_ADDRESS}`
    },
    {
        name: 'GeckoTerminal RADRS',
        url: `https://api.geckoterminal.com/api/v2/networks/bsc/tokens/${RADRS_ADDRESS}`
    },
    {
        name: 'Binance BNB Price',
        url: 'https://data-api.binance.vision/api/v3/ticker/price?symbol=BNBUSDT'
    }
];

function testAPI(config) {
    return new Promise((resolve) => {
        const startTime = Date.now();
        const url = new URL(config.url);
        const client = url.protocol === 'https:' ? https : http;

        const options = {
            hostname: url.hostname,
            path: url.pathname + url.search,
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0'
            },
            timeout: 10000
        };

        console.log(`\n[Test] ${config.name}`);
        console.log(`[URL] ${config.url}`);

        const req = client.request(options, (res) => {
            const duration = Date.now() - startTime;
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                console.log(`[Status] ${res.statusCode} (${duration}ms)`);
                
                if (res.statusCode === 200) {
                    try {
                        const json = JSON.parse(data);
                        console.log(`[Result] ✅ SUCCESS`);
                        
                        // Display price if available
                        if (config.name.includes('DexScreener')) {
                            const pairs = json.pairs || [];
                            if (pairs.length > 0) {
                                console.log(`[Price] $${pairs[0].priceUsd}`);
                            }
                        } else if (config.name.includes('GeckoTerminal')) {
                            const price = json.data?.attributes?.price_usd;
                            if (price) {
                                console.log(`[Price] $${price}`);
                            }
                        } else if (config.name.includes('Binance')) {
                            console.log(`[Price] $${json.price}`);
                        }
                    } catch (e) {
                        console.log(`[Result] ⚠️ JSON parse failed:`, e.message);
                    }
                } else {
                    console.log(`[Result] ❌ FAILED: HTTP ${res.statusCode}`);
                }
                
                resolve({ name: config.name, success: res.statusCode === 200, duration });
            });
        });

        req.on('error', (err) => {
            const duration = Date.now() - startTime;
            console.log(`[Result] ❌ Error: ${err.message} (${duration}ms)`);
            resolve({ name: config.name, success: false, duration, error: err.message });
        });

        req.on('timeout', () => {
            req.destroy();
            const duration = Date.now() - startTime;
            console.log(`[Result] ❌ Timeout (${duration}ms)`);
            resolve({ name: config.name, success: false, duration, error: 'Timeout' });
        });

        req.end();
    });
}

async function runTests() {
    console.log('========================================');
    console.log('  API Connection Test');
    console.log('========================================');

    const results = [];
    
    for (const api of APIs) {
        const result = await testAPI(api);
        results.push(result);
        await new Promise(resolve => setTimeout(resolve, 500)); // Delay 500ms to avoid rate limiting
    }

    console.log('\n========================================');
    console.log('  Test Results Summary');
    console.log('========================================\n');

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    results.forEach(r => {
        const status = r.success ? '✅ SUCCESS' : '❌ FAILED';
        const error = r.error ? ` (${r.error})` : '';
        console.log(`${status} - ${r.name} - ${r.duration}ms${error}`);
    });

    console.log(`\nSuccess: ${successCount} / ${results.length}`);
    console.log(`Failed: ${failCount} / ${results.length}`);

    if (failCount > 0) {
        console.log('\n⚠️ Diagnostic Suggestions:');
        console.log('1. Check if network connection is working');
        console.log('2. Try using VPN or switching network');
        console.log('3. Check if firewall/antivirus is blocking');
        console.log('4. API services may be rate-limited or unavailable in your region');
    } else {
        console.log('\n✅ All API connections are working normally!');
    }

    console.log('\n========================================\n');
}

runTests();
