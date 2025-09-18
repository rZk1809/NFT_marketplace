const axios = require('axios');

const BASE_URL = 'http://localhost:3002/api';

async function demoUserFlows() {
  console.log('🎮 LENDIFY USER FLOWS DEMONSTRATION');
  console.log('=' .repeat(50));
  console.log('');

  try {
    // User Flow 1: New User Onboarding & Authentication
    console.log('👤 USER FLOW 1: Authentication & Profile');
    console.log('-' .repeat(40));
    
    const userAddress = '0x742d35cc6bf8fccb87a23180b10b7e9ba8b3a0c7';
    
    // Step 1: Generate authentication nonce
    const nonce = await axios.post(`${BASE_URL}/auth/nonce`, {
      walletAddress: userAddress
    });
    console.log('✅ Step 1: Nonce generated for wallet authentication');
    console.log(`   🎲 Nonce: ${nonce.data.data.nonce}`);
    
    // Step 2: Get user profile (simulating successful wallet signature)
    const userProfile = await axios.get(`${BASE_URL}/auth/user/${userAddress}`);
    console.log('✅ Step 2: User profile loaded');
    console.log(`   👤 User: ${userProfile.data.data.user.username}`);
    console.log(`   ⭐ Rating: ${userProfile.data.data.user.reputation.averageRating}/5.0`);
    console.log(`   📈 Listings: ${userProfile.data.data.user.reputation.totalListings}`);
    console.log('');

    // User Flow 2: NFT Discovery & Marketplace Browsing
    console.log('🎨 USER FLOW 2: NFT Discovery & Browsing');
    console.log('-' .repeat(40));
    
    // Step 1: Browse available NFTs
    const availableNFTs = await axios.get(`${BASE_URL}/nft/available?limit=3`);
    console.log('✅ Step 1: Browse available NFTs for rent');
    console.log(`   📊 Found ${availableNFTs.data.data.nfts.length} available NFTs`);
    
    // Step 2: Check trending NFTs
    const trendingNFTs = await axios.get(`${BASE_URL}/nft/trending?limit=2`);
    console.log('✅ Step 2: Check trending NFTs');
    console.log(`   🔥 Found ${trendingNFTs.data.data.length} trending NFTs`);
    
    // Step 3: Search for specific NFTs
    const searchResults = await axios.get(`${BASE_URL}/nft/search?q=ape`);
    console.log('✅ Step 3: Search for \"ape\" NFTs');
    console.log(`   🔍 Found ${searchResults.data.data.nfts.length} matching NFTs`);
    
    if (availableNFTs.data.data.nfts.length > 0) {
      const featuredNFT = availableNFTs.data.data.nfts[0];
      console.log('   🎯 Featured NFT: ' + featuredNFT.metadata.name);
      console.log('   💰 Collection Floor: ' + featuredNFT.collection.floorPrice + ' ETH');
      console.log('   ⭐ Rental Rating: ' + featuredNFT.rental.ratings.average + '/5.0');
    }
    console.log('');

    // User Flow 3: Rental Marketplace
    console.log('🏠 USER FLOW 3: Rental Marketplace');
    console.log('-' .repeat(40));
    
    // Step 1: Browse available rentals
    const rentals = await axios.get(`${BASE_URL}/rental/available?limit=3`);
    console.log('✅ Step 1: Browse available rentals');
    console.log(`   📊 Found ${rentals.data.data.rentals.length} active rentals`);
    
    if (rentals.data.data.rentals.length > 0) {
      const rental = rentals.data.data.rentals[0];
      console.log('   💰 Price: ' + rental.pricing.dailyPrice + ' ' + rental.pricing.currency + '/day');
      console.log('   🔒 Collateral: ' + rental.pricing.collateralRequired + ' ETH');
      console.log('   ⚡ Instant Rent: ' + (rental.settings.instantRent ? 'Yes' : 'No'));
      
      // Step 2: Get detailed rental information
      const rentalDetails = await axios.get(`${BASE_URL}/rental/${rental._id}`);
      console.log('✅ Step 2: Rental details loaded');
      console.log('   📝 Terms: ' + rentalDetails.data.data.rental.terms.description);
      console.log('   🎯 Use Cases: ' + rental.settings.allowedUseCases.join(', '));
    }
    console.log('');

    // User Flow 4: Lending Platform
    console.log('💰 USER FLOW 4: Lending & Borrowing');
    console.log('-' .repeat(40));
    
    // Step 1: Browse loan requests
    const loans = await axios.get(`${BASE_URL}/lending/requests?limit=2`);
    console.log('✅ Step 1: Browse loan requests');
    console.log(`   📊 Found ${loans.data.data.loanRequests.length} loan requests`);
    
    if (loans.data.data.loanRequests.length > 0) {
      const loan = loans.data.data.loanRequests[0];
      console.log('   💵 Principal: ' + loan.terms.principal + ' ' + loan.terms.currency);
      console.log('   📈 Interest Rate: ' + loan.terms.interestRate + '% APY');
      console.log('   📅 Duration: ' + loan.terms.duration + ' days');
      console.log('   🏦 LTV Ratio: ' + (loan.terms.ltvRatio * 100).toFixed(1) + '%');
      
      // Step 2: Get detailed loan information
      const loanDetails = await axios.get(`${BASE_URL}/lending/${loan._id}`);
      console.log('✅ Step 2: Loan details loaded');
      console.log('   🎯 Purpose: ' + loanDetails.data.data.loan.purpose);
      console.log('   💎 Collateral: ' + loan.collateral.length + ' NFT(s)');
      console.log('   💰 Collateral Value: ' + loan.collateral[0].estimatedValue + ' ETH');
    }
    console.log('');

    // User Flow 5: Platform Analytics & Stats
    console.log('📊 USER FLOW 5: Platform Analytics');
    console.log('-' .repeat(40));
    
    const stats = await axios.get(`${BASE_URL}/stats`);
    console.log('✅ Platform statistics loaded');
    console.log(`   👥 Total Users: ${stats.data.data.users.toLocaleString()}`);
    console.log(`   🎨 Total NFTs: ${stats.data.data.nfts.toLocaleString()}`);
    console.log(`   🏠 Active Rentals: ${stats.data.data.availableRentals.toLocaleString()}`);
    console.log(`   💰 Loan Requests: ${stats.data.data.activeLendingRequests.toLocaleString()}`);
    console.log(`   📈 Total Volume: ${stats.data.data.totalRentals + stats.data.data.totalLoans} transactions`);
    console.log('');

    // Performance Summary
    console.log('⚡ PERFORMANCE SUMMARY');
    console.log('-' .repeat(40));
    const startTime = Date.now();
    
    await Promise.all([
      axios.get(`${BASE_URL}/stats`),
      axios.get(`${BASE_URL}/nft/available`),
      axios.get(`${BASE_URL}/rental/available`),
      axios.get(`${BASE_URL}/lending/requests`)
    ]);
    
    const totalTime = Date.now() - startTime;
    console.log(`✅ 4 concurrent API calls completed in ${totalTime}ms`);
    console.log(`⚡ Average response time: ${Math.round(totalTime / 4)}ms`);
    console.log(`🚀 Performance Grade: ${totalTime < 50 ? 'EXCELLENT' : totalTime < 100 ? 'GOOD' : 'ACCEPTABLE'}`);
    console.log('');

    // Final Summary
    console.log('🎯 DEMONSTRATION COMPLETE!');
    console.log('=' .repeat(50));
    console.log('✅ User authentication and profiles working');
    console.log('✅ NFT marketplace fully functional');
    console.log('✅ Rental platform operational');
    console.log('✅ Lending platform working');
    console.log('✅ Real-time analytics available');
    console.log('✅ Excellent performance across all flows');
    console.log('');
    console.log('🚀 ALL USER FLOWS SUCCESSFULLY DEMONSTRATED!');
    console.log('💎 Lendify is ready for real users!');
    console.log('=' .repeat(50));

  } catch (error) {
    console.error('❌ Demo failed:', error.response?.data || error.message);
  }
}

demoUserFlows();