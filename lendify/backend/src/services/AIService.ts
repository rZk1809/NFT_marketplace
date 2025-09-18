import axios from 'axios';
import { EventEmitter } from 'events';

export interface NFTMetadata {
  contractAddress: string;
  tokenId: string;
  name?: string;
  description?: string;
  image?: string;
  attributes?: Array<{
    trait_type: string;
    value: any;
  }>;
  collection?: string;
  rarity?: number;
  lastSalePrice?: string;
  floorPrice?: string;
}

export interface MarketData {
  volume24h: number;
  volumeChange24h: number;
  floorPrice: number;
  floorPriceChange24h: number;
  sales24h: number;
  avgSalePrice: number;
  uniqueHolders: number;
  totalSupply: number;
}

export interface RentalHistory {
  tokenId: string;
  rentalCount: number;
  avgRentalDuration: number;
  avgDailyPrice: number;
  lastRentalDate: Date;
  totalEarnings: number;
  avgRating: number;
  demandScore: number;
}

export interface PricePrediction {
  currentPrice: number;
  predictedPrice: number;
  confidence: number;
  trend: 'up' | 'down' | 'stable';
  factors: {
    demandScore: number;
    rarityScore: number;
    utilityScore: number;
    marketSentiment: number;
    seasonality: number;
  };
  timeframe: '1d' | '7d' | '30d';
  reasoning: string[];
}

export interface UserRecommendation {
  type: 'rent' | 'lend' | 'buy' | 'sell';
  nftContract: string;
  tokenId: string;
  score: number;
  reasoning: string;
  expectedReturn?: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface AIAnalysis {
  nftContract: string;
  tokenId: string;
  analysisType: 'pricing' | 'demand' | 'risk' | 'recommendation';
  result: any;
  confidence: number;
  timestamp: Date;
  factors: string[];
}

export class AIService extends EventEmitter {
  private openaiApiKey: string;
  private huggingfaceApiKey: string;
  private analysisCache: Map<string, any> = new Map();
  private isInitialized: boolean = false;

  constructor() {
    super();
    this.openaiApiKey = process.env.OPENAI_API_KEY || '';
    this.huggingfaceApiKey = process.env.HUGGINGFACE_API_KEY || '';
  }

  public async initialize(): Promise<void> {
    try {
      // Test API connections
      if (this.openaiApiKey) {
        await this.testOpenAIConnection();
      }

      if (this.huggingfaceApiKey) {
        await this.testHuggingFaceConnection();
      }

      this.isInitialized = true;
      console.log('✅ AI Service initialized successfully');
    } catch (error) {
      console.warn('⚠️ AI Service initialization failed, running with limited functionality:', error);
      this.isInitialized = false;
    }
  }

  private async testOpenAIConnection(): Promise<void> {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: 'Test connection' }],
          max_tokens: 5
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      if (response.status === 200) {
        console.log('✅ OpenAI API connection successful');
      }
    } catch (error: any) {
      if (error.response?.status === 429) {
        console.log('✅ OpenAI API connection successful (rate limited)');
      } else {
        throw new Error(`OpenAI API connection failed: ${error.message}`);
      }
    }
  }

  private async testHuggingFaceConnection(): Promise<void> {
    try {
      const response = await axios.post(
        'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium',
        { inputs: 'test' },
        {
          headers: {
            'Authorization': `Bearer ${this.huggingfaceApiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      console.log('✅ HuggingFace API connection successful');
    } catch (error: any) {
      if (error.response?.status === 503) {
        console.log('✅ HuggingFace API connection successful (model loading)');
      } else {
        throw new Error(`HuggingFace API connection failed: ${error.message}`);
      }
    }
  }

  // Dynamic Pricing Analysis
  public async analyzeDynamicPricing(
    nftContract: string,
    tokenId: string,
    metadata: NFTMetadata,
    marketData: MarketData,
    rentalHistory: RentalHistory
  ): Promise<PricePrediction> {
    const cacheKey = `pricing_${nftContract}_${tokenId}`;
    const cached = this.analysisCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < 300000) { // 5 minutes cache
      return cached.data;
    }

    try {
      // Calculate various scoring factors
      const rarityScore = this.calculateRarityScore(metadata);
      const demandScore = this.calculateDemandScore(rentalHistory, marketData);
      const utilityScore = this.calculateUtilityScore(metadata);
      const marketSentiment = this.calculateMarketSentiment(marketData);
      const seasonality = this.calculateSeasonality();

      // Base price calculation
      const basePrice = this.calculateBasePrice(marketData, rentalHistory);
      
      // AI-enhanced price prediction
      let predictedPrice = basePrice;
      let confidence = 0.5;
      let reasoning = [];

      if (this.isInitialized && this.openaiApiKey) {
        const aiAnalysis = await this.getAIPricingAnalysis({
          metadata,
          marketData,
          rentalHistory,
          rarityScore,
          demandScore,
          utilityScore
        });
        
        predictedPrice = aiAnalysis.predictedPrice;
        confidence = aiAnalysis.confidence;
        reasoning = aiAnalysis.reasoning;
      } else {
        // Fallback calculation without AI
        const multiplier = this.calculatePriceMultiplier(
          rarityScore,
          demandScore,
          utilityScore,
          marketSentiment,
          seasonality
        );
        
        predictedPrice = basePrice * multiplier;
        confidence = this.calculateConfidence(rarityScore, demandScore, utilityScore);
        reasoning = this.generateFallbackReasoning(rarityScore, demandScore, utilityScore);
      }

      const result: PricePrediction = {
        currentPrice: basePrice,
        predictedPrice,
        confidence,
        trend: predictedPrice > basePrice * 1.05 ? 'up' : predictedPrice < basePrice * 0.95 ? 'down' : 'stable',
        factors: {
          demandScore,
          rarityScore,
          utilityScore,
          marketSentiment,
          seasonality
        },
        timeframe: '7d',
        reasoning
      };

      // Cache the result
      this.analysisCache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });

      this.emit('pricePrediction', { nftContract, tokenId, prediction: result });
      
      return result;
    } catch (error) {
      console.error(`Error in dynamic pricing analysis for ${nftContract}:${tokenId}:`, error);
      throw error;
    }
  }

  private async getAIPricingAnalysis(data: any): Promise<any> {
    const prompt = `
    Analyze this NFT for rental pricing:

    Collection: ${data.metadata.collection || 'Unknown'}
    Attributes: ${JSON.stringify(data.metadata.attributes || [])}
    
    Market Data:
    - Floor Price: ${data.marketData.floorPrice} ETH
    - 24h Volume: ${data.marketData.volume24h} ETH
    - 24h Sales: ${data.marketData.sales24h}
    - Average Sale Price: ${data.marketData.avgSalePrice} ETH
    
    Rental History:
    - Total Rentals: ${data.rentalHistory.rentalCount}
    - Average Daily Price: ${data.rentalHistory.avgDailyPrice} ETH
    - Average Rating: ${data.rentalHistory.avgRating}/5
    - Demand Score: ${data.rentalHistory.demandScore}
    
    Scores:
    - Rarity Score: ${data.rarityScore}
    - Demand Score: ${data.demandScore}
    - Utility Score: ${data.utilityScore}

    Provide a rental price prediction with confidence level and reasoning. 
    Consider market trends, rarity, demand, and utility.
    
    Respond in JSON format:
    {
      "predictedPrice": number,
      "confidence": number (0-1),
      "reasoning": ["reason1", "reason2", "reason3"]
    }
    `;

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are an expert NFT analyst specializing in rental pricing. Provide accurate, data-driven pricing predictions.'
            },
            { role: 'user', content: prompt }
          ],
          max_tokens: 500,
          temperature: 0.1
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const content = response.data.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      console.error('Error getting AI pricing analysis:', error);
      throw error;
    }
  }

  // User Recommendations
  public async generateUserRecommendations(
    userAddress: string,
    userHistory: any,
    preferences: any,
    marketData: any[]
  ): Promise<UserRecommendation[]> {
    try {
      const recommendations: UserRecommendation[] = [];

      // Analyze user behavior patterns
      const behaviorPattern = this.analyzeUserBehavior(userHistory);

      // Generate recommendations based on different strategies
      const rentRecommendations = await this.generateRentRecommendations(behaviorPattern, marketData);
      const lendRecommendations = await this.generateLendRecommendations(userAddress, behaviorPattern, marketData);
      
      recommendations.push(...rentRecommendations, ...lendRecommendations);

      // Sort by score and return top recommendations
      return recommendations
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
    } catch (error) {
      console.error('Error generating user recommendations:', error);
      return [];
    }
  }

  // Market Analysis
  public async analyzeMarketTrends(
    collections: string[],
    timeframe: '1d' | '7d' | '30d' = '7d'
  ): Promise<any> {
    try {
      const trends: { [key: string]: any } = {};

      for (const collection of collections) {
        const analysis = await this.analyzeCollectionTrends(collection, timeframe);
        trends[collection] = analysis;
      }

      return {
        timeframe,
        timestamp: new Date(),
        collections: trends,
        overallSentiment: this.calculateOverallMarketSentiment(Object.values(trends))
      };
    } catch (error) {
      console.error('Error analyzing market trends:', error);
      throw error;
    }
  }

  // Risk Assessment
  public async assessRisk(
    nftContract: string,
    tokenId: string,
    transactionType: 'rent' | 'lend' | 'buy' | 'sell',
    amount: number
  ): Promise<any> {
    try {
      const riskFactors = {
        marketVolatility: await this.calculateMarketVolatility(nftContract),
        liquidityRisk: await this.calculateLiquidityRisk(nftContract),
        contractRisk: await this.assessSmartContractRisk(nftContract),
        userRisk: await this.calculateUserRisk(),
        priceRisk: await this.calculatePriceRisk(nftContract, tokenId, amount)
      };

      const overallRisk = this.calculateOverallRisk(riskFactors);
      
      return {
        overallRisk,
        riskLevel: overallRisk < 0.3 ? 'low' : overallRisk < 0.7 ? 'medium' : 'high',
        factors: riskFactors,
        recommendations: this.generateRiskRecommendations(riskFactors, transactionType),
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error in risk assessment:', error);
      throw error;
    }
  }

  // Utility methods for scoring and calculations
  private calculateRarityScore(metadata: NFTMetadata): number {
    if (!metadata.attributes || metadata.attributes.length === 0) return 0.5;
    
    // Simple rarity calculation based on attribute count and uniqueness
    const attributeCount = metadata.attributes.length;
    const uniquenessScore = attributeCount > 0 ? Math.min(attributeCount / 10, 1) : 0;
    
    return Math.min(uniquenessScore + (metadata.rarity || 0) / 100, 1);
  }

  private calculateDemandScore(rentalHistory: RentalHistory, marketData: MarketData): number {
    const rentalFrequency = rentalHistory.rentalCount > 0 ? Math.min(rentalHistory.rentalCount / 50, 1) : 0;
    const ratingScore = rentalHistory.avgRating > 0 ? rentalHistory.avgRating / 5 : 0;
    const volumeScore = marketData.sales24h > 0 ? Math.min(marketData.sales24h / 100, 1) : 0;
    
    return (rentalFrequency + ratingScore + volumeScore) / 3;
  }

  private calculateUtilityScore(metadata: NFTMetadata): number {
    // Basic utility scoring based on collection and attributes
    const gameRelatedKeywords = ['game', 'gaming', 'play', 'character', 'weapon', 'land', 'avatar'];
    const description = (metadata.description || '').toLowerCase();
    const name = (metadata.name || '').toLowerCase();
    
    let utilityScore = 0;
    
    // Check for gaming-related utility
    gameRelatedKeywords.forEach(keyword => {
      if (description.includes(keyword) || name.includes(keyword)) {
        utilityScore += 0.2;
      }
    });
    
    // Check for special attributes that indicate utility
    if (metadata.attributes) {
      const utilityAttributes = metadata.attributes.filter(attr => 
        ['power', 'level', 'rarity', 'strength', 'magic', 'ability'].some(keyword => 
          attr.trait_type.toLowerCase().includes(keyword)
        )
      );
      utilityScore += Math.min(utilityAttributes.length * 0.1, 0.5);
    }
    
    return Math.min(utilityScore, 1);
  }

  private calculateMarketSentiment(marketData: MarketData): number {
    const volumeChange = marketData.volumeChange24h || 0;
    const priceChange = marketData.floorPriceChange24h || 0;
    
    // Normalize to 0-1 scale
    const volumeSentiment = Math.max(-1, Math.min(1, volumeChange / 100));
    const priceSentiment = Math.max(-1, Math.min(1, priceChange / 100));
    
    return (volumeSentiment + priceSentiment + 2) / 4; // Convert to 0-1 scale
  }

  private calculateSeasonality(): number {
    // Simple seasonality based on current month
    const month = new Date().getMonth();
    const seasonalityFactors = [0.8, 0.7, 0.9, 1.0, 1.1, 1.0, 0.9, 0.8, 1.0, 1.1, 1.2, 1.3];
    return seasonalityFactors[month] || 1.0;
  }

  private calculateBasePrice(marketData: MarketData, rentalHistory: RentalHistory): number {
    if (rentalHistory.avgDailyPrice > 0) {
      return rentalHistory.avgDailyPrice;
    }
    
    // Fallback: estimate based on floor price
    return marketData.floorPrice * 0.01; // 1% of floor price as daily rental
  }

  private calculatePriceMultiplier(...scores: number[]): number {
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    return 0.5 + (avgScore * 1.5); // Range: 0.5x to 2x
  }

  private calculateConfidence(...scores: number[]): number {
    const variance = this.calculateVariance(scores);
    return Math.max(0.1, 1 - variance); // Higher confidence with lower variance
  }

  private calculateVariance(numbers: number[]): number {
    const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
    const variance = numbers.reduce((sum, num) => sum + Math.pow(num - mean, 2), 0) / numbers.length;
    return variance;
  }

  private generateFallbackReasoning(rarityScore: number, demandScore: number, utilityScore: number): string[] {
    const reasoning = [];
    
    if (rarityScore > 0.7) reasoning.push('High rarity score indicates premium value');
    if (demandScore > 0.7) reasoning.push('Strong rental demand based on historical data');
    if (utilityScore > 0.5) reasoning.push('Utility features may drive rental interest');
    if (rarityScore < 0.3) reasoning.push('Common attributes may limit pricing power');
    
    return reasoning;
  }

  private analyzeUserBehavior(userHistory: any): any {
    // Analyze user's past behavior to identify patterns
    return {
      preferredCategories: [],
      avgRentalDuration: 0,
      riskTolerance: 'medium',
      budget: { min: 0, max: 1 }
    };
  }

  private async generateRentRecommendations(behaviorPattern: any, marketData: any[]): Promise<UserRecommendation[]> {
    // Generate rental recommendations based on user behavior
    return [];
  }

  private async generateLendRecommendations(userAddress: string, behaviorPattern: any, marketData: any[]): Promise<UserRecommendation[]> {
    // Generate lending recommendations
    return [];
  }

  private async analyzeCollectionTrends(collection: string, timeframe: string): Promise<any> {
    // Analyze trends for a specific collection
    return {
      trend: 'stable',
      confidence: 0.5,
      factors: []
    };
  }

  private calculateOverallMarketSentiment(analyses: any[]): string {
    // Calculate overall market sentiment
    return 'neutral';
  }

  // Risk assessment methods
  private async calculateMarketVolatility(nftContract: string): Promise<number> {
    return 0.5; // Placeholder
  }

  private async calculateLiquidityRisk(nftContract: string): Promise<number> {
    return 0.3; // Placeholder
  }

  private async assessSmartContractRisk(nftContract: string): Promise<number> {
    return 0.2; // Placeholder
  }

  private async calculateUserRisk(): Promise<number> {
    return 0.1; // Placeholder
  }

  private async calculatePriceRisk(nftContract: string, tokenId: string, amount: number): Promise<number> {
    return 0.4; // Placeholder
  }

  private calculateOverallRisk(riskFactors: any): number {
    const weights = { marketVolatility: 0.3, liquidityRisk: 0.25, contractRisk: 0.2, userRisk: 0.15, priceRisk: 0.1 };
    return Object.entries(riskFactors).reduce((total, [factor, value]) => 
      total + (value as number) * weights[factor as keyof typeof weights], 0
    );
  }

  private generateRiskRecommendations(riskFactors: any, transactionType: string): string[] {
    const recommendations = [];
    
    if (riskFactors.marketVolatility > 0.7) {
      recommendations.push('Consider waiting for more stable market conditions');
    }
    
    if (riskFactors.liquidityRisk > 0.5) {
      recommendations.push('Ensure you can afford to hold the position for extended periods');
    }
    
    return recommendations;
  }

  // Cache management
  public clearCache(): void {
    this.analysisCache.clear();
  }

  public getCacheStats(): any {
    return {
      size: this.analysisCache.size,
      keys: Array.from(this.analysisCache.keys())
    };
  }
}