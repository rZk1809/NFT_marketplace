const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('./dist/models/User').User;
const NFT = require('./dist/models/NFT').NFT;
const Rental = require('./dist/models/Rental').Rental;
const Loan = require('./dist/models/Loan').Loan;

// Sample data
const sampleUsers = [
  {
    walletAddress: '0x742d35cc6bf8fccb87a23180b10b7e9ba8b3a0c7',
    username: 'cryptoartist',
    email: 'artist@example.com',
    bio: 'Digital artist creating unique NFT collections',
    avatar: 'https://via.placeholder.com/150',
    isVerified: true,
    role: 'user',
    profileCompleted: true,
    reputation: {
      totalListings: 15,
      totalRentals: 8,
      totalEarnings: 2.5,
      averageRating: 4.8,
      successfulRentals: 8
    },
    preferences: {
      notifications: { email: true, push: true, sms: false },
      privacy: { showProfile: true, showActivity: true, showNFTs: true },
      defaultChain: 1,
      language: 'en',
      theme: 'dark'
    }
  },
  {
    walletAddress: '0x8ba1f109551bd432803012645hac136c2c9e9c7',
    username: 'nftcollector',
    email: 'collector@example.com',
    bio: 'Passionate NFT collector and enthusiast',
    avatar: 'https://via.placeholder.com/150',
    isVerified: false,
    role: 'user',
    profileCompleted: true,
    reputation: {
      totalListings: 5,
      totalRentals: 12,
      totalEarnings: 0.8,
      averageRating: 4.6,
      successfulRentals: 11
    }
  },
  {
    walletAddress: '0x123456789abcdef123456789abcdef123456789a',
    username: 'gamemaster',
    email: 'gamer@example.com',
    bio: 'Gaming NFT specialist',
    avatar: 'https://via.placeholder.com/150',
    isVerified: true,
    role: 'user',
    profileCompleted: true,
    reputation: {
      totalListings: 25,
      totalRentals: 20,
      totalEarnings: 5.2,
      averageRating: 4.9,
      successfulRentals: 19
    }
  }
];

const sampleNFTs = [
  {
    contractAddress: '0xa0b86a33e6ba3050e71c8f1d5b23c8b74b0c6d92',
    tokenId: '1001',
    chainId: 1,
    owner: '0x742d35cc6bf8fccb87a23180b10b7e9ba8b3a0c7',
    metadata: {
      name: 'Cosmic Dragon #1001',
      description: 'A mystical dragon from the cosmic realm',
      image: 'https://via.placeholder.com/500',
      category: 'gaming',
      attributes: [
        { traitType: 'Rarity', value: 'Legendary', displayType: 'string' },
        { traitType: 'Power', value: 95, displayType: 'number', maxValue: 100 },
        { traitType: 'Element', value: 'Fire', displayType: 'string' }
      ]
    },
    collection: {
      name: 'Cosmic Dragons',
      symbol: 'CDRG',
      floorPrice: 0.5,
      totalSupply: 10000,
      verified: true
    },
    pricing: {
      estimatedValue: 1.2,
      currentFloorPrice: 0.5,
      lastSalePrice: 1.1,
      priceHistory: [
        {
          price: 1.2,
          currency: 'ETH',
          timestamp: new Date(),
          source: 'listing'
        }
      ]
    },
    rental: {
      isAvailable: true,
      totalRentals: 3,
      successfulRentals: 3,
      totalRevenue: 0.45,
      avgDailyPrice: 0.05,
      avgRentalDuration: 3,
      ratings: {
        average: 4.8,
        count: 3,
        breakdown: { 5: 2, 4: 1, 3: 0, 2: 0, 1: 0 }
      }
    },
    analytics: {
      views: 150,
      favorites: 25,
      shares: 8,
      demandScore: 78,
      rarityScore: 92,
      utilityScore: 85,
      trendingScore: 88
    },
    status: 'active'
  },
  {
    contractAddress: '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d',
    tokenId: '2002',
    chainId: 1,
    owner: '0x8ba1f109551bd432803012645hac136c2c9e9c7',
    metadata: {
      name: 'Bored Ape #2002',
      description: 'A unique member of the Bored Ape Yacht Club',
      image: 'https://via.placeholder.com/500',
      category: 'pfp',
      attributes: [
        { traitType: 'Background', value: 'Blue', displayType: 'string' },
        { traitType: 'Eyes', value: 'Laser Eyes', displayType: 'string' },
        { traitType: 'Mouth', value: 'Grin', displayType: 'string' }
      ]
    },
    collection: {
      name: 'Bored Ape Yacht Club',
      symbol: 'BAYC',
      floorPrice: 15.0,
      totalSupply: 10000,
      verified: true
    },
    pricing: {
      estimatedValue: 25.5,
      currentFloorPrice: 15.0,
      lastSalePrice: 24.0,
      priceHistory: [
        {
          price: 25.5,
          currency: 'ETH',
          timestamp: new Date(),
          source: 'listing'
        }
      ]
    },
    rental: {
      isAvailable: true,
      totalRentals: 1,
      successfulRentals: 1,
      totalRevenue: 0.5,
      avgDailyPrice: 0.25,
      avgRentalDuration: 2,
      ratings: {
        average: 5.0,
        count: 1,
        breakdown: { 5: 1, 4: 0, 3: 0, 2: 0, 1: 0 }
      }
    },
    analytics: {
      views: 320,
      favorites: 45,
      shares: 12,
      demandScore: 95,
      rarityScore: 88,
      utilityScore: 70,
      trendingScore: 92
    },
    status: 'active'
  },
  {
    contractAddress: '0x60e4d786628fea6478f785a6d7e704777c86a7c6',
    tokenId: '5555',
    chainId: 1,
    owner: '0x123456789abcdef123456789abcdef123456789a',
    metadata: {
      name: 'Mutant Ape #5555',
      description: 'A mutated member of the ape society',
      image: 'https://via.placeholder.com/500',
      category: 'gaming',
      attributes: [
        { traitType: 'Type', value: 'M1 Serum', displayType: 'string' },
        { traitType: 'Background', value: 'M1 Gray', displayType: 'string' },
        { traitType: 'Fur', value: 'M1 Blue', displayType: 'string' }
      ]
    },
    collection: {
      name: 'Mutant Ape Yacht Club',
      symbol: 'MAYC',
      floorPrice: 5.2,
      totalSupply: 19423,
      verified: true
    },
    pricing: {
      estimatedValue: 8.5,
      currentFloorPrice: 5.2,
      lastSalePrice: 7.8,
      priceHistory: [
        {
          price: 8.5,
          currency: 'ETH',
          timestamp: new Date(),
          source: 'listing'
        }
      ]
    },
    rental: {
      isAvailable: false,
      totalRentals: 5,
      successfulRentals: 5,
      totalRevenue: 1.25,
      avgDailyPrice: 0.1,
      avgRentalDuration: 2.5,
      ratings: {
        average: 4.6,
        count: 5,
        breakdown: { 5: 3, 4: 1, 3: 1, 2: 0, 1: 0 }
      }
    },
    analytics: {
      views: 89,
      favorites: 15,
      shares: 3,
      demandScore: 72,
      rarityScore: 75,
      utilityScore: 90,
      trendingScore: 68
    },
    status: 'active'
  }
];

const sampleRentals = [
  {
    lender: '0x742d35cc6bf8fccb87a23180b10b7e9ba8b3a0c7',
    pricing: {
      dailyPrice: 0.05,
      currency: 'ETH',
      collateralRequired: 0.2
    },
    duration: {
      min: 1,
      max: 7
    },
    settings: {
      instantRent: true,
      allowedUseCases: ['gaming', 'metaverse'],
      autoExtend: false
    },
    terms: {
      description: 'Perfect for gaming and metaverse adventures. High-powered cosmic dragon with legendary rarity.',
      restrictions: ['No commercial use', 'No modification of appearance'],
      penalties: {
        lateReturn: 0.01,
        damage: 0.1
      }
    },
    status: 'active',
    blockchain: {
      chainId: 1,
      contractAddress: '0xa0b86a33e6ba3050e71c8f1d5b23c8b74b0c6d92',
      tokenId: '1001'
    }
  },
  {
    lender: '0x8ba1f109551bd432803012645hac136c2c9e9c7',
    pricing: {
      dailyPrice: 0.25,
      currency: 'ETH',
      collateralRequired: 5.0
    },
    duration: {
      min: 1,
      max: 3
    },
    settings: {
      instantRent: false,
      allowedUseCases: ['pfp', 'utility'],
      autoExtend: false
    },
    terms: {
      description: 'Premium Bored Ape for profile picture use. High value NFT with excellent reputation.',
      restrictions: ['PFP use only', 'No commercial licensing', 'Credit original owner'],
      penalties: {
        lateReturn: 0.05,
        damage: 2.0
      }
    },
    status: 'active',
    blockchain: {
      chainId: 1,
      contractAddress: '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d',
      tokenId: '2002'
    }
  }
];

const sampleLoans = [
  {
    borrower: '0x123456789abcdef123456789abcdef123456789a',
    collateral: [
      {
        contractAddress: '0x60e4d786628fea6478f785a6d7e704777c86a7c6',
        tokenId: '5555',
        chainId: 1,
        estimatedValue: 8.5,
        lockedAt: new Date(),
        status: 'locked'
      }
    ],
    terms: {
      principal: 5.0,
      currency: 'ETH',
      interestRate: 15.0,
      duration: 30,
      totalRepayment: 5.62,
      repaymentSchedule: 'lump_sum',
      ltvRatio: 58.8
    },
    purpose: 'Short-term liquidity for new project launch',
    settings: {
      autoLiquidation: true,
      gracePeriod: 7
    },
    status: 'requested'
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      NFT.deleteMany({}),
      Rental.deleteMany({}),
      Loan.deleteMany({})
    ]);
    
    // Insert sample data
    console.log('📝 Inserting sample users...');
    const users = await User.insertMany(sampleUsers);
    console.log(`✅ Created ${users.length} users`);
    
    console.log('🎨 Inserting sample NFTs...');
    const nfts = await NFT.insertMany(sampleNFTs);
    console.log(`✅ Created ${nfts.length} NFTs`);
    
    console.log('🏠 Inserting sample rentals...');
    // Link rentals to actual NFT IDs
    const rentalsWithNFTs = sampleRentals.map((rental, index) => ({
      ...rental,
      nft: nfts[index]._id
    }));
    const rentals = await Rental.insertMany(rentalsWithNFTs);
    console.log(`✅ Created ${rentals.length} rentals`);
    
    // Update NFTs with rental listing IDs
    await NFT.findByIdAndUpdate(nfts[0]._id, {
      'rental.currentListing': rentals[0]._id
    });
    await NFT.findByIdAndUpdate(nfts[1]._id, {
      'rental.currentListing': rentals[1]._id
    });
    
    console.log('💰 Inserting sample loans...');
    // Link loans to actual NFT IDs
    const loansWithNFTs = sampleLoans.map(loan => ({
      ...loan,
      collateral: loan.collateral.map(coll => ({
        ...coll,
        nft: nfts[2]._id
      }))
    }));
    const loans = await Loan.insertMany(loansWithNFTs);
    console.log(`✅ Created ${loans.length} loans`);
    
    // Update NFT with loan collateral info
    await NFT.findByIdAndUpdate(nfts[2]._id, {
      'collateral.isLocked': true,
      'collateral.loanId': loans[0]._id,
      'collateral.lockedAt': new Date()
    });
    
    console.log('🎉 Database seeding completed successfully!');
    console.log('');
    console.log('📊 Summary:');
    console.log(`   Users: ${users.length}`);
    console.log(`   NFTs: ${nfts.length}`);
    console.log(`   Rentals: ${rentals.length}`);
    console.log(`   Loans: ${loans.length}`);
    console.log('');
    console.log('🚀 Ready to test APIs!');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await mongoose.connection.close();
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;