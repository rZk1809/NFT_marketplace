import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Grid, List, TrendingUp, Star, Users,
  ArrowRight, Eye, Heart, ShoppingCart, BarChart3, Activity
} from 'lucide-react';
import CollectionBrowser from '../components/marketplace/CollectionBrowser';
import { useAuth } from '../hooks/useAuth';
import collectionService from '../services/collectionService';
import './CollectionsPage.css';

const CollectionsPage = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('volume');
  const [timeframe, setTimeframe] = useState('24h');
  const { user } = useAuth();

  useEffect(() => {
    loadCollections();
  }, [sortBy, timeframe]);

  const loadCollections = async () => {
    try {
      setLoading(true);
      const data = await collectionService.getCollections({
        sortBy,
        timeframe,
        limit: 50
      });
      setCollections(data);
    } catch (error) {
      console.error('Failed to load collections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCollectionSelect = (collection) => {
    setSelectedCollection(collection);
    // Navigate to collection detail page
    window.location.href = `/collections/${collection.id}`;
  };

  const handleFollowCollection = async (collectionId) => {
    try {
      await collectionService.followCollection(collectionId);
      // Update local state
      setCollections(prev => prev.map(col => 
        col.id === collectionId 
          ? { ...col, isFollowing: true, followers: col.followers + 1 }
          : col
      ));
    } catch (error) {
      console.error('Failed to follow collection:', error);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatPrice = (price) => {
    return `${price.value} ${price.currency}`;
  };

  const renderCollectionCard = (collection) => (
    <div 
      key={collection.id} 
      className="collection-card"
      onClick={() => handleCollectionSelect(collection)}
    >
      <div className="collection-header">
        <div className="collection-banner">
          <img 
            src={collection.bannerImage || 'https://via.placeholder.com/400x200?text=Collection+Banner'} 
            alt={`${collection.name} banner`}
            className="banner-image"
            loading="lazy"
          />
        </div>
        <div className="collection-avatar">
          <img 
            src={collection.image || 'https://via.placeholder.com/80x80?text=Collection'} 
            alt={collection.name}
            className="avatar-image"
          />
          {collection.verified && (
            <div className="verified-badge">
              <Star size={16} fill="currentColor" />
            </div>
          )}
        </div>
      </div>

      <div className="collection-content">
        <h3 className="collection-name">{collection.name}</h3>
        <p className="collection-description">
          {collection.description?.substring(0, 100)}
          {collection.description?.length > 100 && '...'}
        </p>

        <div className="collection-stats">
          <div className="stat-item">
            <span className="stat-label">Floor Price</span>
            <span className="stat-value">
              {collection.floorPrice ? formatPrice(collection.floorPrice) : 'N/A'}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Volume ({timeframe})</span>
            <span className="stat-value">
              {collection.volume ? formatPrice(collection.volume) : 'N/A'}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Items</span>
            <span className="stat-value">{formatNumber(collection.totalSupply || 0)}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Owners</span>
            <span className="stat-value">{formatNumber(collection.owners || 0)}</span>
          </div>
        </div>

        <div className="collection-metrics">
          <div className="metric">
            <Eye size={14} />
            <span>{formatNumber(collection.views || 0)}</span>
          </div>
          <div className="metric">
            <Users size={14} />
            <span>{formatNumber(collection.followers || 0)}</span>
          </div>
          <div className="metric">
            <Activity size={14} />
            <span className={collection.volumeChange >= 0 ? 'positive' : 'negative'}>
              {collection.volumeChange >= 0 ? '+' : ''}{collection.volumeChange?.toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="collection-actions">
          <button 
            className={`follow-btn ${collection.isFollowing ? 'following' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              handleFollowCollection(collection.id);
            }}
          >
            {collection.isFollowing ? 'Following' : 'Follow'}
          </button>
          <button className="view-collection-btn">
            View Collection
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="collections-page">
      {/* Header */}
      <header className="collections-header">
        <div className="header-container">
          <div className="header-content">
            <div className="brand">
              <h1>NFT Collections</h1>
              <p>Discover trending and popular NFT collections</p>
            </div>
            
            <div className="header-stats">
              <div className="stat">
                <span className="stat-value">2,847</span>
                <span className="stat-label">Collections</span>
              </div>
              <div className="stat">
                <span className="stat-value">1.2M</span>
                <span className="stat-label">Total Items</span>
              </div>
              <div className="stat">
                <span className="stat-value">456K</span>
                <span className="stat-label">Owners</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="collections-main">
        {/* Collection Browser */}
        <section className="browser-section">
          <div className="container">
            <CollectionBrowser 
              onCollectionSelect={handleCollectionSelect}
              onFollowCollection={handleFollowCollection}
            />
          </div>
        </section>

        {/* Controls */}
        <section className="controls-section">
          <div className="container">
            <div className="controls-bar">
              <div className="sort-controls">
                <label>Sort by:</label>
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="sort-select"
                >
                  <option value="volume">Volume</option>
                  <option value="floorPrice">Floor Price</option>
                  <option value="totalSupply">Items</option>
                  <option value="owners">Owners</option>
                  <option value="created">Recently Created</option>
                </select>

                <label>Timeframe:</label>
                <select 
                  value={timeframe} 
                  onChange={(e) => setTimeframe(e.target.value)}
                  className="timeframe-select"
                >
                  <option value="1h">1 Hour</option>
                  <option value="24h">24 Hours</option>
                  <option value="7d">7 Days</option>
                  <option value="30d">30 Days</option>
                  <option value="all">All Time</option>
                </select>
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
            </div>
          </div>
        </section>

        {/* Collections Grid */}
        <section className="collections-section">
          <div className="container">
            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading collections...</p>
              </div>
            ) : (
              <div className={`collections-${viewMode}`}>
                {collections.map(renderCollectionCard)}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default CollectionsPage;
