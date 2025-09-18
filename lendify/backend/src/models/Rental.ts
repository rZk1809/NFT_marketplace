import mongoose, { Document, Schema } from 'mongoose';

export interface IRental extends Document {
  _id: string;
  nft: {
    contractAddress: string;
    tokenId: string;
    chainId: number;
    nftId?: Schema.Types.ObjectId; // Reference to NFT model
  };
  owner: string;
  renter?: string;
  pricing: {
    pricePerDay: number;
    currency: string;
    totalPrice: number;
    collateral: number;
    platformFee: number;
    netAmount: number;
  };
  terms: {
    duration: number; // in days
    startDate?: Date;
    endDate?: Date;
    autoRenewal: boolean;
    cancellationPolicy: 'flexible' | 'moderate' | 'strict';
    termsAndConditions?: string;
  };
  blockchain: {
    listingTxHash?: string;
    rentalTxHash?: string;
    completionTxHash?: string;
    blockNumber?: number;
    contractAddress: string;
    listingId?: number;
  };
  payment: {
    method: 'crypto' | 'fiat';
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    paymentDate?: Date;
    refundDate?: Date;
    paymentTxHash?: string;
    refundTxHash?: string;
  };
  status: 'draft' | 'listed' | 'rented' | 'active' | 'completed' | 'expired' | 'cancelled' | 'disputed';
  timeline: Array<{
    status: string;
    timestamp: Date;
    txHash?: string;
    notes?: string;
  }>;
  extensions: Array<{
    originalEndDate: Date;
    newEndDate: Date;
    additionalDays: number;
    additionalCost: number;
    timestamp: Date;
    txHash?: string;
  }>;
  ratings: {
    renterRating?: {
      score: number;
      review?: string;
      timestamp: Date;
    };
    ownerRating?: {
      score: number;
      review?: string;
      timestamp: Date;
    };
  };
  dispute?: {
    isDisputed: boolean;
    reason: string;
    initiator: 'owner' | 'renter';
    description: string;
    evidence: Array<{
      type: 'text' | 'image' | 'document';
      content: string;
      uploadedBy: 'owner' | 'renter';
      timestamp: Date;
    }>;
    resolution?: {
      decision: 'favor_owner' | 'favor_renter' | 'split' | 'no_fault';
      reasoning: string;
      compensationOwner?: number;
      compensationRenter?: number;
      resolvedBy: string;
      resolvedAt: Date;
    };
  };
  metadata: {
    category?: string;
    tags: string[];
    notes?: string;
    visibility: 'public' | 'private' | 'unlisted';
  };
  analytics: {
    views: number;
    inquiries: number;
    favorited: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const RentalSchema = new Schema<IRental>({
  nft: {
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
      enum: [1, 137, 42161, 10, 8453]
    },
    nftId: { type: Schema.Types.ObjectId, ref: 'NFT' }
  },
  owner: {
    type: String,
    required: true,
    lowercase: true,
    match: /^0x[a-fA-F0-9]{40}$/
  },
  renter: {
    type: String,
    lowercase: true,
    match: /^0x[a-fA-F0-9]{40}$/
  },
  pricing: {
    pricePerDay: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, default: 'ETH' },
    totalPrice: { type: Number, required: true, min: 0 },
    collateral: { type: Number, required: true, min: 0 },
    platformFee: { type: Number, default: 0, min: 0 },
    netAmount: { type: Number, required: true, min: 0 }
  },
  terms: {
    duration: { type: Number, required: true, min: 1, max: 365 },
    startDate: Date,
    endDate: Date,
    autoRenewal: { type: Boolean, default: false },
    cancellationPolicy: {
      type: String,
      enum: ['flexible', 'moderate', 'strict'],
      default: 'moderate'
    },
    termsAndConditions: String
  },
  blockchain: {
    listingTxHash: String,
    rentalTxHash: String,
    completionTxHash: String,
    blockNumber: Number,
    contractAddress: {
      type: String,
      required: true,
      lowercase: true,
      match: /^0x[a-fA-F0-9]{40}$/
    },
    listingId: Number
  },
  payment: {
    method: { type: String, enum: ['crypto', 'fiat'], default: 'crypto' },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    paymentDate: Date,
    refundDate: Date,
    paymentTxHash: String,
    refundTxHash: String
  },
  status: {
    type: String,
    enum: ['draft', 'listed', 'rented', 'active', 'completed', 'expired', 'cancelled', 'disputed'],
    default: 'draft'
  },
  timeline: [{
    status: { type: String, required: true },
    timestamp: { type: Date, required: true },
    txHash: String,
    notes: String
  }],
  extensions: [{
    originalEndDate: { type: Date, required: true },
    newEndDate: { type: Date, required: true },
    additionalDays: { type: Number, required: true },
    additionalCost: { type: Number, required: true },
    timestamp: { type: Date, required: true },
    txHash: String
  }],
  ratings: {
    renterRating: {
      score: { type: Number, min: 1, max: 5 },
      review: { type: String, maxlength: 1000 },
      timestamp: Date
    },
    ownerRating: {
      score: { type: Number, min: 1, max: 5 },
      review: { type: String, maxlength: 1000 },
      timestamp: Date
    }
  },
  dispute: {
    isDisputed: { type: Boolean, default: false },
    reason: String,
    initiator: { type: String, enum: ['owner', 'renter'] },
    description: String,
    evidence: [{
      type: { type: String, enum: ['text', 'image', 'document'], required: true },
      content: { type: String, required: true },
      uploadedBy: { type: String, enum: ['owner', 'renter'], required: true },
      timestamp: { type: Date, required: true }
    }],
    resolution: {
      decision: {
        type: String,
        enum: ['favor_owner', 'favor_renter', 'split', 'no_fault']
      },
      reasoning: String,
      compensationOwner: Number,
      compensationRenter: Number,
      resolvedBy: String,
      resolvedAt: Date
    }
  },
  metadata: {
    category: String,
    tags: [String],
    notes: String,
    visibility: { type: String, enum: ['public', 'private', 'unlisted'], default: 'public' }
  },
  analytics: {
    views: { type: Number, default: 0, min: 0 },
    inquiries: { type: Number, default: 0, min: 0 },
    favorited: { type: Number, default: 0, min: 0 }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
RentalSchema.index({ owner: 1 });
RentalSchema.index({ renter: 1 });
RentalSchema.index({ status: 1 });
RentalSchema.index({ 'nft.contractAddress': 1, 'nft.tokenId': 1, 'nft.chainId': 1 });
RentalSchema.index({ 'terms.endDate': 1 });
RentalSchema.index({ 'pricing.pricePerDay': 1 });
RentalSchema.index({ createdAt: -1 });
RentalSchema.index({ updatedAt: -1 });

// Compound indexes
RentalSchema.index({ status: 1, 'terms.endDate': 1 });
RentalSchema.index({ owner: 1, status: 1 });
RentalSchema.index({ renter: 1, status: 1 });

// Virtual properties
RentalSchema.virtual('isActive').get(function() {
  return ['rented', 'active'].includes(this.status);
});

RentalSchema.virtual('isExpired').get(function() {
  return this.terms.endDate && new Date() > this.terms.endDate;
});

RentalSchema.virtual('daysRemaining').get(function() {
  if (!this.terms.endDate || this.status !== 'active') return 0;
  const now = new Date();
  const diff = this.terms.endDate.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
});

RentalSchema.virtual('totalDuration').get(function() {
  const baseDuration = this.terms.duration;
  const extensionDays = this.extensions.reduce((total, ext) => total + ext.additionalDays, 0);
  return baseDuration + extensionDays;
});

// Methods
RentalSchema.methods.updateStatus = function(newStatus: string, txHash?: string, notes?: string) {
  this.status = newStatus;
  
  this.timeline.push({
    status: newStatus,
    timestamp: new Date(),
    txHash,
    notes
  });
  
  // Set specific dates based on status
  switch (newStatus) {
    case 'active':
      if (!this.terms.startDate) {
        this.terms.startDate = new Date();
        this.terms.endDate = new Date(Date.now() + (this.terms.duration * 24 * 60 * 60 * 1000));
      }
      break;
    case 'completed':
    case 'expired':
    case 'cancelled':
      // These are terminal states
      break;
  }
  
  return this.save();
};

RentalSchema.methods.extendRental = function(additionalDays: number, additionalCost: number, txHash?: string) {
  if (!this.terms.endDate) {
    throw new Error('Cannot extend rental without end date');
  }
  
  const originalEndDate = new Date(this.terms.endDate);
  const newEndDate = new Date(this.terms.endDate.getTime() + (additionalDays * 24 * 60 * 60 * 1000));
  
  this.extensions.push({
    originalEndDate,
    newEndDate,
    additionalDays,
    additionalCost,
    timestamp: new Date(),
    txHash
  });
  
  this.terms.endDate = newEndDate;
  this.pricing.totalPrice += additionalCost;
  
  this.timeline.push({
    status: 'extended',
    timestamp: new Date(),
    txHash,
    notes: `Extended by ${additionalDays} days`
  });
  
  return this.save();
};

RentalSchema.methods.addRating = function(ratingData: {
  score: number;
  review?: string;
  ratedBy: 'owner' | 'renter';
}) {
  const timestamp = new Date();
  
  if (ratingData.ratedBy === 'owner') {
    // Owner rating the renter
    this.ratings.renterRating = {
      score: ratingData.score,
      review: ratingData.review,
      timestamp
    };
  } else {
    // Renter rating the owner/NFT
    this.ratings.ownerRating = {
      score: ratingData.score,
      review: ratingData.review,
      timestamp
    };
  }
  
  return this.save();
};

RentalSchema.methods.initiateDispute = function(disputeData: {
  reason: string;
  description: string;
  initiator: 'owner' | 'renter';
}) {
  this.dispute = {
    isDisputed: true,
    reason: disputeData.reason,
    initiator: disputeData.initiator,
    description: disputeData.description,
    evidence: []
  };
  
  this.status = 'disputed';
  
  this.timeline.push({
    status: 'disputed',
    timestamp: new Date(),
    notes: `Dispute initiated by ${disputeData.initiator}: ${disputeData.reason}`
  });
  
  return this.save();
};

RentalSchema.methods.addEvidence = function(evidenceData: {
  type: 'text' | 'image' | 'document';
  content: string;
  uploadedBy: 'owner' | 'renter';
}) {
  if (!this.dispute?.isDisputed) {
    throw new Error('Cannot add evidence to non-disputed rental');
  }
  
  this.dispute.evidence.push({
    ...evidenceData,
    timestamp: new Date()
  });
  
  return this.save();
};

RentalSchema.methods.resolveDispute = function(resolutionData: {
  decision: 'favor_owner' | 'favor_renter' | 'split' | 'no_fault';
  reasoning: string;
  compensationOwner?: number;
  compensationRenter?: number;
  resolvedBy: string;
}) {
  if (!this.dispute?.isDisputed) {
    throw new Error('Cannot resolve non-disputed rental');
  }
  
  this.dispute.resolution = {
    ...resolutionData,
    resolvedAt: new Date()
  };
  
  this.status = 'completed'; // Or could be 'cancelled' based on resolution
  
  this.timeline.push({
    status: 'resolved',
    timestamp: new Date(),
    notes: `Dispute resolved: ${resolutionData.decision}`
  });
  
  return this.save();
};

// Static methods
RentalSchema.statics.findByNFT = function(contractAddress: string, tokenId: string, chainId: number) {
  return this.find({
    'nft.contractAddress': contractAddress,
    'nft.tokenId': tokenId,
    'nft.chainId': chainId
  });
};

RentalSchema.statics.findActiveRentals = function() {
  return this.find({
    status: { $in: ['rented', 'active'] },
    'terms.endDate': { $gt: new Date() }
  });
};

RentalSchema.statics.findExpiredRentals = function() {
  return this.find({
    status: { $in: ['rented', 'active'] },
    'terms.endDate': { $lt: new Date() }
  });
};

RentalSchema.statics.findByUser = function(userAddress: string, role?: 'owner' | 'renter') {
  const query: any = {};
  
  if (role === 'owner') {
    query.owner = userAddress;
  } else if (role === 'renter') {
    query.renter = userAddress;
  } else {
    query.$or = [{ owner: userAddress }, { renter: userAddress }];
  }
  
  return this.find(query);
};

// Pre-save middleware
RentalSchema.pre('save', function(next) {
  // Calculate net amount if not set
  if (this.isModified('pricing') && !this.pricing.netAmount) {
    this.pricing.netAmount = this.pricing.totalPrice - this.pricing.platformFee;
  }
  
  // Validate end date
  if (this.terms.startDate && this.terms.duration && !this.terms.endDate) {
    this.terms.endDate = new Date(
      this.terms.startDate.getTime() + (this.terms.duration * 24 * 60 * 60 * 1000)
    );
  }
  
  next();
});

export const Rental = mongoose.model<IRental>('Rental', RentalSchema);