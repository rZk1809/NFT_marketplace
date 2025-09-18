import React, { useState } from 'react';
import {
  Search, Filter, Grid, List, TrendingUp, Star,
  ArrowRight, Eye, Heart, ShoppingCart, Clock
} from 'lucide-react';
import AdvancedSearch from '../components/marketplace/AdvancedSearch';
import NotificationCenter from '../components/common/NotificationCenter';
import { useAuth } from '../hooks/useAuth';
import './MarketplacePage.css';

const MarketplacePage = () => {
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [activeTab, setActiveTab] = useState('explore');
  const { user } = useAuth();

  // Mock NFT data - would come from your NFT service
  const featuredNFTs = [
    {
      id: 'nft-1',
      name: 'Cosmic Voyager #1234',
      image: 'https://via.placeholder.com/400x400?text=Cosmic+Voyager',
      collection: 'Cosmic Voyagers',
      price: { value: 2.5, currency: 'ETH' },
      lastSale: { value: 1.8, currency: 'ETH' },
      owner: {
        address: '0x1234...5678',
        name: 'CryptoCollector',
        verified: true
      },
      likes: 245,
      views: 1234,
      rarity: 'Legendary',
      blockchain: 'ethereum',
      listed: true,
      auction: false
    },
    {
      id: 'nft-2',
      name: 'Digital Dreams #0789',
      image: 'https://via.placeholder.com/400x400?text=Digital+Dreams',
      collection: 'Digital Dreams',
      price: { value: 0.8, currency: 'ETH' },
      lastSale: { value: 0.5, currency: 'ETH' },
      owner: {
        address: '0x8765...4321',
        name: 'ArtLover',
        verified: false
      },
      likes: 89,
      views: 567,
      rarity: 'Rare',
      blockchain: 'polygon',
      listed: false,
      auction: true,
      auctionEndTime: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'nft-3',
      name: 'Pixel Warriors #0456',
      image: 'https://via.placeholder.com/400x400?text=Pixel+Warriors',
      collection: 'Pixel Warriors',
      price: { value: 1.2, currency: 'ETH' },
      lastSale: { value: 0.9, currency: 'ETH' },
      owner: {
        address: '0x2468...1357',
        name: 'PixelMaster',
        verified: true
      },
      likes: 156,
      views: 890,
      rarity: 'Epic',
      blockchain: 'ethereum',
      listed: true,
      auction: false
    }
  ];

  const handleSearchResults = (results) => {
    console.log('Search results:', results);
    // Handle search results - would update NFT display
  };

  const handleNFTSelect = (nft) => {
    setSelectedNFT(nft);
    // Navigate to NFT detail page or open modal
    console.log('Selected NFT:', nft);
  };

  const formatTimeRemaining = (endTime) => {
    if (!endTime) return '';
    
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
  };

  const renderNFTCard = (nft) => (
    <div 
      key={nft.id} 
      className="nft-card"
      onClick={() => handleNFTSelect(nft)}
    >
      <div className="nft-card-header">
        <img 
          src={nft.image} 
          alt={nft.name}
          className="nft-image"
          loading="lazy"
        />
        <div className="nft-overlay">
          <div className="nft-stats">
            <span className="nft-stat">
              <Eye size={14} />
              {nft.views}
            </span>
            <span className="nft-stat">
              <Heart size={14} />
              {nft.likes}
            </span>
          </div>
          {nft.auction && (
            <div className="auction-timer">
              <span className="timer-label">Ends in</span>
              <span className="timer-value">
                {formatTimeRemaining(nft.auctionEndTime)}
              </span>
            </div>
          )}
        </div>
        {nft.rarity && (
          <div className={`rarity-badge ${nft.rarity.toLowerCase()}`}>
            {nft.rarity}
          </div>
        )}
      </div>

      <div className="nft-card-content">
        <div className="nft-collection">
          {nft.collection}
        </div>
        <h3 className="nft-name">{nft.name}</h3>
        
        <div className="nft-owner">
          <span className="owner-label">by</span>
          <span className="owner-name">
            {nft.owner?.name || 'Unknown'}
            {nft.owner?.verified && <Star size={12} />}
          </span>
        </div>

        <div className="nft-pricing">
          <div className="current-price">
            <span className="price-label">
              {nft.auction ? 'Current Bid' : 'Price'}
            </span>
            <span className="price-value">
              {nft.price.value} {nft.price.currency}
            </span>
          </div>
          {nft.lastSale && (
            <div className="last-sale">
              <span className="sale-label">Last Sale</span>
              <span className="sale-value">
                {nft.lastSale.value} {nft.lastSale.currency}
              </span>
            </div>
          )}
        </div>

        <div className="nft-actions">
          {nft.listed && !nft.auction && (
            <button className="buy-now-btn">
              <ShoppingCart size={16} />
              Buy Now
            </button>
          )}
          {nft.auction && (
            <button className="bid-btn">
              Place Bid
            </button>
          )}
          {!nft.listed && !nft.auction && (
            <button className="make-offer-btn">
              Make Offer
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="marketplace-page">
      {/* Header */}
      <header className="marketplace-header">
        <div className="header-container">
          <div className="header-content">
            <div className="brand">
              <h1>Lendify Marketplace</h1>
              <p>Discover, collect, and trade unique NFTs</p>
            </div>
            
            <div className="header-actions">
              {user && <NotificationCenter />}
              {user ? (
                <div className="user-info">
                  <span>Welcome, {user.name || 'User'}</span>
                </div>
              ) : (
                <button className="connect-wallet-btn">
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="marketplace-main">
        {/* Advanced Search */}
        <section className="search-section">
          <div className="container">
            <AdvancedSearch 
              onSearchResults={handleSearchResults}
              placeholder="Search NFTs, collections, and creators..."
            />
          </div>
        </section>

        {/* Navigation Tabs */}
        <section className="navigation-section">
          <div className="container">
            <nav className="marketplace-nav">
              <div className="nav-tabs">
                {[
                  { id: 'explore', label: 'Explore', icon: Search },
                  { id: 'trending', label: 'Trending', icon: TrendingUp },
                  { id: 'collections', label: 'Collections', icon: Grid },
                  { id: 'auctions', label: 'Live Auctions', icon: Clock }
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

              <div className="view-controls">
                <button
                  className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  title="Grid View"
                >
                  <Grid size={18} />
                </button>
                <button
                  className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                  title="List View"
                >
                  <List size={18} />
                </button>
              </div>
            </nav>
          </div>
        </section>

        {/* Featured NFTs */}
        <section className="featured-section">
          <div className="container">
            <div className="section-header">
              <h2>Featured NFTs</h2>
              <button className="view-all-btn">
                View All <ArrowRight size={16} />
              </button>
            </div>

            <div className={`nfts-${viewMode}`}>
              {featuredNFTs.map(renderNFTCard)}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="stats-section">
          <div className="container">
            <div className="stats-grid">
              <div className="stat-card">
                <h3>24h Volume</h3>
                <p className="stat-value">1,234.56 ETH</p>
                <span className="stat-change positive">+12.5%</span>
              </div>
              <div className="stat-card">
                <h3>Total Sales</h3>
                <p className="stat-value">98,765</p>
                <span className="stat-change positive">+5.2%</span>
              </div>
              <div className="stat-card">
                <h3>Active Users</h3>
                <p className="stat-value">15,432</p>
                <span className="stat-change positive">+8.9%</span>
              </div>
              <div className="stat-card">
                <h3>Collections</h3>
                <p className="stat-value">2,847</p>
                <span className="stat-change positive">+3.1%</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="marketplace-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h4>Marketplace</h4>
              <ul>
                <li><a href="/collections">Browse Collections</a></li>
                <li><a href="/auctions">Live Auctions</a></li>
                <li><a href="/create">Create NFT</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Community</h4>
              <ul>
                <li><a href="/discord">Discord</a></li>
                <li><a href="/twitter">Twitter</a></li>
                <li><a href="/blog">Blog</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Support</h4>
              <ul>
                <li><a href="/help">Help Center</a></li>
                <li><a href="/contact">Contact</a></li>
                <li><a href="/terms">Terms</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MarketplacePage;