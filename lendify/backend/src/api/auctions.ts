import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// Mock data for development
const mockAuctions = [
  {
    id: 'auction-1',
    nft: {
      id: 'nft-1',
      name: 'Cosmic Voyager #1234',
      image: 'https://via.placeholder.com/400x400?text=Cosmic+Voyager',
      collection: 'Cosmic Voyagers',
      rarity: 'Legendary',
      tokenId: '1234',
      contractAddress: '0x1234...5678'
    },
    seller: {
      address: '0x1234...5678',
      name: 'CryptoCollector',
      verified: true
    },
    startingBid: { value: 0.5, currency: 'ETH' },
    reservePrice: { value: 1.0, currency: 'ETH' },
    currentBid: { value: 2.5, currency: 'ETH' },
    highestBidder: {
      address: '0x8765...4321',
      name: 'BidMaster'
    },
    startTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    bidCount: 15,
    bidders: 8,
    status: 'active',
    views: 1234,
    watchers: 89,
    isWatching: false,
    blockchain: 'ethereum',
    bids: [
      {
        id: 'bid-1',
        bidder: { address: '0x8765...4321', name: 'BidMaster' },
        amount: { value: 2.5, currency: 'ETH' },
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        txHash: '0xabcd...1234'
      },
      {
        id: 'bid-2',
        bidder: { address: '0x2468...1357', name: 'Collector123' },
        amount: { value: 2.2, currency: 'ETH' },
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        txHash: '0xefgh...5678'
      }
    ]
  },
  {
    id: 'auction-2',
    nft: {
      id: 'nft-2',
      name: 'Digital Dreams #0789',
      image: 'https://via.placeholder.com/400x400?text=Digital+Dreams',
      collection: 'Digital Dreams',
      rarity: 'Rare',
      tokenId: '789',
      contractAddress: '0x8765...4321'
    },
    seller: {
      address: '0x2468...1357',
      name: 'ArtLover',
      verified: false
    },
    startingBid: { value: 0.1, currency: 'ETH' },
    reservePrice: { value: 0.5, currency: 'ETH' },
    currentBid: { value: 0.8, currency: 'ETH' },
    highestBidder: {
      address: '0x9876...5432',
      name: 'Collector123'
    },
    startTime: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    bidCount: 7,
    bidders: 5,
    status: 'active',
    views: 567,
    watchers: 34,
    isWatching: true,
    blockchain: 'polygon',
    bids: [
      {
        id: 'bid-3',
        bidder: { address: '0x9876...5432', name: 'Collector123' },
        amount: { value: 0.8, currency: 'ETH' },
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        txHash: '0xijkl...9012'
      }
    ]
  }
];

// GET /api/auctions - Get all auctions
router.get('/', 
  asyncHandler(async (req: Request, res: Response) => {
    const { 
      status = 'active',
      sortBy = 'ending_soon',
      category,
      blockchain,
      minPrice,
      maxPrice,
      limit = 50,
      offset = 0 
    } = req.query;

    let auctions = [...mockAuctions];

    // Filter by status
    if (status !== 'all') {
      auctions = auctions.filter(auction => {
        const now = new Date().getTime();
        const endTime = new Date(auction.endTime).getTime();
        
        switch (status) {
          case 'active':
            return endTime > now && auction.status === 'active';
          case 'ending_soon':
            return endTime > now && endTime - now < 60 * 60 * 1000; // Less than 1 hour
          case 'ended':
            return endTime <= now || auction.status === 'ended';
          case 'new':
            const startTime = new Date(auction.startTime).getTime();
            return now - startTime < 24 * 60 * 60 * 1000; // Started within 24 hours
          default:
            return true;
        }
      });
    }

    // Filter by blockchain
    if (blockchain && blockchain !== 'all') {
      auctions = auctions.filter(auction => auction.blockchain === blockchain);
    }

    // Filter by price range
    if (minPrice) {
      auctions = auctions.filter(auction => 
        auction.currentBid.value >= parseFloat(minPrice as string)
      );
    }
    if (maxPrice) {
      auctions = auctions.filter(auction => 
        auction.currentBid.value <= parseFloat(maxPrice as string)
      );
    }

    // Sort auctions
    auctions.sort((a, b) => {
      const now = new Date().getTime();
      
      switch (sortBy) {
        case 'ending_soon':
          return new Date(a.endTime).getTime() - new Date(b.endTime).getTime();
        case 'highest_bid':
          return b.currentBid.value - a.currentBid.value;
        case 'most_bids':
          return b.bidCount - a.bidCount;
        case 'newest':
          return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
        case 'price_low':
          return a.currentBid.value - b.currentBid.value;
        case 'price_high':
          return b.currentBid.value - a.currentBid.value;
        default:
          return 0;
      }
    });

    // Pagination
    const startIndex = parseInt(offset as string);
    const endIndex = startIndex + parseInt(limit as string);
    const paginatedAuctions = auctions.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: paginatedAuctions,
      pagination: {
        total: auctions.length,
        limit: parseInt(limit as string),
        offset: startIndex,
        hasMore: endIndex < auctions.length
      }
    });
  })
);

// GET /api/auctions/active - Get active auctions
router.get('/active', 
  asyncHandler(async (req: Request, res: Response) => {
    const now = new Date().getTime();
    const activeAuctions = mockAuctions.filter(auction => {
      const endTime = new Date(auction.endTime).getTime();
      return endTime > now && auction.status === 'active';
    });

    res.json({
      success: true,
      data: activeAuctions
    });
  })
);

// GET /api/auctions/:id - Get auction by ID
router.get('/:id', 
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    
    const auction = mockAuctions.find(a => a.id === id);
    
    if (!auction) {
      return res.status(404).json({
        success: false,
        error: 'Auction not found'
      });
    }

    res.json({
      success: true,
      data: auction
    });
  })
);

// POST /api/auctions/:id/bid - Place a bid
router.post('/:id/bid', authMiddleware.authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { amount } = req.body;
    const userId = req.user?.id;
    const userAddress = req.user?.address;
    
    const auction = mockAuctions.find(a => a.id === id);
    
    if (!auction) {
      return res.status(404).json({
        success: false,
        error: 'Auction not found'
      });
    }

    // Check if auction is still active
    const now = new Date().getTime();
    const endTime = new Date(auction.endTime).getTime();
    
    if (endTime <= now) {
      return res.status(400).json({
        success: false,
        error: 'Auction has ended'
      });
    }

    // Validate bid amount
    if (!amount || amount <= auction.currentBid.value) {
      return res.status(400).json({
        success: false,
        error: 'Bid must be higher than current bid'
      });
    }

    // Check if user is the seller
    if (auction.seller.address === userAddress) {
      return res.status(400).json({
        success: false,
        error: 'Cannot bid on your own auction'
      });
    }

    // Create new bid
    const newBid = {
      id: `bid-${Date.now()}`,
      bidder: {
        address: userAddress || '0x0000...0000',
        name: req.user?.userId || 'Unknown'
      },
      amount: { value: amount, currency: 'ETH' },
      timestamp: new Date().toISOString(),
      txHash: `0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 4)}`
    };

    // Update auction
    auction.currentBid = newBid.amount;
    auction.highestBidder = newBid.bidder;
    auction.bidCount += 1;
    auction.bids.unshift(newBid);

    // Update bidders count if new bidder
    const existingBidder = auction.bids.find(bid => 
      bid.bidder.address === userAddress && bid.id !== newBid.id
    );
    if (!existingBidder) {
      auction.bidders += 1;
    }

    res.json({
      success: true,
      data: {
        bid: newBid,
        auction: {
          currentBid: auction.currentBid,
          bidCount: auction.bidCount,
          bidders: auction.bidders
        }
      }
    });
  })
);

// POST /api/auctions/:id/watch - Watch/unwatch auction
router.post('/:id/watch', authMiddleware.authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.id;
    
    const auction = mockAuctions.find(a => a.id === id);
    
    if (!auction) {
      return res.status(404).json({
        success: false,
        error: 'Auction not found'
      });
    }

    // Toggle watch status (mock implementation)
    auction.isWatching = !auction.isWatching;
    auction.watchers += auction.isWatching ? 1 : -1;

    res.json({
      success: true,
      data: {
        isWatching: auction.isWatching,
        watchers: auction.watchers
      }
    });
  })
);

// POST /api/auctions - Create new auction
router.post('/', authMiddleware.authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const {
      nftId,
      startingBid,
      reservePrice,
      duration // in hours
    } = req.body;

    // Validate required fields
    if (!nftId || !startingBid || !duration) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // Mock NFT data (in real implementation, fetch from database)
    const mockNFT = {
      id: nftId,
      name: 'Sample NFT #123',
      image: 'https://via.placeholder.com/400x400?text=NFT',
      collection: 'Sample Collection',
      rarity: 'Common',
      tokenId: '123',
      contractAddress: '0x1234...5678'
    };

    // Create new auction
    const newAuction = {
      id: `auction-${Date.now()}`,
      nft: mockNFT,
      seller: {
        address: req.user?.address || '0x0000...0000',
        name: req.user?.userId || 'Unknown',
        verified: false
      },
      startingBid: { value: startingBid, currency: 'ETH' },
      reservePrice: reservePrice ? { value: reservePrice, currency: 'ETH' } : { value: 0, currency: 'ETH' },
      currentBid: { value: startingBid, currency: 'ETH' },
      highestBidder: { address: '', name: '' },
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + duration * 60 * 60 * 1000).toISOString(),
      bidCount: 0,
      bidders: 0,
      status: 'active',
      views: 0,
      watchers: 0,
      isWatching: false,
      blockchain: 'ethereum',
      bids: []
    };

    mockAuctions.push(newAuction);

    res.status(201).json({
      success: true,
      data: newAuction
    });
  })
);

// PUT /api/auctions/:id/end - End auction early (seller only)
router.put('/:id/end', authMiddleware.authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const userAddress = req.user?.address;
    
    const auction = mockAuctions.find(a => a.id === id);
    
    if (!auction) {
      return res.status(404).json({
        success: false,
        error: 'Auction not found'
      });
    }

    // Check if user is the seller
    if (auction.seller.address !== userAddress) {
      return res.status(403).json({
        success: false,
        error: 'Only the seller can end the auction'
      });
    }

    // Check if auction is still active
    if (auction.status !== 'active') {
      return res.status(400).json({
        success: false,
        error: 'Auction is not active'
      });
    }

    // End auction
    auction.status = 'ended';
    auction.endTime = new Date().toISOString();

    res.json({
      success: true,
      data: auction
    });
  })
);

export default router;
