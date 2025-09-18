import { Router, Request, Response } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { validateRequest, commonSchemas } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { NFT, INFT } from '../models/NFT';
import { User } from '../models/User';
import Joi from 'joi';

const router = Router();

// Health check
router.get('/health', (req: Request, res: Response) => {
  res.json({ success: true, service: 'NFT API', message: 'Service is healthy' });
});

// Get NFT by contract address, token ID, and chain ID
router.get('/:chainId/:contractAddress/:tokenId', 
  validateRequest({
    params: Joi.object({
      chainId: commonSchemas.chainId,
      contractAddress: commonSchemas.ethereumAddress,
      tokenId: commonSchemas.tokenId
    })
  }),
  asyncHandler(async (req: Request, res: Response) => {
    const { chainId, contractAddress, tokenId } = req.params;
    
    const nft = await NFT.findByIdentifier(contractAddress, tokenId, parseInt(chainId));
    
    if (!nft) {
      return res.status(404).json({
        success: false,
        error: 'NFT not found'
      });
    }
    
    // Increment view count
    await nft.updateAnalytics({ views: 1 });
    
    res.json({
      success: true,
      data: nft
    });
  })
);

// Get available NFTs for rent
router.get('/available', 
  validateRequest({
    query: Joi.object({
      chainId: Joi.number().valid(1, 137, 42161, 10, 8453).optional(),
      category: Joi.string().optional(),
      minPrice: Joi.number().min(0).optional(),
      maxPrice: Joi.number().min(0).optional(),
      sortBy: Joi.string().valid('price', 'rating', 'trending', 'recent').default('recent'),
      sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(20)
    })
  }),
  asyncHandler(async (req: Request, res: Response) => {
    const { 
      chainId, 
      category, 
      minPrice, 
      maxPrice, 
      sortBy, 
      sortOrder, 
      page, 
      limit 
    } = req.query as any;
    
    const filters: any = {};
    
    if (chainId) filters.chainId = chainId;
    if (category) filters['metadata.category'] = category;
    if (minPrice !== undefined || maxPrice !== undefined) {
      filters['rental.avgDailyPrice'] = {};
      if (minPrice !== undefined) filters['rental.avgDailyPrice'].$gte = minPrice;
      if (maxPrice !== undefined) filters['rental.avgDailyPrice'].$lte = maxPrice;
    }
    
    const sortOptions: any = {};
    switch (sortBy) {
      case 'price':
        sortOptions['rental.avgDailyPrice'] = sortOrder === 'asc' ? 1 : -1;
        break;
      case 'rating':
        sortOptions['rental.ratings.average'] = sortOrder === 'asc' ? 1 : -1;
        break;
      case 'trending':
        sortOptions['analytics.trendingScore'] = sortOrder === 'asc' ? 1 : -1;
        break;
      default:
        sortOptions.createdAt = sortOrder === 'asc' ? 1 : -1;
    }
    
    const skip = (page - 1) * limit;
    
    const [nfts, total] = await Promise.all([
      NFT.find({ 'rental.isAvailable': true, status: 'active', ...filters })
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .populate('rental.currentListing'),
      NFT.countDocuments({ 'rental.isAvailable': true, status: 'active', ...filters })
    ]);
    
    res.json({
      success: true,
      data: {
        nfts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  })
);

// Get trending NFTs
router.get('/trending', 
  validateRequest({
    query: Joi.object({
      chainId: Joi.number().valid(1, 137, 42161, 10, 8453).optional(),
      timeframe: Joi.string().valid('1h', '24h', '7d', '30d').default('24h'),
      limit: Joi.number().integer().min(1).max(50).default(20)
    })
  }),
  asyncHandler(async (req: Request, res: Response) => {
    const { chainId, timeframe, limit } = req.query as any;
    
    const filters: any = {};
    if (chainId) filters.chainId = chainId;
    
    const baseQuery = { status: 'active', ...filters };
    const nfts = await NFT.find(baseQuery)
      .sort({ 'analytics.trendingScore': -1 })
      .limit(limit)
      .populate('rental.currentListing');
    
    res.json({
      success: true,
      data: nfts
    });
  })
);

// Search NFTs
router.get('/search', 
  validateRequest({
    query: Joi.object({
      q: Joi.string().required().min(1),
      chainId: Joi.number().valid(1, 137, 42161, 10, 8453).optional(),
      category: Joi.string().optional(),
      availableOnly: Joi.boolean().default(false),
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(50).default(20)
    })
  }),
  asyncHandler(async (req: Request, res: Response) => {
    const { q, chainId, category, availableOnly, page, limit } = req.query as any;
    
    const filters: any = {
      $text: { $search: q },
      status: 'active'
    };
    
    if (chainId) filters.chainId = chainId;
    if (category) filters['metadata.category'] = category;
    if (availableOnly) filters['rental.isAvailable'] = true;
    
    const skip = (page - 1) * limit;
    
    const [nfts, total] = await Promise.all([
      NFT.find(filters)
        .sort({ score: { $meta: 'textScore' } })
        .skip(skip)
        .limit(limit)
        .populate('rental.currentListing'),
      NFT.countDocuments(filters)
    ]);
    
    res.json({
      success: true,
      data: {
        nfts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  })
);

// Get NFTs owned by a user
router.get('/owner/:ownerAddress', 
  validateRequest({
    params: Joi.object({
      ownerAddress: commonSchemas.ethereumAddress
    }),
    query: Joi.object({
      chainId: Joi.number().valid(1, 137, 42161, 10, 8453).optional(),
      status: Joi.string().valid('active', 'rented', 'listed').optional(),
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(20)
    })
  }),
  asyncHandler(async (req: Request, res: Response) => {
    const { ownerAddress } = req.params;
    const { chainId, status, page, limit } = req.query as any;
    
    const filters: any = { 
      owner: ownerAddress.toLowerCase(),
      status: 'active'
    };
    
    if (chainId) filters.chainId = chainId;
    if (status === 'rented') filters.currentUser = { $ne: null };
    if (status === 'listed') filters['rental.isAvailable'] = true;
    
    const skip = (page - 1) * limit;
    
    const [nfts, total] = await Promise.all([
      NFT.find(filters)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('rental.currentListing'),
      NFT.countDocuments(filters)
    ]);
    
    res.json({
      success: true,
      data: {
        nfts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  })
);

// Create/Register NFT
router.post('/', 
  authMiddleware.authenticate,
  validateRequest({
    body: Joi.object({
      contractAddress: commonSchemas.ethereumAddress,
      tokenId: commonSchemas.tokenId,
      chainId: commonSchemas.chainId,
      metadata: Joi.object({
        name: Joi.string().optional(),
        description: Joi.string().optional(),
        image: Joi.string().uri().optional(),
        animationUrl: Joi.string().uri().optional(),
        externalUrl: Joi.string().uri().optional(),
        attributes: Joi.array().items(Joi.object({
          traitType: Joi.string().required(),
          value: Joi.any().required(),
          displayType: Joi.string().optional(),
          maxValue: Joi.number().optional()
        })).default([])
      }).required(),
      collectionInfo: Joi.object({
        name: Joi.string().optional(),
        symbol: Joi.string().optional(),
        floorPrice: Joi.number().min(0).optional(),
        totalSupply: Joi.number().min(0).optional(),
        verified: Joi.boolean().default(false)
      }).optional(),
      estimatedValue: Joi.number().min(0).required()
    })
  }),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { contractAddress, tokenId, chainId, metadata, collection, estimatedValue } = req.body;
    const owner = req.user!.address;
    
    // Check if NFT already exists
    const existingNFT = await NFT.findByIdentifier(contractAddress, tokenId, chainId);
    if (existingNFT) {
      return res.status(409).json({
        success: false,
        error: 'NFT already registered'
      });
    }
    
    const nft = new NFT({
      contractAddress,
      tokenId,
      chainId,
      owner,
      metadata,
      collection,
      pricing: {
        estimatedValue,
        priceHistory: [{
          price: estimatedValue,
          currency: 'ETH',
          timestamp: new Date(),
          source: 'listing'
        }]
      },
      crossChain: {
        originalChain: chainId,
        bridgeHistory: []
      },
      analytics: {
        views: 0,
        favorites: 0,
        shares: 0,
        demandScore: 0,
        rarityScore: 0,
        utilityScore: 0,
        trendingScore: 0,
        lastAnalyzed: new Date()
      }
    });
    
    await nft.save();
    
    // Update user's NFT count
    await User.findOneAndUpdate(
      { walletAddress: owner },
      { $inc: { 'reputation.totalListings': 1 } }
    );
    
    res.status(201).json({
      success: true,
      message: 'NFT registered successfully',
      data: nft
    });
  })
);

// Update NFT metadata
router.put('/:chainId/:contractAddress/:tokenId', 
  authMiddleware.authenticate,
  validateRequest({
    params: Joi.object({
      chainId: commonSchemas.chainId,
      contractAddress: commonSchemas.ethereumAddress,
      tokenId: commonSchemas.tokenId
    }),
    body: Joi.object({
      metadata: Joi.object({
        name: Joi.string().optional(),
        description: Joi.string().optional(),
        image: Joi.string().uri().optional(),
        animationUrl: Joi.string().uri().optional(),
        externalUrl: Joi.string().uri().optional(),
        attributes: Joi.array().items(Joi.object({
          traitType: Joi.string().required(),
          value: Joi.any().required(),
          displayType: Joi.string().optional(),
          maxValue: Joi.number().optional()
        })).optional()
      }).optional(),
      collection: Joi.object({
        name: Joi.string().optional(),
        symbol: Joi.string().optional(),
        verified: Joi.boolean().optional()
      }).optional(),
      estimatedValue: Joi.number().min(0).optional()
    })
  }),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { chainId, contractAddress, tokenId } = req.params;
    const { metadata, collectionInfo, estimatedValue } = req.body;
    const userAddress = req.user!.address;

    const nft = await NFT.findByIdentifier(contractAddress, tokenId, parseInt(chainId));

    if (!nft) {
      return res.status(404).json({
        success: false,
        error: 'NFT not found'
      });
    }

    // Check ownership or admin permissions
    if (nft.owner !== userAddress && req.user!.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this NFT'
      });
    }

    // Update fields
    if (metadata) {
      nft.metadata = { ...nft.metadata, ...metadata };
    }

    if (collectionInfo) {
      nft.collectionInfo = { ...nft.collectionInfo, ...collectionInfo };
    }
    
    if (estimatedValue !== undefined) {
      nft.pricing.estimatedValue = estimatedValue;
      nft.addPriceHistory(estimatedValue, 'ETH', 'listing');
    }
    
    await nft.save();
    
    res.json({
      success: true,
      message: 'NFT updated successfully',
      data: nft
    });
  })
);

// Add NFT to favorites
router.post('/:chainId/:contractAddress/:tokenId/favorite', 
  authMiddleware.authenticate,
  validateRequest({
    params: Joi.object({
      chainId: commonSchemas.chainId,
      contractAddress: commonSchemas.ethereumAddress,
      tokenId: commonSchemas.tokenId
    })
  }),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { chainId, contractAddress, tokenId } = req.params;
    
    const nft = await NFT.findByIdentifier(contractAddress, tokenId, parseInt(chainId));
    
    if (!nft) {
      return res.status(404).json({
        success: false,
        error: 'NFT not found'
      });
    }
    
    await nft.updateAnalytics({ favorites: 1 });
    
    res.json({
      success: true,
      message: 'NFT added to favorites'
    });
  })
);

// Rate NFT (after rental completion)
router.post('/:chainId/:contractAddress/:tokenId/rate', 
  authMiddleware.authenticate,
  validateRequest({
    params: Joi.object({
      chainId: commonSchemas.chainId,
      contractAddress: commonSchemas.ethereumAddress,
      tokenId: commonSchemas.tokenId
    }),
    body: Joi.object({
      rating: Joi.number().integer().min(1).max(5).required(),
      review: Joi.string().max(1000).optional()
    })
  }),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { chainId, contractAddress, tokenId } = req.params;
    const { rating } = req.body;
    
    const nft = await NFT.findByIdentifier(contractAddress, tokenId, parseInt(chainId));
    
    if (!nft) {
      return res.status(404).json({
        success: false,
        error: 'NFT not found'
      });
    }
    
    // TODO: Verify user has completed a rental for this NFT
    
    await nft.updateRating(rating);
    
    res.json({
      success: true,
      message: 'Rating submitted successfully',
      data: {
        newAverage: nft.rental.ratings.average,
        totalRatings: nft.rental.ratings.count
      }
    });
  })
);

// Get NFT analytics
router.get('/:chainId/:contractAddress/:tokenId/analytics', 
  validateRequest({
    params: Joi.object({
      chainId: commonSchemas.chainId,
      contractAddress: commonSchemas.ethereumAddress,
      tokenId: commonSchemas.tokenId
    }),
    query: Joi.object({
      timeframe: Joi.string().valid('7d', '30d', '90d').default('30d')
    })
  }),
  asyncHandler(async (req: Request, res: Response) => {
    const { chainId, contractAddress, tokenId } = req.params;
    const { timeframe } = req.query;
    
    const nft = await NFT.findByIdentifier(contractAddress, tokenId, parseInt(chainId));
    
    if (!nft) {
      return res.status(404).json({
        success: false,
        error: 'NFT not found'
      });
    }
    
    // Calculate timeframe-specific analytics
    const endDate = new Date();
    const startDate = new Date();
    
    switch (timeframe) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
    }
    
    // Get price history for the timeframe
    const priceHistory = nft.pricing.priceHistory.filter(p => 
      p.timestamp >= startDate && p.timestamp <= endDate
    );
    
    res.json({
      success: true,
      data: {
        basic: {
          views: nft.analytics.views,
          favorites: nft.analytics.favorites,
          shares: nft.analytics.shares,
          demandScore: nft.analytics.demandScore,
          rarityScore: nft.analytics.rarityScore,
          utilityScore: nft.analytics.utilityScore,
          trendingScore: nft.analytics.trendingScore
        },
        rental: {
          totalRentals: nft.rental.totalRentals,
          successfulRentals: nft.rental.successfulRentals,
          totalRevenue: nft.rental.totalRevenue,
          avgDailyPrice: nft.rental.avgDailyPrice,
          avgRentalDuration: nft.rental.avgRentalDuration,
          ratings: nft.rental.ratings
        },
        pricing: {
          currentValue: nft.pricing.estimatedValue,
          lastSalePrice: nft.pricing.lastSalePrice,
          floorPrice: nft.pricing.currentFloorPrice,
          priceHistory: priceHistory
        },
        timeframe: {
          start: startDate,
          end: endDate,
          period: timeframe
        }
      }
    });
  })
);

export default router;
