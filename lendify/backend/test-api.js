const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

// Test health endpoints
async function testHealthEndpoints() {
  console.log('🔍 Testing Health Endpoints...\n');
  
  const services = ['auth', 'nft', 'rental', 'lending', 'flashLoan', 'oracle', 'reputation', 'analytics', 'crossChain'];
  
  for (const service of services) {
    try {
      const response = await axios.get(`${BASE_URL}/${service}/health`);
      console.log(`✅ ${service.toUpperCase()} Health: ${response.data.message}`);
    } catch (error) {
      console.log(`❌ ${service.toUpperCase()} Health: ${error.message}`);
    }
  }
  console.log('');
}

// Test NFT endpoints
async function testNFTEndpoints() {
  console.log('🎨 Testing NFT Endpoints...\n');
  
  try {
    // Test get available NFTs
    const response = await axios.get(`${BASE_URL}/nft/available`, {
      params: {
        page: 1,
        limit: 5
      }
    });
    console.log(`✅ GET /nft/available: Found ${response.data.data.nfts.length} NFTs`);
  } catch (error) {
    console.log(`❌ GET /nft/available: ${error.response?.data?.error || error.message}`);
  }
  
  try {
    // Test get trending NFTs
    const response = await axios.get(`${BASE_URL}/nft/trending`);
    console.log(`✅ GET /nft/trending: Found ${response.data.data.length} trending NFTs`);
  } catch (error) {
    console.log(`❌ GET /nft/trending: ${error.response?.data?.error || error.message}`);
  }
  
  console.log('');
}

// Test Auth endpoints
async function testAuthEndpoints() {
  console.log('🔐 Testing Auth Endpoints...\n');
  
  try {
    // Test nonce generation
    const response = await axios.post(`${BASE_URL}/auth/nonce`, {
      walletAddress: '0x1234567890123456789012345678901234567890'
    });
    console.log(`✅ POST /auth/nonce: Generated nonce successfully`);
  } catch (error) {
    console.log(`❌ POST /auth/nonce: ${error.response?.data?.error || error.message}`);
  }
  
  console.log('');
}

// Test Rental endpoints
async function testRentalEndpoints() {
  console.log('🏠 Testing Rental Endpoints...\n');
  
  try {
    // Test get available rentals
    const response = await axios.get(`${BASE_URL}/rental/available`, {
      params: {
        page: 1,
        limit: 5
      }
    });
    console.log(`✅ GET /rental/available: Found ${response.data.data.rentals.length} rental listings`);
  } catch (error) {
    console.log(`❌ GET /rental/available: ${error.response?.data?.error || error.message}`);
  }
  
  console.log('');
}

// Test Lending endpoints
async function testLendingEndpoints() {
  console.log('💰 Testing Lending Endpoints...\n');
  
  try {
    // Test get loan requests
    const response = await axios.get(`${BASE_URL}/lending/requests`, {
      params: {
        page: 1,
        limit: 5
      }
    });
    console.log(`✅ GET /lending/requests: Found ${response.data.data.loanRequests.length} loan requests`);
  } catch (error) {
    console.log(`❌ GET /lending/requests: ${error.response?.data?.error || error.message}`);
  }
  
  console.log('');
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting API Tests for Lendify Backend\n');
  console.log('=' .repeat(50));
  
  await testHealthEndpoints();
  await testAuthEndpoints();
  await testNFTEndpoints();
  await testRentalEndpoints();
  await testLendingEndpoints();
  
  console.log('=' .repeat(50));
  console.log('✨ API Tests Completed!\n');
  console.log('💡 Note: Some endpoints may return empty arrays since we haven\'t seeded data yet.');
  console.log('📝 Next steps: Add sample data and test authenticated endpoints.');
}

// Run tests if server is accessible
runTests().catch(console.error);