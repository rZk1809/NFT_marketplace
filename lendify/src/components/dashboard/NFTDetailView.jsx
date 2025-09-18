import React from 'react'
import { Html } from '@react-three/drei'
import './NFTDetailView.css'

const NFTDetailView = ({ nft, onClose, onListForRent }) => {
  if (!nft) return null

  const getRarityColor = (rarity) => {
    switch (rarity.toLowerCase()) {
      case 'legendary': return '#ff6b6b'
      case 'epic': return '#764ba2'
      case 'rare': return '#667eea'
      case 'uncommon': return '#50fa7b'
      default: return '#cccccc'
    }
  }

  return (
    <Html
      position={[0, 0, 0]}
      transform
      occlude
      style={{
        pointerEvents: 'auto',
        userSelect: 'none'
      }}
    >
      <div className="nft-detail-overlay">
        <div className="nft-detail-card">
          {/* Close Button */}
          <button className="nft-detail-close" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          {/* NFT Image */}
          <div className="nft-detail-image-container">
            <img 
              src={nft.image} 
              alt={nft.name}
              className="nft-detail-image"
            />
            <div className="nft-detail-glow"></div>
          </div>

          {/* NFT Info */}
          <div className="nft-detail-info">
            <div className="nft-detail-header">
              <h2 className="nft-detail-name">{nft.name}</h2>
              <div 
                className="nft-detail-rarity"
                style={{ color: getRarityColor(nft.rarity) }}
              >
                {nft.rarity}
              </div>
            </div>

            <p className="nft-detail-description">{nft.description}</p>

            <div className="nft-detail-price">
              <span className="price-label">Current Value</span>
              <span className="price-value">{nft.price}</span>
            </div>

            <div className="nft-detail-stats">
              <div className="stat-item">
                <span className="stat-label">Collection</span>
                <span className="stat-value">{nft.name.split(' #')[0]}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Token ID</span>
                <span className="stat-value">#{nft.id}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Blockchain</span>
                <span className="stat-value">Ethereum</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="nft-detail-actions">
              <button 
                className="nft-action-btn primary"
                onClick={() => onListForRent && onListForRent(nft)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M12 6v6l4 2"></path>
                </svg>
                List for Rent
              </button>
              
              <button className="nft-action-btn secondary">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                View Details
              </button>

              <button className="nft-action-btn secondary">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                Set Alert
              </button>
            </div>
          </div>
        </div>
      </div>
    </Html>
  )
}

export default NFTDetailView
