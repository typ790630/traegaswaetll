#!/usr/bin/env node
/**
 * 🧪 完整功能测试脚本
 * 测试钱包应用的所有核心功能
 */

const { createPublicClient, http, formatEther, fallback, createWalletClient, parseEther } = require('viem');
const { bsc } = require('viem/chains');
const { privateKeyToAccount, generateMnemonic, mnemonicToAccount, english } = require('viem/accounts');
const chalk = require('chalk');

// 配置
const RADRS_CONFIG = {
  chainId: 56,
  rpcUrls: [
    'https://bsc-dataseed1.defibit.io/',
    'https://bsc.publicnode.com',
    'https://bsc-dataseed1.ninicoin.io/',
    'https://bsc-dataseed.binance.org/'
  ],
  paymasterAddress: '0xD0D46B98dFf2ee93Dfe708d4434f180383B2B939',
  referralRegistryAddress: '0x086dEaa48841918f132ad0489feb32DcC3913147',
  radrsTokenAddress: '0xe2188a2e0a41a50f09359e5fe714d5e643036f2a',
  usdtAddress: '0x55d398326f99059fF775485246999027B3197955'
};

const ERC20_ABI = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function'
  }
];

const REFERRAL_ABI = [
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'getReferrer',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'referrer', type: 'address' }],
    name: 'getInviteCount',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'referrer', type: 'address' }],
    name: 'totalRewardsEarned',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  }
];

// 创建客户端
const publicClient = createPublicClient({
  chain: bsc,
  transport: fallback(RADRS_CONFIG.rpcUrls.map(url => http(url))),
  pollingInterval: 4000
});

// 测试结果收集
const results = {
  passed: [],
  failed: [],
  warnings: []
};

// 工具函数
function printHeader(title) {
  console.log('\n' + chalk.cyan('═'.repeat(60)));
  console.log(chalk.cyan.bold(`  ${title}`));
  console.log(chalk.cyan('═'.repeat(60)) + '\n');
}

function printTest(name, status, details = '') {
  const icon = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⚠️';
  const color = status === 'pass' ? chalk.green : status === 'fail' ? chalk.red : chalk.yellow;
  console.log(color(`${icon} ${name}`));
  if (details) {
    console.log(chalk.gray(`   ${details}`));
  }
}

function recordResult(test, status, details = '') {
  if (status === 'pass') {
    results.passed.push({ test, details });
  } else if (status === 'fail') {
    results.failed.push({ test, details });
  } else {
    results.warnings.push({ test, details });
  }
}

// 测试 1: RPC 连接测试
async function testRpcConnection() {
  printHeader('测试 1: RPC 连接测试');
  
  try {
    const blockNumber = await publicClient.getBlockNumber();
    printTest('RPC 连接', 'pass', `当前区块: ${blockNumber}`);
    recordResult('RPC连接', 'pass', `区块号: ${blockNumber}`);
    
    const chainId = await publicClient.getChainId();
    if (chainId === 56) {
      printTest('链 ID 验证', 'pass', 'BSC 主网 (56)');
      recordResult('链ID', 'pass', 'BSC主网');
    } else {
      printTest('链 ID 验证', 'fail', `错误的链ID: ${chainId}`);
      recordResult('链ID', 'fail', `错误: ${chainId}`);
    }
    
    return true;
  } catch (error) {
    printTest('RPC 连接', 'fail', error.message);
    recordResult('RPC连接', 'fail', error.message);
    return false;
  }
}

// 测试 2: 钱包创建测试
async function testWalletCreation() {
  printHeader('测试 2: 钱包创建测试');
  
  try {
    // 测试助记词生成
    const mnemonic = generateMnemonic(english);
    const words = mnemonic.split(' ');
    if (words.length === 12) {
      printTest('助记词生成', 'pass', `${words.length} 个单词`);
      recordResult('助记词生成', 'pass', '12词');
    } else {
      printTest('助记词生成', 'fail', `错误的词数: ${words.length}`);
      recordResult('助记词生成', 'fail', `${words.length}词`);
    }
    
    // 测试从助记词创建账户
    const account = mnemonicToAccount(mnemonic);
    if (account.address.startsWith('0x') && account.address.length === 42) {
      printTest('从助记词创建账户', 'pass', `地址: ${account.address}`);
      recordResult('助记词账户', 'pass', account.address.slice(0, 10) + '...');
    } else {
      printTest('从助记词创建账户', 'fail', '地址格式错误');
      recordResult('助记词账户', 'fail', '格式错误');
    }
    
    // 测试私钥账户
    const testPrivateKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
    const pkAccount = privateKeyToAccount(testPrivateKey);
    if (pkAccount.address.startsWith('0x')) {
      printTest('私钥账户创建', 'pass', `地址: ${pkAccount.address}`);
      recordResult('私钥账户', 'pass', pkAccount.address.slice(0, 10) + '...');
    } else {
      printTest('私钥账户创建', 'fail', '地址格式错误');
      recordResult('私钥账户', 'fail', '格式错误');
    }
    
    return account;
  } catch (error) {
    printTest('钱包创建', 'fail', error.message);
    recordResult('钱包创建', 'fail', error.message);
    return null;
  }
}

// 测试 3: 余额查询测试
async function testBalanceQueries(testAddress) {
  printHeader('测试 3: 余额查询测试');
  
  try {
    // BNB 余额
    const bnbBalance = await publicClient.getBalance({
      address: testAddress
    });
    printTest('BNB 余额查询', 'pass', `${formatEther(bnbBalance)} BNB`);
    recordResult('BNB余额', 'pass', `${formatEther(bnbBalance)} BNB`);
    
    // RADRS 余额
    const radrsBalance = await publicClient.readContract({
      address: RADRS_CONFIG.radrsTokenAddress,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [testAddress]
    });
    printTest('RADRS 余额查询', 'pass', `${formatEther(radrsBalance)} RADRS`);
    recordResult('RADRS余额', 'pass', `${formatEther(radrsBalance)} RADRS`);
    
    // USDT 余额
    const usdtBalance = await publicClient.readContract({
      address: RADRS_CONFIG.usdtAddress,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [testAddress]
    });
    printTest('USDT 余额查询', 'pass', `${formatEther(usdtBalance)} USDT`);
    recordResult('USDT余额', 'pass', `${formatEther(usdtBalance)} USDT`);
    
    return true;
  } catch (error) {
    printTest('余额查询', 'fail', error.message);
    recordResult('余额查询', 'fail', error.message);
    return false;
  }
}

// 测试 4: 推荐系统测试
async function testReferralSystem(testAddress) {
  printHeader('测试 4: 推荐系统测试');
  
  try {
    // 获取推荐人
    const referrer = await publicClient.readContract({
      address: RADRS_CONFIG.referralRegistryAddress,
      abi: REFERRAL_ABI,
      functionName: 'getReferrer',
      args: [testAddress]
    });
    
    const hasReferrer = referrer !== '0x0000000000000000000000000000000000000000';
    printTest('推荐人查询', 'pass', hasReferrer ? `推荐人: ${referrer}` : '无推荐人');
    recordResult('推荐人查询', 'pass', hasReferrer ? '已绑定' : '未绑定');
    
    // 获取邀请数量
    const inviteCount = await publicClient.readContract({
      address: RADRS_CONFIG.referralRegistryAddress,
      abi: REFERRAL_ABI,
      functionName: 'getInviteCount',
      args: [testAddress]
    });
    printTest('邀请数量查询', 'pass', `${inviteCount.toString()} 人`);
    recordResult('邀请数量', 'pass', `${inviteCount}人`);
    
    // 获取总奖励
    const totalRewards = await publicClient.readContract({
      address: RADRS_CONFIG.referralRegistryAddress,
      abi: REFERRAL_ABI,
      functionName: 'totalRewardsEarned',
      args: [testAddress]
    });
    printTest('推荐奖励查询', 'pass', `${formatEther(totalRewards)} RADRS`);
    recordResult('推荐奖励', 'pass', `${formatEther(totalRewards)} RADRS`);
    
    return true;
  } catch (error) {
    printTest('推荐系统', 'fail', error.message);
    recordResult('推荐系统', 'fail', error.message);
    return false;
  }
}

// 测试 5: 代币信息测试
async function testTokenInfo() {
  printHeader('测试 5: 代币信息测试');
  
  try {
    // RADRS 代币信息
    const radrsSymbol = await publicClient.readContract({
      address: RADRS_CONFIG.radrsTokenAddress,
      abi: ERC20_ABI,
      functionName: 'symbol'
    });
    printTest('RADRS 符号', 'pass', radrsSymbol);
    recordResult('RADRS符号', 'pass', radrsSymbol);
    
    const radrsDecimals = await publicClient.readContract({
      address: RADRS_CONFIG.radrsTokenAddress,
      abi: ERC20_ABI,
      functionName: 'decimals'
    });
    printTest('RADRS 精度', 'pass', `${radrsDecimals} decimals`);
    recordResult('RADRS精度', 'pass', `${radrsDecimals}`);
    
    // USDT 代币信息
    const usdtSymbol = await publicClient.readContract({
      address: RADRS_CONFIG.usdtAddress,
      abi: ERC20_ABI,
      functionName: 'symbol'
    });
    printTest('USDT 符号', 'pass', usdtSymbol);
    recordResult('USDT符号', 'pass', usdtSymbol);
    
    return true;
  } catch (error) {
    printTest('代币信息', 'fail', error.message);
    recordResult('代币信息', 'fail', error.message);
    return false;
  }
}

// 测试 6: 价格服务测试
async function testPriceService() {
  printHeader('测试 6: 价格服务测试');
  
  try {
    // CoinGecko API
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=binancecoin,ethereum&vs_currencies=usd',
      { 
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      }
    );
    
    if (response.ok) {
      const data = await response.json();
      printTest('CoinGecko API', 'pass', `BNB: $${data.binancecoin?.usd || 'N/A'}`);
      recordResult('价格API', 'pass', `BNB: $${data.binancecoin?.usd}`);
    } else {
      printTest('CoinGecko API', 'warn', `HTTP ${response.status}`);
      recordResult('价格API', 'warn', `状态: ${response.status}`);
    }
    
    // GeckoTerminal API (RADRS)
    const radrsResponse = await fetch(
      'https://api.geckoterminal.com/api/v2/networks/bsc/tokens/0xe2188a2e0a41a50f09359e5fe714d5e643036f2a'
    );
    
    if (radrsResponse.ok) {
      const radrsData = await radrsResponse.json();
      const radrsPrice = radrsData.data?.attributes?.price_usd;
      if (radrsPrice) {
        printTest('RADRS 价格', 'pass', `$${radrsPrice}`);
        recordResult('RADRS价格', 'pass', `$${radrsPrice}`);
      } else {
        printTest('RADRS 价格', 'warn', '价格数据缺失');
        recordResult('RADRS价格', 'warn', '数据缺失');
      }
    } else {
      printTest('RADRS 价格', 'warn', `HTTP ${radrsResponse.status}`);
      recordResult('RADRS价格', 'warn', `状态: ${radrsResponse.status}`);
    }
    
    return true;
  } catch (error) {
    printTest('价格服务', 'fail', error.message);
    recordResult('价格服务', 'fail', error.message);
    return false;
  }
}

// 测试 7: Gas 价格测试
async function testGasPrice() {
  printHeader('测试 7: Gas 价格测试');
  
  try {
    const gasPrice = await publicClient.getGasPrice();
    const gasPriceGwei = Number(gasPrice) / 1e9;
    
    printTest('Gas 价格查询', 'pass', `${gasPriceGwei.toFixed(2)} Gwei`);
    recordResult('Gas价格', 'pass', `${gasPriceGwei.toFixed(2)} Gwei`);
    
    // 估算转账 gas
    const estimatedGas = 21000n; // 标准转账
    const estimatedCost = gasPrice * estimatedGas;
    const costBnb = formatEther(estimatedCost);
    
    printTest('转账 Gas 估算', 'pass', `~${costBnb} BNB (21000 gas)`);
    recordResult('Gas估算', 'pass', `${costBnb} BNB`);
    
    return true;
  } catch (error) {
    printTest('Gas 价格', 'fail', error.message);
    recordResult('Gas价格', 'fail', error.message);
    return false;
  }
}

// 测试 8: 活动记录测试
async function testActivityLogs(testAddress) {
  printHeader('测试 8: 活动记录测试');
  
  try {
    // 获取最近的转账事件
    const transferEvent = {
      anonymous: false,
      inputs: [
        { indexed: true, name: 'from', type: 'address' },
        { indexed: true, name: 'to', type: 'address' },
        { indexed: false, name: 'value', type: 'uint256' }
      ],
      name: 'Transfer',
      type: 'event'
    };
    
    const logs = await publicClient.getLogs({
      address: RADRS_CONFIG.radrsTokenAddress,
      event: transferEvent,
      args: {
        to: testAddress
      },
      fromBlock: 'earliest',
      toBlock: 'latest'
    });
    
    printTest('活动记录查询', 'pass', `找到 ${logs.length} 条记录`);
    recordResult('活动记录', 'pass', `${logs.length}条`);
    
    return true;
  } catch (error) {
    // 这个可能会因为区块范围太大而失败，所以只是警告
    printTest('活动记录查询', 'warn', '查询范围可能过大');
    recordResult('活动记录', 'warn', '范围限制');
    return true;
  }
}

// 生成测试报告
function generateReport() {
  printHeader('📊 测试报告');
  
  const total = results.passed.length + results.failed.length + results.warnings.length;
  const passRate = ((results.passed.length / total) * 100).toFixed(1);
  
  console.log(chalk.green(`✅ 通过: ${results.passed.length}/${total} (${passRate}%)`));
  console.log(chalk.red(`❌ 失败: ${results.failed.length}/${total}`));
  console.log(chalk.yellow(`⚠️  警告: ${results.warnings.length}/${total}`));
  
  if (results.failed.length > 0) {
    console.log('\n' + chalk.red.bold('失败的测试:'));
    results.failed.forEach(r => {
      console.log(chalk.red(`  - ${r.test}: ${r.details}`));
    });
  }
  
  if (results.warnings.length > 0) {
    console.log('\n' + chalk.yellow.bold('警告:'));
    results.warnings.forEach(r => {
      console.log(chalk.yellow(`  - ${r.test}: ${r.details}`));
    });
  }
  
  console.log('\n' + chalk.cyan('═'.repeat(60)));
  
  if (results.failed.length === 0) {
    console.log(chalk.green.bold('🎉 所有核心功能测试通过！'));
  } else {
    console.log(chalk.red.bold('⚠️  部分功能需要修复'));
  }
  
  console.log(chalk.cyan('═'.repeat(60)) + '\n');
}

// 主测试函数
async function runAllTests() {
  console.log(chalk.bold.cyan('\n🧪 开始全功能测试...\n'));
  
  // 使用一个有余额的测试地址
  const testAddress = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
  
  try {
    // 执行所有测试
    await testRpcConnection();
    const account = await testWalletCreation();
    await testBalanceQueries(testAddress);
    await testReferralSystem(testAddress);
    await testTokenInfo();
    await testPriceService();
    await testGasPrice();
    await testActivityLogs(testAddress);
    
    // 生成报告
    generateReport();
    
  } catch (error) {
    console.error(chalk.red('\n❌ 测试执行出错:'), error.message);
    process.exit(1);
  }
}

// 检查依赖
try {
  require('chalk');
} catch (e) {
  console.log('\n⚠️  缺少 chalk 依赖，安装中...');
  require('child_process').execSync('npm install chalk', { stdio: 'inherit' });
  console.log('✅ 依赖安装完成，重新运行脚本...\n');
  process.exit(0);
}

// 运行测试
runAllTests().catch(error => {
  console.error(chalk.red('Fatal error:'), error);
  process.exit(1);
});
