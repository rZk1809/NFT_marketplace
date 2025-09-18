import { Router, Request, Response } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { validateRequest, commonSchemas } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { User, IUser } from '../models/User';
import { web3Service } from '../services/web3';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import Joi from 'joi';

const router = Router();

// Health check
router.get('/health', (req: Request, res: Response) => {
  res.json({ success: true, service: 'Auth API', message: 'Service is healthy' });
});

// Generate nonce for wallet authentication
router.post('/nonce', 
  validateRequest({
    body: Joi.object({
      walletAddress: commonSchemas.ethereumAddress
    })
  }),
  asyncHandler(async (req: Request, res: Response) => {
    const { walletAddress } = req.body;
    
    // Generate a unique nonce
    const nonce = crypto.randomBytes(16).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    
    // Store or update nonce in user record
    await User.findOneAndUpdate(
      { walletAddress: walletAddress.toLowerCase() },
      { 
        tempAuth: {
          nonce,
          expiresAt,
          attempts: 0
        }
      },
      { upsert: true, new: true }
    );
    
    const message = `Please sign this message to authenticate with Lendify:\n\nNonce: ${nonce}\nTimestamp: ${new Date().toISOString()}`;
    
    res.json({
      success: true,
      data: {
        nonce,
        message,
        expiresAt
      }
    });
  })
);

// Verify signature and authenticate user
router.post('/verify', 
  validateRequest({
    body: Joi.object({
      walletAddress: commonSchemas.ethereumAddress,
      signature: Joi.string().required(),
      message: Joi.string().required()
    })
  }),
  asyncHandler(async (req: Request, res: Response) => {
    const { walletAddress, signature, message } = req.body;
    
    const user = await User.findOne({ 
      walletAddress: walletAddress.toLowerCase(),
      'tempAuth.expiresAt': { $gt: new Date() }
    });
    
    if (!user || !user.tempAuth) {
      return res.status(401).json({
        success: false,
        error: 'Nonce expired or not found. Please request a new nonce.'
      });
    }
    
    // Check for too many attempts
    if (user.tempAuth.attempts >= 3) {
      return res.status(429).json({
        success: false,
        error: 'Too many authentication attempts. Please request a new nonce.'
      });
    }
    
    try {
      // Verify the signature
      const isValidSignature = await web3Service.verifySignature(
        message, 
        signature, 
        walletAddress
      );
      
      if (!isValidSignature) {
        // Increment attempt counter
        user.tempAuth.attempts += 1;
        await user.save();
        
        return res.status(401).json({
          success: false,
          error: 'Invalid signature'
        });
      }
      
      // Clear temp auth data
      user.tempAuth = undefined;
      user.lastLogin = new Date();
      user.loginCount = (user.loginCount || 0) + 1;
      
      await user.save();
      
      // Generate JWT token
      const tokenPayload = {
        userId: user._id,
        address: user.walletAddress,
        role: user.role || 'user'
      };
      
      const jwtOptions: any = { expiresIn: process.env.JWT_EXPIRES_IN || '24h' };
      const accessToken = jwt.sign(
        tokenPayload,
        process.env.JWT_SECRET!,
        jwtOptions
      );
      
      const refreshToken = jwt.sign(
        { userId: user._id },
        process.env.JWT_REFRESH_SECRET!,
        { expiresIn: '30d' }
      );
      
      // Store refresh token
      user.refreshTokens = user.refreshTokens || [];
      user.refreshTokens.push({
        token: refreshToken,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        deviceInfo: req.get('User-Agent') || 'Unknown'
      });
      
      await user.save();
      
      res.json({
        success: true,
        message: 'Authentication successful',
        data: {
          user: {
            id: user._id,
            walletAddress: user.walletAddress,
            username: user.username,
            role: user.role,
            isVerified: user.isVerified,
            reputation: user.reputation,
            preferences: user.preferences
          },
          tokens: {
            accessToken,
            refreshToken
          }
        }
      });
      
    } catch (error) {
      console.error('Signature verification error:', error);
      return res.status(500).json({
        success: false,
        error: 'Authentication failed'
      });
    }
  })
);

// Refresh access token
router.post('/refresh', 
  validateRequest({
    body: Joi.object({
      refreshToken: Joi.string().required()
    })
  }),
  asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as any;
      
      const user = await User.findById(decoded.userId);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'User not found'
        });
      }
      
      // Check if refresh token exists and is valid
      const tokenIndex = user.refreshTokens?.findIndex(
        t => t.token === refreshToken && t.expiresAt > new Date()
      );
      
      if (tokenIndex === undefined || tokenIndex === -1) {
        return res.status(401).json({
          success: false,
          error: 'Invalid or expired refresh token'
        });
      }
      
      // Generate new access token
      const jwtOptions2: any = { expiresIn: process.env.JWT_EXPIRES_IN || '24h' };
      const newAccessToken = jwt.sign(
        {
          userId: user._id,
          address: user.walletAddress,
          role: user.role || 'user'
        },
        process.env.JWT_SECRET!,
        jwtOptions2
      );
      
      res.json({
        success: true,
        data: {
          accessToken: newAccessToken
        }
      });
      
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: 'Invalid refresh token'
      });
    }
  })
);

// Complete user profile setup
router.post('/profile/complete', 
  authMiddleware.authenticate,
  validateRequest({
    body: Joi.object({
      username: Joi.string().alphanum().min(3).max(30).optional(),
      email: Joi.string().email().optional(),
      bio: Joi.string().max(500).optional(),
      avatar: Joi.string().uri().optional(),
      preferences: Joi.object({
        notifications: Joi.object({
          email: Joi.boolean().default(true),
          push: Joi.boolean().default(true),
          sms: Joi.boolean().default(false)
        }).optional(),
        privacy: Joi.object({
          showProfile: Joi.boolean().default(true),
          showActivity: Joi.boolean().default(true),
          showNFTs: Joi.boolean().default(true)
        }).optional(),
        defaultChain: commonSchemas.chainId.optional()
      }).optional()
    })
  }),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.userId;
    const { username, email, bio, avatar, preferences } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Check if username is already taken
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: 'Username already taken'
        });
      }
    }
    
    // Update user profile
    if (username) user.username = username;
    if (email) user.email = email;
    if (bio) user.bio = bio;
    if (avatar) user.avatar = avatar;
    if (preferences) {
      user.preferences = { ...user.preferences, ...preferences };
    }
    
    user.profileCompleted = true;
    user.updatedAt = new Date();
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          walletAddress: user.walletAddress,
          username: user.username,
          email: user.email,
          bio: user.bio,
          avatar: user.avatar,
          profileCompleted: user.profileCompleted,
          preferences: user.preferences
        }
      }
    });
  })
);

// Get current user profile
router.get('/profile', 
  authMiddleware.authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.userId;
    
    const user = await User.findById(userId)
      .select('-refreshTokens -tempAuth');
    
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
  })
);

// Update user preferences
router.patch('/preferences', 
  authMiddleware.authenticate,
  validateRequest({
    body: Joi.object({
      notifications: Joi.object({
        email: Joi.boolean().optional(),
        push: Joi.boolean().optional(),
        sms: Joi.boolean().optional()
      }).optional(),
      privacy: Joi.object({
        showProfile: Joi.boolean().optional(),
        showActivity: Joi.boolean().optional(),
        showNFTs: Joi.boolean().optional()
      }).optional(),
      defaultChain: commonSchemas.chainId.optional(),
      language: Joi.string().valid('en', 'es', 'fr', 'de', 'ja', 'ko', 'zh').optional(),
      theme: Joi.string().valid('light', 'dark', 'auto').optional()
    })
  }),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.userId;
    const updates = req.body;
    
    const user = await User.findByIdAndUpdate(
      userId,
      { 
        $set: {
          'preferences': { ...updates },
          'updatedAt': new Date()
        }
      },
      { new: true, runValidators: true }
    ).select('-refreshTokens -tempAuth');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: { user }
    });
  })
);

// Logout (invalidate refresh token)
router.post('/logout', 
  authMiddleware.authenticate,
  validateRequest({
    body: Joi.object({
      refreshToken: Joi.string().optional(),
      logoutAll: Joi.boolean().default(false)
    })
  }),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.userId;
    const { refreshToken, logoutAll } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    if (logoutAll) {
      // Remove all refresh tokens
      user.refreshTokens = [];
    } else if (refreshToken) {
      // Remove specific refresh token
      user.refreshTokens = user.refreshTokens?.filter(
        t => t.token !== refreshToken
      ) || [];
    }
    
    await user.save();
    
    res.json({
      success: true,
      message: logoutAll ? 'Logged out from all devices' : 'Logged out successfully'
    });
  })
);

// Check if user exists and get basic info
router.get('/user/:address', 
  validateRequest({
    params: Joi.object({
      address: commonSchemas.ethereumAddress
    })
  }),
  asyncHandler(async (req: Request, res: Response) => {
    const { address } = req.params;
    
    const user = await User.findOne({ 
      walletAddress: address.toLowerCase() 
    }).select('walletAddress username avatar bio isVerified reputation profileCompleted createdAt');
    
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
  })
);

export default router;
