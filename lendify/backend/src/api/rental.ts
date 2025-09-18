import { Router, Request, Response } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { validateRequest, commonSchemas } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { Rental, IRental } from '../models/Rental';
import { NFT } from '../models/NFT';
import { User } from '../models/User';
import { web3Service } from '../services/web3';
import { notificationService } from '../services/notifications';
import Joi from 'joi';

const router = Router();

// Health check
router.get('/health', (req: Request, res: Response) => {
  res.json({ success: true, service: 'Rental API', message: 'Service is healthy' });
});

// Create rental listing
router.post('/list', 
  authMiddleware.authenticate,
  validateRequest({
    body: Joi.object({
      nftContractAddress: commonSchemas.ethereumAddress,
      nftTokenId: commonSchemas.tokenId,
      nftChainId: commonSchemas.chainId,
      dailyPrice: Joi.number().positive().required(),
      currency: Joi.string().valid('ETH', 'MATIC', 'USDC', 'DAI').default('ETH'),
      minRentalDuration: Joi.number().integer().min(1).max(365).default(1),
      maxRentalDuration: Joi.number().integer().min(1).max(365).default(30),
      collateralRequired: Joi.number().min(0).required(),
      instantRent: Joi.boolean().default(false),
      allowedUseCases: Joi.array().items(
        Joi.string().valid('gaming', 'metaverse', 'pfp', 'utility', 'yield', 'other')
      ).min(1).required(),
      terms: Joi.object({
        description: Joi.string().max(1000).required(),
        restrictions: Joi.array().items(Joi.string().max(200)).default([]),
        penalties: Joi.object({
          lateReturn: Joi.number().min(0).default(0),
          damage: Joi.number().min(0).default(0)
        }).default({})
      }).required()
    })
  }),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const lenderAddress = req.user!.address;
    const {
      nftContractAddress,
      nftTokenId,
      nftChainId,
      dailyPrice,
      currency,
      minRentalDuration,
      maxRentalDuration,
      collateralRequired,
      instantRent,
      allowedUseCases,
      terms
    } = req.body;
    
    // Verify NFT ownership
    const nft = await NFT.findByIdentifier(nftContractAddress, nftTokenId, nftChainId);
    if (!nft) {
      return res.status(404).json({
        success: false,
        error: 'NFT not found. Please register the NFT first.'
      });
    }
    
    if (nft.owner.toLowerCase() !== lenderAddress.toLowerCase()) {
      return res.status(403).json({
        success: false,
        error: 'You do not own this NFT'
      });
    }
    
    // Check if NFT is already listed or rented
    if (nft.currentUser || nft.rental?.isAvailable) {
      return res.status(409).json({
        success: false,
        error: 'NFT is already listed for rent or currently rented'
      });
    }
    
    // Create rental listing
    const rental = new Rental({
      nft: nft._id,
      lender: lenderAddress,
      pricing: {
        dailyPrice,
        currency,
        collateralRequired
      },
      duration: {
        min: minRentalDuration,
        max: maxRentalDuration
      },
      settings: {
        instantRent,
        allowedUseCases,
        autoExtend: false
      },
      terms,
      status: 'active',
      blockchain: {
        chainId: nftChainId,
        contractAddress: nftContractAddress,
        tokenId: nftTokenId
      }
    });
    
    await rental.save();
    
    // Update NFT rental information
    await NFT.findByIdAndUpdate(nft._id, {
      $set: {
        'rental.isAvailable': true,
        'rental.currentListing': rental._id,
        'rental.avgDailyPrice': dailyPrice
      }
    });
    
    res.status(201).json({
      success: true,
      message: 'NFT listed for rent successfully',
      data: { rental }
    });
  })
);

// Get available rentals
router.get('/available',
  validateRequest({
    query: Joi.object({
      chainId: Joi.number().valid(1, 137, 42161, 10, 8453).optional(),
      useCase: Joi.string().valid('gaming', 'metaverse', 'pfp', 'utility', 'yield', 'other').optional(),
      minPrice: Joi.number().min(0).optional(),
      maxPrice: Joi.number().min(0).optional(),
      maxDuration: Joi.number().integer().min(1).optional(),
      sortBy: Joi.string().valid('price', 'duration', 'rating', 'recent').default('recent'),
      sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(50).default(20)
    })
  }),
  asyncHandler(async (req: Request, res: Response) => {
    const { 
      chainId, 
      useCase, 
      minPrice, 
      maxPrice, 
      maxDuration,
      sortBy, 
      sortOrder, 
      page, 
      limit 
    } = req.query as any;
    
    const filters: any = {
      status: 'active'
    };
    
    if (chainId) filters['blockchain.chainId'] = chainId;
    if (useCase) filters['settings.allowedUseCases'] = useCase;
    
    if (minPrice !== undefined || maxPrice !== undefined) {
      filters['pricing.dailyPrice'] = {};
      if (minPrice !== undefined) filters['pricing.dailyPrice'].$gte = minPrice;
      if (maxPrice !== undefined) filters['pricing.dailyPrice'].$lte = maxPrice;
    }
    
    if (maxDuration) filters['duration.max'] = { $lte: maxDuration };
    
    const sortOptions: any = {};
    switch (sortBy) {
      case 'price':
        sortOptions['pricing.dailyPrice'] = sortOrder === 'asc' ? 1 : -1;
        break;
      case 'duration':
        sortOptions['duration.max'] = sortOrder === 'asc' ? 1 : -1;
        break;
      default:
        sortOptions.createdAt = sortOrder === 'asc' ? 1 : -1;
    }
    
    const skip = (page - 1) * limit;
    
    const [rentals, total] = await Promise.all([
      Rental.find(filters)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .populate('nft'),
      Rental.countDocuments(filters)
    ]);
    
    res.json({
      success: true,
      data: {
        rentals,
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

// Get rental by ID
router.get('/:rentalId', 
  validateRequest({
    params: Joi.object({
      rentalId: commonSchemas.mongoId
    })
  }),
  asyncHandler(async (req: Request, res: Response) => {
    const { rentalId } = req.params;
    
    const rental = await Rental.findById(rentalId)
      .populate('nft');
    
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
  })
);

export default router;
