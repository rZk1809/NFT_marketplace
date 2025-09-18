import { Router, Request, Response } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { validateRequest, commonSchemas } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { Loan, ILoan } from '../models/Loan';
import { NFT } from '../models/NFT';
import { User } from '../models/User';
import { web3Service } from '../services/web3';
import { notificationService } from '../services/notifications';
import Joi from 'joi';

const router = Router();

// Health check
router.get('/health', (req: Request, res: Response) => {
  res.json({ success: true, service: 'Lending API', message: 'Service is healthy' });
});

// Create loan request
router.post('/request', 
  authMiddleware.authenticate,
  validateRequest({
    body: Joi.object({
      collateralNFTs: Joi.array().items(
        Joi.object({
          contractAddress: commonSchemas.ethereumAddress,
          tokenId: commonSchemas.tokenId,
          chainId: commonSchemas.chainId,
          estimatedValue: Joi.number().positive().required()
        })
      ).min(1).required(),
      loanAmount: Joi.number().positive().required(),
      currency: Joi.string().valid('ETH', 'MATIC', 'USDC', 'DAI', 'USDT').required(),
      interestRate: Joi.number().positive().max(100).required(),
      duration: Joi.number().integer().min(1).max(365).required(),
      purpose: Joi.string().max(500).required(),
      repaymentSchedule: Joi.string().valid('lump_sum', 'monthly', 'weekly').default('lump_sum'),
      autoLiquidation: Joi.boolean().default(true)
    })
  }),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const borrowerAddress = req.user!.address;
    const {
      collateralNFTs,
      loanAmount,
      currency,
      interestRate,
      duration,
      purpose,
      repaymentSchedule,
      autoLiquidation
    } = req.body;
    
    // Verify ownership of all collateral NFTs
    const nftVerifications = await Promise.all(
      collateralNFTs.map(async (collateral: any) => {
        const nft = await NFT.findByIdentifier(
          collateral.contractAddress,
          collateral.tokenId,
          collateral.chainId
        );
        
        if (!nft) {
          throw new Error(`NFT not found: ${collateral.contractAddress}:${collateral.tokenId}`);
        }
        
        if (nft.owner.toLowerCase() !== borrowerAddress.toLowerCase()) {
          throw new Error(`You do not own NFT: ${collateral.contractAddress}:${collateral.tokenId}`);
        }
        
        return { nft, collateral };
      })
    );
    
    // Calculate total collateral value
    const totalCollateralValue = collateralNFTs.reduce(
      (sum: number, collateral: any) => sum + collateral.estimatedValue,
      0
    );
    
    // Calculate Loan-to-Value ratio
    const ltvRatio = (loanAmount / totalCollateralValue) * 100;
    
    if (ltvRatio > 80) {
      return res.status(400).json({
        success: false,
        error: 'Loan amount exceeds maximum 80% LTV ratio'
      });
    }
    
    // Calculate total repayment amount
    const totalInterest = (loanAmount * interestRate * duration) / (365 * 100);
    const totalRepayment = loanAmount + totalInterest;
    
    // Create loan request
    const loan = new Loan({
      borrower: borrowerAddress,
      collateral: collateralNFTs.map((c: any, index: number) => ({
        nft: nftVerifications[index].nft._id,
        contractAddress: c.contractAddress,
        tokenId: c.tokenId,
        chainId: c.chainId,
        estimatedValue: c.estimatedValue,
        lockedAt: new Date(),
        status: 'locked'
      })),
      terms: {
        principal: loanAmount,
        currency,
        interestRate,
        duration,
        totalRepayment,
        repaymentSchedule,
        ltvRatio
      },
      purpose,
      settings: {
        autoLiquidation,
        gracePeriod: 7
      },
      status: 'requested'
    });
    
    await loan.save();
    
    res.status(201).json({
      success: true,
      message: 'Loan request created successfully',
      data: { loan }
    });
  })
);

// Get available loan requests
router.get('/requests', 
  validateRequest({
    query: Joi.object({
      currency: Joi.string().valid('ETH', 'MATIC', 'USDC', 'DAI', 'USDT').optional(),
      minAmount: Joi.number().positive().optional(),
      maxAmount: Joi.number().positive().optional(),
      maxLTV: Joi.number().positive().max(100).optional(),
      sortBy: Joi.string().valid('amount', 'ltv', 'interest', 'duration', 'recent').default('recent'),
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(50).default(20)
    })
  }),
  asyncHandler(async (req: Request, res: Response) => {
    const { currency, minAmount, maxAmount, maxLTV, sortBy, page, limit } = req.query as any;
    
    const filters: any = { status: 'requested' };
    
    if (currency) filters['terms.currency'] = currency;
    if (maxLTV) filters['terms.ltvRatio'] = { $lte: maxLTV };
    
    if (minAmount || maxAmount) {
      filters['terms.principal'] = {};
      if (minAmount) filters['terms.principal'].$gte = minAmount;
      if (maxAmount) filters['terms.principal'].$lte = maxAmount;
    }
    
    const sortOptions: any = {};
    switch (sortBy) {
      case 'amount':
        sortOptions['terms.principal'] = -1;
        break;
      case 'ltv':
        sortOptions['terms.ltvRatio'] = 1;
        break;
      case 'interest':
        sortOptions['terms.interestRate'] = -1;
        break;
      default:
        sortOptions.createdAt = -1;
    }
    
    const skip = (page - 1) * limit;
    
    const [loans, total] = await Promise.all([
      Loan.find(filters)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit),
      Loan.countDocuments(filters)
    ]);
    
    res.json({
      success: true,
      data: {
        loanRequests: loans,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) }
      }
    });
  })
);

// Get loan by ID
router.get('/:loanId', 
  validateRequest({
    params: Joi.object({
      loanId: commonSchemas.mongoId
    })
  }),
  asyncHandler(async (req: Request, res: Response) => {
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
  })
);

export default router;
