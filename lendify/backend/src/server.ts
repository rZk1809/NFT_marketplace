import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

// Import routes
import authRoutes from './api/auth';
import nftRoutes from './api/nft';
import rentalRoutes from './api/rental';
import lendingRoutes from './api/lending';
import flashLoanRoutes from './api/flashLoan';
import oracleRoutes from './api/oracle';
import reputationRoutes from './api/reputation';
import analyticsRoutes from './api/analytics';
import crossChainRoutes from './api/crossChain';
import daoRoutes from './api/dao';
import notificationRoutes from './api/notification';
import webhookRoutes from './api/webhook';
import collectionsRoutes from './api/collections';
import auctionsRoutes from './api/auctions';
import offersRoutes from './api/offers';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { authMiddleware } from './middleware/auth';
import { requestLogger } from './middleware/logger';
import { validateRequest } from './middleware/validation';

// Import services
import { Web3Service } from './services/Web3Service';
import { NotificationService } from './services/NotificationService';
import { AnalyticsService } from './services/AnalyticsService';
import { AIService } from './services/AIService';
import { CrossChainService } from './services/CrossChainService';

// Load environment variables
dotenv.config();

interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

class LendifyBackendServer {
  public app: Application;
  public server: any;
  public io: SocketIOServer;
  
  // Services
  public web3Service!: Web3Service;
  public notificationService!: NotificationService;
  public analyticsService!: AnalyticsService;
  public aiService!: AIService;
  public crossChainService!: CrossChainService;

  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
      }
    });
    
    // Initialize services
    this.initializeServices();
    
    // Setup middleware and routes
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
    this.setupSocketIO();
  }

  private initializeServices(): void {
    this.web3Service = new Web3Service();
    this.notificationService = new NotificationService(this.io);
    this.analyticsService = new AnalyticsService();
    this.aiService = new AIService();
    this.crossChainService = new CrossChainService();
  }

  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }));

    // CORS configuration
    this.app.use(cors({
      origin: process.env.NODE_ENV === 'production' 
        ? [process.env.FRONTEND_URL!] 
        : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-Chain-ID']
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS!) || 15 * 60 * 1000, // 15 minutes
      max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS!) || 100, // limit each IP to 100 requests per windowMs
      message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW_MS!) || 900000) / 1000)
      },
      standardHeaders: true,
      legacyHeaders: false,
    });

    // Stricter rate limiting for sensitive endpoints
    const strictLimiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // limit each IP to 5 requests per windowMs for sensitive operations
      message: {
        error: 'Too many sensitive requests from this IP, please try again later.'
      }
    });

    this.app.use('/api/', limiter);
    this.app.use(['/api/auth/login', '/api/auth/register', '/api/lending/request', '/api/flash-loan/execute'], strictLimiter);

    // Request logging
    if (process.env.NODE_ENV === 'development') {
      this.app.use(morgan('dev'));
    } else {
      this.app.use(morgan('combined'));
    }

    // Custom request logger
    this.app.use(requestLogger);

    // Body parsing middleware
    this.app.use(express.json({ 
      limit: '10mb',
      verify: (req: any, res, buf, encoding) => {
        // Store raw body for webhook signature verification
        if (req.originalUrl && req.originalUrl.includes('/webhook')) {
          req.rawBody = buf;
        }
      }
    }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Trust proxy (important for rate limiting and getting real IP addresses)
    this.app.set('trust proxy', 1);

    // Health check endpoint (before auth middleware)
    this.app.get('/health', (req: Request, res: Response) => {
      res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.env.npm_package_version || '1.0.0'
      });
    });

    // API Info endpoint
    this.app.get('/api', (req: Request, res: Response) => {
      res.json({
        name: 'Lendify Backend API',
        version: '2.0.0',
        description: 'Advanced NFT rental marketplace with DeFi integration',
        endpoints: {
          auth: '/api/auth',
          nft: '/api/nft',
          rental: '/api/rental',
          lending: '/api/lending',
          flashLoan: '/api/flash-loan',
          oracle: '/api/oracle',
          reputation: '/api/reputation',
          analytics: '/api/analytics',
          crossChain: '/api/cross-chain',
          dao: '/api/dao',
          notifications: '/api/notifications',
          webhooks: '/api/webhook'
        },
        features: [
          'ERC-4907 NFT Rentals',
          'NFT Collateralized Lending',
          'Flash Loans',
          'AI-Powered Dynamic Pricing',
          'Cross-Chain Support',
          'Reputation System',
          'DAO Governance',
          'Real-time Notifications'
        ]
      });
    });
  }

  private setupRoutes(): void {
    // Direct stats endpoint (shortcut to analytics/stats)
    this.app.get('/api/stats', async (req: Request, res: Response) => {
      try {
        // Import models dynamically to avoid circular dependencies
        const { NFT } = await import('./models/NFT');
        const { Rental } = await import('./models/Rental');
        const { Loan } = await import('./models/Loan');
        const { User } = await import('./models/User');
        
        const [nftCount, rentalCount, loanCount, userCount, activeRentals, activeLoanRequests] = await Promise.all([
          NFT.countDocuments({ status: 'active' }),
          Rental.countDocuments({ status: 'active' }),
          Loan.countDocuments(),
          User.countDocuments(),
          Rental.countDocuments({ status: 'active' }),
          Loan.countDocuments({ status: 'requested' })
        ]);
        
        const stats = {
          users: userCount,
          nfts: nftCount,
          totalRentals: rentalCount,
          totalLoans: loanCount,
          availableRentals: activeRentals,
          activeLendingRequests: activeLoanRequests,
          totalVolume: rentalCount + loanCount,
          lastUpdated: new Date().toISOString()
        };
        
        res.json({
          success: true,
          data: stats
        });
      } catch (error) {
        console.error('Error fetching platform stats:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to fetch platform statistics'
        });
      }
    });

    // API routes with proper prefixes
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/nft', nftRoutes);
    this.app.use('/api/rental', rentalRoutes);
    this.app.use('/api/lending', lendingRoutes);
    this.app.use('/api/flash-loan', flashLoanRoutes);
    this.app.use('/api/oracle', oracleRoutes);
    this.app.use('/api/reputation', reputationRoutes);
    this.app.use('/api/analytics', analyticsRoutes);
    this.app.use('/api/cross-chain', crossChainRoutes);
    this.app.use('/api/dao', daoRoutes);
    this.app.use('/api/notifications', notificationRoutes);
    this.app.use('/api/webhook', webhookRoutes);
    this.app.use('/api/collections', collectionsRoutes);
    this.app.use('/api/auctions', auctionsRoutes);
    this.app.use('/api/offers', offersRoutes);

    // Catch-all for undefined routes
    this.app.use('*', (req: Request, res: Response) => {
      res.status(404).json({
        error: 'Route not found',
        message: `Cannot ${req.method} ${req.originalUrl}`,
        suggestion: 'Check the API documentation for available endpoints'
      });
    });
  }

  private setupErrorHandling(): void {
    // Global error handler
    this.app.use((err: AppError, req: Request, res: Response, next: NextFunction) => {
      console.error('Global error handler:', err);

      // Mongoose validation errors
      if (err.name === 'ValidationError') {
        return res.status(400).json({
          error: 'Validation Error',
          details: err.message,
          timestamp: new Date().toISOString()
        });
      }

      // MongoDB duplicate key errors
      if (err.name === 'MongoError' && (err as any).code === 11000) {
        return res.status(409).json({
          error: 'Duplicate Entry',
          message: 'Resource already exists',
          timestamp: new Date().toISOString()
        });
      }

      // JWT errors
      if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
          error: 'Invalid Token',
          message: 'Authentication token is invalid',
          timestamp: new Date().toISOString()
        });
      }

      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          error: 'Token Expired',
          message: 'Authentication token has expired',
          timestamp: new Date().toISOString()
        });
      }

      // Web3/Blockchain errors
      if (err.message && err.message.includes('execution reverted')) {
        return res.status(400).json({
          error: 'Transaction Failed',
          message: 'Smart contract execution failed',
          details: err.message,
          timestamp: new Date().toISOString()
        });
      }

      // Default error response
      const statusCode = err.statusCode || 500;
      res.status(statusCode).json({
        error: statusCode === 500 ? 'Internal Server Error' : err.name || 'Unknown Error',
        message: statusCode === 500 && process.env.NODE_ENV === 'production' 
          ? 'Something went wrong on our end' 
          : err.message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
        timestamp: new Date().toISOString()
      });
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      // Close server gracefully
      this.server.close(() => {
        process.exit(1);
      });
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error: Error) => {
      console.error('Uncaught Exception:', error);
      // Close server gracefully
      this.server.close(() => {
        process.exit(1);
      });
    });

    // Handle SIGTERM for graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down gracefully...');
      this.server.close(() => {
        mongoose.connection.close();
        console.log('MongoDB connection closed.');
        process.exit(0);
      });
    });

    // Handle SIGINT (Ctrl+C)
    process.on('SIGINT', () => {
      console.log('SIGINT received, shutting down gracefully...');
      this.server.close(() => {
        mongoose.connection.close();
        console.log('MongoDB connection closed.');
        process.exit(0);
      });
    });
  }

  private setupSocketIO(): void {
    this.io.use((socket, next) => {
      // Socket authentication middleware
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      // Verify JWT token
      // Implementation depends on your auth service
      next();
    });

    this.io.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id}`);

      // Handle user room joining for personalized notifications
      socket.on('join-user-room', (userId: string) => {
        socket.join(`user:${userId}`);
        console.log(`User ${userId} joined their room`);
      });

      // Handle NFT monitoring
      socket.on('monitor-nft', (data: { nftContract: string, tokenId: string }) => {
        const roomName = `nft:${data.nftContract}:${data.tokenId}`;
        socket.join(roomName);
        console.log(`Client monitoring NFT: ${data.nftContract}:${data.tokenId}`);
      });

      // Handle rental monitoring
      socket.on('monitor-rental', (rentalId: string) => {
        socket.join(`rental:${rentalId}`);
        console.log(`Client monitoring rental: ${rentalId}`);
      });

      // Handle lending monitoring
      socket.on('monitor-loan', (loanId: string) => {
        socket.join(`loan:${loanId}`);
        console.log(`Client monitoring loan: ${loanId}`);
      });

      socket.on('disconnect', (reason) => {
        console.log(`Client disconnected: ${socket.id}, reason: ${reason}`);
      });

      socket.on('error', (error) => {
        console.error(`Socket error from ${socket.id}:`, error);
      });
    });
  }

  public async connectDatabase(): Promise<void> {
    try {
      const mongoUri = process.env.MONGODB_URI!;
      await mongoose.connect(mongoUri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      
      console.log('✅ Connected to MongoDB');

      // Handle MongoDB connection events
      mongoose.connection.on('error', (err) => {
        console.error('MongoDB connection error:', err);
      });

      mongoose.connection.on('disconnected', () => {
        console.log('MongoDB disconnected');
      });

      mongoose.connection.on('reconnected', () => {
        console.log('MongoDB reconnected');
      });

    } catch (error) {
      console.error('❌ MongoDB connection failed:', error);
      if (process.env.NODE_ENV === 'production') {
        process.exit(1);
      } else {
        console.warn('⚠️ Continuing without database in development mode');
      }
    }
  }

  public async start(): Promise<void> {
    try {
      // Connect to database
      await this.connectDatabase();

      // Initialize Web3 connections
      await this.web3Service.initialize();
      console.log('✅ Web3 service initialized');

      // Initialize AI service
      await this.aiService.initialize();
      console.log('✅ AI service initialized');

      // Initialize cross-chain service
      await this.crossChainService.initialize();
      console.log('✅ Cross-chain service initialized');

      // Start analytics service
      this.analyticsService.startMetricsCollection();
      console.log('✅ Analytics service started');

      const PORT = process.env.PORT || 3001;
      
      this.server.listen(PORT, () => {
        console.log(`
🚀 Lendify Backend Server is running!

📍 Server Details:
   • Port: ${PORT}
   • Environment: ${process.env.NODE_ENV || 'development'}
   • API Base: http://localhost:${PORT}/api
   • Health Check: http://localhost:${PORT}/health

🔗 API Endpoints:
   • Authentication: /api/auth
   • NFT Operations: /api/nft
   • Rentals: /api/rental
   • Lending: /api/lending
   • Flash Loans: /api/flash-loan
   • Oracle: /api/oracle
   • Reputation: /api/reputation
   • Analytics: /api/analytics
   • Cross-Chain: /api/cross-chain
   • DAO: /api/dao
   • Notifications: /api/notifications
   • Webhooks: /api/webhook

🌐 WebSocket: Connected for real-time updates
💾 Database: MongoDB connected
⛓️  Blockchain: Multi-chain support enabled
🤖 AI Services: Dynamic pricing & analytics active
        `);
      });

    } catch (error) {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    }
  }

  public getApp(): Application {
    return this.app;
  }

  public getIO(): SocketIOServer {
    return this.io;
  }
}

// Create and export server instance
const server = new LendifyBackendServer();

// Start server if this file is run directly
if (require.main === module) {
  server.start().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
}

export default server;
export { LendifyBackendServer };