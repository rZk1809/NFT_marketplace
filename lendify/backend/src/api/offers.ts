import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// Mock data for development
const mockOffers = [
  {
    id: 'offer-1',
    nft: {
      id: 'nft-1',
      name: 'Cosmic Voyager #1234',
      image: 'https://via.placeholder.com/400x400?text=Cosmic+Voyager',
      collection: 'Cosmic Voyagers',
      tokenId: '1234',
      contractAddress: '0x1234...5678'
    },
    offerer: {
      address: '0x8765...4321',
      name: 'OfferMaker',
      verified: true
    },
    owner: {
      address: '0x1234...5678',
      name: 'NFTOwner',
      verified: false
    },
    amount: { value: 2.0, currency: 'ETH' },
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'pending',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    blockchain: 'ethereum'
  },
  {
    id: 'offer-2',
    nft: {
      id: 'nft-2',
      name: 'Digital Dreams #0789',
      image: 'https://via.placeholder.com/400x400?text=Digital+Dreams',
      collection: 'Digital Dreams',
      tokenId: '789',
      contractAddress: '0x8765...4321'
    },
    offerer: {
      address: '0x2468...1357',
      name: 'Collector123',
      verified: false
    },
    owner: {
      address: '0x9876...5432',
      name: 'ArtOwner',
      verified: true
    },
    amount: { value: 0.5, currency: 'ETH' },
    expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'pending',
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    blockchain: 'polygon'
  }
];

// GET /api/nfts/:nftId/offers - Get offers for a specific NFT
router.get('/nfts/:nftId/offers', 
  asyncHandler(async (req: Request, res: Response) => {
    const { nftId } = req.params;
    const { status = 'all', limit = 50, offset = 0 } = req.query;

    let offers = mockOffers.filter(offer => offer.nft.id === nftId);

    // Filter by status
    if (status !== 'all') {
      offers = offers.filter(offer => {
        if (status === 'active') {
          return offer.status === 'pending' && new Date(offer.expiresAt).getTime() > Date.now();
        }
        return offer.status === status;
      });
    }

    // Sort by creation date (newest first)
    offers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Pagination
    const startIndex = parseInt(offset as string);
    const endIndex = startIndex + parseInt(limit as string);
    const paginatedOffers = offers.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: paginatedOffers,
      pagination: {
        total: offers.length,
        limit: parseInt(limit as string),
        offset: startIndex,
        hasMore: endIndex < offers.length
      }
    });
  })
);

// GET /api/offers/:id - Get offer by ID
router.get('/:id', 
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    
    const offer = mockOffers.find(o => o.id === id);
    
    if (!offer) {
      return res.status(404).json({
        success: false,
        error: 'Offer not found'
      });
    }

    res.json({
      success: true,
      data: offer
    });
  })
);

// POST /api/nfts/:nftId/offers - Make an offer on an NFT
router.post('/nfts/:nftId/offers', authMiddleware.authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { nftId } = req.params;
    const { amount, expirationDays = 7 } = req.body;
    const userAddress = req.user?.address;

    // Validate required fields
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid offer amount'
      });
    }

    // Mock NFT data (in real implementation, fetch from database)
    const mockNFT = {
      id: nftId,
      name: 'Sample NFT #123',
      image: 'https://via.placeholder.com/400x400?text=NFT',
      collection: 'Sample Collection',
      tokenId: '123',
      contractAddress: '0x1234...5678',
      owner: {
        address: '0x9999...8888',
        name: 'NFTOwner',
        verified: false
      }
    };

    // Check if user is trying to make offer on their own NFT
    if (mockNFT.owner.address === userAddress) {
      return res.status(400).json({
        success: false,
        error: 'Cannot make offer on your own NFT'
      });
    }

    // Check if user already has an active offer on this NFT
    const existingOffer = mockOffers.find(offer => 
      offer.nft.id === nftId && 
      offer.offerer.address === userAddress && 
      offer.status === 'pending' &&
      new Date(offer.expiresAt).getTime() > Date.now()
    );

    if (existingOffer) {
      return res.status(400).json({
        success: false,
        error: 'You already have an active offer on this NFT'
      });
    }

    // Create new offer
    const newOffer = {
      id: `offer-${Date.now()}`,
      nft: {
        id: mockNFT.id,
        name: mockNFT.name,
        image: mockNFT.image,
        collection: mockNFT.collection,
        tokenId: mockNFT.tokenId,
        contractAddress: mockNFT.contractAddress
      },
      offerer: {
        address: userAddress || '0x0000...0000',
        name: req.user?.userId || 'Unknown',
        verified: false
      },
      owner: mockNFT.owner,
      amount: { value: amount, currency: 'ETH' },
      expiresAt: new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000).toISOString(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      blockchain: 'ethereum'
    };

    mockOffers.push(newOffer);

    res.status(201).json({
      success: true,
      data: newOffer
    });
  })
);

// POST /api/offers/:id/accept - Accept an offer (owner only)
router.post('/:id/accept', authMiddleware.authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const userAddress = req.user?.address;
    
    const offer = mockOffers.find(o => o.id === id);
    
    if (!offer) {
      return res.status(404).json({
        success: false,
        error: 'Offer not found'
      });
    }

    // Check if user is the NFT owner
    if (offer.owner.address !== userAddress) {
      return res.status(403).json({
        success: false,
        error: 'Only the NFT owner can accept this offer'
      });
    }

    // Check if offer is still valid
    if (offer.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Offer is no longer valid'
      });
    }

    if (new Date(offer.expiresAt).getTime() <= Date.now()) {
      return res.status(400).json({
        success: false,
        error: 'Offer has expired'
      });
    }

    // Accept offer
    offer.status = 'accepted';

    // In a real implementation, this would trigger the NFT transfer
    // and payment processing

    res.json({
      success: true,
      data: offer,
      message: 'Offer accepted successfully'
    });
  })
);

// POST /api/offers/:id/reject - Reject an offer (owner only)
router.post('/:id/reject', authMiddleware.authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const userAddress = req.user?.address;
    
    const offer = mockOffers.find(o => o.id === id);
    
    if (!offer) {
      return res.status(404).json({
        success: false,
        error: 'Offer not found'
      });
    }

    // Check if user is the NFT owner
    if (offer.owner.address !== userAddress) {
      return res.status(403).json({
        success: false,
        error: 'Only the NFT owner can reject this offer'
      });
    }

    // Check if offer is still valid
    if (offer.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Offer is no longer valid'
      });
    }

    // Reject offer
    offer.status = 'rejected';

    res.json({
      success: true,
      data: offer,
      message: 'Offer rejected successfully'
    });
  })
);

// DELETE /api/offers/:id - Cancel an offer (offerer only)
router.delete('/:id', authMiddleware.authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const userAddress = req.user?.address;
    
    const offerIndex = mockOffers.findIndex(o => o.id === id);
    
    if (offerIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Offer not found'
      });
    }

    const offer = mockOffers[offerIndex];

    // Check if user is the offerer
    if (offer.offerer.address !== userAddress) {
      return res.status(403).json({
        success: false,
        error: 'Only the offerer can cancel this offer'
      });
    }

    // Check if offer can be cancelled
    if (offer.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Cannot cancel this offer'
      });
    }

    // Cancel offer
    offer.status = 'cancelled';

    res.json({
      success: true,
      message: 'Offer cancelled successfully'
    });
  })
);

// GET /api/users/:address/offers - Get offers made by a user
router.get('/users/:address/offers', 
  asyncHandler(async (req: Request, res: Response) => {
    const { address } = req.params;
    const { status = 'all', type = 'made', limit = 50, offset = 0 } = req.query;

    let offers = [];

    if (type === 'made') {
      // Offers made by the user
      offers = mockOffers.filter(offer => offer.offerer.address === address);
    } else if (type === 'received') {
      // Offers received by the user (on their NFTs)
      offers = mockOffers.filter(offer => offer.owner.address === address);
    } else {
      // All offers (made and received)
      offers = mockOffers.filter(offer => 
        offer.offerer.address === address || offer.owner.address === address
      );
    }

    // Filter by status
    if (status !== 'all') {
      offers = offers.filter(offer => {
        if (status === 'active') {
          return offer.status === 'pending' && new Date(offer.expiresAt).getTime() > Date.now();
        }
        return offer.status === status;
      });
    }

    // Sort by creation date (newest first)
    offers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Pagination
    const startIndex = parseInt(offset as string);
    const endIndex = startIndex + parseInt(limit as string);
    const paginatedOffers = offers.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: paginatedOffers,
      pagination: {
        total: offers.length,
        limit: parseInt(limit as string),
        offset: startIndex,
        hasMore: endIndex < offers.length
      }
    });
  })
);

export default router;
