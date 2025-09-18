import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const config = {
  // Server configuration
  server: {
    port: parseInt(process.env.PORT || '3001'),
    host: process.env.HOST || 'localhost',
    nodeEnv: process.env.NODE_ENV || 'development',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000'
  },

  // Database configuration
  database: {
    mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/lendify',
    maxPoolSize: parseInt(process.env.DB_MAX_POOL_SIZE || '10'),
    serverSelectionTimeoutMS: parseInt(process.env.DB_SERVER_SELECTION_TIMEOUT || '5000'),
    socketTimeoutMS: parseInt(process.env.DB_SOCKET_TIMEOUT || '45000'),
  },

  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  },

  // Blockchain configuration
  blockchain: {
    ethereum: {
      rpcUrl: process.env.ETHEREUM_RPC_URL || 'https://eth-mainnet.alchemyapi.io/v2/YOUR_API_KEY',
      chainId: 1,
      explorerUrl: 'https://etherscan.io'
    },
    polygon: {
      rpcUrl: process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com',
      chainId: 137,
      explorerUrl: 'https://polygonscan.com'
    },
    arbitrum: {
      rpcUrl: process.env.ARBITRUM_RPC_URL || 'https://arb1.arbitrum.io/rpc',
      chainId: 42161,
      explorerUrl: 'https://arbiscan.io'
    },
    optimism: {
      rpcUrl: process.env.OPTIMISM_RPC_URL || 'https://mainnet.optimism.io',
      chainId: 10,
      explorerUrl: 'https://optimistic.etherscan.io'
    },
    base: {
      rpcUrl: process.env.BASE_RPC_URL || 'https://mainnet.base.org',
      chainId: 8453,
      explorerUrl: 'https://basescan.org'
    }
  },

  // Smart contract addresses
  contracts: {
    ethereum: {
      nftRentalMarketplace: process.env.ETH_NFT_RENTAL_MARKETPLACE || '',
      reputationSystem: process.env.ETH_REPUTATION_SYSTEM || '',
      nftCollateralizedLending: process.env.ETH_NFT_COLLATERALIZED_LENDING || '',
      flashRentalLoan: process.env.ETH_FLASH_RENTAL_LOAN || '',
      dynamicPricingOracle: process.env.ETH_DYNAMIC_PRICING_ORACLE || ''
    },
    polygon: {
      nftRentalMarketplace: process.env.POLYGON_NFT_RENTAL_MARKETPLACE || '',
      reputationSystem: process.env.POLYGON_REPUTATION_SYSTEM || '',
      nftCollateralizedLending: process.env.POLYGON_NFT_COLLATERALIZED_LENDING || '',
      flashRentalLoan: process.env.POLYGON_FLASH_RENTAL_LOAN || '',
      dynamicPricingOracle: process.env.POLYGON_DYNAMIC_PRICING_ORACLE || ''
    },
    arbitrum: {
      nftRentalMarketplace: process.env.ARB_NFT_RENTAL_MARKETPLACE || '',
      reputationSystem: process.env.ARB_REPUTATION_SYSTEM || '',
      nftCollateralizedLending: process.env.ARB_NFT_COLLATERALIZED_LENDING || '',
      flashRentalLoan: process.env.ARB_FLASH_RENTAL_LOAN || '',
      dynamicPricingOracle: process.env.ARB_DYNAMIC_PRICING_ORACLE || ''
    },
    optimism: {
      nftRentalMarketplace: process.env.OP_NFT_RENTAL_MARKETPLACE || '',
      reputationSystem: process.env.OP_REPUTATION_SYSTEM || '',
      nftCollateralizedLending: process.env.OP_NFT_COLLATERALIZED_LENDING || '',
      flashRentalLoan: process.env.OP_FLASH_RENTAL_LOAN || '',
      dynamicPricingOracle: process.env.OP_DYNAMIC_PRICING_ORACLE || ''
    },
    base: {
      nftRentalMarketplace: process.env.BASE_NFT_RENTAL_MARKETPLACE || '',
      reputationSystem: process.env.BASE_REPUTATION_SYSTEM || '',
      nftCollateralizedLending: process.env.BASE_NFT_COLLATERALIZED_LENDING || '',
      flashRentalLoan: process.env.BASE_FLASH_RENTAL_LOAN || '',
      dynamicPricingOracle: process.env.BASE_DYNAMIC_PRICING_ORACLE || ''
    }
  },

  // AI Services configuration
  ai: {
    openai: {
      apiKey: process.env.OPENAI_API_KEY || '',
      model: process.env.OPENAI_MODEL || 'gpt-4',
      maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '1000')
    },
    huggingface: {
      apiKey: process.env.HUGGINGFACE_API_KEY || '',
      modelUrl: process.env.HUGGINGFACE_MODEL_URL || 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium'
    }
  },

  // External APIs
  apis: {
    chainlink: {
      apiKey: process.env.CHAINLINK_API_KEY || ''
    },
    alchemy: {
      apiKey: process.env.ALCHEMY_API_KEY || ''
    },
    infura: {
      projectId: process.env.INFURA_PROJECT_ID || '',
      projectSecret: process.env.INFURA_PROJECT_SECRET || ''
    },
    opensea: {
      apiKey: process.env.OPENSEA_API_KEY || ''
    }
  },

  // Notification services
  notifications: {
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
      from: process.env.SMTP_FROM || 'noreply@lendify.com'
    },
    twilio: {
      sid: process.env.TWILIO_SID || '',
      token: process.env.TWILIO_TOKEN || '',
      phone: process.env.TWILIO_PHONE || ''
    },
    fcm: {
      serverKey: process.env.FCM_SERVER_KEY || ''
    }
  },

  // Rate limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    skipSuccessfulRequests: process.env.RATE_LIMIT_SKIP_SUCCESS === 'true'
  },

  // File upload
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
    allowedTypes: (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/gif').split(',')
  },

  // Security
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12'),
    sessionSecret: process.env.SESSION_SECRET || 'your-session-secret',
    corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:5173').split(',')
  },

  // Analytics
  analytics: {
    googleAnalytics: {
      trackingId: process.env.GA_TRACKING_ID || ''
    },
    mixpanel: {
      token: process.env.MIXPANEL_TOKEN || ''
    }
  },

  // Cache
  cache: {
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || '',
      db: parseInt(process.env.REDIS_DB || '0')
    },
    ttl: parseInt(process.env.CACHE_TTL || '3600') // 1 hour
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/app.log',
    maxSize: process.env.LOG_MAX_SIZE || '10m',
    maxFiles: parseInt(process.env.LOG_MAX_FILES || '5')
  },

  // Feature flags
  features: {
    enableAI: process.env.ENABLE_AI === 'true',
    enableCrossChain: process.env.ENABLE_CROSS_CHAIN === 'true',
    enableAnalytics: process.env.ENABLE_ANALYTICS === 'true',
    enableNotifications: process.env.ENABLE_NOTIFICATIONS === 'true',
    maintenanceMode: process.env.MAINTENANCE_MODE === 'true'
  }
};

// Validate required environment variables
const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars);
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
}

export default config;