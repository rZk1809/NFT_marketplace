import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.jsx'
import WalletSelectionModal from '../wallet/WalletSelectionModal.jsx'
import './ConnectWalletButton.css'

const ConnectWalletButton = () => {
  const [showWalletModal, setShowWalletModal] = useState(false)
  const { isAuthenticated, walletAddress, walletType, availableWallets, error, loading, disconnectWallet } = useAuth()
  const navigate = useNavigate()

  const handleConnectClick = () => {
    setShowWalletModal(true)
  }

  const handleWalletConnected = (connectionInfo) => {
    console.log('Wallet connected:', connectionInfo)
    
    // Navigate to dashboard on successful connection
    setTimeout(() => {
      navigate('/app/dashboard')
    }, 500) // Small delay for smooth UX
  }

  const handleDisconnect = async () => {
    try {
      await disconnectWallet()
    } catch (err) {
      console.error('Disconnect failed:', err)
    }
  }

  const formatAddress = (address) => {
    if (!address) return ''
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  // If already connected, show wallet info
  if (isAuthenticated && walletAddress) {
    return (
      <div className="wallet-connect-container">
        <div className="wallet-connect-card connected">
          <div className="connected-wallet-info">
            <div className="wallet-status">
              <div className="status-indicator connected"></div>
              <span className="status-text">Connected</span>
            </div>
            
            <div className="wallet-details">
              <div className="wallet-type-badge">{walletType}</div>
              <div className="wallet-address">{formatAddress(walletAddress)}</div>
            </div>
            
            <div className="wallet-actions">
              <button
                className="secondary-btn"
                onClick={() => navigate('/app/dashboard')}
              >
                Dashboard
              </button>
              <button
                className="disconnect-btn"
                onClick={handleDisconnect}
              >
                Disconnect
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show connection interface
  return (
    <>
      <div className="wallet-connect-container">
        <div className="wallet-connect-card">
          <div className="wallet-connect-header">
            <h2 className="wallet-connect-title">Connect Your Wallet</h2>
            <p className="wallet-connect-subtitle">
              Access your personalized Lendify dashboard
            </p>
          </div>
          
          <div className="wallet-connect-content">
            <div className="wallet-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="1" y="3" width="22" height="18" rx="2" ry="2"/>
                <line x1="1" y1="9" x2="23" y2="9"/>
                <path d="m17 8 4-4-4-4"/>
              </svg>
            </div>
            
            <button
              className={`wallet-connect-btn ${loading ? 'loading' : ''}`}
              onClick={handleConnectClick}
              disabled={loading}
            >
              <span className="btn-content">
                {loading && (
                  <div className="loading-spinner"></div>
                )}
                {loading ? 'Connecting...' : 'Connect Wallet'}
              </span>
            </button>
            
            {error && (
              <div className="error-message">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="15" y1="9" x2="9" y2="15"/>
                  <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                {error}
              </div>
            )}
            
            <div className="wallet-info">
              <p>Supported wallets:</p>
              <div className="wallet-options">
                {availableWallets.slice(0, 4).map((wallet) => (
                  <div key={wallet.type} className="wallet-option">
                    <span className="wallet-icon-small">{wallet.icon}</span>
                    <span>{wallet.name}</span>
                  </div>
                ))}
                {availableWallets.length > 4 && (
                  <div className="wallet-option">
                    <span>+{availableWallets.length - 4} more</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Wallet Selection Modal */}
      <WalletSelectionModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        onWalletConnected={handleWalletConnected}
      />
    </>
  )
}

export default ConnectWalletButton
