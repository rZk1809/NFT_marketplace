const mongoose = require('mongoose');
require('dotenv').config();

// Simple schema definitions for seeding
const UserSchema = new mongoose.Schema({
  walletAddress: { type: String, required: true, unique: true },
  username: String,
  email: String,
  bio: String,
  avatar: String,
  isVerified: { type: Boolean, default: false },
  profileCompleted: { type: Boolean, default: false },
  loginCount: { type: Number, default: 0 },
  reputation: {
    totalListings: { type: Number, default: 0 },
    totalRentals: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    successfulRentals: { type: Number, default: 0 }
  },
  preferences: {
    notifications: { 
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }
    },
    privacy: {
      showProfile: { type: Boolean, default: true },
      showActivity: { type: Boolean, default: true },
      showNFTs: { type: Boolean, default: true }
    },
    defaultChain: Number,
    language: { type: String, default: 'en' },
    theme: { type: String, default: 'dark' }
  },
  role: { type: String, default: 'user' }
}, { timestamps: true });

const NFTSchema = new mongoose.Schema({
  contractAddress: { type: String, required: true },
  tokenId: { type: String, required: true },
  chainId: { type: Number, required: true },
  owner: { type: String, required: true },
  metadata: {
    name: String,
    description: String,
    image: String,
    category: String,
    attributes: Array
  },
  collection: {
    name: String,
    symbol: String,
    floorPrice: Number,
    totalSupply: Number,
    verified: Boolean
  },
  pricing: {
    estimatedValue: Number,
    currentFloorPrice: Number,
    lastSalePrice: Number,
    priceHistory: Array
  },
  rental: {
    isAvailable: { type: Boolean, default: false },
    totalRentals: { type: Number, default: 0 },
    successfulRentals: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    avgDailyPrice: { type: Number, default: 0 },
    avgRentalDuration: { type: Number, default: 0 },
    ratings: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
      breakdown: {
        5: { type: Number, default: 0 },
        4: { type: Number, default: 0 },
        3: { type: Number, default: 0 },
        2: { type: Number, default: 0 },
        1: { type: Number, default: 0 }
      }
    }
  },
  analytics: {
    views: { type: Number, default: 0 },
    favorites: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    demandScore: { type: Number, default: 0 },
    rarityScore: { type: Number, default: 0 },
    utilityScore: { type: Number, default: 0 },
    trendingScore: { type: Number, default: 0 }
  },
  status: { type: String, default: 'active' }
}, { timestamps: true });

const RentalSchema = new mongoose.Schema({
  nft: { type: mongoose.Schema.Types.ObjectId, ref: 'NFT' },
  lender: String,
  pricing: {
    dailyPrice: Number,
    currency: String,
    collateralRequired: Number
  },
  duration: {
    min: Number,
    max: Number
  },
  settings: {
    instantRent: Boolean,
    allowedUseCases: [String],
    autoExtend: Boolean
  },
  terms: {
    description: String,
    restrictions: [String],
    penalties: {
      lateReturn: Number,
      damage: Number
    }
  },
  status: String,
  blockchain: {
    chainId: Number,
    contractAddress: String,
    tokenId: String
  }
}, { timestamps: true });

const LoanSchema = new mongoose.Schema({
  borrower: String,
  collateral: [{
    contractAddress: String,
    tokenId: String,
    chainId: Number,
    estimatedValue: Number,
    lockedAt: Date,
    status: String
  }],
  terms: {
    principal: Number,
    currency: String,
    interestRate: Number,
    duration: Number,
    totalRepayment: Number,
    repaymentSchedule: String,
    ltvRatio: Number
  },
  purpose: String,
  settings: {
    autoLiquidation: Boolean,
    gracePeriod: Number
  },
  status: String
}, { timestamps: true });

// Create models
const User = mongoose.model('User', UserSchema);
const NFT = mongoose.model('NFT', NFTSchema);
const Rental = mongoose.model('Rental', RentalSchema);
const Loan = mongoose.model('Loan', LoanSchema);

// Sample data
const sampleUsers = [
  {
    walletAddress: '0x742d35cc6bf8fccb87a23180b10b7e9ba8b3a0c7',
    username: 'cryptoartist',
    email: 'artist@example.com',
    bio: 'Digital artist creating unique NFT collections',
    avatar: 'https://via.placeholder.com/150',
    isVerified: true,
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
        { traitType: 'Rarity', value: 'Legendary' },
        { traitType: 'Power', value: 95 },
        { traitType: 'Element', value: 'Fire' }
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
        { traitType: 'Background', value: 'Blue' },
        { traitType: 'Eyes', value: 'Laser Eyes' },
        { traitType: 'Mouth', value: 'Grin' }
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
      lastSalePrice: 24.0
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
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lendify-test');
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
    
    console.log('🏠 Creating sample rentals...');
    const sampleRentals = [
      {
        nft: nfts[0]._id,
        lender: '0x742d35cc6bf8fccb87a23180b10b7e9ba8b3a0c7',
        pricing: {
          dailyPrice: 0.05,
          currency: 'ETH',
          collateralRequired: 0.2
        },
        duration: { min: 1, max: 7 },
        settings: {
          instantRent: true,
          allowedUseCases: ['gaming', 'metaverse'],
          autoExtend: false
        },
        terms: {
          description: 'Perfect for gaming and metaverse adventures.',
          restrictions: ['No commercial use'],
          penalties: { lateReturn: 0.01, damage: 0.1 }
        },
        status: 'active',
        blockchain: {
          chainId: 1,
          contractAddress: '0xa0b86a33e6ba3050e71c8f1d5b23c8b74b0c6d92',
          tokenId: '1001'
        }
      }
    ];
    
    const rentals = await Rental.insertMany(sampleRentals);
    console.log(`✅ Created ${rentals.length} rentals`);
    
    console.log('💰 Creating sample loans...');
    const sampleLoans = [
      {
        borrower: '0x123456789abcdef123456789abcdef123456789a',
        collateral: [{
          contractAddress: '0x60e4d786628fea6478f785a6d7e704777c86a7c6',
          tokenId: '5555',
          chainId: 1,
          estimatedValue: 8.5,
          lockedAt: new Date(),
          status: 'locked'
        }],
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
    
    const loans = await Loan.insertMany(sampleLoans);
    console.log(`✅ Created ${loans.length} loans`);
    
    console.log('🎉 Database seeding completed successfully!');
    console.log('');
    console.log('📊 Summary:');
    console.log(`   Users: ${users.length}`);
    console.log(`   NFTs: ${nfts.length}`);
    console.log(`   Rentals: ${rentals.length}`);
    console.log(`   Loans: ${loans.length}`);
    console.log('');
    console.log('🚀 Ready to test APIs with real data!');
    
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