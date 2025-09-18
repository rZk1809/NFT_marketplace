// Bidding & Auction Service
// Handles bidding operations, auction management, and offer systems

class BiddingService {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = 2 * 60 * 1000; // 2 minutes for real-time data
    this.apiBase = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
    this.wsConnection = null;
    this.subscriptions = new Map();
  }

  // Auction Management
  async getAuctions(options = {}) {
    const {
      status = 'active',
      sortBy = 'ending_soon',
      category,
      blockchain,
      minPrice,
      maxPrice,
      limit = 50,
      offset = 0
    } = options;

    const cacheKey = `auctions-${JSON.stringify(options)}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const params = new URLSearchParams({
        status,
        sortBy,
        category: category || '',
        blockchain: blockchain || '',
        minPrice: minPrice?.toString() || '',
        maxPrice: maxPrice?.toString() || '',
        limit: limit.toString(),
        offset: offset.toString()
      });

      const response = await fetch(`${this.apiBase}/auctions?${params}`);
      if (!response.ok) throw new Error('Failed to fetch auctions');

      const result = await response.json();
      this.setCache(cacheKey, result.data);
      return result.data;
    } catch (error) {
      console.error('Auction fetch error:', error);
      return this.getMockActiveAuctions(options);
    }
  }

  async getActiveAuctions(options = {}) {
    const {
      category = '',
      priceRange = { min: 0, max: null },
      sortBy = 'endTime',
      sortOrder = 'asc',
      page = 1,
      limit = 20
    } = options;

    const cacheKey = `active-auctions-${JSON.stringify(options)}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const params = new URLSearchParams({
        category,
        minPrice: priceRange.min.toString(),
        maxPrice: priceRange.max?.toString() || '',
        sortBy,
        sortOrder,
        page: page.toString(),
        limit: limit.toString()
      });

      const response = await fetch(`${this.apiBase}/auctions/active?${params}`);
      if (!response.ok) throw new Error('Failed to fetch auctions');
      
      const result = await response.json();
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Auction fetch error:', error);
      return this.getMockActiveAuctions(options);
    }
  }

  async getAuctionDetails(auctionId) {
    const cacheKey = `auction-${auctionId}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`${this.apiBase}/auctions/${auctionId}`);
      if (!response.ok) throw new Error('Auction not found');
      
      const auction = await response.json();
      this.setCache(cacheKey, auction, 30000); // Shorter cache for active auctions
      return auction;
    } catch (error) {
      console.error('Auction details error:', error);
      return this.getMockAuctionDetails(auctionId);
    }
  }

  async getBidHistory(auctionId, limit = 50) {
    try {
      const response = await fetch(`${this.apiBase}/auctions/${auctionId}/bids?limit=${limit}`);
      if (!response.ok) throw new Error('Failed to fetch bid history');
      
      return await response.json();
    } catch (error) {
      console.error('Bid history error:', error);
      return this.getMockBidHistory(auctionId, limit);
    }
  }

  // Bidding Operations
  async placeBid(auctionId, bidAmount, userAddress) {
    try {
      const response = await fetch(`${this.apiBase}/auctions/${auctionId}/bid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          amount: bidAmount,
          bidder: userAddress,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to place bid');
      }
      
      const result = await response.json();
      this.clearAuctionCache(auctionId);
      return result;
    } catch (error) {
      console.error('Place bid error:', error);
      throw error;
    }
  }

  async withdrawBid(auctionId, bidId, userAddress) {
    try {
      const response = await fetch(`${this.apiBase}/auctions/${auctionId}/bids/${bidId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({ bidder: userAddress })
      });

      if (!response.ok) throw new Error('Failed to withdraw bid');
      
      const result = await response.json();
      this.clearAuctionCache(auctionId);
      return result;
    } catch (error) {
      console.error('Withdraw bid error:', error);
      throw error;
    }
  }

  async watchAuction(auctionId) {
    try {
      const response = await fetch(`${this.apiBase}/auctions/${auctionId}/watch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) throw new Error('Failed to watch auction');

      const result = await response.json();
      this.clearAuctionCache(auctionId);
      return result;
    } catch (error) {
      console.error('Watch auction error:', error);
      throw error;
    }
  }

  // Offer System
  async makeOffer(nftId, offerAmount, duration, userAddress) {
    try {
      const response = await fetch(`${this.apiBase}/nfts/${nftId}/offers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          amount: offerAmount,
          duration: duration, // in hours
          offerer: userAddress,
          timestamp: new Date().toISOString(),
          expiresAt: new Date(Date.now() + duration * 60 * 60 * 1000).toISOString()
        })
      });

      if (!response.ok) throw new Error('Failed to make offer');
      
      return await response.json();
    } catch (error) {
      console.error('Make offer error:', error);
      throw error;
    }
  }

  async acceptOffer(offerId, userAddress) {
    try {
      const response = await fetch(`${this.apiBase}/offers/${offerId}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({ acceptedBy: userAddress })
      });

      if (!response.ok) throw new Error('Failed to accept offer');
      
      return await response.json();
    } catch (error) {
      console.error('Accept offer error:', error);
      throw error;
    }
  }

  async rejectOffer(offerId, userAddress) {
    try {
      const response = await fetch(`${this.apiBase}/offers/${offerId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({ rejectedBy: userAddress })
      });

      if (!response.ok) throw new Error('Failed to reject offer');
      
      return await response.json();
    } catch (error) {
      console.error('Reject offer error:', error);
      throw error;
    }
  }

  async getOffers(nftId, status = 'active') {
    const cacheKey = `offers-${nftId}-${status}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`${this.apiBase}/nfts/${nftId}/offers?status=${status}`);
      if (!response.ok) throw new Error('Failed to fetch offers');
      
      const result = await response.json();
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Offers fetch error:', error);
      return this.getMockOffers(nftId, status);
    }
  }

  async getUserOffers(userAddress, type = 'sent') {
    const cacheKey = `user-offers-${userAddress}-${type}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`${this.apiBase}/users/${userAddress}/offers?type=${type}`);
      if (!response.ok) throw new Error('Failed to fetch user offers');
      
      const result = await response.json();
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('User offers fetch error:', error);
      return { offers: [] };
    }
  }

  // Auction Creation (for sellers)
  async createAuction(nftId, auctionData, userAddress) {
    try {
      const response = await fetch(`${this.apiBase}/auctions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          nftId,
          seller: userAddress,
          startingPrice: auctionData.startingPrice,
          reservePrice: auctionData.reservePrice || 0,
          duration: auctionData.duration, // in hours
          startTime: auctionData.startTime || new Date().toISOString(),
          endTime: new Date(
            (new Date(auctionData.startTime || Date.now())).getTime() + 
            auctionData.duration * 60 * 60 * 1000
          ).toISOString(),
          createdAt: new Date().toISOString()
        })
      });

      if (!response.ok) throw new Error('Failed to create auction');
      
      const result = await response.json();
      this.clearCache(); // Clear all auction caches
      return result;
    } catch (error) {
      console.error('Create auction error:', error);
      throw error;
    }
  }

  async endAuction(auctionId, userAddress) {
    try {
      const response = await fetch(`${this.apiBase}/auctions/${auctionId}/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({ endedBy: userAddress })
      });

      if (!response.ok) throw new Error('Failed to end auction');
      
      const result = await response.json();
      this.clearAuctionCache(auctionId);
      return result;
    } catch (error) {
      console.error('End auction error:', error);
      throw error;
    }
  }

  // Real-time Updates via WebSocket
  subscribeToAuction(auctionId, callback) {
    if (!this.wsConnection || this.wsConnection.readyState !== WebSocket.OPEN) {
      this.initializeWebSocket();
    }

    const subscription = { auctionId, callback };
    this.subscriptions.set(auctionId, subscription);

    // Send subscription message
    if (this.wsConnection?.readyState === WebSocket.OPEN) {
      this.wsConnection.send(JSON.stringify({
        type: 'subscribe',
        channel: 'auction',
        auctionId
      }));
    }

    return () => this.unsubscribeFromAuction(auctionId);
  }

  unsubscribeFromAuction(auctionId) {
    this.subscriptions.delete(auctionId);
    
    if (this.wsConnection?.readyState === WebSocket.OPEN) {
      this.wsConnection.send(JSON.stringify({
        type: 'unsubscribe',
        channel: 'auction',
        auctionId
      }));
    }
  }

  initializeWebSocket() {
    const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:3001/ws';
    
    this.wsConnection = new WebSocket(wsUrl);
    
    this.wsConnection.onopen = () => {
      console.log('WebSocket connected for bidding service');
    };

    this.wsConnection.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.channel === 'auction') {
          const subscription = this.subscriptions.get(data.auctionId);
          if (subscription) {
            subscription.callback(data);
          }
          
          // Clear cache for updated auction
          this.clearAuctionCache(data.auctionId);
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    };

    this.wsConnection.onclose = () => {
      console.log('WebSocket disconnected, attempting to reconnect...');
      setTimeout(() => {
        this.initializeWebSocket();
      }, 5000);
    };

    this.wsConnection.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
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

  setCache(key, data, customExpiry = null) {
    this.cache.set(key, {
      data,
      expiry: Date.now() + (customExpiry || this.cacheExpiry)
    });
  }

  clearCache() {
    this.cache.clear();
  }

  clearAuctionCache(auctionId) {
    const keysToDelete = [];
    for (const key of this.cache.keys()) {
      if (key.includes(`auction-${auctionId}`) || key.includes('active-auctions')) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  formatTimeRemaining(endTime) {
    const now = new Date().getTime();
    const end = new Date(endTime).getTime();
    const remaining = end - now;

    if (remaining <= 0) return 'Ended';

    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }

  // Mock Data Functions (Fallback)
  getMockActiveAuctions(options) {
    const mockAuctions = [
      {
        id: 'auction-1',
        nft: {
          id: 'nft-1',
          name: 'Cosmic Voyager #1234',
          image: 'https://via.placeholder.com/400x400?text=Cosmic+Voyager',
          collection: 'Cosmic Voyagers',
          tokenId: '1234'
        },
        seller: {
          address: '0x1234...5678',
          name: 'CryptoCollector',
          verified: true
        },
        startingPrice: { value: 0.5, currency: 'ETH' },
        currentBid: { value: 2.1, currency: 'ETH' },
        reservePrice: { value: 1.0, currency: 'ETH' },
        bidCount: 12,
        startTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // 6 hours left
        status: 'active',
        topBidder: {
          address: '0x8765...4321',
          name: 'NFTWhale'
        }
      },
      {
        id: 'auction-2',
        nft: {
          id: 'nft-2',
          name: 'Digital Dreams #0789',
          image: 'https://via.placeholder.com/400x400?text=Digital+Dreams',
          collection: 'Digital Dreams',
          tokenId: '0789'
        },
        seller: {
          address: '0x2345...6789',
          name: 'ArtistDAO',
          verified: true
        },
        startingPrice: { value: 0.1, currency: 'ETH' },
        currentBid: { value: 0.8, currency: 'ETH' },
        reservePrice: { value: 0.5, currency: 'ETH' },
        bidCount: 7,
        startTime: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours left
        status: 'active',
        topBidder: {
          address: '0x3456...7890',
          name: 'DigitalCollector'
        }
      }
    ];

    // Apply filters and sorting
    let filtered = [...mockAuctions];
    
    if (options.category) {
      filtered = filtered.filter(a => 
        a.nft.collection.toLowerCase().includes(options.category.toLowerCase())
      );
    }

    if (options.priceRange?.min > 0) {
      filtered = filtered.filter(a => a.currentBid.value >= options.priceRange.min);
    }

    if (options.priceRange?.max) {
      filtered = filtered.filter(a => a.currentBid.value <= options.priceRange.max);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aVal, bVal;
      switch (options.sortBy) {
        case 'price':
          aVal = a.currentBid.value;
          bVal = b.currentBid.value;
          break;
        case 'bidCount':
          aVal = a.bidCount;
          bVal = b.bidCount;
          break;
        default: // endTime
          aVal = new Date(a.endTime).getTime();
          bVal = new Date(b.endTime).getTime();
      }
      
      return options.sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
    });

    // Apply pagination
    const startIndex = (options.page - 1) * options.limit;
    const endIndex = startIndex + options.limit;
    const paginatedAuctions = filtered.slice(startIndex, endIndex);

    return {
      auctions: paginatedAuctions,
      total: filtered.length,
      page: options.page,
      limit: options.limit,
      pages: Math.ceil(filtered.length / options.limit)
    };
  }

  getMockAuctionDetails(auctionId) {
    const auctions = this.getMockActiveAuctions({}).auctions;
    return auctions.find(a => a.id === auctionId) || auctions[0];
  }

  getMockBidHistory(auctionId, limit) {
    return {
      bids: [
        {
          id: 'bid-1',
          amount: { value: 2.1, currency: 'ETH' },
          bidder: {
            address: '0x8765...4321',
            name: 'NFTWhale',
            verified: true
          },
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          txHash: '0xabc...123'
        },
        {
          id: 'bid-2',
          amount: { value: 1.8, currency: 'ETH' },
          bidder: {
            address: '0x3456...7890',
            name: 'DigitalCollector',
            verified: false
          },
          timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          txHash: '0xdef...456'
        }
      ],
      total: 2
    };
  }

  getMockOffers(nftId, status) {
    return {
      offers: [
        {
          id: 'offer-1',
          amount: { value: 1.5, currency: 'ETH' },
          offerer: {
            address: '0x9876...5432',
            name: 'CryptoCollector',
            verified: true
          },
          duration: 24, // hours
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          expiresAt: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(),
          status: 'active'
        }
      ],
      total: 1
    };
  }

  // Cleanup
  disconnect() {
    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
    }
    this.subscriptions.clear();
    this.clearCache();
  }
}

export default new BiddingService();