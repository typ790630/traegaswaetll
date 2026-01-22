// Quick API Test - CommonJS version
console.log('========================================');
console.log('  Quick API Test');
console.log('========================================\n');

const https = require('https');

const RADRS_ADDRESS = '0xe2188a2e0a41a50f09359e5fe714d5e643036f2a';

function testAPI(name, url) {
    return new Promise((resolve) => {
        console.log(`Testing: ${name}`);
        console.log(`URL: ${url}\n`);
        
        const startTime = Date.now();
        
        https.get(url, { timeout: 10000 }, (res) => {
            const duration = Date.now() - startTime;
            let data = '';
            
            res.on('data', chunk => data += chunk);
            
            res.on('end', () => {
                console.log(`Status: ${res.statusCode} (${duration}ms)`);
                
                if (res.statusCode === 200) {
                    try {
                        const json = JSON.parse(data);
                        console.log('Result: SUCCESS ✓');
                        
                        // Try to find price
                        if (json.pairs && json.pairs[0]) {
                            console.log(`Price: $${json.pairs[0].priceUsd}`);
                        } else if (json.data?.attributes?.price_usd) {
                            console.log(`Price: $${json.data.attributes.price_usd}`);
                        } else if (json.price) {
                            console.log(`Price: $${json.price}`);
                        }
                    } catch (e) {
                        console.log('Result: SUCCESS but JSON parse failed');
                    }
                } else {
                    console.log(`Result: FAILED (HTTP ${res.statusCode})`);
                }
                
                console.log('----------------------------------------\n');
                resolve(res.statusCode === 200);
            });
        }).on('error', (err) => {
            const duration = Date.now() - startTime;
            console.log(`Status: ERROR (${duration}ms)`);
            console.log(`Error: ${err.message}`);
            console.log('Result: FAILED ✗');
            console.log('----------------------------------------\n');
            resolve(false);
        }).on('timeout', () => {
            console.log('Status: TIMEOUT (10000ms)');
            console.log('Result: FAILED ✗');
            console.log('----------------------------------------\n');
            resolve(false);
        });
    });
}

async function runTests() {
    const tests = [
        ['DexScreener RADRS', `https://api.dexscreener.com/latest/dex/tokens/${RADRS_ADDRESS}`],
        ['GeckoTerminal RADRS', `https://api.geckoterminal.com/api/v2/networks/bsc/tokens/${RADRS_ADDRESS}`],
        ['Binance BNB', 'https://data-api.binance.vision/api/v3/ticker/price?symbol=BNBUSDT']
    ];
    
    const results = [];
    
    for (const [name, url] of tests) {
        const success = await testAPI(name, url);
        results.push({ name, success });
        await new Promise(r => setTimeout(r, 500));
    }
    
    console.log('========================================');
    console.log('  Summary');
    console.log('========================================\n');
    
    const successCount = results.filter(r => r.success).length;
    
    results.forEach(r => {
        const status = r.success ? 'SUCCESS ✓' : 'FAILED ✗';
        console.log(`${status} - ${r.name}`);
    });
    
    console.log(`\nTotal: ${successCount}/${results.length} succeeded`);
    
    if (successCount === 0) {
        console.log('\n⚠️  All tests failed. Possible reasons:');
        console.log('1. No internet connection');
        console.log('2. Firewall blocking requests');
        console.log('3. API services are down');
        console.log('4. Need VPN to access these services');
        console.log('\nSolutions:');
        console.log('- Try switching to WiFi or mobile data');
        console.log('- Try using a VPN (Hong Kong/Singapore)');
        console.log('- Check if antivirus/firewall is blocking');
    } else if (successCount < results.length) {
        console.log('\n⚠️  Some tests failed. This is usually OK.');
        console.log('The app will use the working APIs as fallback.');
    } else {
        console.log('\n✓ All tests passed! APIs are working normally.');
        console.log('Your custom tokens should display prices correctly.');
    }
    
    console.log('\n========================================\n');
}

runTests().catch(console.error);
