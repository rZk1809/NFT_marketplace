import React, { useState, useEffect } from 'react';
import { 
  Clock, TrendingUp, Star, Eye, Heart, Gavel,
  ArrowRight, Timer, DollarSign, Users, Activity
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import biddingService from '../services/biddingService';
import './AuctionsPage.css';

const AuctionsPage = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('live');
  const [sortBy, setSortBy] = useState('ending_soon');
  const { user } = useAuth();

  useEffect(() => {
    loadAuctions();
  }, [activeTab, sortBy]);

  const loadAuctions = async () => {
    try {
      setLoading(true);
      const data = await biddingService.getAuctions({
        status: activeTab,
        sortBy,
        limit: 50
      });
      setAuctions(data);
    } catch (error) {
      console.error('Failed to load auctions:', error);
      // Use mock data for development
      setAuctions(getMockAuctions());
    } finally {
      setLoading(false);
    }
  };

  const getMockAuctions = () => [
    {
      id: 'auction-1',
      nft: {
        id: 'nft-1',
        name: 'Cosmic Voyager #1234',
        image: 'https://via.placeholder.com/400x400?text=Cosmic+Voyager',
        collection: 'Cosmic Voyagers',
        rarity: 'Legendary'
      },
      currentBid: { value: 2.5, currency: 'ETH' },
      reservePrice: { value: 1.0, currency: 'ETH' },
      startingBid: { value: 0.5, currency: 'ETH' },
      endTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      bidCount: 15,
      bidders: 8,
      seller: {
        address: '0x1234...5678',
        name: 'CryptoCollector',
        verified: true
      },
      highestBidder: {
        address: '0x8765...4321',
        name: 'BidMaster'
      },
      status: 'active',
      views: 1234,
      watchers: 89
    },
    {
      id: 'auction-2',
      nft: {
        id: 'nft-2',
        name: 'Digital Dreams #0789',
        image: 'https://via.placeholder.com/400x400?text=Digital+Dreams',
        collection: 'Digital Dreams',
        rarity: 'Rare'
      },
      currentBid: { value: 0.8, currency: 'ETH' },
      reservePrice: { value: 0.5, currency: 'ETH' },
      startingBid: { value: 0.1, currency: 'ETH' },
      endTime: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
      bidCount: 7,
      bidders: 5,
      seller: {
        address: '0x2468...1357',
        name: 'ArtLover',
        verified: false
      },
      highestBidder: {
        address: '0x9876...5432',
        name: 'Collector123'
      },
      status: 'active',
      views: 567,
      watchers: 34
    }
  ];

  const formatTimeRemaining = (endTime) => {
    if (!endTime) return 'Ended';
    
    const now = new Date().getTime();
    const end = new Date(endTime).getTime();
    const remaining = end - now;

    if (remaining <= 0) return 'Ended';

    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  const handlePlaceBid = async (auctionId, bidAmount) => {
    try {
      await biddingService.placeBid(auctionId, bidAmount);
      // Refresh auctions
      loadAuctions();
    } catch (error) {
      console.error('Failed to place bid:', error);
    }
  };

  const handleWatchAuction = async (auctionId) => {
    try {
      await biddingService.watchAuction(auctionId);
      // Update local state
      setAuctions(prev => prev.map(auction => 
        auction.id === auctionId 
          ? { ...auction, isWatching: true, watchers: auction.watchers + 1 }
          : auction
      ));
    } catch (error) {
      console.error('Failed to watch auction:', error);
    }
  };

  const renderAuctionCard = (auction) => {
    const timeRemaining = formatTimeRemaining(auction.endTime);
    const isEnding = new Date(auction.endTime).getTime() - Date.now() < 60 * 60 * 1000; // Less than 1 hour

    return (
      <div 
        key={auction.id} 
        className={`auction-card ${isEnding ? 'ending-soon' : ''}`}
      >
        <div className="auction-header">
          <img 
            src={auction.nft.image} 
            alt={auction.nft.name}
            className="nft-image"
            loading="lazy"
          />
          <div className="auction-overlay">
            <div className="auction-stats">
              <span className="stat">
                <Eye size={14} />
                {auction.views}
              </span>
              <span className="stat">
                <Heart size={14} />
                {auction.watchers}
              </span>
            </div>
            <div className="auction-timer">
              <Timer size={16} />
              <span className={`timer-value ${isEnding ? 'urgent' : ''}`}>
                {timeRemaining}
              </span>
            </div>
          </div>
          {auction.nft.rarity && (
            <div className={`rarity-badge ${auction.nft.rarity.toLowerCase()}`}>
              {auction.nft.rarity}
            </div>
          )}
        </div>

        <div className="auction-content">
          <div className="nft-info">
            <div className="collection-name">{auction.nft.collection}</div>
            <h3 className="nft-name">{auction.nft.name}</h3>
          </div>

          <div className="bid-info">
            <div className="current-bid">
              <span className="bid-label">Current Bid</span>
              <span className="bid-value">
                {auction.currentBid.value} {auction.currentBid.currency}
              </span>
            </div>
            <div className="bid-details">
              <span className="bid-count">{auction.bidCount} bids</span>
              <span className="bidder-count">{auction.bidders} bidders</span>
            </div>
          </div>

          <div className="seller-info">
            <span className="seller-label">by</span>
            <span className="seller-name">
              {auction.seller.name}
              {auction.seller.verified && <Star size={12} />}
            </span>
          </div>

          <div className="auction-actions">
            <button 
              className="place-bid-btn"
              onClick={() => handlePlaceBid(auction.id, auction.currentBid.value + 0.1)}
              disabled={!user}
            >
              <Gavel size={16} />
              Place Bid
            </button>
            <button 
              className={`watch-btn ${auction.isWatching ? 'watching' : ''}`}
              onClick={() => handleWatchAuction(auction.id)}
              disabled={!user}
            >
              {auction.isWatching ? 'Watching' : 'Watch'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="auctions-page">
      {/* Header */}
      <header className="auctions-header">
        <div className="header-container">
          <div className="header-content">
            <div className="brand">
              <h1>Live Auctions</h1>
              <p>Bid on exclusive NFTs in real-time auctions</p>
            </div>
            
            <div className="header-stats">
              <div className="stat">
                <span className="stat-value">156</span>
                <span className="stat-label">Live Auctions</span>
              </div>
              <div className="stat">
                <span className="stat-value">2,847</span>
                <span className="stat-label">Total Bids</span>
              </div>
              <div className="stat">
                <span className="stat-value">456.7 ETH</span>
                <span className="stat-label">Volume (24h)</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="auctions-main">
        {/* Navigation Tabs */}
        <section className="navigation-section">
          <div className="container">
            <nav className="auctions-nav">
              <div className="nav-tabs">
                {[
                  { id: 'live', label: 'Live Auctions', icon: Clock },
                  { id: 'ending_soon', label: 'Ending Soon', icon: Timer },
                  { id: 'new', label: 'New Auctions', icon: TrendingUp },
                  { id: 'my_bids', label: 'My Bids', icon: Gavel }
                ].map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      <Icon size={18} />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              <div className="sort-controls">
                <label>Sort by:</label>
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="sort-select"
                >
                  <option value="ending_soon">Ending Soon</option>
                  <option value="highest_bid">Highest Bid</option>
                  <option value="most_bids">Most Bids</option>
                  <option value="newest">Newest</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                </select>
              </div>
            </nav>
          </div>
        </section>

        {/* Auctions Grid */}
        <section className="auctions-section">
          <div className="container">
            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading auctions...</p>
              </div>
            ) : auctions.length === 0 ? (
              <div className="empty-state">
                <Clock size={48} />
                <h3>No auctions found</h3>
                <p>Check back later for new auctions</p>
              </div>
            ) : (
              <div className="auctions-grid">
                {auctions.map(renderAuctionCard)}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default AuctionsPage;
