import mongoose, { Document, Schema, Model } from 'mongoose';

export interface INFT extends Document {
  _id: string;
  contractAddress: string;
  tokenId: string;
  chainId: number;
  owner: string;
  currentUser?: string; // ERC-4907 user (renter)
  metadata: {
    name?: string;
    description?: string;
    image?: string;
    animationUrl?: string;
    externalUrl?: string;
    attributes: Array<{
      traitType: string;
      value: any;
      displayType?: string;
      maxValue?: number;
    }>;
  };
  collectionInfo: {
    name?: string;
    symbol?: string;
    floorPrice?: number;
    totalSupply?: number;
    verified: boolean;
  };
  pricing: {
    lastSalePrice?: number;
    currentFloorPrice?: number;
    estimatedValue?: number;
    priceHistory: Array<{
      price: number;
      currency: string;
      timestamp: Date;
      source: 'sale' | 'listing' | 'oracle';
    }>;
  };
  rental: {
    isAvailable: boolean;
    currentListing?: Schema.Types.ObjectId;
    totalRentals: number;
    successfulRentals: number;
    totalRevenue: number;
    avgRentalDuration: number;
    avgDailyPrice: number;
    lastRentalDate?: Date;
    ratings: {
      average: number;
      count: number;
      breakdown: {
        5: number;
        4: number;
        3: number;
        2: number;
        1: number;
      };
    };
  };
  lending: {
    isCollateral: boolean;
    currentLoan?: Schema.Types.ObjectId;
    totalLoans: number;
    totalBorrowed: number;
    lastLoanDate?: Date;
  };
  collateral?: {
    isLocked: boolean;
    loanId?: Schema.Types.ObjectId;
    lockedAt?: Date;
  };
  analytics: {
    views: number;
    favorites: number;
    shares: number;
    demandScore: number;
    rarityScore: number;
    utilityScore: number;
    trendingScore: number;
    lastAnalyzed: Date;
  };
  crossChain: {
    originalChain: number;
    bridgeHistory: Array<{
      fromChain: number;
      toChain: number;
      transactionHash: string;
      bridgeProvider: string;
      timestamp: Date;
      status: 'pending' | 'completed' | 'failed';
    }>;
  };
  verification: {
    isVerified: boolean;
    verificationSource?: string;
    verifiedAt?: Date;
  };
  status: 'active' | 'hidden' | 'reported' | 'suspended';
  createdAt: Date;
  updatedAt: Date;

  // Instance methods
  updateRating(rating: number): Promise<INFT>;
  updateAnalytics(data: { views?: number; favorites?: number; shares?: number; demandScore?: number; rarityScore?: number; }): Promise<INFT>;
  recordRental(data: { duration: number; price: number; successful: boolean; }): Promise<INFT>;
  addPriceHistory(price: number, currency: string, source: 'sale' | 'listing' | 'oracle'): Promise<INFT>;
}

// Static methods interface
export interface INFTModel extends Model<INFT> {
  findByIdentifier(contractAddress: string, tokenId: string, chainId: number): Promise<INFT | null>;
  findAvailableForRent(filters?: any): Promise<INFT[]>;
  findTrending(limit?: number): Promise<INFT[]>;
}

const NFTSchema = new Schema<INFT>({
  contractAddress: {
    type: String,
    required: true,
    lowercase: true,
    match: /^0x[a-fA-F0-9]{40}$/
  },
  tokenId: {
    type: String,
    required: true
  },
  chainId: {
    type: Number,
    required: true,
    enum: [1, 137, 42161, 10, 8453] // Ethereum, Polygon, Arbitrum, Optimism, Base
  },
  owner: {
    type: String,
    required: true,
    lowercase: true,
    match: /^0x[a-fA-F0-9]{40}$/
  },
  currentUser: {
    type: String,
    lowercase: true,
    match: /^0x[a-fA-F0-9]{40}$/
  },
  metadata: {
    name: String,
    description: String,
    image: String,
    animationUrl: String,
    externalUrl: String,
    attributes: [{
      traitType: { type: String, required: true },
      value: { type: mongoose.Schema.Types.Mixed, required: true },
      displayType: String,
      maxValue: Number
    }]
  },
  collectionInfo: {
    name: String,
    symbol: String,
    floorPrice: { type: Number, min: 0 },
    totalSupply: { type: Number, min: 0 },
    verified: { type: Boolean, default: false }
  },
  pricing: {
    lastSalePrice: { type: Number, min: 0 },
    currentFloorPrice: { type: Number, min: 0 },
    estimatedValue: { type: Number, min: 0 },
    priceHistory: [{
      price: { type: Number, required: true, min: 0 },
      currency: { type: String, required: true },
      timestamp: { type: Date, required: true },
      source: { type: String, enum: ['sale', 'listing', 'oracle'], required: true }
    }]
  },
  rental: {
    isAvailable: { type: Boolean, default: false },
    currentListing: { type: Schema.Types.ObjectId, ref: 'Rental' },
    totalRentals: { type: Number, default: 0, min: 0 },
    successfulRentals: { type: Number, default: 0, min: 0 },
    totalRevenue: { type: Number, default: 0, min: 0 },
    avgRentalDuration: { type: Number, default: 0, min: 0 },
    avgDailyPrice: { type: Number, default: 0, min: 0 },
    lastRentalDate: Date,
    ratings: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0, min: 0 },
      breakdown: {
        5: { type: Number, default: 0, min: 0 },
        4: { type: Number, default: 0, min: 0 },
        3: { type: Number, default: 0, min: 0 },
        2: { type: Number, default: 0, min: 0 },
        1: { type: Number, default: 0, min: 0 }
      }
    }
  },
  lending: {
    isCollateral: { type: Boolean, default: false },
    currentLoan: { type: Schema.Types.ObjectId, ref: 'Loan' },
    totalLoans: { type: Number, default: 0, min: 0 },
    totalBorrowed: { type: Number, default: 0, min: 0 },
    lastLoanDate: Date
  },
  collateral: {
    isLocked: { type: Boolean, default: false },
    loanId: { type: Schema.Types.ObjectId, ref: 'Loan' },
    lockedAt: Date
  },
  analytics: {
    views: { type: Number, default: 0, min: 0 },
    favorites: { type: Number, default: 0, min: 0 },
    shares: { type: Number, default: 0, min: 0 },
    demandScore: { type: Number, default: 0, min: 0, max: 100 },
    rarityScore: { type: Number, default: 0, min: 0, max: 100 },
    utilityScore: { type: Number, default: 0, min: 0, max: 100 },
    trendingScore: { type: Number, default: 0, min: 0, max: 100 },
    lastAnalyzed: { type: Date, default: Date.now }
  },
  crossChain: {
    originalChain: { type: Number, required: true },
    bridgeHistory: [{
      fromChain: { type: Number, required: true },
      toChain: { type: Number, required: true },
      transactionHash: { type: String, required: true },
      bridgeProvider: { type: String, required: true },
      timestamp: { type: Date, required: true },
      status: { type: String, enum: ['pending', 'completed', 'failed'], required: true }
    }]
  },
  verification: {
    isVerified: { type: Boolean, default: false },
    verificationSource: String,
    verifiedAt: Date
  },
  status: { 
    type: String, 
    enum: ['active', 'hidden', 'reported', 'suspended'], 
    default: 'active' 
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound index for unique NFT identification
NFTSchema.index({ contractAddress: 1, tokenId: 1, chainId: 1 }, { unique: true });

// Performance indexes
NFTSchema.index({ owner: 1 });
NFTSchema.index({ currentUser: 1 });
NFTSchema.index({ 'rental.isAvailable': 1 });
NFTSchema.index({ 'lending.isCollateral': 1 });
NFTSchema.index({ 'analytics.demandScore': -1 });
NFTSchema.index({ 'analytics.trendingScore': -1 });
NFTSchema.index({ 'collection.name': 1 });
NFTSchema.index({ chainId: 1 });
NFTSchema.index({ createdAt: -1 });
NFTSchema.index({ status: 1 });

// Text search index
NFTSchema.index({ 
  'metadata.name': 'text', 
  'metadata.description': 'text', 
  'collection.name': 'text' 
});

// Virtual for full identifier
NFTSchema.virtual('identifier').get(function() {
  return `${this.contractAddress}:${this.tokenId}:${this.chainId}`;
});

// Virtual for rarity rank
NFTSchema.virtual('rarityRank').get(function() {
  // This would be calculated based on collection-wide rarity data
  return Math.floor((100 - this.analytics.rarityScore) / 10) + 1;
});

// Methods
NFTSchema.methods.updateRating = function(rating: number) {
  const ratings = this.rental.ratings;
  
  // Update breakdown
  ratings.breakdown[rating as keyof typeof ratings.breakdown] += 1;
  ratings.count += 1;
  
  // Recalculate average
  const total = (ratings.breakdown[5] * 5) + 
                (ratings.breakdown[4] * 4) + 
                (ratings.breakdown[3] * 3) + 
                (ratings.breakdown[2] * 2) + 
                (ratings.breakdown[1] * 1);
  
  ratings.average = total / ratings.count;
  
  return this.save();
};

NFTSchema.methods.updateAnalytics = function(data: {
  views?: number;
  favorites?: number;
  shares?: number;
  demandScore?: number;
  rarityScore?: number;
  utilityScore?: number;
}) {
  if (data.views) this.analytics.views += data.views;
  if (data.favorites) this.analytics.favorites += data.favorites;
  if (data.shares) this.analytics.shares += data.shares;
  
  if (data.demandScore !== undefined) this.analytics.demandScore = data.demandScore;
  if (data.rarityScore !== undefined) this.analytics.rarityScore = data.rarityScore;
  if (data.utilityScore !== undefined) this.analytics.utilityScore = data.utilityScore;
  
  // Calculate trending score based on recent activity
  const now = Date.now();
  const dayInMs = 24 * 60 * 60 * 1000;
  const recentViews = this.analytics.views; // In real implementation, this would be time-filtered
  const recentFavorites = this.analytics.favorites;
  
  this.analytics.trendingScore = Math.min(100, 
    (recentViews * 0.1) + 
    (recentFavorites * 2) + 
    (this.analytics.demandScore * 0.5)
  );
  
  this.analytics.lastAnalyzed = new Date();
  
  return this.save();
};

NFTSchema.methods.recordRental = function(data: {
  duration: number;
  price: number;
  successful: boolean;
}) {
  this.rental.totalRentals += 1;
  
  if (data.successful) {
    this.rental.successfulRentals += 1;
    this.rental.totalRevenue += data.price;
    
    // Update averages
    const totalDuration = (this.rental.avgRentalDuration * (this.rental.successfulRentals - 1)) + data.duration;
    this.rental.avgRentalDuration = totalDuration / this.rental.successfulRentals;
    
    const totalPrice = (this.rental.avgDailyPrice * (this.rental.successfulRentals - 1)) + (data.price / data.duration);
    this.rental.avgDailyPrice = totalPrice / this.rental.successfulRentals;
  }
  
  this.rental.lastRentalDate = new Date();
  
  return this.save();
};

NFTSchema.methods.addPriceHistory = function(price: number, currency: string, source: 'sale' | 'listing' | 'oracle') {
  this.pricing.priceHistory.push({
    price,
    currency,
    timestamp: new Date(),
    source
  });
  
  // Keep only last 100 price records
  if (this.pricing.priceHistory.length > 100) {
    this.pricing.priceHistory = this.pricing.priceHistory.slice(-100);
  }
  
  // Update current pricing based on source
  if (source === 'sale') {
    this.pricing.lastSalePrice = price;
  }
  
  return this.save();
};

// Static methods
NFTSchema.statics.findByIdentifier = function(contractAddress: string, tokenId: string, chainId: number) {
  return this.findOne({ contractAddress, tokenId, chainId });
};

NFTSchema.statics.findAvailableForRent = function(filters: any = {}) {
  return this.find({ 
    'rental.isAvailable': true, 
    status: 'active',
    ...filters 
  });
};

NFTSchema.statics.findTrending = function(limit: number = 20) {
  return this.find({ status: 'active' })
    .sort({ 'analytics.trendingScore': -1 })
    .limit(limit);
};

export const NFT = mongoose.model<INFT, INFTModel>('NFT', NFTSchema);