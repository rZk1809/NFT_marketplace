import React, { useState, useEffect } from 'react'
import './NFTMarketplace.css'

const NFTMarketplace = ({ userStats, setUserStats }) => {
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
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${color.bg};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${color.bg}cc;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="300" height="300" fill="url(#grad)"/>
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
  
  // Mock NFT data with rental functionality
  const [nfts] = useState([
    {
      id: 1,
      name: 'Cosmic Sword #1234',
      collection: 'MetaGaming Weapons',
      image: generateImage('Cosmic Sword #1234', 'gaming'),
      category: 'gaming',
      price: '0.1',
      duration: '7 days',
      owner: '0x1234...5678',
      isRented: false,
      rentalsCount: 45,
      rating: 4.8,
      utility: ['In-game weapon', 'Staking rewards'],
      gameCompatible: ['Axie Infinity', 'The Sandbox'],
      aiScore: 92,
      crossChain: ['Ethereum', 'Polygon']
    },
    {
      id: 2,
      name: 'Rare Avatar #007',
      collection: 'MetaHumans',
      image: generateImage('Rare Avatar #007', 'avatar'),
      category: 'avatar',
      price: '0.05',
      duration: '3 days',
      owner: '0x9876...4321',
      isRented: true,
      rentalsCount: 123,
      rating: 4.9,
      utility: ['Profile picture', 'Metaverse identity'],
      gameCompatible: ['VRChat', 'Horizon Worlds'],
      aiScore: 87,
      crossChain: ['Ethereum', 'BSC']
    },
    {
      id: 3,
      name: 'Digital Land #99',
      collection: 'VirtualWorlds',
      image: generateImage('Digital Land #99', 'land'),
      category: 'land',
      price: '0.3',
      duration: '30 days',
      owner: '0x5555...9999',
      isRented: false,
      rentalsCount: 12,
      rating: 4.6,
      utility: ['Virtual events', 'Advertising space'],
      gameCompatible: ['Decentraland', 'Cryptovoxels'],
      aiScore: 95,
      crossChain: ['Ethereum', 'Immutable X']
    },
    {
      id: 4,
      name: 'Music NFT Beat #42',
      collection: 'SoundWaves',
      image: generateImage('Music NFT Beat #42', 'music'),
      category: 'music',
      price: '0.02',
      duration: '1 day',
      owner: '0x7777...3333',
      isRented: false,
      rentalsCount: 78,
      rating: 4.7,
      utility: ['Commercial use', 'Streaming rights'],
      gameCompatible: ['Music platforms'],
      aiScore: 89,
      crossChain: ['Ethereum', 'Solana']
    }
  ])

  const categories = [
    { id: 'all', label: 'All NFTs', count: nfts.length },
    { id: 'gaming', label: 'Gaming', count: nfts.filter(n => n.category === 'gaming').length },
    { id: 'avatar', label: 'Avatars', count: nfts.filter(n => n.category === 'avatar').length },
    { id: 'land', label: 'Virtual Land', count: nfts.filter(n => n.category === 'land').length },
    { id: 'music', label: 'Music', count: nfts.filter(n => n.category === 'music').length }
  ]

  const filteredNFTs = nfts.filter(nft => {
    const matchesCategory = activeCategory === 'all' || nft.category === activeCategory
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
    const [imageLoading, setImageLoading] = useState(true)
    
    const handleImageError = () => {
      setImageError(true)
      setImageLoading(false)
    }
    
    const handleImageLoad = () => {
      setImageLoading(false)
    }
    
    const generateFallbackImage = (category) => {
      const gradients = {
        gaming: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        avatar: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        land: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        music: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        default: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }
      return gradients[category] || gradients.default
    }
    
    // Generate a simple data URI SVG as ultimate fallback
    const generateDataURIImage = (name, category) => {
      const colors = {
        gaming: { bg: '#4f46e5', text: '#ffffff' },
        avatar: { bg: '#f43f5e', text: '#ffffff' },
        land: { bg: '#06b6d4', text: '#ffffff' },
        music: { bg: '#10b981', text: '#ffffff' },
        default: { bg: '#6b7280', text: '#ffffff' }
      }
      const color = colors[category] || colors.default
      
      const svg = `
        <svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
          <rect width="300" height="300" fill="${color.bg}"/>
          <text x="150" y="130" font-family="Arial, sans-serif" font-size="16" font-weight="bold" text-anchor="middle" fill="${color.text}">${name}</text>
          <text x="150" y="170" font-family="Arial, sans-serif" font-size="24" text-anchor="middle" fill="${color.text}" opacity="0.8">
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
    
    return (
      <div className="nft-card" onClick={() => setSelectedNFT(nft)}>
        <div className="nft-image">
          {imageLoading && !imageError && (
            <div className="image-loading">
              <div className="loading-spinner-small"></div>
            </div>
          )}
          
          {!imageError ? (
            <img 
              src={nft.image} 
              alt={nft.name}
              onError={handleImageError}
              onLoad={handleImageLoad}
              loading="lazy"
              style={{ opacity: imageLoading ? 0 : 1 }}
            />
          ) : (
            <div 
              className="fallback-image"
              style={{ background: generateFallbackImage(nft.category) }}
            >
              <div className="fallback-content">
                <div className="fallback-icon">
                  {nft.category === 'gaming' && '🎮'}
                  {nft.category === 'avatar' && '👤'}
                  {nft.category === 'land' && '🏞️'}
                  {nft.category === 'music' && '🎵'}
                </div>
                <div className="fallback-text">{nft.name}</div>
              </div>
            </div>
          )}
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
    )
  }

  const NFTDetailModal = ({ nft, onClose }) => (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{nft.name}</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        
        <div className="modal-body">
          <div className="nft-image-large">
            <img src={nft.image} alt={nft.name} />
          </div>
          
          <div className="nft-info">
            <div className="info-section">
              <h3>Details</h3>
              <p><strong>Collection:</strong> {nft.collection}</p>
              <p><strong>Owner:</strong> {nft.owner}</p>
              <p><strong>Rating:</strong> ⭐ {nft.rating} ({nft.rentalsCount} rentals)</p>
              <p><strong>AI Score:</strong> {nft.aiScore}%</p>
            </div>
            
            <div className="info-section">
              <h3>Utility</h3>
              <ul>
                {nft.utility.map((util, index) => (
                  <li key={index}>{util}</li>
                ))}
              </ul>
            </div>
            
            <div className="info-section">
              <h3>Game Compatibility</h3>
              <div className="game-tags">
                {nft.gameCompatible.map((game, index) => (
                  <span key={index} className="game-tag">{game}</span>
                ))}
              </div>
            </div>
            
            <div className="info-section">
              <h3>Cross-Chain Support</h3>
              <div className="chain-tags">
                {nft.crossChain.map((chain, index) => (
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
              <span className="value">{nft.price} ETH</span>
            </div>
            <div className="term">
              <span className="label">Duration:</span>
              <span className="value">{nft.duration}</span>
            </div>
          </div>
          <button 
            className="rent-btn-large"
            onClick={() => handleRentNFT(nft)}
            disabled={nft.isRented}
          >
            {nft.isRented ? 'Currently Rented' : 'Rent This NFT'}
          </button>
        </div>
      </div>
    </div>
  )

  const ListNFTModal = ({ onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
      name: '',
      price: '',
      duration: '7',
      category: 'gaming'
    })

    const handleSubmit = (e) => {
      e.preventDefault()
      onSubmit(formData)
    }

    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>List NFT for Rent</h2>
            <button className="close-btn" onClick={onClose}>✕</button>
          </div>
          
          <form onSubmit={handleSubmit} className="list-form">
            <div className="form-group">
              <label>NFT Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Rental Price (ETH)</label>
              <input
                type="number"
                step="0.001"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Duration (days)</label>
              <select
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: e.target.value})}
              >
                <option value="1">1 day</option>
                <option value="3">3 days</option>
                <option value="7">7 days</option>
                <option value="14">14 days</option>
                <option value="30">30 days</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                <option value="gaming">Gaming</option>
                <option value="avatar">Avatar</option>
                <option value="land">Virtual Land</option>
                <option value="music">Music</option>
              </select>
            </div>
            
            <div className="form-actions">
              <button type="button" onClick={onClose} className="cancel-btn">
                Cancel
              </button>
              <button type="submit" className="submit-btn">
                List for Rent
              </button>
            </div>
          </form>
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

      {/* Market Stats */}
      <div className="market-stats">
        <div className="stat-card">
          <span className="stat-number">1,234</span>
          <span className="stat-label">Active Rentals</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">567</span>
          <span className="stat-label">Available NFTs</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">89.3 ETH</span>
          <span className="stat-label">Volume (24h)</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">4.2 ETH</span>
          <span className="stat-label">Avg. Price</span>
        </div>
      </div>

      {/* NFT Grid */}
      <div className="nft-grid">
        {filteredNFTs.map(nft => (
          <NFTCard key={nft.id} nft={nft} />
        ))}
      </div>

      {/* Modals */}
      {selectedNFT && (
        <NFTDetailModal 
          nft={selectedNFT} 
          onClose={() => setSelectedNFT(null)} 
        />
      )}

      {showListModal && (
        <ListNFTModal
          onClose={() => setShowListModal(false)}
          onSubmit={handleListForRent}
        />
      )}
    </div>
  )
}

export default NFTMarketplace