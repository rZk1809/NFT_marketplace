const mongoose = require('mongoose');
require('dotenv').config();

// Define simple schemas
const UserSchema = new mongoose.Schema({
  walletAddress: { type: String, required: true, unique: true },
  username: String,
  email: String,
  bio: String,
  avatar: String,
  isVerified: { type: Boolean, default: false },
  profileCompleted: { type: Boolean, default: false },
  reputation: {
    totalListings: { type: Number, default: 0 },
    totalRentals: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    successfulRentals: { type: Number, default: 0 }
  }
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
    verified: Boolean
  },
  rental: {
    isAvailable: { type: Boolean, default: false },
    totalRentals: { type: Number, default: 0 },
    avgDailyPrice: { type: Number, default: 0 },
    ratings: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 }
    }
  },
  analytics: {
    views: { type: Number, default: 0 },
    favorites: { type: Number, default: 0 },
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
    allowedUseCases: [String]
  },
  terms: {
    description: String,
    restrictions: [String]
  },
  status: String
}, { timestamps: true });

const LoanSchema = new mongoose.Schema({
  borrower: String,
  collateral: [{
    contractAddress: String,
    tokenId: String,
    chainId: Number,
    estimatedValue: Number
  }],
  terms: {
    principal: Number,
    currency: String,
    interestRate: Number,
    duration: Number,
    ltvRatio: Number
  },
  purpose: String,
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
      verified: true
    },
    rental: {
      isAvailable: true,
      totalRentals: 3,
      avgDailyPrice: 0.05,
      ratings: {
        average: 4.8,
        count: 3
      }
    },
    analytics: {
      views: 150,
      favorites: 25,
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
      verified: true
    },
    rental: {
      isAvailable: true,
      totalRentals: 1,
      avgDailyPrice: 0.25,
      ratings: {
        average: 5.0,
        count: 1
      }
    },
    analytics: {
      views: 320,
      favorites: 45,
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
      category: 'collectible',
      attributes: [
        { traitType: 'Background', value: 'Purple' },
        { traitType: 'Fur', value: 'Golden' },
        { traitType: 'Eyes', value: 'Bloodshot' }
      ]
    },
    collection: {
      name: 'Mutant Ape Yacht Club',
      symbol: 'MAYC',
      floorPrice: 8.0,
      verified: true
    },
    rental: {
      isAvailable: true,
      totalRentals: 5,
      avgDailyPrice: 0.15,
      ratings: {
        average: 4.6,
        count: 5
      }
    },
    analytics: {
      views: 280,
      favorites: 38,
      trendingScore: 85
    },
    status: 'active'
  }
];

// Database connection and seeding
async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lendify-test');
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await NFT.deleteMany({});
    await Rental.deleteMany({});
    await Loan.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Insert users
    const users = await User.insertMany(sampleUsers);
    console.log(`👥 Inserted ${users.length} users`);

    // Insert NFTs
    const nfts = await NFT.insertMany(sampleNFTs);
    console.log(`🎨 Inserted ${nfts.length} NFTs`);

    // Create sample rentals
    const sampleRentals = [
      {
        nft: nfts[0]._id,
        lender: users[0].walletAddress,
        pricing: {
          dailyPrice: 0.05,
          currency: 'ETH',
          collateralRequired: 0.1
        },
        duration: {
          min: 1,
          max: 30
        },
        settings: {
          instantRent: true,
          allowedUseCases: ['gaming', 'display']
        },
        terms: {
          description: 'Perfect for gaming adventures and virtual displays',
          restrictions: ['No commercial use', 'No resale during rental period']
        },
        status: 'active'
      },
      {
        nft: nfts[1]._id,
        lender: users[1].walletAddress,
        pricing: {
          dailyPrice: 0.25,
          currency: 'ETH',
          collateralRequired: 5.0
        },
        duration: {
          min: 1,
          max: 14
        },
        settings: {
          instantRent: false,
          allowedUseCases: ['pfp', 'display']
        },
        terms: {
          description: 'Premium Bored Ape for profile picture use',
          restrictions: ['Must maintain original metadata', 'No derivative works']
        },
        status: 'active'
      },
      {
        nft: nfts[2]._id,
        lender: users[2].walletAddress,
        pricing: {
          dailyPrice: 0.15,
          currency: 'ETH',
          collateralRequired: 1.5
        },
        duration: {
          min: 3,
          max: 21
        },
        settings: {
          instantRent: true,
          allowedUseCases: ['pfp', 'gaming', 'metaverse']
        },
        terms: {
          description: 'Versatile Mutant Ape for multiple use cases',
          restrictions: ['No commercial advertising', 'Respect community guidelines']
        },
        status: 'active'
      }
    ];

    const rentals = await Rental.insertMany(sampleRentals);
    console.log(`🏠 Inserted ${rentals.length} rentals`);

    // Create sample loans
    const sampleLoans = [
      {
        borrower: users[0].walletAddress,
        collateral: [
          {
            contractAddress: nfts[0].contractAddress,
            tokenId: nfts[0].tokenId,
            chainId: 1,
            estimatedValue: 1.2
          }
        ],
        terms: {
          principal: 0.5,
          currency: 'ETH',
          interestRate: 8.5,
          duration: 30,
          ltvRatio: 0.42
        },
        purpose: 'Portfolio expansion',
        status: 'requested'
      },
      {
        borrower: users[1].walletAddress,
        collateral: [
          {
            contractAddress: nfts[1].contractAddress,
            tokenId: nfts[1].tokenId,
            chainId: 1,
            estimatedValue: 25.5
          }
        ],
        terms: {
          principal: 10.0,
          currency: 'ETH',
          interestRate: 7.0,
          duration: 60,
          ltvRatio: 0.39
        },
        purpose: 'Business investment',
        status: 'requested'
      }
    ];

    const loans = await Loan.insertMany(sampleLoans);
    console.log(`💰 Inserted ${loans.length} loans`);

    console.log('');
    console.log('🎉 Database seeded successfully!');
    console.log('📊 Summary:');
    console.log(`  Users: ${users.length}`);
    console.log(`  NFTs: ${nfts.length}`);
    console.log(`  Rentals: ${rentals.length}`);
    console.log(`  Loans: ${loans.length}`);
    console.log('');

    await mongoose.disconnect();
    console.log('❌ Disconnected from MongoDB');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run the seeding
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;