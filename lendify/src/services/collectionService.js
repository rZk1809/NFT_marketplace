// Collection Management Service
// Handles collection operations, metadata, analytics, and management features

class CollectionService {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
    this.apiBase = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
  }

  // Collection Discovery & Management
  async getCollections(options = {}) {
    const {
      category = '',
      blockchain = '',
      verified = null,
      sortBy = 'volume',
      sortOrder = 'desc',
      page = 1,
      limit = 20,
      search = ''
    } = options;

    const cacheKey = `collections-${JSON.stringify(options)}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const params = new URLSearchParams({
        category,
        blockchain,
        verified: verified !== null ? verified.toString() : '',
        sortBy,
        sortOrder,
        page: page.toString(),
        limit: limit.toString(),
        search
      });

      const response = await fetch(`${this.apiBase}/collections?${params}`);
      if (!response.ok) throw new Error('Failed to fetch collections');
      
      const result = await response.json();
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Collection fetch error:', error);
      return this.getMockCollections(options);
    }
  }

  async getCollectionDetails(collectionId) {
    const cacheKey = `collection-${collectionId}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`${this.apiBase}/collections/${collectionId}`);
      if (!response.ok) throw new Error('Collection not found');
      
      const collection = await response.json();
      this.setCache(cacheKey, collection);
      return collection;
    } catch (error) {
      console.error('Collection details error:', error);
      return this.getMockCollectionDetails(collectionId);
    }
  }

  async getCollectionStats(collectionId, period = '7d') {
    const cacheKey = `collection-stats-${collectionId}-${period}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`${this.apiBase}/collections/${collectionId}/stats?period=${period}`);
      if (!response.ok) throw new Error('Failed to fetch collection stats');
      
      const stats = await response.json();
      this.setCache(cacheKey, stats);
      return stats;
    } catch (error) {
      console.error('Collection stats error:', error);
      return this.getMockCollectionStats(collectionId, period);
    }
  }

  async getCollectionActivity(collectionId, options = {}) {
    const {
      type = 'all', // 'sale', 'listing', 'offer', 'transfer'
      page = 1,
      limit = 50
    } = options;

    try {
      const params = new URLSearchParams({
        type,
        page: page.toString(),
        limit: limit.toString()
      });

      const response = await fetch(`${this.apiBase}/collections/${collectionId}/activity?${params}`);
      if (!response.ok) throw new Error('Failed to fetch collection activity');
      
      return await response.json();
    } catch (error) {
      console.error('Collection activity error:', error);
      return this.getMockCollectionActivity(collectionId, options);
    }
  }

  // Collection Management (Creator/Owner Functions)
  async createCollection(collectionData, userAddress) {
    try {
      const response = await fetch(`${this.apiBase}/collections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          ...collectionData,
          creator: userAddress,
          createdAt: new Date().toISOString()
        })
      });

      if (!response.ok) throw new Error('Failed to create collection');
      
      const newCollection = await response.json();
      this.clearCache(); // Clear cache after creation
      return newCollection;
    } catch (error) {
      console.error('Collection creation error:', error);
      throw error;
    }
  }

  async updateCollection(collectionId, updateData, userAddress) {
    try {
      const response = await fetch(`${this.apiBase}/collections/${collectionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          ...updateData,
          updatedAt: new Date().toISOString(),
          updatedBy: userAddress
        })
      });

      if (!response.ok) throw new Error('Failed to update collection');
      
      const updatedCollection = await response.json();
      this.clearCache(); // Clear cache after update
      return updatedCollection;
    } catch (error) {
      console.error('Collection update error:', error);
      throw error;
    }
  }

  // Collection Analytics
  async getTopCollections(period = '24h', limit = 10) {
    const cacheKey = `top-collections-${period}-${limit}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`${this.apiBase}/collections/top?period=${period}&limit=${limit}`);
      if (!response.ok) throw new Error('Failed to fetch top collections');
      
      const result = await response.json();
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Top collections error:', error);
      return this.getMockTopCollections(period, limit);
    }
  }

  async getTrendingCollections(limit = 10) {
    const cacheKey = `trending-collections-${limit}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`${this.apiBase}/collections/trending?limit=${limit}`);
      if (!response.ok) throw new Error('Failed to fetch trending collections');
      
      const result = await response.json();
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Trending collections error:', error);
      return this.getMockTrendingCollections(limit);
    }
  }

  // User Collection Interactions
  async followCollection(collectionId, userAddress) {
    try {
      const response = await fetch(`${this.apiBase}/collections/${collectionId}/follow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({ userAddress })
      });

      if (!response.ok) throw new Error('Failed to follow collection');
      return await response.json();
    } catch (error) {
      console.error('Follow collection error:', error);
      throw error;
    }
  }

  async unfollowCollection(collectionId, userAddress) {
    try {
      const response = await fetch(`${this.apiBase}/collections/${collectionId}/follow`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({ userAddress })
      });

      if (!response.ok) throw new Error('Failed to unfollow collection');
      return await response.json();
    } catch (error) {
      console.error('Unfollow collection error:', error);
      throw error;
    }
  }

  async getFollowedCollections(userAddress) {
    const cacheKey = `followed-collections-${userAddress}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`${this.apiBase}/users/${userAddress}/collections/following`);
      if (!response.ok) throw new Error('Failed to fetch followed collections');
      
      const result = await response.json();
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Followed collections error:', error);
      return { collections: [] };
    }
  }

  // Utility Functions
  getAuthToken() {
    return localStorage.getItem('authToken') || '';
  }

  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() < cached.expiry) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      expiry: Date.now() + this.cacheExpiry
    });
  }

  clearCache() {
    this.cache.clear();
  }

  // Mock Data Functions (Fallback)
  getMockCollections(options) {
    const mockCollections = [
      {
        id: 'collection-1',
        name: 'CryptoPunks',
        symbol: 'PUNK',
        description: 'The original and largest NFT collection on Ethereum',
        image: 'https://via.placeholder.com/300x300?text=CryptoPunks',
        bannerImage: 'https://via.placeholder.com/800x200?text=CryptoPunks+Banner',
        contractAddress: '0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb',
        blockchain: 'ethereum',
        creator: {
          address: '0x1234...5678',
          name: 'Larva Labs',
          verified: true
        },
        stats: {
          totalSupply: 10000,
          owners: 5500,
          floorPrice: { value: 45.5, currency: 'ETH' },
          volume24h: { value: 234.7, currency: 'ETH' },
          volume7d: { value: 1456.2, currency: 'ETH' },
          volumeTotal: { value: 998234.5, currency: 'ETH' }
        },
        verified: true,
        featured: true,
        category: 'pfp',
        createdAt: '2017-06-23T00:00:00.000Z',
        tags: ['pixel-art', 'collectible', 'ethereum', 'historic']
      },
      {
        id: 'collection-2',
        name: 'Bored Ape Yacht Club',
        symbol: 'BAYC',
        description: 'A collection of 10,000 unique Bored Ape NFTs',
        image: 'https://via.placeholder.com/300x300?text=BAYC',
        bannerImage: 'https://via.placeholder.com/800x200?text=BAYC+Banner',
        contractAddress: '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d',
        blockchain: 'ethereum',
        creator: {
          address: '0x5678...9012',
          name: 'Yuga Labs',
          verified: true
        },
        stats: {
          totalSupply: 10000,
          owners: 6400,
          floorPrice: { value: 28.9, currency: 'ETH' },
          volume24h: { value: 189.3, currency: 'ETH' },
          volume7d: { value: 987.1, currency: 'ETH' },
          volumeTotal: { value: 543210.8, currency: 'ETH' }
        },
        verified: true,
        featured: true,
        category: 'pfp',
        createdAt: '2021-04-23T00:00:00.000Z',
        tags: ['ape', 'collectible', 'ethereum', 'yacht-club']
      },
      {
        id: 'collection-3',
        name: 'Art Blocks Curated',
        symbol: 'BLOCKS',
        description: 'Generative art collections by established artists',
        image: 'https://via.placeholder.com/300x300?text=ArtBlocks',
        bannerImage: 'https://via.placeholder.com/800x200?text=ArtBlocks+Banner',
        contractAddress: '0xa7d8d9ef8d8ce8992df33d8b8cf4aebabd5bd270',
        blockchain: 'ethereum',
        creator: {
          address: '0x9012...3456',
          name: 'Art Blocks',
          verified: true
        },
        stats: {
          totalSupply: 15000,
          owners: 3200,
          floorPrice: { value: 2.1, currency: 'ETH' },
          volume24h: { value: 45.6, currency: 'ETH' },
          volume7d: { value: 234.8, currency: 'ETH' },
          volumeTotal: { value: 89456.3, currency: 'ETH' }
        },
        verified: true,
        featured: false,
        category: 'art',
        createdAt: '2020-11-27T00:00:00.000Z',
        tags: ['generative', 'art', 'curated', 'algorithm']
      }
    ];

    // Apply filters
    let filtered = [...mockCollections];
    
    if (options.category) {
      filtered = filtered.filter(c => c.category === options.category);
    }
    if (options.blockchain) {
      filtered = filtered.filter(c => c.blockchain === options.blockchain);
    }
    if (options.verified !== null) {
      filtered = filtered.filter(c => c.verified === options.verified);
    }
    if (options.search) {
      const searchLower = options.search.toLowerCase();
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(searchLower) ||
        c.description.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aVal, bVal;
      switch (options.sortBy) {
        case 'volume':
          aVal = a.stats.volume24h.value;
          bVal = b.stats.volume24h.value;
          break;
        case 'floorPrice':
          aVal = a.stats.floorPrice.value;
          bVal = b.stats.floorPrice.value;
          break;
        case 'totalSupply':
          aVal = a.stats.totalSupply;
          bVal = b.stats.totalSupply;
          break;
        case 'name':
          return options.sortOrder === 'desc' ? 
            b.name.localeCompare(a.name) : a.name.localeCompare(b.name);
        default:
          aVal = new Date(a.createdAt).getTime();
          bVal = new Date(b.createdAt).getTime();
      }
      
      return options.sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
    });

    // Apply pagination
    const startIndex = (options.page - 1) * options.limit;
    const endIndex = startIndex + options.limit;
    const paginatedCollections = filtered.slice(startIndex, endIndex);

    return {
      collections: paginatedCollections,
      total: filtered.length,
      page: options.page,
      limit: options.limit,
      pages: Math.ceil(filtered.length / options.limit)
    };
  }

  getMockCollectionDetails(collectionId) {
    const collections = this.getMockCollections({}).collections;
    const collection = collections.find(c => c.id === collectionId) || collections[0];
    
    return {
      ...collection,
      detailedStats: {
        ...collection.stats,
        avgPrice: { value: collection.stats.floorPrice.value * 1.5, currency: 'ETH' },
        marketCap: { value: collection.stats.floorPrice.value * collection.stats.totalSupply, currency: 'ETH' },
        sales24h: 45,
        sales7d: 234,
        uniqueTraders24h: 32,
        uniqueTraders7d: 156
      },
      attributes: [
        { trait_type: 'Background', values: ['Red', 'Blue', 'Green', 'Yellow'], counts: [1200, 1500, 800, 2500] },
        { trait_type: 'Eyes', values: ['Normal', 'Laser', 'Zombie', 'Robot'], counts: [5000, 500, 200, 300] },
        { trait_type: 'Mouth', values: ['Smile', 'Frown', 'Neutral'], counts: [3000, 2000, 5000] }
      ],
      socialLinks: {
        website: 'https://example.com',
        twitter: 'https://twitter.com/collection',
        discord: 'https://discord.gg/collection',
        instagram: 'https://instagram.com/collection'
      }
    };
  }

  getMockCollectionStats(collectionId, period) {
    return {
      volume: { value: 234.5, currency: 'ETH', change: 12.5 },
      sales: { count: 45, change: -5.2 },
      avgPrice: { value: 5.2, currency: 'ETH', change: 8.9 },
      floorPrice: { value: 2.1, currency: 'ETH', change: -2.1 },
      owners: { count: 3200, change: 1.5 },
      uniqueTraders: { count: 156, change: 23.4 },
      period
    };
  }

  getMockCollectionActivity(collectionId, options) {
    return {
      activities: [
        {
          id: 'activity-1',
          type: 'sale',
          tokenId: '1234',
          price: { value: 5.2, currency: 'ETH' },
          from: '0x1234...5678',
          to: '0x8765...4321',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          txHash: '0xabcd...efgh'
        },
        {
          id: 'activity-2',
          type: 'listing',
          tokenId: '5678',
          price: { value: 3.8, currency: 'ETH' },
          from: '0x2345...6789',
          to: null,
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          txHash: '0xefgh...ijkl'
        }
      ],
      total: 2,
      page: options.page || 1,
      limit: options.limit || 50
    };
  }

  getMockTopCollections(period, limit) {
    return {
      collections: this.getMockCollections({ limit }).collections.slice(0, limit),
      period
    };
  }

  getMockTrendingCollections(limit) {
    return {
      collections: this.getMockCollections({ limit }).collections.slice(0, limit)
    };
  }
}

export default new CollectionService();