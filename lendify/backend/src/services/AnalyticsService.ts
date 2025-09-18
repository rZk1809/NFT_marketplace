import { EventEmitter } from 'events';

export interface UserMetrics {
  userId: string;
  totalRentals: number;
  totalListings: number;
  totalEarnings: number;
  totalSpent: number;
  avgRating: number;
  successfulTransactions: number;
  disputes: number;
  activeRentals: number;
  activeLendings: number;
  joinDate: Date;
  lastActivity: Date;
  preferredCategories: string[];
  reputationScore: number;
}

export interface NFTMetrics {
  contractAddress: string;
  tokenId: string;
  totalRentals: number;
  totalRevenue: number;
  avgRentalDuration: number;
  avgDailyPrice: number;
  avgRating: number;
  demandScore: number;
  utilizationRate: number; // % of time rented
  lastRentalDate?: Date;
  category: string;
  owner: string;
}

export interface PlatformMetrics {
  totalUsers: number;
  activeUsers: number; // last 30 days
  totalNFTs: number;
  totalRentals: number;
  totalVolume: number;
  platformFees: number;
  avgTransactionValue: number;
  growthRate: number;
  retentionRate: number;
  churnRate: number;
  topCategories: Array<{ category: string; count: number; volume: number }>;
  topCollections: Array<{ collection: string; count: number; volume: number }>;
}

export interface MarketMetrics {
  chainId: number;
  chainName: string;
  totalVolume24h: number;
  totalVolume7d: number;
  totalVolume30d: number;
  transactionCount24h: number;
  transactionCount7d: number;
  transactionCount30d: number;
  avgGasPrice: number;
  avgTransactionValue: number;
  topNFTs: Array<{ contract: string; tokenId: string; volume: number }>;
  activeUsers24h: number;
  newUsers24h: number;
}

export interface PerformanceMetrics {
  timestamp: Date;
  apiResponseTime: number;
  blockchainResponseTime: number;
  databaseResponseTime: number;
  totalRequests: number;
  failedRequests: number;
  successRate: number;
  memoryUsage: NodeJS.MemoryUsage;
  cpuUsage: number;
  activeConnections: number;
  cacheHitRate: number;
}

export interface RevenueMetrics {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: Date;
  endDate: Date;
  totalRevenue: number;
  platformFees: number;
  rentalRevenue: number;
  lendingRevenue: number;
  flashLoanRevenue: number;
  oracleRevenue: number;
  transactionCount: number;
  avgRevenuePerUser: number;
  avgRevenuePerTransaction: number;
}

export class AnalyticsService extends EventEmitter {
  private metricsCache: Map<string, any> = new Map();
  private performanceHistory: PerformanceMetrics[] = [];
  private realtimeMetrics: Map<string, number> = new Map();
  private isCollecting: boolean = false;
  private metricsInterval?: NodeJS.Timeout;

  constructor() {
    super();
    this.initializeRealtimeMetrics();
  }

  private initializeRealtimeMetrics(): void {
    // Initialize real-time counters
    this.realtimeMetrics.set('api_requests', 0);
    this.realtimeMetrics.set('failed_requests', 0);
    this.realtimeMetrics.set('successful_requests', 0);
    this.realtimeMetrics.set('active_users', 0);
    this.realtimeMetrics.set('total_volume_24h', 0);
    this.realtimeMetrics.set('new_users_today', 0);
    this.realtimeMetrics.set('rentals_today', 0);
    this.realtimeMetrics.set('listings_today', 0);
  }

  public startMetricsCollection(): void {
    if (this.isCollecting) return;

    this.isCollecting = true;
    
    // Collect performance metrics every minute
    this.metricsInterval = setInterval(() => {
      this.collectPerformanceMetrics();
    }, 60000);

    console.log('📊 Analytics service started collecting metrics');
  }

  public stopMetricsCollection(): void {
    if (!this.isCollecting) return;

    this.isCollecting = false;
    
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
    }

    console.log('📊 Analytics service stopped collecting metrics');
  }

  private async collectPerformanceMetrics(): Promise<void> {
    try {
      const memoryUsage = process.memoryUsage();
      const cpuUsage = process.cpuUsage();
      
      const performanceMetric: PerformanceMetrics = {
        timestamp: new Date(),
        apiResponseTime: this.getAverageResponseTime(),
        blockchainResponseTime: this.getBlockchainResponseTime(),
        databaseResponseTime: this.getDatabaseResponseTime(),
        totalRequests: this.realtimeMetrics.get('api_requests') || 0,
        failedRequests: this.realtimeMetrics.get('failed_requests') || 0,
        successRate: this.calculateSuccessRate(),
        memoryUsage,
        cpuUsage: this.calculateCPUPercent(cpuUsage),
        activeConnections: this.getActiveConnections(),
        cacheHitRate: this.calculateCacheHitRate()
      };

      this.performanceHistory.push(performanceMetric);
      
      // Keep only last 24 hours of performance data
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      this.performanceHistory = this.performanceHistory.filter(
        metric => metric.timestamp > oneDayAgo
      );

      this.emit('performanceMetrics', performanceMetric);
      
      // Alert if performance is degraded
      if (performanceMetric.successRate < 0.95 || performanceMetric.apiResponseTime > 2000) {
        this.emit('performanceAlert', {
          type: 'performance_degradation',
          metrics: performanceMetric,
          timestamp: new Date()
        });
      }
    } catch (error) {
      console.error('Error collecting performance metrics:', error);
    }
  }

  // User Analytics
  public async getUserMetrics(userId: string): Promise<UserMetrics> {
    const cacheKey = `user_metrics_${userId}`;
    const cached = this.metricsCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < 300000) { // 5 minutes cache
      return cached.data;
    }

    try {
      // This would typically query the database
      const userMetrics: UserMetrics = {
        userId,
        totalRentals: 0,
        totalListings: 0,
        totalEarnings: 0,
        totalSpent: 0,
        avgRating: 0,
        successfulTransactions: 0,
        disputes: 0,
        activeRentals: 0,
        activeLendings: 0,
        joinDate: new Date(),
        lastActivity: new Date(),
        preferredCategories: [],
        reputationScore: 0
      };

      // Cache the result
      this.metricsCache.set(cacheKey, {
        data: userMetrics,
        timestamp: Date.now()
      });

      return userMetrics;
    } catch (error) {
      console.error(`Error getting user metrics for ${userId}:`, error);
      throw error;
    }
  }

  public async getUserAnalytics(userId: string, timeframe: '7d' | '30d' | '90d' = '30d'): Promise<any> {
    try {
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

      return {
        userId,
        timeframe,
        startDate,
        endDate,
        rentalActivity: await this.getUserRentalActivity(userId, startDate, endDate),
        listingActivity: await this.getUserListingActivity(userId, startDate, endDate),
        earnings: await this.getUserEarnings(userId, startDate, endDate),
        spending: await this.getUserSpending(userId, startDate, endDate),
        ratings: await this.getUserRatings(userId, startDate, endDate),
        categoryPreferences: await this.getUserCategoryPreferences(userId),
        performanceScores: await this.getUserPerformanceScores(userId)
      };
    } catch (error) {
      console.error(`Error getting user analytics for ${userId}:`, error);
      throw error;
    }
  }

  // NFT Analytics
  public async getNFTMetrics(contractAddress: string, tokenId: string): Promise<NFTMetrics> {
    const cacheKey = `nft_metrics_${contractAddress}_${tokenId}`;
    const cached = this.metricsCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < 600000) { // 10 minutes cache
      return cached.data;
    }

    try {
      const nftMetrics: NFTMetrics = {
        contractAddress,
        tokenId,
        totalRentals: 0,
        totalRevenue: 0,
        avgRentalDuration: 0,
        avgDailyPrice: 0,
        avgRating: 0,
        demandScore: 0,
        utilizationRate: 0,
        category: 'unknown',
        owner: ''
      };

      // Cache the result
      this.metricsCache.set(cacheKey, {
        data: nftMetrics,
        timestamp: Date.now()
      });

      return nftMetrics;
    } catch (error) {
      console.error(`Error getting NFT metrics for ${contractAddress}:${tokenId}:`, error);
      throw error;
    }
  }

  public async getNFTAnalytics(contractAddress: string, tokenId: string, timeframe: '7d' | '30d' | '90d' = '30d'): Promise<any> {
    try {
      return {
        contractAddress,
        tokenId,
        timeframe,
        rentalHistory: await this.getNFTRentalHistory(contractAddress, tokenId, timeframe),
        priceHistory: await this.getNFTPriceHistory(contractAddress, tokenId, timeframe),
        ratingHistory: await this.getNFTRatingHistory(contractAddress, tokenId, timeframe),
        demandAnalysis: await this.getNFTDemandAnalysis(contractAddress, tokenId),
        competitorAnalysis: await this.getNFTCompetitorAnalysis(contractAddress, tokenId),
        recommendations: await this.getNFTRecommendations(contractAddress, tokenId)
      };
    } catch (error) {
      console.error(`Error getting NFT analytics for ${contractAddress}:${tokenId}:`, error);
      throw error;
    }
  }

  // Platform Analytics
  public async getPlatformMetrics(): Promise<PlatformMetrics> {
    const cacheKey = 'platform_metrics';
    const cached = this.metricsCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < 300000) { // 5 minutes cache
      return cached.data;
    }

    try {
      const platformMetrics: PlatformMetrics = {
        totalUsers: 0,
        activeUsers: 0,
        totalNFTs: 0,
        totalRentals: 0,
        totalVolume: 0,
        platformFees: 0,
        avgTransactionValue: 0,
        growthRate: 0,
        retentionRate: 0,
        churnRate: 0,
        topCategories: [],
        topCollections: []
      };

      // Cache the result
      this.metricsCache.set(cacheKey, {
        data: platformMetrics,
        timestamp: Date.now()
      });

      return platformMetrics;
    } catch (error) {
      console.error('Error getting platform metrics:', error);
      throw error;
    }
  }

  public async getPlatformAnalytics(timeframe: '1d' | '7d' | '30d' | '90d' = '30d'): Promise<any> {
    try {
      return {
        timeframe,
        timestamp: new Date(),
        userGrowth: await this.getUserGrowthAnalytics(timeframe),
        volumeAnalytics: await this.getVolumeAnalytics(timeframe),
        categoryAnalytics: await this.getCategoryAnalytics(timeframe),
        collectionAnalytics: await this.getCollectionAnalytics(timeframe),
        geographicAnalytics: await this.getGeographicAnalytics(timeframe),
        deviceAnalytics: await this.getDeviceAnalytics(timeframe),
        conversionAnalytics: await this.getConversionAnalytics(timeframe)
      };
    } catch (error) {
      console.error('Error getting platform analytics:', error);
      throw error;
    }
  }

  // Market Analytics
  public async getMarketMetrics(chainId?: number): Promise<MarketMetrics[]> {
    try {
      const supportedChains = chainId ? [chainId] : [1, 137, 42161, 10, 8453];
      const marketMetrics: MarketMetrics[] = [];

      for (const chain of supportedChains) {
        const metrics = await this.getChainMetrics(chain);
        marketMetrics.push(metrics);
      }

      return marketMetrics;
    } catch (error) {
      console.error('Error getting market metrics:', error);
      throw error;
    }
  }

  private async getChainMetrics(chainId: number): Promise<MarketMetrics> {
    // This would typically query blockchain data and database
    const chainNames: { [key: number]: string } = {
      1: 'Ethereum',
      137: 'Polygon',
      42161: 'Arbitrum',
      10: 'Optimism',
      8453: 'Base'
    };

    return {
      chainId,
      chainName: chainNames[chainId] || 'Unknown',
      totalVolume24h: 0,
      totalVolume7d: 0,
      totalVolume30d: 0,
      transactionCount24h: 0,
      transactionCount7d: 0,
      transactionCount30d: 0,
      avgGasPrice: 0,
      avgTransactionValue: 0,
      topNFTs: [],
      activeUsers24h: 0,
      newUsers24h: 0
    };
  }

  // Revenue Analytics
  public async getRevenueMetrics(period: 'daily' | 'weekly' | 'monthly' | 'yearly', startDate?: Date, endDate?: Date): Promise<RevenueMetrics> {
    const end = endDate || new Date();
    const start = startDate || this.getStartDateForPeriod(period, end);

    try {
      return {
        period,
        startDate: start,
        endDate: end,
        totalRevenue: 0,
        platformFees: 0,
        rentalRevenue: 0,
        lendingRevenue: 0,
        flashLoanRevenue: 0,
        oracleRevenue: 0,
        transactionCount: 0,
        avgRevenuePerUser: 0,
        avgRevenuePerTransaction: 0
      };
    } catch (error) {
      console.error('Error getting revenue metrics:', error);
      throw error;
    }
  }

  // Real-time Metrics
  public incrementMetric(metricName: string, value: number = 1): void {
    const currentValue = this.realtimeMetrics.get(metricName) || 0;
    this.realtimeMetrics.set(metricName, currentValue + value);
  }

  public setMetric(metricName: string, value: number): void {
    this.realtimeMetrics.set(metricName, value);
  }

  public getRealtimeMetrics(): { [key: string]: number } {
    return Object.fromEntries(this.realtimeMetrics.entries());
  }

  // Performance Metrics
  public getPerformanceHistory(hours: number = 24): PerformanceMetrics[] {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.performanceHistory.filter(metric => metric.timestamp > cutoff);
  }

  public getCurrentPerformance(): PerformanceMetrics | null {
    return this.performanceHistory.length > 0 
      ? this.performanceHistory[this.performanceHistory.length - 1] 
      : null;
  }

  // Event tracking
  public trackEvent(eventName: string, userId?: string, properties?: any): void {
    const event = {
      eventName,
      userId,
      properties,
      timestamp: new Date()
    };

    this.emit('event', event);
    this.incrementMetric(`event_${eventName}`);

    // Store event for batch processing
    // This would typically be sent to analytics platforms like Mixpanel, Amplitude, etc.
  }

  public trackUserAction(action: string, userId: string, metadata?: any): void {
    this.trackEvent('user_action', userId, { action, ...metadata });
  }

  public trackTransactionEvent(type: 'rental' | 'lending' | 'flashloan', txHash: string, value: number, userId?: string): void {
    this.trackEvent('transaction', userId, { type, txHash, value });
    this.incrementMetric(`${type}_transactions`);
    this.incrementMetric('total_volume_24h', value);
  }

  // Utility methods
  private getStartDateForPeriod(period: string, endDate: Date): Date {
    const start = new Date(endDate);
    
    switch (period) {
      case 'daily':
        start.setHours(0, 0, 0, 0);
        break;
      case 'weekly':
        start.setDate(start.getDate() - 7);
        break;
      case 'monthly':
        start.setMonth(start.getMonth() - 1);
        break;
      case 'yearly':
        start.setFullYear(start.getFullYear() - 1);
        break;
    }
    
    return start;
  }

  private getAverageResponseTime(): number {
    // Calculate average API response time from recent requests
    return 250; // Placeholder
  }

  private getBlockchainResponseTime(): number {
    // Calculate average blockchain response time
    return 800; // Placeholder
  }

  private getDatabaseResponseTime(): number {
    // Calculate average database response time
    return 150; // Placeholder
  }

  private calculateSuccessRate(): number {
    const total = this.realtimeMetrics.get('api_requests') || 0;
    const failed = this.realtimeMetrics.get('failed_requests') || 0;
    return total > 0 ? (total - failed) / total : 1;
  }

  private calculateCPUPercent(cpuUsage: NodeJS.CpuUsage): number {
    // Calculate CPU usage percentage
    return (cpuUsage.user + cpuUsage.system) / 1000000; // Convert microseconds to percentage
  }

  private getActiveConnections(): number {
    // Get current active connections
    return 0; // Placeholder
  }

  private calculateCacheHitRate(): number {
    // Calculate cache hit rate
    return 0.85; // Placeholder
  }

  // Placeholder methods for complex analytics (would implement database queries)
  private async getUserRentalActivity(userId: string, startDate: Date, endDate: Date): Promise<any> {
    return { totalRentals: 0, avgDuration: 0, categories: [] };
  }

  private async getUserListingActivity(userId: string, startDate: Date, endDate: Date): Promise<any> {
    return { totalListings: 0, activeListings: 0, avgPrice: 0 };
  }

  private async getUserEarnings(userId: string, startDate: Date, endDate: Date): Promise<any> {
    return { totalEarnings: 0, rentalEarnings: 0, lendingEarnings: 0 };
  }

  private async getUserSpending(userId: string, startDate: Date, endDate: Date): Promise<any> {
    return { totalSpent: 0, rentalSpent: 0, borrowingCosts: 0 };
  }

  private async getUserRatings(userId: string, startDate: Date, endDate: Date): Promise<any> {
    return { avgRating: 0, totalRatings: 0, ratingDistribution: {} };
  }

  private async getUserCategoryPreferences(userId: string): Promise<any> {
    return { preferredCategories: [], categorySpending: {} };
  }

  private async getUserPerformanceScores(userId: string): Promise<any> {
    return { reputationScore: 0, trustScore: 0, activityScore: 0 };
  }

  private async getNFTRentalHistory(contractAddress: string, tokenId: string, timeframe: string): Promise<any> {
    return { totalRentals: 0, rentalDates: [], prices: [] };
  }

  private async getNFTPriceHistory(contractAddress: string, tokenId: string, timeframe: string): Promise<any> {
    return { priceChanges: [], avgPrice: 0, priceVolatility: 0 };
  }

  private async getNFTRatingHistory(contractAddress: string, tokenId: string, timeframe: string): Promise<any> {
    return { avgRating: 0, ratingTrend: 'stable', totalRatings: 0 };
  }

  private async getNFTDemandAnalysis(contractAddress: string, tokenId: string): Promise<any> {
    return { demandScore: 0, demandTrend: 'stable', demandFactors: [] };
  }

  private async getNFTCompetitorAnalysis(contractAddress: string, tokenId: string): Promise<any> {
    return { competitors: [], marketPosition: 'unknown' };
  }

  private async getNFTRecommendations(contractAddress: string, tokenId: string): Promise<any> {
    return { priceOptimization: [], marketingTips: [], timingAdvice: [] };
  }

  private async getUserGrowthAnalytics(timeframe: string): Promise<any> {
    return { newUsers: 0, growthRate: 0, retentionRate: 0 };
  }

  private async getVolumeAnalytics(timeframe: string): Promise<any> {
    return { totalVolume: 0, volumeGrowth: 0, avgTransactionSize: 0 };
  }

  private async getCategoryAnalytics(timeframe: string): Promise<any> {
    return { topCategories: [], categoryGrowth: {} };
  }

  private async getCollectionAnalytics(timeframe: string): Promise<any> {
    return { topCollections: [], collectionGrowth: {} };
  }

  private async getGeographicAnalytics(timeframe: string): Promise<any> {
    return { topCountries: [], regionGrowth: {} };
  }

  private async getDeviceAnalytics(timeframe: string): Promise<any> {
    return { deviceTypes: [], browserTypes: [] };
  }

  private async getConversionAnalytics(timeframe: string): Promise<any> {
    return { conversionRate: 0, funnelAnalysis: {} };
  }

  // Cache management
  public clearCache(): void {
    this.metricsCache.clear();
  }

  public getCacheStats(): any {
    return {
      size: this.metricsCache.size,
      keys: Array.from(this.metricsCache.keys())
    };
  }
}