import React, { useState } from 'react'
import './NFTMarketplace.css'
import '../../styles/dashboard-states.css'

const NFTMarketplace = ({ userStats, availableNFTs = [], trendingNFTs = [], loading = false, error = null, onRefresh }) => {
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('price')
  const [selectedNFT, setSelectedNFT] = useState(null)
  const [showListModal, setShowListModal] = useState(false)
  
  // Helper function to generate reliable placeholder images
  const generateImage = (name, category) => {
    const colors = {
      gaming: { bg: '#4f46e5', text: '#ffffff' },
      avatar: { bg: '#f43f5e', text: '#ffffff' },
      land: { bg: '#06b6d4', text: '#ffffff' },
      music: { bg: '#10b981', text: '#ffffff' }
    }
    const color = colors[category] || { bg: '#6b7280', text: '#ffffff' }
    
    const svg = `
      <svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad${category}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${color.bg};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${color.bg}cc;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="300" height="300" fill="url(#grad${category})"/>
        <text x="150" y="140" font-family="Arial, sans-serif" font-size="14" font-weight="bold" text-anchor="middle" fill="${color.text}">${name}</text>
        <text x="150" y="180" font-family="Arial, sans-serif" font-size="32" text-anchor="middle" fill="${color.text}" opacity="0.7">
          ${category === 'gaming' ? '🎮' : category === 'avatar' ? '👤' : category === 'land' ? '🏞️' : category === 'music' ? '🎵' : '🖼️'}
        </text>
      </svg>
    `
    
    // Safe base64 encoding
    try {
      return `data:image/svg+xml;base64,${btoa(svg)}`
    } catch (error) {
      // Fallback to URL encoding if btoa fails
      return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
    }
  }
  
  // Use real NFT data from backend, fallback to generated images if no image available
  const nfts = availableNFTs.map(nft => ({
    ...nft,
    image: nft.image || generateImage(nft.name, nft.category)
  }))

  const categories = [
    { id: 'all', label: 'All NFTs', count: nfts.length },
    { id: 'gaming', label: 'Gaming', count: nfts.filter(n => n.category === 'gaming').length },
    { id: 'pfp', label: 'Avatars', count: nfts.filter(n => n.category === 'pfp' || n.category === 'avatar').length },
    { id: 'collectible', label: 'Collectibles', count: nfts.filter(n => n.category === 'collectible').length },
    { id: 'other', label: 'Other', count: nfts.filter(n => !['gaming','pfp','collectible'].includes(n.category)).length }
  ]

  const filteredNFTs = nfts.filter(nft => {
    const matchesCategory = activeCategory === 'all' || 
                          nft.category === activeCategory ||
                          (activeCategory === 'pfp' && nft.category === 'avatar')
    const matchesSearch = nft.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         nft.collection.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const handleRentNFT = (nft) => {
    // Simulate rental transaction
    alert(`Initiating rental for ${nft.name} at ${nft.price} ETH for ${nft.duration}`)
    // In real implementation, this would call smart contract
  }

  const handleListForRent = (formData) => {
    // Simulate listing NFT for rent
    console.log('Listing NFT:', formData)
    setShowListModal(false)
    alert('NFT listed for rent successfully!')
  }

  const NFTCard = ({ nft }) => {
    const [imageError, setImageError] = useState(false)
    
    const handleImageError = () => {
      setImageError(true)
    }
    
    return (
      <div className="nft-card" onClick={() => setSelectedNFT(nft)}>
        <div className="nft-image">
          <img 
            src={nft.image} 
            alt={nft.name}
            onError={handleImageError}
            loading="lazy"
          />
          {nft.isRented && <div className="rental-badge">Rented</div>}
          <div className="ai-score">AI: {nft.aiScore}%</div>
        </div>
        
        <div className="nft-details">
          <h3 className="nft-name">{nft.name}</h3>
          <p className="nft-collection">{nft.collection}</p>
          
          <div className="nft-stats">
            <div className="stat">
              <span className="stat-value">⭐ {nft.rating}</span>
            </div>
            <div className="stat">
              <span className="stat-value">🔄 {nft.rentalsCount}</span>
            </div>
          </div>

          <div className="chain-badges">
            {nft.crossChain.map(chain => (
              <span key={chain} className="chain-badge">{chain}</span>
            ))}
          </div>
          
          <div className="nft-price">
            <div className="price-info">
              <span className="price">{nft.price} ETH</span>
              <span className="duration">/ {nft.duration}</span>
            </div>
            <button 
              className="rent-btn"
              onClick={(e) => {
                e.stopPropagation()
                handleRentNFT(nft)
              }}
              disabled={nft.isRented}
            >
              {nft.isRented ? 'Rented' : 'Rent Now'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="nft-marketplace">
      <div className="marketplace-header">
        <div className="header-title">
          <h2>NFT Rental Marketplace</h2>
          <p>ERC-4907 Compatible • Non-Custodial • Cross-Chain</p>
        </div>
        
        <div className="header-actions">
          <button 
            className="list-nft-btn"
            onClick={() => setShowListModal(true)}
          >
            + List Your NFT
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="marketplace-controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search NFTs, collections..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="sort-controls">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="price">Price</option>
            <option value="rating">Rating</option>
            <option value="rentals">Most Rented</option>
            <option value="ai-score">AI Score</option>
          </select>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="category-tabs">
        {categories.map(category => (
          <button
            key={category.id}
            className={`category-tab ${activeCategory === category.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(category.id)}
          >
            {category.label}
            <span className="count">({category.count})</span>
          </button>
        ))}
      </div>

      {/* Market Stats - Use real data from backend */}
      <div className="market-stats">
        <div className="stat-card">
          <span className="stat-number">{userStats?.totalRentals || 0}</span>
          <span className="stat-label">Your Rentals</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{nfts.length}</span>
          <span className="stat-label">Available NFTs</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{userStats?.earnings || 0} ETH</span>
          <span className="stat-label">Your Earnings</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">⭐ {userStats?.reputation || 0}</span>
          <span className="stat-label">Your Rating</span>
        </div>
      </div>

      {/* Loading and Error States */}
      {loading && (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading NFTs from blockchain...</p>
        </div>
      )}
      
      {error && (
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <p>Failed to load NFTs: {error}</p>
          {onRefresh && (
            <button onClick={onRefresh} className="retry-btn">
              🔄 Retry
            </button>
          )}
        </div>
      )}
      
      {/* NFT Grid */}
      {!loading && !error && (
        <div className="nft-grid">
          {filteredNFTs.length > 0 ? (
            filteredNFTs.map(nft => (
              <NFTCard key={nft.id} nft={nft} />
            ))
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>No NFTs Found</h3>
              <p>Try adjusting your search or category filters</p>
            </div>
          )}
        </div>
      )}

      {/* Simple Modal for selected NFT */}
      {selectedNFT && (
        <div className="modal-overlay" onClick={() => setSelectedNFT(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedNFT.name}</h2>
              <button className="close-btn" onClick={() => setSelectedNFT(null)}>✕</button>
            </div>
            
            <div className="modal-body">
              <div className="nft-image-large">
                <img src={selectedNFT.image} alt={selectedNFT.name} />
              </div>
              
              <div className="nft-info">
                <div className="info-section">
                  <h3>Details</h3>
                  <p><strong>Collection:</strong> {selectedNFT.collection}</p>
                  <p><strong>Owner:</strong> {selectedNFT.owner}</p>
                  <p><strong>Rating:</strong> ⭐ {selectedNFT.rating} ({selectedNFT.rentalsCount} rentals)</p>
                  <p><strong>AI Score:</strong> {selectedNFT.aiScore}%</p>
                </div>
                
                <div className="info-section">
                  <h3>Cross-Chain Support</h3>
                  <div className="chain-tags">
                    {selectedNFT.crossChain.map((chain, index) => (
                      <span key={index} className="chain-tag">{chain}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <div className="rental-terms">
                <div className="term">
                  <span className="label">Price:</span>
                  <span className="value">{selectedNFT.price} ETH</span>
                </div>
                <div className="term">
                  <span className="label">Duration:</span>
                  <span className="value">{selectedNFT.duration}</span>
                </div>
              </div>
              <button 
                className="rent-btn-large"
                onClick={() => handleRentNFT(selectedNFT)}
                disabled={selectedNFT.isRented}
              >
                {selectedNFT.isRented ? 'Currently Rented' : 'Rent This NFT'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default NFTMarketplace