const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Models (simplified for this demo)
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

// Health endpoints
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Lendify Backend with Real Database is running',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

const services = ['auth', 'nft', 'rental', 'lending', 'flashLoan', 'oracle', 'reputation', 'analytics', 'crossChain'];

services.forEach(service => {
  app.get(`/api/${service}/health`, (req, res) => {
    res.json({
      success: true,
      service: `${service.charAt(0).toUpperCase() + service.slice(1)} API`,
      message: 'Service is healthy',
      timestamp: new Date().toISOString()
    });
  });
});

// Auth endpoints
app.post('/api/auth/nonce', async (req, res) => {
  const { walletAddress } = req.body;
  
  if (!walletAddress) {
    return res.status(400).json({
      success: false,
      error: 'Wallet address is required'
    });
  }

  const nonce = Math.random().toString(36).substring(2, 15);
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
  
  res.json({
    success: true,
    data: {
      nonce,
      message: `Please sign this message to authenticate with Lendify:\\n\\nNonce: ${nonce}\\nTimestamp: ${new Date().toISOString()}`,
      expiresAt
    }
  });
});

app.get('/api/auth/user/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const user = await User.findOne({ walletAddress: address.toLowerCase() })
      .select('walletAddress username avatar bio isVerified reputation profileCompleted createdAt');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Database error',
      details: error.message
    });
  }
});

// NFT endpoints
app.get('/api/nft/available', async (req, res) => {
  try {
    const { page = 1, limit = 20, chainId, category } = req.query;
    
    const filters = { 
      'rental.isAvailable': true, 
      status: 'active' 
    };
    
    if (chainId) filters.chainId = parseInt(chainId);
    if (category) filters['metadata.category'] = category;
    
    const nfts = await NFT.find(filters)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await NFT.countDocuments(filters);
    
    res.json({
      success: true,
      data: {
        nfts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Database error',
      details: error.message
    });
  }
});

app.get('/api/nft/trending', async (req, res) => {
  try {
    const { limit = 20, chainId } = req.query;
    
    const filters = { status: 'active' };
    if (chainId) filters.chainId = parseInt(chainId);
    
    const nfts = await NFT.find(filters)
      .sort({ 'analytics.trendingScore': -1 })
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      data: nfts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Database error',
      details: error.message
    });
  }
});

app.get('/api/nft/search', async (req, res) => {
  try {
    const { q, page = 1, limit = 20, chainId, category } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }
    
    const filters = {
      $or: [
        { 'metadata.name': { $regex: q, $options: 'i' } },
        { 'metadata.description': { $regex: q, $options: 'i' } },
        { 'collection.name': { $regex: q, $options: 'i' } }
      ],
      status: 'active'
    };
    
    if (chainId) filters.chainId = parseInt(chainId);
    if (category) filters['metadata.category'] = category;
    
    const nfts = await NFT.find(filters)
      .sort({ 'analytics.trendingScore': -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await NFT.countDocuments(filters);
    
    res.json({
      success: true,
      data: {
        nfts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Database error',
      details: error.message
    });
  }
});

app.get('/api/nft/:chainId/:contractAddress/:tokenId', async (req, res) => {
  try {
    const { chainId, contractAddress, tokenId } = req.params;
    
    const nft = await NFT.findOne({
      chainId: parseInt(chainId),
      contractAddress: contractAddress.toLowerCase(),
      tokenId
    });
    
    if (!nft) {
      return res.status(404).json({
        success: false,
        error: 'NFT not found'
      });
    }
    
    // Increment view count
    await NFT.updateOne(
      { _id: nft._id },
      { $inc: { 'analytics.views': 1 } }
    );
    
    res.json({
      success: true,
      data: nft
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Database error',
      details: error.message
    });
  }
});

// Rental endpoints
app.get('/api/rental/available', async (req, res) => {
  try {
    const { page = 1, limit = 20, useCase, minPrice, maxPrice } = req.query;
    
    const filters = { status: 'active' };
    
    if (useCase) filters['settings.allowedUseCases'] = useCase;
    if (minPrice || maxPrice) {
      filters['pricing.dailyPrice'] = {};
      if (minPrice) filters['pricing.dailyPrice'].$gte = parseFloat(minPrice);
      if (maxPrice) filters['pricing.dailyPrice'].$lte = parseFloat(maxPrice);
    }
    
    const rentals = await Rental.find(filters)
      .populate('nft')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Rental.countDocuments(filters);
    
    res.json({
      success: true,
      data: {
        rentals,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Database error',
      details: error.message
    });
  }
});

app.get('/api/rental/:rentalId', async (req, res) => {
  try {
    const { rentalId } = req.params;
    
    const rental = await Rental.findById(rentalId).populate('nft');
    
    if (!rental) {
      return res.status(404).json({
        success: false,
        error: 'Rental not found'
      });
    }
    
    res.json({
      success: true,
      data: { rental }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Database error',
      details: error.message
    });
  }
});

// Lending endpoints
app.get('/api/lending/requests', async (req, res) => {
  try {
    const { page = 1, limit = 20, currency, maxLTV } = req.query;
    
    const filters = { status: 'requested' };
    
    if (currency) filters['terms.currency'] = currency;
    if (maxLTV) filters['terms.ltvRatio'] = { $lte: parseFloat(maxLTV) };
    
    const loans = await Loan.find(filters)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Loan.countDocuments(filters);
    
    res.json({
      success: true,
      data: {
        loanRequests: loans,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Database error',
      details: error.message
    });
  }
});

app.get('/api/lending/:loanId', async (req, res) => {
  try {
    const { loanId } = req.params;
    
    const loan = await Loan.findById(loanId);
    
    if (!loan) {
      return res.status(404).json({
        success: false,
        error: 'Loan not found'
      });
    }
    
    res.json({
      success: true,
      data: { loan }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Database error',
      details: error.message
    });
  }
});

// Database stats endpoint
app.get('/api/stats', async (req, res) => {
  try {
    const [userCount, nftCount, rentalCount, loanCount] = await Promise.all([
      User.countDocuments(),
      NFT.countDocuments(),
      Rental.countDocuments(),
      Loan.countDocuments()
    ]);
    
    const availableRentals = await Rental.countDocuments({ status: 'active' });
    const activeLendingRequests = await Loan.countDocuments({ status: 'requested' });
    
    res.json({
      success: true,
      data: {
        users: userCount,
        nfts: nftCount,
        totalRentals: rentalCount,
        totalLoans: loanCount,
        availableRentals,
        activeLendingRequests,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Database error',
      details: error.message
    });
  }
});

// Database connection test
app.get('/api/db/test', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const dbStats = await mongoose.connection.db.stats();
      res.json({
        success: true,
        message: 'Database connection is active',
        state: 'connected',
        database: mongoose.connection.db.databaseName,
        collections: dbStats.collections,
        dataSize: dbStats.dataSize,
        storageSize: dbStats.storageSize
      });
    } else {
      res.json({
        success: false,
        message: 'Database connection is not active',
        state: mongoose.connection.readyState
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Database connection test failed',
      details: error.message
    });
  }
});

// Connect to database
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lendify-test');
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Something went wrong!',
    message: err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.originalUrl
  });
});

// Start server
const startServer = async () => {
  await connectDB();
  
  app.listen(PORT, () => {
    console.log('');
    console.log('🎉 Lendify Backend with Real Database Started!');
    console.log('=' .repeat(60));
    console.log(`📍 Server running on: http://localhost:${PORT}`);
    console.log(`🗄️  Database: ${process.env.MONGODB_URI || 'mongodb://localhost:27017/lendify-test'}`);
    console.log('');
    console.log('🔍 Key Endpoints:');
    console.log(`  GET  /health                     - Server health`);
    console.log(`  GET  /api/stats                  - Platform statistics`);
    console.log(`  GET  /api/db/test               - Database connection test`);
    console.log('');
    console.log('🎨 NFT Endpoints:');
    console.log(`  GET  /api/nft/available         - Available NFTs (with real data)`);
    console.log(`  GET  /api/nft/trending          - Trending NFTs`);
    console.log(`  GET  /api/nft/search?q=query    - Search NFTs`);
    console.log('');
    console.log('🏠 Rental Endpoints:');
    console.log(`  GET  /api/rental/available      - Available rentals`);
    console.log(`  GET  /api/rental/:id            - Rental details`);
    console.log('');
    console.log('💰 Lending Endpoints:');
    console.log(`  GET  /api/lending/requests      - Loan requests`);
    console.log(`  GET  /api/lending/:id           - Loan details`);
    console.log('');
    console.log('👤 User Endpoints:');
    console.log(`  GET  /api/auth/user/:address    - User profile`);
    console.log(`  POST /api/auth/nonce           - Generate nonce`);
    console.log('');
    console.log('🧪 Test with real data now available!');
    console.log('=' .repeat(60));
  });
};

startServer().catch(console.error);