import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  _id: string;
  walletAddress: string;
  email?: string;
  username?: string;
  bio?: string;
  avatar?: string;
  profileCompleted?: boolean;
  isVerified?: boolean;
  loginCount?: number;
  lastLogin?: Date;
  tempAuth?: {
    nonce: string;
    expiresAt: Date;
    attempts: number;
  };
  refreshTokens?: Array<{
    token: string;
    createdAt: Date;
    expiresAt: Date;
    deviceInfo: string;
  }>;
  profile: {
    displayName?: string;
    bio?: string;
    avatar?: string;
    website?: string;
    twitter?: string;
    discord?: string;
  };
  reputation: {
    score: number;
    level: string;
    totalRentals: number;
    successfulRentals: number;
    totalListings: number;
    activeListings: number;
    totalEarnings: number;
    totalSpent: number;
    disputes: number;
    averageRating: number;
    totalRatings: number;
    badges: string[];
  };
  preferences: {
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
      categories: {
        rental: boolean;
        lending: boolean;
        payments: boolean;
        disputes: boolean;
        marketing: boolean;
        system: boolean;
      };
    };
    privacy: {
      showRealName: boolean;
      showEmail: boolean;
      showStats: boolean;
    };
  };
  verification: {
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
    isKYCVerified: boolean;
    kycLevel: 'none' | 'basic' | 'advanced';
  };
  security: {
    twoFactorEnabled: boolean;
    loginAttempts: number;
    lockoutUntil?: Date;
    lastLogin: Date;
    lastLoginIP: string;
  };
  role: 'user' | 'moderator' | 'admin';
  status: 'active' | 'suspended' | 'banned';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  walletAddress: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: /^0x[a-fA-F0-9]{40}$/
  },
  email: {
    type: String,
    sparse: true,
    lowercase: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  username: {
    type: String,
    sparse: true,
    minlength: 3,
    maxlength: 30,
    match: /^[a-zA-Z0-9_-]+$/
  },
  bio: { type: String, maxlength: 500 },
  avatar: String,
  profileCompleted: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
  loginCount: { type: Number, default: 0 },
  lastLogin: Date,
  tempAuth: {
    nonce: String,
    expiresAt: Date,
    attempts: { type: Number, default: 0 }
  },
  refreshTokens: [{
    token: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
    deviceInfo: String
  }],
  profile: {
    displayName: { type: String, maxlength: 50 },
    bio: { type: String, maxlength: 500 },
    avatar: String,
    website: String,
    twitter: String,
    discord: String
  },
  reputation: {
    score: { type: Number, default: 0, min: 0 },
    level: { type: String, default: 'Newcomer' },
    totalRentals: { type: Number, default: 0, min: 0 },
    successfulRentals: { type: Number, default: 0, min: 0 },
    totalListings: { type: Number, default: 0, min: 0 },
    activeListings: { type: Number, default: 0, min: 0 },
    totalEarnings: { type: Number, default: 0, min: 0 },
    totalSpent: { type: Number, default: 0, min: 0 },
    disputes: { type: Number, default: 0, min: 0 },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalRatings: { type: Number, default: 0, min: 0 },
    badges: [{ type: String }]
  },
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      categories: {
        rental: { type: Boolean, default: true },
        lending: { type: Boolean, default: true },
        payments: { type: Boolean, default: true },
        disputes: { type: Boolean, default: true },
        marketing: { type: Boolean, default: false },
        system: { type: Boolean, default: true }
      }
    },
    privacy: {
      showRealName: { type: Boolean, default: false },
      showEmail: { type: Boolean, default: false },
      showStats: { type: Boolean, default: true }
    }
  },
  verification: {
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    isKYCVerified: { type: Boolean, default: false },
    kycLevel: { type: String, enum: ['none', 'basic', 'advanced'], default: 'none' }
  },
  security: {
    twoFactorEnabled: { type: Boolean, default: false },
    loginAttempts: { type: Number, default: 0 },
    lockoutUntil: Date,
    lastLogin: { type: Date, default: Date.now },
    lastLoginIP: String
  },
  role: { type: String, enum: ['user', 'moderator', 'admin'], default: 'user' },
  status: { type: String, enum: ['active', 'suspended', 'banned'], default: 'active' }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
UserSchema.index({ walletAddress: 1 });
UserSchema.index({ email: 1 }, { sparse: true });
UserSchema.index({ username: 1 }, { sparse: true });
UserSchema.index({ 'reputation.score': -1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ status: 1, role: 1 });

// Virtual for reputation level calculation
UserSchema.virtual('reputation.calculatedLevel').get(function() {
  const score = this.reputation.score;
  if (score >= 10000) return 'Legendary';
  if (score >= 5000) return 'Master';
  if (score >= 2500) return 'Expert';
  if (score >= 1000) return 'Professional';
  if (score >= 500) return 'Intermediate';
  if (score >= 100) return 'Novice';
  return 'Newcomer';
});

// Methods
UserSchema.methods.updateReputation = function(data: {
  rentalsCompleted?: number;
  earningsAdded?: number;
  spentAdded?: number;
  rating?: number;
  dispute?: boolean;
}) {
  if (data.rentalsCompleted) {
    this.reputation.totalRentals += data.rentalsCompleted;
    this.reputation.successfulRentals += data.rentalsCompleted;
    this.reputation.score += data.rentalsCompleted * 10;
  }
  
  if (data.earningsAdded) {
    this.reputation.totalEarnings += data.earningsAdded;
    this.reputation.score += Math.floor(data.earningsAdded * 100);
  }
  
  if (data.spentAdded) {
    this.reputation.totalSpent += data.spentAdded;
    this.reputation.score += Math.floor(data.spentAdded * 50);
  }
  
  if (data.rating) {
    const newTotal = (this.reputation.averageRating * this.reputation.totalRatings) + data.rating;
    this.reputation.totalRatings += 1;
    this.reputation.averageRating = newTotal / this.reputation.totalRatings;
    this.reputation.score += data.rating * 5;
  }
  
  if (data.dispute) {
    this.reputation.disputes += 1;
    this.reputation.score = Math.max(0, this.reputation.score - 50);
  }
  
  this.reputation.level = this.reputation.calculatedLevel;
};

UserSchema.methods.isLocked = function() {
  return !!(this.security.lockoutUntil && this.security.lockoutUntil > Date.now());
};

UserSchema.methods.incLoginAttempts = function() {
  if (this.security.lockoutUntil && this.security.lockoutUntil < Date.now()) {
    return this.updateOne({
      $unset: { 'security.lockoutUntil': 1, 'security.loginAttempts': 1 }
    });
  }
  
  const updates: any = { $inc: { 'security.loginAttempts': 1 } };
  if (this.security.loginAttempts + 1 >= 5 && !this.isLocked()) {
    updates.$set = { 'security.lockoutUntil': Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }
  
  return this.updateOne(updates);
};

export const User = mongoose.model<IUser>('User', UserSchema);