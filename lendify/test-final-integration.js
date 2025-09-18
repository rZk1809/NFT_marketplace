#!/usr/bin/env node

/**
 * Final Integration Test
 * Comprehensive test to verify all fixes are working
 */

console.log('🎯 Final Integration Test - Console Error Resolution\n');

async function testServerResponses() {
  const tests = [];
  
  // Test 1: Frontend server
  try {
    console.log('1. Testing frontend server...');
    const response = await fetch('http://localhost:5173/');
    const html = await response.text();
    
    if (response.ok && html.includes('<div id="root">')) {
      console.log('   ✅ Frontend server responding correctly');
      console.log('   📄 HTML contains React root element');
      tests.push({ name: 'Frontend Server', status: 'PASS' });
    } else {
      console.log('   ❌ Frontend server response invalid');
      tests.push({ name: 'Frontend Server', status: 'FAIL' });
    }
  } catch (error) {
    console.log('   ❌ Frontend server not accessible:', error.message);
    tests.push({ name: 'Frontend Server', status: 'FAIL', error: error.message });
  }

  // Test 2: Backend API
  try {
    console.log('\n2. Testing backend API...');
    const response = await fetch('http://localhost:3001/api/');
    const data = await response.json();
    
    if (response.ok && data.name === 'Lendify Backend API') {
      console.log('   ✅ Backend API responding correctly');
      console.log('   📊 API version:', data.version);
      tests.push({ name: 'Backend API', status: 'PASS' });
    } else {
      console.log('   ❌ Backend API response invalid');
      tests.push({ name: 'Backend API', status: 'FAIL' });
    }
  } catch (error) {
    console.log('   ❌ Backend API not accessible:', error.message);
    tests.push({ name: 'Backend API', status: 'FAIL', error: error.message });
  }

  // Test 3: Environment variables
  try {
    console.log('\n3. Testing environment configuration...');
    const fs = await import('fs');
    const envContent = fs.readFileSync('.env', 'utf8');
    
    const hasViteVars = envContent.includes('VITE_API_URL');
    const hasOldReactVars = envContent.includes('REACT_APP_API_URL');
    
    if (hasViteVars && !hasOldReactVars) {
      console.log('   ✅ Environment variables updated to Vite format');
      tests.push({ name: 'Environment Variables', status: 'PASS' });
    } else if (hasOldReactVars) {
      console.log('   ⚠️  Still contains old REACT_APP_ variables');
      tests.push({ name: 'Environment Variables', status: 'PARTIAL' });
    } else {
      console.log('   ❌ Environment variables not configured');
      tests.push({ name: 'Environment Variables', status: 'FAIL' });
    }
  } catch (error) {
    console.log('   ❌ Could not read .env file:', error.message);
    tests.push({ name: 'Environment Variables', status: 'FAIL', error: error.message });
  }

  // Test 4: Polyfills file
  try {
    console.log('\n4. Testing polyfills configuration...');
    const fs = await import('fs');
    const polyfillsExist = fs.existsSync('src/polyfills.js');
    const mainJsxContent = fs.readFileSync('src/main.jsx', 'utf8');
    const polyfillsImported = mainJsxContent.includes('./polyfills.js');
    
    if (polyfillsExist && polyfillsImported) {
      console.log('   ✅ Polyfills file exists and imported');
      tests.push({ name: 'Polyfills Configuration', status: 'PASS' });
    } else {
      console.log('   ❌ Polyfills not properly configured');
      tests.push({ name: 'Polyfills Configuration', status: 'FAIL' });
    }
  } catch (error) {
    console.log('   ❌ Could not check polyfills:', error.message);
    tests.push({ name: 'Polyfills Configuration', status: 'FAIL', error: error.message });
  }

  // Test 5: Vite configuration
  try {
    console.log('\n5. Testing Vite configuration...');
    const fs = await import('fs');
    const viteConfigContent = fs.readFileSync('vite.config.js', 'utf8');
    
    const hasBufferAlias = viteConfigContent.includes('buffer');
    const hasProcessAlias = viteConfigContent.includes('process');
    const hasDefineGlobal = viteConfigContent.includes('global: \'globalThis\'');
    
    if (hasBufferAlias && hasProcessAlias && hasDefineGlobal) {
      console.log('   ✅ Vite config has proper polyfill setup');
      tests.push({ name: 'Vite Configuration', status: 'PASS' });
    } else {
      console.log('   ❌ Vite config missing polyfill configuration');
      tests.push({ name: 'Vite Configuration', status: 'FAIL' });
    }
  } catch (error) {
    console.log('   ❌ Could not check Vite config:', error.message);
    tests.push({ name: 'Vite Configuration', status: 'FAIL', error: error.message });
  }

  return tests;
}

async function testWalletDependencies() {
  console.log('\n6. Testing wallet dependencies...');
  
  try {
    // Test Coinbase Wallet SDK
    const { CoinbaseWalletSDK } = await import('@coinbase/wallet-sdk');
    console.log('   ✅ @coinbase/wallet-sdk imports successfully');
    
    // Test WalletConnect
    const WalletConnectProvider = (await import('@walletconnect/web3-provider')).default;
    console.log('   ✅ @walletconnect/web3-provider imports successfully');
    
    // Test Buffer and Process (should work in Node.js)
    const { Buffer } = await import('buffer');
    const process = (await import('process')).default;
    console.log('   ✅ buffer and process polyfills available');
    
    return { name: 'Wallet Dependencies', status: 'PASS' };
  } catch (error) {
    console.log('   ❌ Wallet dependency import failed:', error.message);
    return { name: 'Wallet Dependencies', status: 'FAIL', error: error.message };
  }
}

async function runFinalTest() {
  const serverTests = await testServerResponses();
  const walletTest = await testWalletDependencies();
  
  const allTests = [...serverTests, walletTest];
  
  console.log('\n' + '='.repeat(70));
  console.log('🎯 FINAL INTEGRATION TEST RESULTS');
  console.log('='.repeat(70));
  
  const passed = allTests.filter(test => test.status === 'PASS').length;
  const failed = allTests.filter(test => test.status === 'FAIL').length;
  const partial = allTests.filter(test => test.status === 'PARTIAL').length;
  
  allTests.forEach((test, index) => {
    const statusIcon = test.status === 'PASS' ? '✅' : test.status === 'FAIL' ? '❌' : '⚠️';
    console.log(`${index + 1}. ${test.name}: ${statusIcon} ${test.status}`);
    if (test.error) {
      console.log(`   Error: ${test.error}`);
    }
  });
  
  console.log('\n' + '-'.repeat(70));
  console.log(`📊 Summary: ${passed} passed, ${failed} failed, ${partial} partial`);
  
  if (failed === 0) {
    console.log('\n🎉 SUCCESS: All critical fixes are in place!');
    console.log('✅ Console errors should be resolved');
    console.log('🚀 Application ready for development');
    
    console.log('\n📋 What was fixed:');
    console.log('   • Added Buffer and process polyfills');
    console.log('   • Updated environment variables to Vite format (VITE_*)');
    console.log('   • Fixed import statements in service files');
    console.log('   • Configured Vite for Node.js compatibility');
    console.log('   • Installed missing wallet dependencies');
    
    console.log('\n🔗 Access Points:');
    console.log('   • Frontend: http://localhost:5173/');
    console.log('   • Backend API: http://localhost:3001/api/');
    console.log('   • Polyfill Test: http://localhost:5173/test-browser-polyfills.html');
    
    process.exit(0);
  } else {
    console.log('\n⚠️  Some issues remain - check the errors above');
    process.exit(1);
  }
}

// Run the final test
runFinalTest().catch(error => {
  console.error('❌ Final test failed:', error);
  process.exit(1);
});
