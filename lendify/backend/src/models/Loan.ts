import mongoose, { Document, Schema } from 'mongoose';

export interface ILoan extends Document {
  _id: string;
  borrower: string;
  lender?: string;
  nft: {
    contractAddress: string;
    tokenId: string;
    chainId: number;
    nftId?: Schema.Types.ObjectId;
    estimatedValue: number;
    oraclePrice?: number;
  };
  loan: {
    principal: number;
    currency: string;
    interestRate: number; // Annual percentage rate
    duration: number; // in days
    ltv: number; // Loan-to-value ratio
    startDate?: Date;
    dueDate?: Date;
    actualDueDate?: Date; // After extensions
  };
  repayment: {
    totalAmount: number; // Principal + interest
    amountPaid: number;
    remainingAmount: number;
    payments: Array<{
      amount: number;
      timestamp: Date;
      txHash: string;
      type: 'partial' | 'full' | 'interest_only';
    }>;
    gracePeriod: number; // days after due date
    lateFee: number;
  };
  collateral: {
    isEscrowed: boolean;
    escrowContract?: string;
    escrowTxHash?: string;
    releaseCondition: 'repayment' | 'liquidation';
    liquidationThreshold: number; // Percentage drop in NFT value
    currentValue?: number;
    lastValuation?: Date;
  };
  blockchain: {
    loanContract: string;
    loanId?: number;
    requestTxHash?: string;
    fundingTxHash?: string;
    repaymentTxHash?: string;
    liquidationTxHash?: string;
    blockNumber?: number;
  };
  status: 'requested' | 'funded' | 'active' | 'repaid' | 'defaulted' | 'liquidated' | 'cancelled';
  timeline: Array<{
    status: string;
    timestamp: Date;
    txHash?: string;
    amount?: number;
    notes?: string;
  }>;
  terms: {
    autoLiquidation: boolean;
    partialRepayment: boolean;
    earlyRepayment: boolean;
    extensionAllowed: boolean;
    maxExtensions: number;
    extensionFee: number;
    penaltyRate: number; // Additional interest for late payment
  };
  extensions: Array<{
    originalDueDate: Date;
    newDueDate: Date;
    additionalDays: number;
    extensionFee: number;
    additionalInterest: number;
    timestamp: Date;
    txHash?: string;
    reason?: string;
  }>;
  risk: {
    creditScore?: number;
    riskLevel: 'low' | 'medium' | 'high';
    riskFactors: string[];
    volatilityScore: number;
    liquidityScore: number;
  };
  dispute?: {
    isDisputed: boolean;
    reason: string;
    initiator: 'borrower' | 'lender';
    description: string;
    evidence: Array<{
      type: 'text' | 'image' | 'document';
      content: string;
      uploadedBy: 'borrower' | 'lender';
      timestamp: Date;
    }>;
    resolution?: {
      decision: 'favor_borrower' | 'favor_lender' | 'partial_relief' | 'no_fault';
      reasoning: string;
      adjustedAmount?: number;
      newTerms?: any;
      resolvedBy: string;
      resolvedAt: Date;
    };
  };
  analytics: {
    inquiries: number;
    views: number;
    competingOffers: number;
  };
  metadata: {
    purpose?: string;
    notes?: string;
    visibility: 'public' | 'private';
  };
  createdAt: Date;
  updatedAt: Date;

  // Virtual properties
  isActive: boolean;
  isOverdue: boolean;
  daysRemaining: number;
  currentLTV: number;
}

const LoanSchema = new Schema<ILoan>({
  borrower: {
    type: String,
    required: true,
    lowercase: true,
    match: /^0x[a-fA-F0-9]{40}$/
  },
  lender: {
    type: String,
    lowercase: true,
    match: /^0x[a-fA-F0-9]{40}$/
  },
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
    nftId: { type: Schema.Types.ObjectId, ref: 'NFT' },
    estimatedValue: { type: Number, required: true, min: 0 },
    oraclePrice: { type: Number, min: 0 }
  },
  loan: {
    principal: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, default: 'ETH' },
    interestRate: { type: Number, required: true, min: 0, max: 100 },
    duration: { type: Number, required: true, min: 1, max: 365 },
    ltv: { type: Number, required: true, min: 0, max: 100 },
    startDate: Date,
    dueDate: Date,
    actualDueDate: Date
  },
  repayment: {
    totalAmount: { type: Number, required: true, min: 0 },
    amountPaid: { type: Number, default: 0, min: 0 },
    remainingAmount: { type: Number, required: true, min: 0 },
    payments: [{
      amount: { type: Number, required: true, min: 0 },
      timestamp: { type: Date, required: true },
      txHash: { type: String, required: true },
      type: { type: String, enum: ['partial', 'full', 'interest_only'], required: true }
    }],
    gracePeriod: { type: Number, default: 7, min: 0 },
    lateFee: { type: Number, default: 0, min: 0 }
  },
  collateral: {
    isEscrowed: { type: Boolean, default: false },
    escrowContract: String,
    escrowTxHash: String,
    releaseCondition: { type: String, enum: ['repayment', 'liquidation'], default: 'repayment' },
    liquidationThreshold: { type: Number, required: true, min: 0, max: 100 },
    currentValue: { type: Number, min: 0 },
    lastValuation: Date
  },
  blockchain: {
    loanContract: {
      type: String,
      required: true,
      lowercase: true,
      match: /^0x[a-fA-F0-9]{40}$/
    },
    loanId: Number,
    requestTxHash: String,
    fundingTxHash: String,
    repaymentTxHash: String,
    liquidationTxHash: String,
    blockNumber: Number
  },
  status: {
    type: String,
    enum: ['requested', 'funded', 'active', 'repaid', 'defaulted', 'liquidated', 'cancelled'],
    default: 'requested'
  },
  timeline: [{
    status: { type: String, required: true },
    timestamp: { type: Date, required: true },
    txHash: String,
    amount: Number,
    notes: String
  }],
  terms: {
    autoLiquidation: { type: Boolean, default: true },
    partialRepayment: { type: Boolean, default: true },
    earlyRepayment: { type: Boolean, default: true },
    extensionAllowed: { type: Boolean, default: false },
    maxExtensions: { type: Number, default: 0, min: 0 },
    extensionFee: { type: Number, default: 0, min: 0 },
    penaltyRate: { type: Number, default: 0, min: 0 }
  },
  extensions: [{
    originalDueDate: { type: Date, required: true },
    newDueDate: { type: Date, required: true },
    additionalDays: { type: Number, required: true },
    extensionFee: { type: Number, required: true },
    additionalInterest: { type: Number, required: true },
    timestamp: { type: Date, required: true },
    txHash: String,
    reason: String
  }],
  risk: {
    creditScore: { type: Number, min: 0, max: 1000 },
    riskLevel: { type: String, enum: ['low', 'medium', 'high'], required: true },
    riskFactors: [String],
    volatilityScore: { type: Number, required: true, min: 0, max: 100 },
    liquidityScore: { type: Number, required: true, min: 0, max: 100 }
  },
  dispute: {
    isDisputed: { type: Boolean, default: false },
    reason: String,
    initiator: { type: String, enum: ['borrower', 'lender'] },
    description: String,
    evidence: [{
      type: { type: String, enum: ['text', 'image', 'document'], required: true },
      content: { type: String, required: true },
      uploadedBy: { type: String, enum: ['borrower', 'lender'], required: true },
      timestamp: { type: Date, required: true }
    }],
    resolution: {
      decision: {
        type: String,
        enum: ['favor_borrower', 'favor_lender', 'partial_relief', 'no_fault']
      },
      reasoning: String,
      adjustedAmount: Number,
      newTerms: Schema.Types.Mixed,
      resolvedBy: String,
      resolvedAt: Date
    }
  },
  analytics: {
    inquiries: { type: Number, default: 0, min: 0 },
    views: { type: Number, default: 0, min: 0 },
    competingOffers: { type: Number, default: 0, min: 0 }
  },
  metadata: {
    purpose: String,
    notes: String,
    visibility: { type: String, enum: ['public', 'private'], default: 'public' }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
LoanSchema.index({ borrower: 1 });
LoanSchema.index({ lender: 1 });
LoanSchema.index({ status: 1 });
LoanSchema.index({ 'nft.contractAddress': 1, 'nft.tokenId': 1, 'nft.chainId': 1 });
LoanSchema.index({ 'loan.dueDate': 1 });
LoanSchema.index({ 'loan.actualDueDate': 1 });
LoanSchema.index({ 'loan.principal': 1 });
LoanSchema.index({ 'loan.interestRate': 1 });
LoanSchema.index({ 'risk.riskLevel': 1 });
LoanSchema.index({ createdAt: -1 });

// Compound indexes
LoanSchema.index({ status: 1, 'loan.dueDate': 1 });
LoanSchema.index({ borrower: 1, status: 1 });
LoanSchema.index({ lender: 1, status: 1 });

// Virtual properties
LoanSchema.virtual('isActive').get(function() {
  return ['funded', 'active'].includes(this.status);
});

LoanSchema.virtual('isActive').get(function() {
  return this.status === 'active';
});

LoanSchema.virtual('isOverdue').get(function() {
  const dueDate = this.loan.actualDueDate || this.loan.dueDate;
  return dueDate && new Date() > dueDate && this.status === 'active';
});

LoanSchema.virtual('daysRemaining').get(function() {
  if (!this.isActive) return 0;
  const dueDate = this.loan.actualDueDate || this.loan.dueDate;
  if (!dueDate) return 0;
  
  const now = new Date();
  const diff = dueDate.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
});

LoanSchema.virtual('currentLTV').get(function() {
  const currentValue = this.collateral.currentValue || this.nft.estimatedValue;
  return (this.repayment.remainingAmount / currentValue) * 100;
});

LoanSchema.virtual('totalInterest').get(function() {
  return this.repayment.totalAmount - this.loan.principal;
});

// Methods
LoanSchema.methods.updateStatus = function(newStatus: string, txHash?: string, amount?: number, notes?: string) {
  this.status = newStatus;
  
  this.timeline.push({
    status: newStatus,
    timestamp: new Date(),
    txHash,
    amount,
    notes
  });
  
  // Set dates based on status
  switch (newStatus) {
    case 'funded':
    case 'active':
      if (!this.loan.startDate) {
        this.loan.startDate = new Date();
        this.loan.dueDate = new Date(Date.now() + (this.loan.duration * 24 * 60 * 60 * 1000));
        this.loan.actualDueDate = this.loan.dueDate;
      }
      break;
  }
  
  return this.save();
};

LoanSchema.methods.makePayment = function(amount: number, txHash: string, type: 'partial' | 'full' | 'interest_only' = 'partial') {
  this.repayment.amountPaid += amount;
  this.repayment.remainingAmount = Math.max(0, this.repayment.totalAmount - this.repayment.amountPaid);
  
  this.repayment.payments.push({
    amount,
    timestamp: new Date(),
    txHash,
    type
  });
  
  // Update status based on payment
  if (this.repayment.remainingAmount === 0) {
    this.updateStatus('repaid', txHash, amount, 'Loan fully repaid');
  } else {
    this.timeline.push({
      status: 'payment_made',
      timestamp: new Date(),
      txHash,
      amount,
      notes: `${type} payment of ${amount} ${this.loan.currency}`
    });
  }
  
  return this.save();
};

LoanSchema.methods.extendLoan = function(additionalDays: number, extensionFee: number, additionalInterest: number, txHash?: string, reason?: string) {
  if (!this.terms.extensionAllowed) {
    throw new Error('Loan extensions not allowed');
  }
  
  if (this.extensions.length >= this.terms.maxExtensions) {
    throw new Error('Maximum extensions reached');
  }
  
  const originalDueDate = new Date(this.loan.actualDueDate || this.loan.dueDate!);
  const newDueDate = new Date(originalDueDate.getTime() + (additionalDays * 24 * 60 * 60 * 1000));
  
  this.extensions.push({
    originalDueDate,
    newDueDate,
    additionalDays,
    extensionFee,
    additionalInterest,
    timestamp: new Date(),
    txHash,
    reason
  });
  
  this.loan.actualDueDate = newDueDate;
  this.repayment.totalAmount += extensionFee + additionalInterest;
  this.repayment.remainingAmount += extensionFee + additionalInterest;
  
  this.timeline.push({
    status: 'extended',
    timestamp: new Date(),
    txHash,
    notes: `Extended by ${additionalDays} days`
  });
  
  return this.save();
};

LoanSchema.methods.liquidate = function(txHash?: string, liquidationValue?: number) {
  this.status = 'liquidated';
  
  this.timeline.push({
    status: 'liquidated',
    timestamp: new Date(),
    txHash,
    amount: liquidationValue,
    notes: 'Collateral liquidated due to default or threshold breach'
  });
  
  if (txHash) {
    this.blockchain.liquidationTxHash = txHash;
  }
  
  return this.save();
};

LoanSchema.methods.updateCollateralValue = function(newValue: number, source: string = 'oracle') {
  const previousValue = this.collateral.currentValue || this.nft.estimatedValue;
  this.collateral.currentValue = newValue;
  this.collateral.lastValuation = new Date();
  
  // Check liquidation threshold
  const valueDropPercentage = ((previousValue - newValue) / previousValue) * 100;
  
  if (valueDropPercentage >= this.collateral.liquidationThreshold && this.isActive) {
    this.timeline.push({
      status: 'liquidation_threshold_reached',
      timestamp: new Date(),
      notes: `Collateral value dropped by ${valueDropPercentage.toFixed(2)}%, threshold: ${this.collateral.liquidationThreshold}%`
    });
    
    if (this.terms.autoLiquidation) {
      // Auto-liquidation would be handled by external service
      this.status = 'defaulted';
    }
  }
  
  return this.save();
};

// Calculate interest accrued
LoanSchema.methods.calculateAccruedInterest = function(asOfDate?: Date): number {
  const date = asOfDate || new Date();
  const startDate = this.loan.startDate;
  
  if (!startDate || date <= startDate) return 0;
  
  const daysElapsed = Math.floor((date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const dailyRate = this.loan.interestRate / 365 / 100;
  
  return this.loan.principal * dailyRate * daysElapsed;
};

// Static methods
LoanSchema.statics.findByNFT = function(contractAddress: string, tokenId: string, chainId: number) {
  return this.find({
    'nft.contractAddress': contractAddress,
    'nft.tokenId': tokenId,
    'nft.chainId': chainId
  });
};

LoanSchema.statics.findActiveLoans = function() {
  return this.find({
    status: { $in: ['funded', 'active'] }
  });
};

LoanSchema.statics.findOverdueLoans = function() {
  return this.find({
    status: 'active',
    $or: [
      { 'loan.dueDate': { $lt: new Date() } },
      { 'loan.actualDueDate': { $lt: new Date() } }
    ]
  });
};

LoanSchema.statics.findByUser = function(userAddress: string, role?: 'borrower' | 'lender') {
  const query: any = {};
  
  if (role === 'borrower') {
    query.borrower = userAddress;
  } else if (role === 'lender') {
    query.lender = userAddress;
  } else {
    query.$or = [{ borrower: userAddress }, { lender: userAddress }];
  }
  
  return this.find(query);
};

LoanSchema.statics.findLiquidationCandidates = function() {
  return this.find({
    status: 'active',
    'terms.autoLiquidation': true,
    $expr: {
      $gte: [
        {
          $multiply: [
            {
              $divide: [
                { $subtract: ['$nft.estimatedValue', '$collateral.currentValue'] },
                '$nft.estimatedValue'
              ]
            },
            100
          ]
        },
        '$collateral.liquidationThreshold'
      ]
    }
  });
};

// Pre-save middleware
LoanSchema.pre('save', function(next) {
  // Calculate total repayment amount if not set
  if (this.isModified('loan') && this.loan.principal && this.loan.interestRate && this.loan.duration) {
    const dailyRate = this.loan.interestRate / 365 / 100;
    const totalInterest = this.loan.principal * dailyRate * this.loan.duration;
    this.repayment.totalAmount = this.loan.principal + totalInterest;
    this.repayment.remainingAmount = this.repayment.totalAmount - this.repayment.amountPaid;
  }
  
  // Calculate LTV
  if (this.isModified('loan') || this.isModified('nft')) {
    this.loan.ltv = (this.loan.principal / this.nft.estimatedValue) * 100;
  }
  
  next();
});

export const Loan = mongoose.model<ILoan>('Loan', LoanSchema);