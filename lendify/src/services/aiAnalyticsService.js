import apiService from './api.js';

class AIAnalyticsService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  // Cache management
  getCacheKey(endpoint, params = {}) {
    return `${endpoint}_${JSON.stringify(params)}`;
  }

  getCachedData(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  setCachedData(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // Platform Analytics
  async getPlatformStats() {
    const cacheKey = this.getCacheKey('platform_stats');
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const response = await apiService.get('/analytics/stats');
      const data = response.data;
      this.setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching platform stats:', error);
      throw error;
    }
  }

  // Market Analytics
  async getMarketAnalytics(timeframe = '30d') {
    const cacheKey = this.getCacheKey('market_analytics', { timeframe });
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const response = await apiService.get(`/analytics/market?timeframe=${timeframe}`);
      const data = response.data;
      this.setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching market analytics:', error);
      // Return mock data for development
      return this.getMockMarketAnalytics(timeframe);
    }
  }

  // AI Insights
  async getAIInsights(userId = null) {
    const cacheKey = this.getCacheKey('ai_insights', { userId });
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const endpoint = userId ? `/analytics/ai-insights?userId=${userId}` : '/analytics/ai-insights';
      const response = await apiService.get(endpoint);
      const data = response.data;
      this.setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching AI insights:', error);
      return this.getMockAIInsights();
    }
  }

  // Portfolio Analytics
  async getPortfolioAnalytics(userId) {
    const cacheKey = this.getCacheKey('portfolio_analytics', { userId });
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const response = await apiService.get(`/analytics/portfolio/${userId}`);
      const data = response.data;
      this.setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching portfolio analytics:', error);
      return this.getMockPortfolioAnalytics();
    }
  }

  // NFT Analytics
  async getNFTAnalytics(contractAddress, tokenId, chainId = 1, timeframe = '30d') {
    const cacheKey = this.getCacheKey('nft_analytics', { contractAddress, tokenId, chainId, timeframe });
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const response = await apiService.get(`/nft/${chainId}/${contractAddress}/${tokenId}/analytics?timeframe=${timeframe}`);
      const data = response.data;
      this.setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching NFT analytics:', error);
      return this.getMockNFTAnalytics();
    }
  }

  // Predictive Analytics
  async getPredictiveAnalytics(type = 'market', params = {}) {
    const cacheKey = this.getCacheKey('predictive_analytics', { type, ...params });
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const response = await apiService.get(`/analytics/predictive/${type}`, { params });
      const data = response.data;
      this.setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching predictive analytics:', error);
      return this.getMockPredictiveAnalytics(type);
    }
  }

  // Mock data for development/fallback
  getMockMarketAnalytics(timeframe) {
    return {
      timeframe,
      totalVolume: 1234.56,
      volumeChange: 12.5,
      totalTransactions: 5678,
      transactionChange: 8.3,
      averagePrice: 0.15,
      priceChange: -3.2,
      activeUsers: 2341,
      userChange: 15.7,
      topCategories: [
        { name: 'Gaming Assets', volume: 456.78, percentage: 37 },
        { name: 'Profile Pictures', volume: 312.45, percentage: 25 },
        { name: 'Virtual Land', volume: 234.12, percentage: 19 },
        { name: 'Music NFTs', volume: 132.89, percentage: 11 },
        { name: 'Art', volume: 98.32, percentage: 8 }
      ],
      topCollections: [
        { name: 'Bored Ape Yacht Club', volume: 234.56, change: 15.2 },
        { name: 'CryptoPunks', volume: 187.34, change: -5.8 },
        { name: 'Azuki', volume: 156.78, change: 22.1 },
        { name: 'Doodles', volume: 134.23, change: 8.9 },
        { name: 'Mutant Ape Yacht Club', volume: 123.45, change: -2.3 }
      ],
      priceHistory: this.generateMockPriceHistory(timeframe),
      volumeHistory: this.generateMockVolumeHistory(timeframe)
    };
  }

  getMockAIInsights() {
    return {
      insights: [
        {
          type: 'price',
          title: 'Optimal Pricing Detected',
          description: 'Your gaming NFT could earn 23% more at 0.125 ETH',
          confidence: 94,
          action: 'Adjust Price',
          priority: 'high',
          category: 'pricing'
        },
        {
          type: 'market',
          title: 'Market Trend Alert',
          description: 'Metaverse land rentals up 45% this week',
          confidence: 87,
          action: 'View Opportunities',
          priority: 'medium',
          category: 'market'
        },
        {
          type: 'portfolio',
          title: 'Portfolio Optimization',
          description: 'Diversify into music NFTs for better returns',
          confidence: 76,
          action: 'Explore',
          priority: 'low',
          category: 'portfolio'
        }
      ],
      aiScore: 87.5,
      predictedRevenue: 34.2,
      marketSentiment: 'Bullish',
      riskLevel: 'Medium',
      recommendations: [
        'Consider listing your rare gaming NFT during peak hours (6-9 PM UTC)',
        'Music NFT category showing strong growth - consider diversification',
        'Your portfolio is well-balanced but could benefit from more utility NFTs'
      ]
    };
  }

  getMockPortfolioAnalytics() {
    return {
      totalValue: 12.45,
      totalRevenue: 3.67,
      totalRentals: 23,
      averageRating: 4.8,
      utilizationRate: 67.3,
      categories: [
        { name: 'Gaming', count: 8, value: 5.23, percentage: 42 },
        { name: 'Art', count: 5, value: 3.45, percentage: 28 },
        { name: 'Music', count: 3, value: 2.12, percentage: 17 },
        { name: 'Utility', count: 2, value: 1.65, percentage: 13 }
      ],
      performance: {
        bestPerformer: { name: 'Cosmic Dragon #1001', revenue: 0.89 },
        worstPerformer: { name: 'Art Piece #234', revenue: 0.12 },
        mostRented: { name: 'Gaming Sword #456', rentals: 12 }
      }
    };
  }

  getMockNFTAnalytics() {
    return {
      basic: {
        views: 320,
        favorites: 45,
        shares: 12,
        demandScore: 78,
        rarityScore: 85,
        utilityScore: 92,
        trendingScore: 88
      },
      rental: {
        totalRentals: 15,
        successfulRentals: 14,
        totalRevenue: 2.34,
        avgDailyPrice: 0.15,
        avgRentalDuration: 7.2,
        ratings: { average: 4.6, count: 12 }
      },
      pricing: {
        currentValue: 1.2,
        lastSalePrice: 1.15,
        floorPrice: 0.95,
        priceHistory: this.generateMockPriceHistory('30d')
      }
    };
  }

  getMockPredictiveAnalytics(type) {
    const predictions = {
      market: {
        predictions: [
          { metric: 'Volume', prediction: '+15%', confidence: 87, timeframe: '7 days' },
          { metric: 'Price', prediction: '+8%', confidence: 72, timeframe: '30 days' },
          { metric: 'Users', prediction: '+22%', confidence: 91, timeframe: '14 days' }
        ]
      },
      portfolio: {
        predictions: [
          { metric: 'Revenue', prediction: '+34%', confidence: 83, timeframe: '30 days' },
          { metric: 'Utilization', prediction: '+12%', confidence: 76, timeframe: '14 days' }
        ]
      }
    };
    return predictions[type] || predictions.market;
  }

  generateMockPriceHistory(timeframe) {
    const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
    const history = [];
    let basePrice = 0.15;
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const variation = (Math.random() - 0.5) * 0.02;
      basePrice += variation;
      history.push({
        date: date.toISOString().split('T')[0],
        price: Math.max(0.05, basePrice),
        volume: Math.floor(Math.random() * 100) + 50
      });
    }
    
    return history;
  }

  generateMockVolumeHistory(timeframe) {
    const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
    const history = [];
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      history.push({
        date: date.toISOString().split('T')[0],
        volume: Math.floor(Math.random() * 200) + 100,
        transactions: Math.floor(Math.random() * 50) + 25
      });
    }
    
    return history;
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
  }

  // Refresh specific data
  async refreshData(type, params = {}) {
    const cacheKey = this.getCacheKey(type, params);
    this.cache.delete(cacheKey);
    
    switch (type) {
      case 'platform_stats':
        return await this.getPlatformStats();
      case 'market_analytics':
        return await this.getMarketAnalytics(params.timeframe);
      case 'ai_insights':
        return await this.getAIInsights(params.userId);
      case 'portfolio_analytics':
        return await this.getPortfolioAnalytics(params.userId);
      default:
        throw new Error(`Unknown data type: ${type}`);
    }
  }
}

export const aiAnalyticsService = new AIAnalyticsService();
