#!/usr/bin/env node

/**
 * Comprehensive Marketplace Integration Test
 * Tests all new marketplace enhancement features
 */

const API_BASE = 'http://localhost:3001/api';

async function testEndpoint(url, method = 'GET', body = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(url, options);
    const data = await response.json();
    
    return {
      success: response.ok,
      status: response.status,
      data: data
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

async function runTests() {
  console.log('🧪 Starting Marketplace Integration Tests...\n');
  
  const tests = [
    // Collections API Tests
    {
      name: 'Collections - Get All',
      url: `${API_BASE}/collections`,
      expectedSuccess: true
    },
    {
      name: 'Collections - Get with Filters',
      url: `${API_BASE}/collections?category=art&blockchain=ethereum&verified=true`,
      expectedSuccess: true
    },
    {
      name: 'Collections - Get by ID',
      url: `${API_BASE}/collections/collection-1`,
      expectedSuccess: true
    },
    {
      name: 'Collections - Get Stats',
      url: `${API_BASE}/collections/collection-1/stats`,
      expectedSuccess: true
    },
    {
      name: 'Collections - Get Activity',
      url: `${API_BASE}/collections/collection-1/activity`,
      expectedSuccess: true
    },
    
    // Auctions API Tests
    {
      name: 'Auctions - Get All',
      url: `${API_BASE}/auctions`,
      expectedSuccess: true
    },
    {
      name: 'Auctions - Get Active',
      url: `${API_BASE}/auctions/active`,
      expectedSuccess: true
    },
    {
      name: 'Auctions - Get by ID',
      url: `${API_BASE}/auctions/auction-1`,
      expectedSuccess: true
    },
    {
      name: 'Auctions - Get with Filters',
      url: `${API_BASE}/auctions?status=active&sortBy=ending_soon&category=art`,
      expectedSuccess: true
    },
    
    // Offers API Tests
    {
      name: 'Offers - Get NFT Offers',
      url: `${API_BASE}/offers/nfts/nft-1/offers`,
      expectedSuccess: true
    },
    {
      name: 'Offers - Get by ID',
      url: `${API_BASE}/offers/offer-1`,
      expectedSuccess: true
    },
    {
      name: 'Offers - Get User Offers',
      url: `${API_BASE}/offers/users/0x1234/offers?type=made`,
      expectedSuccess: true
    },
    {
      name: 'Offers - Get User Received Offers',
      url: `${API_BASE}/offers/users/0x1234/offers?type=received`,
      expectedSuccess: true
    },
    
    // Analytics API Tests (existing)
    {
      name: 'Analytics - Platform Stats',
      url: `${API_BASE}/analytics/stats`,
      expectedSuccess: true
    },
    {
      name: 'Analytics - Market Data',
      url: `${API_BASE}/analytics/market`,
      expectedSuccess: true
    },
    {
      name: 'Analytics - AI Insights',
      url: `${API_BASE}/analytics/ai-insights`,
      expectedSuccess: true
    }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    process.stdout.write(`Testing ${test.name}... `);
    
    const result = await testEndpoint(test.url, test.method, test.body);
    
    if (result.success === test.expectedSuccess) {
      console.log('✅ PASS');
      passed++;
      
      // Log some sample data for key endpoints
      if (test.name.includes('Collections - Get All') && result.data?.data) {
        console.log(`   📊 Found ${result.data.data.length} collections`);
      }
      if (test.name.includes('Auctions - Get All') && result.data?.data) {
        console.log(`   🔨 Found ${result.data.data.length} auctions`);
      }
      if (test.name.includes('AI Insights') && result.data?.data) {
        console.log(`   🤖 AI Score: ${result.data.data.aiScore}/100`);
      }
    } else {
      console.log('❌ FAIL');
      console.log(`   Expected success: ${test.expectedSuccess}, Got: ${result.success}`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
      failed++;
    }
  }
  
  console.log('\n📊 Test Results:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! Marketplace integration is working perfectly.');
    
    console.log('\n🔗 Available Endpoints:');
    console.log('📱 Frontend: http://localhost:5173/');
    console.log('🔧 Backend API: http://localhost:3001/api/');
    console.log('📊 Collections: http://localhost:3001/api/collections');
    console.log('🔨 Auctions: http://localhost:3001/api/auctions');
    console.log('💰 Offers: http://localhost:3001/api/offers');
    console.log('📈 Analytics: http://localhost:3001/api/analytics');
    
    console.log('\n🎯 Next Steps:');
    console.log('1. Visit http://localhost:5173/ to test the frontend');
    console.log('2. Navigate to Collections, Auctions, or Notifications pages');
    console.log('3. Test the AI Analytics dashboard integration');
    console.log('4. Verify environment variables are properly configured');
    console.log('5. Add unit tests for individual components');
    
    return true;
  } else {
    console.log('\n⚠️  Some tests failed. Please check the backend server and try again.');
    return false;
  }
}

// Run the tests
runTests().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('❌ Test runner failed:', error);
  process.exit(1);
});
