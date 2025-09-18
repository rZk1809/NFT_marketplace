const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Lendify Backend Test Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API health endpoints for testing
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

// Test endpoints for API functionality
app.get('/api/nft/available', (req, res) => {
  res.json({
    success: true,
    data: {
      nfts: [
        {
          id: '1',
          contractAddress: '0xa0b86a33e6ba3050e71c8f1d5b23c8b74b0c6d92',
          tokenId: '1001',
          chainId: 1,
          name: 'Cosmic Dragon #1001',
          image: 'https://via.placeholder.com/500',
          dailyPrice: 0.05,
          currency: 'ETH',
          isAvailable: true
        },
        {
          id: '2',
          contractAddress: '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d',
          tokenId: '2002',
          chainId: 1,
          name: 'Bored Ape #2002',
          image: 'https://via.placeholder.com/500',
          dailyPrice: 0.25,
          currency: 'ETH',
          isAvailable: true
        }
      ],
      pagination: {
        page: 1,
        limit: 20,
        total: 2,
        pages: 1
      }
    }
  });
});

app.get('/api/nft/trending', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: '1',
        contractAddress: '0xa0b86a33e6ba3050e71c8f1d5b23c8b74b0c6d92',
        tokenId: '1001',
        chainId: 1,
        name: 'Cosmic Dragon #1001',
        trendingScore: 88,
        views: 150,
        favorites: 25
      },
      {
        id: '2',
        contractAddress: '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d',
        tokenId: '2002',
        chainId: 1,
        name: 'Bored Ape #2002',
        trendingScore: 92,
        views: 320,
        favorites: 45
      }
    ]
  });
});

app.post('/api/auth/nonce', (req, res) => {
  const { walletAddress } = req.body;
  
  if (!walletAddress) {
    return res.status(400).json({
      success: false,
      error: 'Wallet address is required'
    });
  }

  const nonce = Math.random().toString(36).substring(2, 15);
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
  
  res.json({
    success: true,
    data: {
      nonce,
      message: `Please sign this message to authenticate with Lendify:\\n\\nNonce: ${nonce}\\nTimestamp: ${new Date().toISOString()}`,
      expiresAt
    }
  });
});

app.get('/api/rental/available', (req, res) => {
  res.json({
    success: true,
    data: {
      rentals: [
        {
          id: '1',
          nft: {
            contractAddress: '0xa0b86a33e6ba3050e71c8f1d5b23c8b74b0c6d92',
            tokenId: '1001',
            name: 'Cosmic Dragon #1001',
            image: 'https://via.placeholder.com/500'
          },
          dailyPrice: 0.05,
          currency: 'ETH',
          minDuration: 1,
          maxDuration: 7,
          collateralRequired: 0.2,
          instantRent: true,
          allowedUseCases: ['gaming', 'metaverse']
        },
        {
          id: '2',
          nft: {
            contractAddress: '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d',
            tokenId: '2002',
            name: 'Bored Ape #2002',
            image: 'https://via.placeholder.com/500'
          },
          dailyPrice: 0.25,
          currency: 'ETH',
          minDuration: 1,
          maxDuration: 3,
          collateralRequired: 5.0,
          instantRent: false,
          allowedUseCases: ['pfp', 'utility']
        }
      ],
      pagination: {
        page: 1,
        limit: 20,
        total: 2,
        pages: 1
      }
    }
  });
});

app.get('/api/lending/requests', (req, res) => {
  res.json({
    success: true,
    data: {
      loanRequests: [
        {
          id: '1',
          borrower: '0x123456789abcdef123456789abcdef123456789a',
          collateral: [
            {
              contractAddress: '0x60e4d786628fea6478f785a6d7e704777c86a7c6',
              tokenId: '5555',
              name: 'Mutant Ape #5555',
              estimatedValue: 8.5
            }
          ],
          loanAmount: 5.0,
          currency: 'ETH',
          interestRate: 15.0,
          duration: 30,
          ltvRatio: 58.8,
          purpose: 'Short-term liquidity for new project launch'
        }
      ],
      pagination: {
        page: 1,
        limit: 20,
        total: 1,
        pages: 1
      }
    }
  });
});

// Database connection test
app.get('/api/db/test', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      res.json({
        success: true,
        message: 'Database connection is active',
        state: 'connected'
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

// Try to connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lendify-test');
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.log('⚠️  Continuing without database connection for API testing');
  }
};

// Error handling middleware
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
    console.log('🚀 Lendify Backend Test Server Started!');
    console.log('=' .repeat(50));
    console.log(`📍 Server running on: http://localhost:${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📦 Database: ${process.env.MONGODB_URI || 'mongodb://localhost:27017/lendify-test'}`);
    console.log('');
    console.log('📋 Available Endpoints:');
    console.log('  GET  /health                     - Server health check');
    console.log('  GET  /api/db/test               - Database connection test');
    console.log('  GET  /api/{service}/health      - Service health checks');
    console.log('  GET  /api/nft/available         - Available NFTs');
    console.log('  GET  /api/nft/trending          - Trending NFTs');
    console.log('  POST /api/auth/nonce           - Generate auth nonce');
    console.log('  GET  /api/rental/available      - Available rentals');
    console.log('  GET  /api/lending/requests      - Loan requests');
    console.log('');
    console.log('🧪 Run tests with: node test-api.js');
    console.log('=' .repeat(50));
  });
};

startServer().catch(console.error);