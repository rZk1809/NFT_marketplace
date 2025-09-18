#!/usr/bin/env node

/**
 * Wallet Integration Test
 * Tests that all wallet-related dependencies are properly installed and can be imported
 */

console.log('🔗 Testing Wallet Integration...\n');

async function testWalletImports() {
  const tests = [];
  
  try {
    // Test 1: Import Coinbase Wallet SDK
    console.log('1. Testing @coinbase/wallet-sdk import...');
    const { CoinbaseWalletSDK } = await import('@coinbase/wallet-sdk');
    console.log('   ✅ CoinbaseWalletSDK imported successfully');
    console.log('   📦 Type:', typeof CoinbaseWalletSDK);
    tests.push({ name: 'Coinbase Wallet SDK', status: 'PASS' });
  } catch (error) {
    console.log('   ❌ Failed to import CoinbaseWalletSDK:', error.message);
    tests.push({ name: 'Coinbase Wallet SDK', status: 'FAIL', error: error.message });
  }

  try {
    // Test 2: Import WalletConnect Web3 Provider
    console.log('\n2. Testing @walletconnect/web3-provider import...');
    const WalletConnectProvider = (await import('@walletconnect/web3-provider')).default;
    console.log('   ✅ WalletConnectProvider imported successfully');
    console.log('   📦 Type:', typeof WalletConnectProvider);
    tests.push({ name: 'WalletConnect Web3 Provider', status: 'PASS' });
  } catch (error) {
    console.log('   ❌ Failed to import WalletConnectProvider:', error.message);
    tests.push({ name: 'WalletConnect Web3 Provider', status: 'FAIL', error: error.message });
  }

  try {
    // Test 3: Import WalletConnect Modal
    console.log('\n3. Testing @walletconnect/modal import...');
    const { WalletConnectModal } = await import('@walletconnect/modal');
    console.log('   ✅ WalletConnectModal imported successfully');
    console.log('   📦 Type:', typeof WalletConnectModal);
    tests.push({ name: 'WalletConnect Modal', status: 'PASS' });
  } catch (error) {
    console.log('   ❌ Failed to import WalletConnectModal:', error.message);
    tests.push({ name: 'WalletConnect Modal', status: 'FAIL', error: error.message });
  }

  try {
    // Test 4: Import Ethers
    console.log('\n4. Testing ethers import...');
    const { ethers } = await import('ethers');
    console.log('   ✅ Ethers imported successfully');
    console.log('   📦 Version:', ethers.version);
    tests.push({ name: 'Ethers', status: 'PASS' });
  } catch (error) {
    console.log('   ❌ Failed to import ethers:', error.message);
    tests.push({ name: 'Ethers', status: 'FAIL', error: error.message });
  }

  try {
    // Test 5: Test wallet service import
    console.log('\n5. Testing walletService import...');
    const walletService = (await import('./src/services/walletService.js')).default;
    console.log('   ✅ WalletService imported successfully');
    console.log('   📦 Type:', typeof walletService);
    console.log('   🔧 Methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(walletService)).filter(name => name !== 'constructor'));
    tests.push({ name: 'Wallet Service', status: 'PASS' });
  } catch (error) {
    console.log('   ❌ Failed to import walletService:', error.message);
    tests.push({ name: 'Wallet Service', status: 'FAIL', error: error.message });
  }

  return tests;
}

async function testWalletServiceMethods() {
  console.log('\n6. Testing WalletService methods...');
  
  try {
    const walletService = (await import('./src/services/walletService.js')).default;
    
    // Test getSupportedWallets method
    const supportedWallets = walletService.getSupportedWallets();
    console.log('   ✅ getSupportedWallets() works');
    console.log('   📋 Supported wallets:', supportedWallets.map(w => w.name).join(', '));
    
    // Test isWalletAvailable method
    const metamaskAvailable = walletService.isWalletAvailable('metamask');
    console.log('   ✅ isWalletAvailable() works');
    console.log('   🦊 MetaMask available:', metamaskAvailable);
    
    return { name: 'Wallet Service Methods', status: 'PASS' };
  } catch (error) {
    console.log('   ❌ Failed to test wallet service methods:', error.message);
    return { name: 'Wallet Service Methods', status: 'FAIL', error: error.message };
  }
}

async function runTests() {
  const importTests = await testWalletImports();
  const methodTest = await testWalletServiceMethods();
  
  const allTests = [...importTests, methodTest];
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 WALLET INTEGRATION TEST RESULTS');
  console.log('='.repeat(60));
  
  const passed = allTests.filter(test => test.status === 'PASS').length;
  const failed = allTests.filter(test => test.status === 'FAIL').length;
  
  allTests.forEach((test, index) => {
    const status = test.status === 'PASS' ? '✅ PASS' : '❌ FAIL';
    console.log(`${index + 1}. ${test.name}: ${status}`);
    if (test.error) {
      console.log(`   Error: ${test.error}`);
    }
  });
  
  console.log('\n' + '-'.repeat(60));
  console.log(`📈 Summary: ${passed}/${allTests.length} tests passed`);
  
  if (failed === 0) {
    console.log('🎉 All wallet dependencies are properly installed and working!');
    console.log('✅ Frontend should start without wallet-related import errors');
    process.exit(0);
  } else {
    console.log('⚠️  Some wallet dependencies have issues');
    process.exit(1);
  }
}

// Run the tests
runTests().catch(error => {
  console.error('❌ Test runner failed:', error);
  process.exit(1);
});
