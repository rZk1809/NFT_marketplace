import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// Mock data for development
const mockCollections = [
  {
    id: 'collection-1',
    name: 'Cosmic Voyagers',
    description: 'A collection of intergalactic explorers traversing the digital cosmos',
    image: 'https://via.placeholder.com/80x80?text=Cosmic',
    bannerImage: 'https://via.placeholder.com/400x200?text=Cosmic+Banner',
    creator: {
      address: '0x1234...5678',
      name: 'CosmicCreator',
      verified: true
    },
    verified: true,
    totalSupply: 10000,
    owners: 3456,
    floorPrice: { value: 2.5, currency: 'ETH' },
    volume: { value: 1234.56, currency: 'ETH' },
    volumeChange: 12.5,
    views: 45678,
    followers: 1234,
    isFollowing: false,
    blockchain: 'ethereum',
    category: 'Art',
    createdAt: '2023-01-15T00:00:00Z',
    stats: {
      totalVolume: { value: 5678.90, currency: 'ETH' },
      averagePrice: { value: 1.8, currency: 'ETH' },
      sales: 3456,
      listings: 234
    }
  },
  {
    id: 'collection-2',
    name: 'Digital Dreams',
    description: 'Surreal digital artworks that blur the line between reality and imagination',
    image: 'https://via.placeholder.com/80x80?text=Dreams',
    bannerImage: 'https://via.placeholder.com/400x200?text=Dreams+Banner',
    creator: {
      address: '0x8765...4321',
      name: 'DreamArtist',
      verified: false
    },
    verified: false,
    totalSupply: 5000,
    owners: 1234,
    floorPrice: { value: 0.8, currency: 'ETH' },
    volume: { value: 456.78, currency: 'ETH' },
    volumeChange: -5.2,
    views: 23456,
    followers: 567,
    isFollowing: true,
    blockchain: 'polygon',
    category: 'Art',
    createdAt: '2023-03-20T00:00:00Z',
    stats: {
      totalVolume: { value: 1234.56, currency: 'ETH' },
      averagePrice: { value: 0.6, currency: 'ETH' },
      sales: 1890,
      listings: 123
    }
  },
  {
    id: 'collection-3',
    name: 'Pixel Warriors',
    description: 'Retro-style pixel art warriors ready for battle in the metaverse',
    image: 'https://via.placeholder.com/80x80?text=Pixel',
    bannerImage: 'https://via.placeholder.com/400x200?text=Pixel+Banner',
    creator: {
      address: '0x2468...1357',
      name: 'PixelMaster',
      verified: true
    },
    verified: true,
    totalSupply: 8888,
    owners: 2345,
    floorPrice: { value: 1.2, currency: 'ETH' },
    volume: { value: 789.12, currency: 'ETH' },
    volumeChange: 8.9,
    views: 34567,
    followers: 890,
    isFollowing: false,
    blockchain: 'ethereum',
    category: 'Gaming',
    createdAt: '2023-02-10T00:00:00Z',
    stats: {
      totalVolume: { value: 3456.78, currency: 'ETH' },
      averagePrice: { value: 1.0, currency: 'ETH' },
      sales: 2567,
      listings: 178
    }
  }
];

const mockActivities = [
  {
    id: 'activity-1',
    type: 'sale',
    nft: {
      id: 'nft-1',
      name: 'Cosmic Voyager #1234',
      image: 'https://via.placeholder.com/100x100?text=NFT'
    },
    price: { value: 2.5, currency: 'ETH' },
    from: { address: '0x1234...5678', name: 'Seller' },
    to: { address: '0x8765...4321', name: 'Buyer' },
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    txHash: '0xabcd...1234'
  },
  {
    id: 'activity-2',
    type: 'listing',
    nft: {
      id: 'nft-2',
      name: 'Cosmic Voyager #5678',
      image: 'https://via.placeholder.com/100x100?text=NFT'
    },
    price: { value: 3.0, currency: 'ETH' },
    from: { address: '0x2468...1357', name: 'Owner' },
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    txHash: '0xefgh...5678'
  }
];

// GET /api/collections - Get all collections
router.get('/', 
  asyncHandler(async (req: Request, res: Response) => {
    const { 
      sortBy = 'volume', 
      timeframe = '24h', 
      category,
      blockchain,
      verified,
      limit = 50,
      offset = 0 
    } = req.query;

    let collections = [...mockCollections];

    // Filter by category
    if (category && category !== 'all') {
      collections = collections.filter(col => 
        col.category.toLowerCase() === (category as string).toLowerCase()
      );
    }

    // Filter by blockchain
    if (blockchain && blockchain !== 'all') {
      collections = collections.filter(col => 
        col.blockchain === blockchain
      );
    }

    // Filter by verified status
    if (verified === 'true') {
      collections = collections.filter(col => col.verified);
    }

    // Sort collections
    collections.sort((a, b) => {
      switch (sortBy) {
        case 'volume':
          return (b.volume?.value || 0) - (a.volume?.value || 0);
        case 'floorPrice':
          return (b.floorPrice?.value || 0) - (a.floorPrice?.value || 0);
        case 'totalSupply':
          return b.totalSupply - a.totalSupply;
        case 'owners':
          return b.owners - a.owners;
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

    // Pagination
    const startIndex = parseInt(offset as string);
    const endIndex = startIndex + parseInt(limit as string);
    const paginatedCollections = collections.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: paginatedCollections,
      pagination: {
        total: collections.length,
        limit: parseInt(limit as string),
        offset: startIndex,
        hasMore: endIndex < collections.length
      }
    });
  })
);

// GET /api/collections/:id - Get collection by ID
router.get('/:id', 
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    
    const collection = mockCollections.find(col => col.id === id);
    
    if (!collection) {
      return res.status(404).json({
        success: false,
        error: 'Collection not found'
      });
    }

    res.json({
      success: true,
      data: collection
    });
  })
);

// GET /api/collections/:id/stats - Get collection statistics
router.get('/:id/stats', 
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { timeframe = '24h' } = req.query;
    
    const collection = mockCollections.find(col => col.id === id);
    
    if (!collection) {
      return res.status(404).json({
        success: false,
        error: 'Collection not found'
      });
    }

    // Mock statistics based on timeframe
    const stats = {
      ...collection.stats,
      timeframe,
      priceHistory: [
        { timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), price: 2.2 },
        { timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(), price: 2.4 },
        { timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), price: 2.3 },
        { timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), price: 2.5 },
        { timestamp: new Date().toISOString(), price: collection.floorPrice?.value || 0 }
      ],
      volumeHistory: [
        { timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), volume: 100 },
        { timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(), volume: 150 },
        { timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), volume: 120 },
        { timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), volume: 180 },
        { timestamp: new Date().toISOString(), volume: collection.volume?.value || 0 }
      ]
    };

    res.json({
      success: true,
      data: stats
    });
  })
);

// GET /api/collections/:id/activity - Get collection activity
router.get('/:id/activity', 
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { type, limit = 50, offset = 0 } = req.query;
    
    const collection = mockCollections.find(col => col.id === id);
    
    if (!collection) {
      return res.status(404).json({
        success: false,
        error: 'Collection not found'
      });
    }

    let activities = [...mockActivities];

    // Filter by activity type
    if (type && type !== 'all') {
      activities = activities.filter(activity => activity.type === type);
    }

    // Pagination
    const startIndex = parseInt(offset as string);
    const endIndex = startIndex + parseInt(limit as string);
    const paginatedActivities = activities.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: paginatedActivities,
      pagination: {
        total: activities.length,
        limit: parseInt(limit as string),
        offset: startIndex,
        hasMore: endIndex < activities.length
      }
    });
  })
);

// POST /api/collections/:id/follow - Follow/unfollow collection
router.post('/:id/follow', authMiddleware.authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.id;
    
    const collection = mockCollections.find(col => col.id === id);
    
    if (!collection) {
      return res.status(404).json({
        success: false,
        error: 'Collection not found'
      });
    }

    // Toggle follow status (mock implementation)
    collection.isFollowing = !collection.isFollowing;
    collection.followers += collection.isFollowing ? 1 : -1;

    res.json({
      success: true,
      data: {
        isFollowing: collection.isFollowing,
        followers: collection.followers
      }
    });
  })
);

// POST /api/collections - Create new collection (admin only)
router.post('/', authMiddleware.authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const {
      name,
      description,
      image,
      bannerImage,
      category,
      blockchain,
      totalSupply
    } = req.body;

    // Validate required fields
    if (!name || !description || !category || !blockchain) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // Create new collection (mock implementation)
    const newCollection = {
      id: `collection-${Date.now()}`,
      name,
      description,
      image: image || 'https://via.placeholder.com/80x80?text=Collection',
      bannerImage: bannerImage || 'https://via.placeholder.com/400x200?text=Banner',
      creator: {
        address: req.user?.address || '0x0000...0000',
        name: req.user?.userId || 'Unknown',
        verified: false
      },
      verified: false,
      totalSupply: totalSupply || 0,
      owners: 0,
      floorPrice: { value: 0, currency: 'ETH' },
      volume: { value: 0, currency: 'ETH' },
      volumeChange: 0,
      views: 0,
      followers: 0,
      isFollowing: false,
      blockchain,
      category,
      createdAt: new Date().toISOString(),
      stats: {
        totalVolume: { value: 0, currency: 'ETH' },
        averagePrice: { value: 0, currency: 'ETH' },
        sales: 0,
        listings: 0
      }
    };

    mockCollections.push(newCollection);

    res.status(201).json({
      success: true,
      data: newCollection
    });
  })
);

export default router;
