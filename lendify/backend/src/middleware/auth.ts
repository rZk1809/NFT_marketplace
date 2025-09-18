import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ethers } from 'ethers';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    userId: string;
    address: string;
    email?: string;
    role: 'user' | 'admin' | 'moderator';
    reputation?: number;
    isEmailVerified: boolean;
    createdAt: Date;
    lastLogin: Date;
  };
  chainId?: number;
}

export interface JWTPayload {
  userId: string;
  address: string;
  role: string;
  iat: number;
  exp: number;
}

export interface SignatureVerificationPayload {
  address: string;
  message: string;
  signature: string;
  timestamp: number;
}

class AuthMiddleware {
  private jwtSecret: string;
  private jwtExpiration: string;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'your-super-secret-key';
    this.jwtExpiration = process.env.JWT_EXPIRATION || '24h';
  }

  // Main authentication middleware
  public authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = this.extractToken(req);
      
      if (!token) {
        res.status(401).json({
          error: 'Authentication required',
          message: 'No token provided'
        });
        return;
      }

      const payload = jwt.verify(token, this.jwtSecret) as JWTPayload;
      
      // Get user details (would typically fetch from database)
      const user = await this.getUserById(payload.userId);
      
      if (!user) {
        res.status(401).json({
          error: 'Invalid token',
          message: 'User not found'
        });
        return;
      }

      // Attach user to request
      req.user = user;
      
      // Extract chain ID from headers if provided
      const chainId = req.headers['x-chain-id'];
      if (chainId) {
        req.chainId = parseInt(chainId as string);
      }

      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        res.status(401).json({
          error: 'Token expired',
          message: 'Please login again'
        });
        return;
      }

      if (error instanceof jwt.JsonWebTokenError) {
        res.status(401).json({
          error: 'Invalid token',
          message: 'Token is malformed'
        });
        return;
      }

      res.status(500).json({
        error: 'Authentication error',
        message: 'Internal server error'
      });
    }
  };

  // Optional authentication (doesn't fail if no token)
  public optionalAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = this.extractToken(req);
      
      if (token) {
        const payload = jwt.verify(token, this.jwtSecret) as JWTPayload;
        const user = await this.getUserById(payload.userId);
        
        if (user) {
          req.user = user;
          
          const chainId = req.headers['x-chain-id'];
          if (chainId) {
            req.chainId = parseInt(chainId as string);
          }
        }
      }
      
      next();
    } catch (error) {
      // Continue without authentication for optional auth
      next();
    }
  };

  // Role-based authorization
  public requireRole = (roles: string[]) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
      if (!req.user) {
        res.status(401).json({
          error: 'Authentication required',
          message: 'Please login first'
        });
        return;
      }

      if (!roles.includes(req.user.role)) {
        res.status(403).json({
          error: 'Insufficient permissions',
          message: `Required role: ${roles.join(' or ')}`
        });
        return;
      }

      next();
    };
  };

  // Admin only middleware
  public requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    this.requireRole(['admin'])(req, res, next);
  };

  // Moderator or admin middleware
  public requireModerator = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    this.requireRole(['admin', 'moderator'])(req, res, next);
  };

  // Reputation-based access control
  public requireReputation = (minReputation: number) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
      if (!req.user) {
        res.status(401).json({
          error: 'Authentication required',
          message: 'Please login first'
        });
        return;
      }

      const userReputation = req.user.reputation || 0;
      if (userReputation < minReputation) {
        res.status(403).json({
          error: 'Insufficient reputation',
          message: `Required reputation: ${minReputation}, current: ${userReputation}`
        });
        return;
      }

      next();
    };
  };

  // Email verification required
  public requireEmailVerified = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: 'Authentication required',
        message: 'Please login first'
      });
      return;
    }

    if (!req.user.isEmailVerified) {
      res.status(403).json({
        error: 'Email verification required',
        message: 'Please verify your email address'
      });
      return;
    }

    next();
  };

  // Verify wallet signature for sensitive operations
  public requireSignature = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Authentication required',
          message: 'Please login first'
        });
        return;
      }

      const signatureData = req.body.signature as SignatureVerificationPayload;
      
      if (!signatureData || !signatureData.signature || !signatureData.message) {
        res.status(400).json({
          error: 'Signature required',
          message: 'Please provide signature data'
        });
        return;
      }

      // Verify the signature
      const isValidSignature = await this.verifySignature(
        signatureData.message,
        signatureData.signature,
        req.user.address
      );

      if (!isValidSignature) {
        res.status(403).json({
          error: 'Invalid signature',
          message: 'Signature verification failed'
        });
        return;
      }

      // Check timestamp to prevent replay attacks (5 minute window)
      const now = Date.now();
      const timeDiff = Math.abs(now - signatureData.timestamp);
      if (timeDiff > 5 * 60 * 1000) {
        res.status(403).json({
          error: 'Signature expired',
          message: 'Please generate a new signature'
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Signature verification error:', error);
      res.status(500).json({
        error: 'Signature verification failed',
        message: 'Internal server error'
      });
    }
  };

  // Rate limiting based on user reputation
  public reputationBasedRateLimit = (baseLimit: number) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
      if (!req.user) {
        res.status(401).json({
          error: 'Authentication required',
          message: 'Please login first'
        });
        return;
      }

      // Higher reputation users get higher rate limits
      const reputation = req.user.reputation || 0;
      const multiplier = Math.min(2, 1 + (reputation / 1000)); // Max 2x multiplier
      const adjustedLimit = Math.floor(baseLimit * multiplier);

      // This would integrate with a rate limiting service
      // For now, just continue
      next();
    };
  };

  // Generate JWT token
  public generateToken = (user: { id: string; address: string; role: string }): string => {
    const jwtOptions: any = { expiresIn: this.jwtExpiration || '24h' };
    return jwt.sign(
      {
        userId: user.id,
        address: user.address,
        role: user.role
      },
      this.jwtSecret!,
      jwtOptions
    );
  };

  // Generate refresh token
  public generateRefreshToken = (userId: string): string => {
    return jwt.sign(
      { userId, type: 'refresh' },
      this.jwtSecret,
      { expiresIn: '7d' }
    );
  };

  // Verify refresh token and generate new access token
  public refreshToken = async (refreshToken: string): Promise<string | null> => {
    try {
      const payload = jwt.verify(refreshToken, this.jwtSecret) as any;
      
      if (payload.type !== 'refresh') {
        return null;
      }

      const user = await this.getUserById(payload.userId);
      if (!user) {
        return null;
      }

      return this.generateToken({
        id: user.id,
        address: user.address,
        role: user.role
      });
    } catch (error) {
      return null;
    }
  };

  // Verify message signature
  public verifySignature = async (message: string, signature: string, expectedAddress: string): Promise<boolean> => {
    try {
      const recoveredAddress = ethers.verifyMessage(message, signature);
      return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
    } catch (error) {
      console.error('Signature verification error:', error);
      return false;
    }
  };

  // Web3 authentication flow
  public authenticateWallet = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { message, signature, address } = req.body;

      if (!message || !signature || !address) {
        res.status(400).json({
          error: 'Missing required fields',
          message: 'Message, signature, and address are required'
        });
        return;
      }

      // Verify the signature
      const isValid = await this.verifySignature(message, signature, address);
      if (!isValid) {
        res.status(401).json({
          error: 'Invalid signature',
          message: 'Signature verification failed'
        });
        return;
      }

      // Check message format and timestamp
      const messagePattern = /^Sign this message to authenticate with Lendify\nTimestamp: (\d+)\nNonce: ([a-f0-9]+)$/;
      const match = message.match(messagePattern);
      
      if (!match) {
        res.status(400).json({
          error: 'Invalid message format',
          message: 'Message does not match required format'
        });
        return;
      }

      const timestamp = parseInt(match[1]);
      const nonce = match[2];

      // Check timestamp (5 minute window)
      const now = Date.now();
      if (Math.abs(now - timestamp) > 5 * 60 * 1000) {
        res.status(400).json({
          error: 'Message expired',
          message: 'Please generate a new message'
        });
        return;
      }

      // Get or create user
      let user = await this.getUserByAddress(address);
      if (!user) {
        user = await this.createUser(address);
      }

      // Update last login
      await this.updateLastLogin(user.id);

      // Generate tokens
      const accessToken = this.generateToken({
        id: user.id,
        address: user.address,
        role: user.role
      });
      const refreshToken = this.generateRefreshToken(user.id);

      res.json({
        success: true,
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          address: user.address,
          role: user.role,
          reputation: user.reputation,
          isEmailVerified: user.isEmailVerified
        }
      });
    } catch (error) {
      console.error('Wallet authentication error:', error);
      res.status(500).json({
        error: 'Authentication failed',
        message: 'Internal server error'
      });
    }
  };

  // Generate authentication message for wallet signing
  public generateAuthMessage = (req: Request, res: Response): void => {
    const timestamp = Date.now();
    const nonce = ethers.hexlify(ethers.randomBytes(16)).slice(2);
    
    const message = `Sign this message to authenticate with Lendify\nTimestamp: ${timestamp}\nNonce: ${nonce}`;
    
    res.json({
      message,
      timestamp,
      nonce
    });
  };

  // Utility methods
  private extractToken = (req: Request): string | null => {
    // Check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.slice(7);
    }

    // Check query parameter
    const tokenFromQuery = req.query.token as string;
    if (tokenFromQuery) {
      return tokenFromQuery;
    }

    // Check cookie (if using cookies)
    const tokenFromCookie = req.cookies?.token;
    if (tokenFromCookie) {
      return tokenFromCookie;
    }

    return null;
  };

  // Database operations (placeholder - implement with actual database)
  private async getUserById(userId: string): Promise<any> {
    // This would query the database for user by ID
    return {
      id: userId,
      address: '0x1234567890123456789012345678901234567890',
      email: 'user@example.com',
      role: 'user',
      reputation: 100,
      isEmailVerified: true,
      createdAt: new Date(),
      lastLogin: new Date()
    };
  }

  private async getUserByAddress(address: string): Promise<any> {
    // This would query the database for user by wallet address
    return null; // Return null if user doesn't exist
  }

  private async createUser(address: string): Promise<any> {
    // This would create a new user in the database
    return {
      id: `user_${Date.now()}`,
      address: address.toLowerCase(),
      email: null,
      role: 'user',
      reputation: 0,
      isEmailVerified: false,
      createdAt: new Date(),
      lastLogin: new Date()
    };
  }

  private async updateLastLogin(userId: string): Promise<void> {
    // This would update the user's last login timestamp
    console.log(`Updated last login for user ${userId}`);
  }
}

// Create singleton instance
const authMiddleware = new AuthMiddleware();

// Export middleware functions
export { authMiddleware };

export interface AuthenticatedMiddleware {
  authenticate: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
  optionalAuth: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
  requireRole: (roles: string[]) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
  requireAdmin: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
  requireModerator: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
  requireReputation: (minReputation: number) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
  requireEmailVerified: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
  requireSignature: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
  reputationBasedRateLimit: (baseLimit: number) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
  generateToken: (user: { id: string; address: string; role: string }) => string;
  generateRefreshToken: (userId: string) => string;
  refreshToken: (refreshToken: string) => Promise<string | null>;
  verifySignature: (message: string, signature: string, expectedAddress: string) => Promise<boolean>;
  authenticateWallet: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  generateAuthMessage: (req: Request, res: Response) => void;
}