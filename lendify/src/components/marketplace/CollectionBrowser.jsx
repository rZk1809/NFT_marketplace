import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, Filter, Grid, List, TrendingUp, Eye, EyeOff,
  Star, Users, Activity, BarChart3, ExternalLink, 
  ChevronDown, CheckCircle, Verified
} from 'lucide-react';
import collectionService from '../../services/collectionService';
import { useAuth } from '../../hooks/useAuth';
import './CollectionBrowser.css';

const CollectionBrowser = ({ 
  onCollectionSelect,
  showHeader = true,
  compact = false,
  limit = 20
}) => {
  // State Management
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBlockchain, setSelectedBlockchain] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState('volume');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [followedCollections, setFollowedCollections] = useState(new Set());

  const { user } = useAuth();

  // Categories and Blockchains
  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'pfp', label: 'Profile Pictures' },
    { value: 'art', label: 'Art' },
    { value: 'gaming', label: 'Gaming' },
    { value: 'music', label: 'Music' },
    { value: 'sport', label: 'Sports' },
    { value: 'utility', label: 'Utility' },
    { value: 'metaverse', label: 'Metaverse' }
  ];

  const blockchains = [
    { value: '', label: 'All Blockchains' },
    { value: 'ethereum', label: 'Ethereum' },
    { value: 'polygon', label: 'Polygon' },
    { value: 'arbitrum', label: 'Arbitrum' },
    { value: 'optimism', label: 'Optimism' },
    { value: 'solana', label: 'Solana' },
    { value: 'bsc', label: 'BNB Chain' }
  ];

  const sortOptions = [
    { value: 'volume', label: 'Volume' },
    { value: 'floorPrice', label: 'Floor Price' },
    { value: 'totalSupply', label: 'Total Supply' },
    { value: 'owners', label: 'Owners' },
    { value: 'name', label: 'Name' },
    { value: 'createdAt', label: 'Created Date' }
  ];

  // Load Collections
  const loadCollections = useCallback(async (resetPage = false) => {
    try {
      setLoading(true);
      setError(null);

      const currentPage = resetPage ? 1 : page;
      const options = {
        category: selectedCategory,
        blockchain: selectedBlockchain,
        verified: verifiedOnly || null,
        sortBy,
        sortOrder,
        page: currentPage,
        limit,
        search: searchQuery.trim()
      };

      const result = await collectionService.getCollections(options);
      
      setCollections(result.collections || []);
      setTotalPages(result.pages || 1);
      
      if (resetPage) setPage(1);
    } catch (err) {
      console.error('Failed to load collections:', err);
      setError('Failed to load collections. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [
    selectedCategory, selectedBlockchain, verifiedOnly, 
    sortBy, sortOrder, page, limit, searchQuery
  ]);

  // Load Followed Collections
  const loadFollowedCollections = useCallback(async () => {
    if (!user?.address) return;
    
    try {
      const result = await collectionService.getFollowedCollections(user.address);
      const followedIds = new Set(result.collections.map(c => c.id));
      setFollowedCollections(followedIds);
    } catch (err) {
      console.error('Failed to load followed collections:', err);
    }
  }, [user?.address]);

  // Effects
  useEffect(() => {
    loadCollections(true);
  }, [selectedCategory, selectedBlockchain, verifiedOnly, sortBy, sortOrder, searchQuery]);

  useEffect(() => {
    loadFollowedCollections();
  }, [loadFollowedCollections]);

  useEffect(() => {
    loadCollections(false);
  }, [page]);

  // Event Handlers
  const handleSearch = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const handleBlockchainChange = (blockchain) => {
    setSelectedBlockchain(blockchain);
  };

  const handleSortChange = (newSortBy) => {
    if (newSortBy === sortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  const handleFollowToggle = async (collectionId) => {
    if (!user?.address) return;

    try {
      const isFollowing = followedCollections.has(collectionId);
      
      if (isFollowing) {
        await collectionService.unfollowCollection(collectionId, user.address);
        setFollowedCollections(prev => {
          const next = new Set(prev);
          next.delete(collectionId);
          return next;
        });
      } else {
        await collectionService.followCollection(collectionId, user.address);
        setFollowedCollections(prev => new Set([...prev, collectionId]));
      }
    } catch (err) {
      console.error('Failed to toggle follow:', err);
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Format Currency
  const formatCurrency = (value, currency) => {
    if (!value || !currency) return 'N/A';
    return `${value.toFixed(2)} ${currency}`;
  };

  // Format Number
  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  // Render Collection Card
  const renderCollectionCard = (collection) => (
    <div 
      key={collection.id} 
      className={`collection-card ${compact ? 'compact' : ''}`}
      onClick={() => onCollectionSelect?.(collection)}
    >
      <div className="collection-card-header">
        <img 
          src={collection.image} 
          alt={collection.name}
          className="collection-image"
          loading="lazy"
        />
        {user?.address && (
          <button
            className={`follow-btn ${followedCollections.has(collection.id) ? 'following' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              handleFollowToggle(collection.id);
            }}
            title={followedCollections.has(collection.id) ? 'Unfollow' : 'Follow'}
          >
            {followedCollections.has(collection.id) ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>

      <div className="collection-card-content">
        <div className="collection-info">
          <div className="collection-name-container">
            <h3 className="collection-name">{collection.name}</h3>
            {collection.verified && (
              <CheckCircle className="verified-icon" size={16} />
            )}
          </div>
          
          <p className="collection-description">
            {collection.description}
          </p>

          <div className="collection-creator">
            <span className="creator-label">by</span>
            <span className="creator-name">
              {collection.creator?.name || 'Unknown Creator'}
              {collection.creator?.verified && (
                <Verified className="creator-verified" size={12} />
              )}
            </span>
          </div>
        </div>

        <div className="collection-stats">
          <div className="stat-row">
            <div className="stat-item">
              <span className="stat-label">Floor</span>
              <span className="stat-value">
                {formatCurrency(collection.stats?.floorPrice?.value, collection.stats?.floorPrice?.currency)}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Volume</span>
              <span className="stat-value">
                {formatCurrency(collection.stats?.volume24h?.value, collection.stats?.volume24h?.currency)}
              </span>
            </div>
          </div>
          
          <div className="stat-row">
            <div className="stat-item">
              <span className="stat-label">Items</span>
              <span className="stat-value">
                {formatNumber(collection.stats?.totalSupply)}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Owners</span>
              <span className="stat-value">
                {formatNumber(collection.stats?.owners)}
              </span>
            </div>
          </div>
        </div>

        <div className="collection-tags">
          {collection.tags?.slice(0, 3).map((tag, index) => (
            <span key={index} className="collection-tag">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  // Render Collection List Item
  const renderCollectionListItem = (collection) => (
    <div 
      key={collection.id} 
      className="collection-list-item"
      onClick={() => onCollectionSelect?.(collection)}
    >
      <div className="collection-list-image">
        <img 
          src={collection.image} 
          alt={collection.name}
          loading="lazy"
        />
      </div>

      <div className="collection-list-info">
        <div className="collection-list-name">
          <h4>{collection.name}</h4>
          {collection.verified && (
            <CheckCircle className="verified-icon" size={16} />
          )}
        </div>
        <p className="collection-list-description">
          {collection.description}
        </p>
      </div>

      <div className="collection-list-stats">
        <div className="stat-column">
          <span className="stat-label">Floor Price</span>
          <span className="stat-value">
            {formatCurrency(collection.stats?.floorPrice?.value, collection.stats?.floorPrice?.currency)}
          </span>
        </div>
        <div className="stat-column">
          <span className="stat-label">24h Volume</span>
          <span className="stat-value">
            {formatCurrency(collection.stats?.volume24h?.value, collection.stats?.volume24h?.currency)}
          </span>
        </div>
        <div className="stat-column">
          <span className="stat-label">Total Supply</span>
          <span className="stat-value">
            {formatNumber(collection.stats?.totalSupply)}
          </span>
        </div>
      </div>

      {user?.address && (
        <button
          className={`follow-btn ${followedCollections.has(collection.id) ? 'following' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            handleFollowToggle(collection.id);
          }}
        >
          {followedCollections.has(collection.id) ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      )}
    </div>
  );

  return (
    <div className={`collection-browser ${compact ? 'compact' : ''}`}>
      {showHeader && (
        <div className="collection-browser-header">
          <div className="header-title">
            <h2>Collections</h2>
            <p>Discover and explore NFT collections</p>
          </div>

          <div className="view-toggle">
            <button
              className={viewMode === 'grid' ? 'active' : ''}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              <Grid size={18} />
            </button>
            <button
              className={viewMode === 'list' ? 'active' : ''}
              onClick={() => setViewMode('list')}
              title="List View"
            >
              <List size={18} />
            </button>
          </div>
        </div>
      )}

      <div className="collection-filters">
        <div className="search-container">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Search collections..."
            value={searchQuery}
            onChange={handleSearch}
            className="search-input"
          />
        </div>

        <div className="filter-controls">
          <select
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="filter-select"
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>

          <select
            value={selectedBlockchain}
            onChange={(e) => handleBlockchainChange(e.target.value)}
            className="filter-select"
          >
            {blockchains.map(chain => (
              <option key={chain.value} value={chain.value}>
                {chain.label}
              </option>
            ))}
          </select>

          <label className="verified-filter">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => setVerifiedOnly(e.target.checked)}
            />
            <span>Verified Only</span>
          </label>

          <div className="sort-controls">
            <span className="sort-label">Sort by:</span>
            {sortOptions.map(option => (
              <button
                key={option.value}
                className={`sort-btn ${sortBy === option.value ? 'active' : ''}`}
                onClick={() => handleSortChange(option.value)}
              >
                {option.label}
                {sortBy === option.value && (
                  <ChevronDown 
                    className={`sort-arrow ${sortOrder === 'asc' ? 'asc' : ''}`}
                    size={14} 
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="collection-content">
        {loading && (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading collections...</p>
          </div>
        )}

        {error && (
          <div className="error-state">
            <p>{error}</p>
            <button onClick={() => loadCollections(true)} className="retry-btn">
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && collections.length === 0 && (
          <div className="empty-state">
            <Filter size={48} />
            <h3>No collections found</h3>
            <p>Try adjusting your search criteria or filters</p>
          </div>
        )}

        {!loading && !error && collections.length > 0 && (
          <>
            <div className={`collections-${viewMode}`}>
              {viewMode === 'grid' 
                ? collections.map(renderCollectionCard)
                : collections.map(renderCollectionListItem)
              }
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="pagination-btn"
                  disabled={page === 1}
                  onClick={() => handlePageChange(page - 1)}
                >
                  Previous
                </button>

                <div className="pagination-info">
                  Page {page} of {totalPages}
                </div>

                <button
                  className="pagination-btn"
                  disabled={page === totalPages}
                  onClick={() => handlePageChange(page + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CollectionBrowser;