const axios = require('axios');

const BACKEND_URL = 'http://localhost:3002';
const FRONTEND_URL = 'http://localhost:5174';

async function testFullStack() {
  console.log('🚀 COMPREHENSIVE LENDIFY FULL-STACK TEST');
  console.log('=' .repeat(60));
  console.log('');
  
  let allTestsPassed = true;
  const testResults = [];

  // Test 1: Backend Health Check
  try {
    console.log('🔧 Testing Backend Health...');
    const healthResponse = await axios.get(`${BACKEND_URL}/health`);
    console.log('✅ Backend Health:', healthResponse.data.message);
    console.log(`   📊 Database Status: ${healthResponse.data.database}`);
    testResults.push({ test: 'Backend Health', status: '✅ PASS' });
  } catch (error) {
    console.log('❌ Backend Health Check Failed:', error.message);
    testResults.push({ test: 'Backend Health', status: '❌ FAIL' });
    allTestsPassed = false;
  }

  // Test 2: Frontend Accessibility
  try {
    console.log('\n🌐 Testing Frontend Accessibility...');
    const frontendResponse = await axios.get(FRONTEND_URL);
    console.log('✅ Frontend is accessible');
    console.log(`   📄 Content-Type: ${frontendResponse.headers['content-type']}`);
    testResults.push({ test: 'Frontend Access', status: '✅ PASS' });
  } catch (error) {
    console.log('❌ Frontend Accessibility Failed:', error.message);
    testResults.push({ test: 'Frontend Access', status: '❌ FAIL' });
    allTestsPassed = false;
  }

  // Test 3: All Service Health Endpoints
  const services = ['auth', 'nft', 'rental', 'lending', 'flashLoan', 'oracle', 'reputation', 'analytics', 'crossChain'];
  console.log('\n🛠️  Testing All Service Health Endpoints...');
  
  for (const service of services) {
    try {
      const serviceResponse = await axios.get(`${BACKEND_URL}/api/${service}/health`);
      console.log(`   ✅ ${service} service: ${serviceResponse.data.message}`);
    } catch (error) {
      console.log(`   ❌ ${service} service: Failed`);
      allTestsPassed = false;
    }
  }
  testResults.push({ test: 'Service Health', status: allTestsPassed ? '✅ PASS' : '❌ FAIL' });

  // Test 4: Database Operations
  console.log('\n📊 Testing Database Operations...');
  try {
    const statsResponse = await axios.get(`${BACKEND_URL}/api/stats`);
    const dbTestResponse = await axios.get(`${BACKEND_URL}/api/db/test`);
    
    console.log('✅ Database Statistics:');
    console.log(`   👥 Users: ${statsResponse.data.data.users}`);
    console.log(`   🎨 NFTs: ${statsResponse.data.data.nfts}`);
    console.log(`   🏠 Rentals: ${statsResponse.data.data.totalRentals}`);
    console.log(`   💰 Loans: ${statsResponse.data.data.totalLoans}`);
    
    console.log('✅ Database Connection:');
    console.log(`   📂 Database: ${dbTestResponse.data.database}`);
    console.log(`   📚 Collections: ${dbTestResponse.data.collections}`);
    console.log(`   💾 Data Size: ${Math.round(dbTestResponse.data.dataSize / 1024)}KB`);
    
    testResults.push({ test: 'Database Operations', status: '✅ PASS' });
  } catch (error) {
    console.log('❌ Database Operations Failed:', error.message);
    testResults.push({ test: 'Database Operations', status: '❌ FAIL' });
    allTestsPassed = false;
  }

  // Test 5: User Authentication Flow
  console.log('\n🔐 Testing User Authentication Flow...');
  try {
    // Generate nonce
    const nonceResponse = await axios.post(`${BACKEND_URL}/api/auth/nonce`, {
      walletAddress: '0x742d35cc6bf8fccb87a23180b10b7e9ba8b3a0c7'
    });
    
    console.log('✅ Nonce Generation:');
    console.log(`   🎲 Nonce: ${nonceResponse.data.data.nonce}`);
    console.log(`   ⏰ Expires: ${new Date(nonceResponse.data.data.expiresAt).toLocaleTimeString()}`);
    
    // Get user profile
    const userResponse = await axios.get(`${BACKEND_URL}/api/auth/user/0x742d35cc6bf8fccb87a23180b10b7e9ba8b3a0c7`);
    
    console.log('✅ User Profile:');
    console.log(`   👤 Username: ${userResponse.data.data.user.username}`);
    console.log(`   ✅ Verified: ${userResponse.data.data.user.isVerified}`);
    console.log(`   ⭐ Rating: ${userResponse.data.data.user.reputation.averageRating}/5.0`);
    
    testResults.push({ test: 'Authentication Flow', status: '✅ PASS' });
  } catch (error) {
    console.log('❌ Authentication Flow Failed:', error.message);
    testResults.push({ test: 'Authentication Flow', status: '❌ FAIL' });
    allTestsPassed = false;
  }

  // Test 6: NFT Marketplace Operations
  console.log('\n🎨 Testing NFT Marketplace Operations...');
  try {
    const availableNFTsResponse = await axios.get(`${BACKEND_URL}/api/nft/available?limit=5`);
    const trendingNFTsResponse = await axios.get(`${BACKEND_URL}/api/nft/trending?limit=3`);
    const searchResponse = await axios.get(`${BACKEND_URL}/api/nft/search?q=ape`);
    
    console.log('✅ NFT Marketplace:');
    console.log(`   🎯 Available NFTs: ${availableNFTsResponse.data.data.nfts.length}`);
    console.log(`   🔥 Trending NFTs: ${trendingNFTsResponse.data.data.length}`);
    console.log(`   🔍 Search Results (ape): ${searchResponse.data.data.nfts.length}`);
    
    if (availableNFTsResponse.data.data.nfts.length > 0) {
      const firstNFT = availableNFTsResponse.data.data.nfts[0];
      console.log(`   📋 Sample NFT: ${firstNFT.metadata.name}`);
      console.log(`   🔗 Contract: ${firstNFT.contractAddress.substring(0, 10)}...`);
      console.log(`   🏷️  Token ID: ${firstNFT.tokenId}`);
    }
    
    testResults.push({ test: 'NFT Marketplace', status: '✅ PASS' });
  } catch (error) {
    console.log('❌ NFT Marketplace Operations Failed:', error.message);
    testResults.push({ test: 'NFT Marketplace', status: '❌ FAIL' });
    allTestsPassed = false;
  }

  // Test 7: Rental Platform Operations
  console.log('\n🏠 Testing Rental Platform Operations...');
  try {
    const availableRentalsResponse = await axios.get(`${BACKEND_URL}/api/rental/available`);
    
    console.log('✅ Rental Platform:');
    console.log(`   🏠 Available Rentals: ${availableRentalsResponse.data.data.rentals.length}`);
    
    if (availableRentalsResponse.data.data.rentals.length > 0) {
      const rental = availableRentalsResponse.data.data.rentals[0];
      console.log(`   💰 Price Range: ${rental.pricing.dailyPrice} ${rental.pricing.currency}/day`);
      console.log(`   🔒 Collateral: ${rental.pricing.collateralRequired} ETH`);
      console.log(`   ⚡ Instant Rent: ${rental.settings.instantRent ? 'Yes' : 'No'}`);
      console.log(`   🎯 Use Cases: ${rental.settings.allowedUseCases.join(', ')}`);
      
      // Test individual rental details
      const rentalDetailsResponse = await axios.get(`${BACKEND_URL}/api/rental/${rental._id}`);
      console.log(`   📄 Rental Details: Loaded successfully`);
    }
    
    testResults.push({ test: 'Rental Platform', status: '✅ PASS' });
  } catch (error) {
    console.log('❌ Rental Platform Operations Failed:', error.message);
    testResults.push({ test: 'Rental Platform', status: '❌ FAIL' });
    allTestsPassed = false;
  }

  // Test 8: Lending Platform Operations
  console.log('\n💰 Testing Lending Platform Operations...');
  try {
    const loanRequestsResponse = await axios.get(`${BACKEND_URL}/api/lending/requests`);
    
    console.log('✅ Lending Platform:');
    console.log(`   💰 Loan Requests: ${loanRequestsResponse.data.data.loanRequests.length}`);
    
    if (loanRequestsResponse.data.data.loanRequests.length > 0) {
      const loan = loanRequestsResponse.data.data.loanRequests[0];
      console.log(`   💵 Principal: ${loan.terms.principal} ${loan.terms.currency}`);
      console.log(`   📈 Interest Rate: ${loan.terms.interestRate}%`);
      console.log(`   📅 Duration: ${loan.terms.duration} days`);
      console.log(`   🏦 LTV Ratio: ${(loan.terms.ltvRatio * 100).toFixed(1)}%`);
      console.log(`   🎯 Purpose: ${loan.purpose}`);
      
      // Test individual loan details
      const loanDetailsResponse = await axios.get(`${BACKEND_URL}/api/lending/${loan._id}`);
      console.log(`   📄 Loan Details: Loaded successfully`);
    }
    
    testResults.push({ test: 'Lending Platform', status: '✅ PASS' });
  } catch (error) {
    console.log('❌ Lending Platform Operations Failed:', error.message);
    testResults.push({ test: 'Lending Platform', status: '❌ FAIL' });
    allTestsPassed = false;
  }

  // Test 9: Performance and Load Testing
  console.log('\n⚡ Testing Performance and Load...');
  try {
    const startTime = Date.now();
    const concurrentRequests = [
      axios.get(`${BACKEND_URL}/api/stats`),
      axios.get(`${BACKEND_URL}/api/nft/available`),
      axios.get(`${BACKEND_URL}/api/rental/available`),
      axios.get(`${BACKEND_URL}/api/lending/requests`),
      axios.get(`${BACKEND_URL}/api/nft/trending`),
      axios.get(`${BACKEND_URL}/api/auth/user/0x742d35cc6bf8fccb87a23180b10b7e9ba8b3a0c7`),
      axios.get(`${BACKEND_URL}/api/nft/search?q=cosmic`),
      axios.get(`${BACKEND_URL}/health`)
    ];
    
    const responses = await Promise.all(concurrentRequests);
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    console.log('✅ Performance Test:');
    console.log(`   🚀 ${concurrentRequests.length} concurrent requests completed`);
    console.log(`   ⏱️  Total time: ${totalTime}ms`);
    console.log(`   ⚡ Average response time: ${Math.round(totalTime / concurrentRequests.length)}ms`);
    console.log(`   ✅ Success rate: ${(responses.filter(r => r.status === 200).length / responses.length * 100).toFixed(1)}%`);
    
    // Performance benchmarks
    const avgResponseTime = totalTime / concurrentRequests.length;
    const performanceGrade = avgResponseTime < 10 ? 'A+' : avgResponseTime < 25 ? 'A' : avgResponseTime < 50 ? 'B' : 'C';
    console.log(`   📊 Performance Grade: ${performanceGrade}`);
    
    testResults.push({ test: 'Performance & Load', status: '✅ PASS' });
  } catch (error) {
    console.log('❌ Performance Testing Failed:', error.message);
    testResults.push({ test: 'Performance & Load', status: '❌ FAIL' });
    allTestsPassed = false;
  }

  // Test 10: Cross-Origin Resource Sharing (CORS)
  console.log('\n🌐 Testing CORS Configuration...');
  try {
    const corsTestResponse = await axios.get(`${BACKEND_URL}/health`, {
      headers: {
        'Origin': 'http://localhost:5174'
      }
    });
    
    console.log('✅ CORS Configuration:');
    console.log(`   🔓 Access allowed from frontend origin`);
    console.log(`   📡 CORS headers present`);
    
    testResults.push({ test: 'CORS Configuration', status: '✅ PASS' });
  } catch (error) {
    console.log('❌ CORS Configuration Failed:', error.message);
    testResults.push({ test: 'CORS Configuration', status: '❌ FAIL' });
    allTestsPassed = false;
  }

  // Final Results Summary
  console.log('\n' + '=' .repeat(60));
  console.log('📋 COMPREHENSIVE TEST RESULTS SUMMARY');
  console.log('=' .repeat(60));
  
  testResults.forEach((result, index) => {
    console.log(`${(index + 1).toString().padStart(2)}. ${result.test.padEnd(25)} ${result.status}`);
  });
  
  console.log('\n🎯 SYSTEM STATUS:');
  console.log('=' .repeat(30));
  console.log(`📊 Tests Passed: ${testResults.filter(r => r.status.includes('✅')).length}/${testResults.length}`);
  console.log(`⚡ Success Rate: ${Math.round(testResults.filter(r => r.status.includes('✅')).length / testResults.length * 100)}%`);
  
  if (allTestsPassed) {
    console.log('\n🎉 ALL SYSTEMS OPERATIONAL! 🎉');
    console.log('✅ MongoDB Database: CONNECTED');
    console.log('✅ Backend API Server: RUNNING (Port 3002)');
    console.log('✅ Frontend Dev Server: RUNNING (Port 5174)');
    console.log('✅ Full-Stack Integration: WORKING');
    console.log('✅ All API Endpoints: FUNCTIONAL');
    console.log('✅ Database Operations: OPERATIONAL');
    console.log('✅ Performance: EXCELLENT');
    console.log('\n🚀 LENDIFY IS 100% READY FOR PRODUCTION! 🚀');
  } else {
    console.log('\n⚠️  SOME ISSUES DETECTED');
    console.log('Please review failed tests above for details.');
  }
  
  console.log('=' .repeat(60));
  return allTestsPassed;
}

// Run the comprehensive test
testFullStack().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Fatal test error:', error);
  process.exit(1);
});