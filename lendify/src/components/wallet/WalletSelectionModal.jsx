import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth.jsx'
import { WalletType } from '../../services/walletService.js'
import './WalletSelectionModal.css'

const WalletSelectionModal = ({ isOpen, onClose, onWalletConnected }) => {
  const { availableWallets, connectWallet, loading, error } = useAuth()
  const [selectedWallet, setSelectedWallet] = useState(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionError, setConnectionError] = useState(null)

  useEffect(() => {
    if (!isOpen) {
      setSelectedWallet(null)
      setIsConnecting(false)
      setConnectionError(null)
    }
  }, [isOpen])

  const handleWalletSelect = async (walletType) => {
    try {
      setIsConnecting(true)
      setConnectionError(null)
      setSelectedWallet(walletType)

      const result = await connectWallet(walletType)
      
      if (onWalletConnected) {
        onWalletConnected(result)
      }
      
      onClose()
    } catch (err) {
      console.error('Wallet connection failed:', err)
      setConnectionError(err.message)
    } finally {
      setIsConnecting(false)
    }
  }

  const getWalletDescription = (walletType) => {
    const descriptions = {
      [WalletType.METAMASK]: 'Connect using MetaMask browser extension',
      [WalletType.WALLETCONNECT]: 'Scan with WalletConnect to connect any mobile wallet',
      [WalletType.COINBASE]: 'Connect with Coinbase Wallet',
      [WalletType.TRUST]: 'Connect using Trust Wallet',
      [WalletType.INJECTED]: 'Connect using your current Web3 wallet',
      [WalletType.PHANTOM]: 'Connect using Phantom wallet (Solana support)'
    }
    return descriptions[walletType] || 'Connect with this wallet'
  }

  const getInstallUrl = (walletType) => {
    const urls = {
      [WalletType.METAMASK]: 'https://metamask.io/download/',
      [WalletType.TRUST]: 'https://trustwallet.com/download',
      [WalletType.COINBASE]: 'https://www.coinbase.com/wallet',
      [WalletType.PHANTOM]: 'https://phantom.app/'
    }
    return urls[walletType]
  }

  if (!isOpen) return null

  return (
    <div className="wallet-modal-overlay" onClick={onClose}>
      <div className="wallet-modal" onClick={(e) => e.stopPropagation()}>
        <div className="wallet-modal-header">
          <h2>Connect Your Wallet</h2>
          <button className="close-btn" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="wallet-modal-content">
          <p className="wallet-modal-subtitle">
            Choose your preferred wallet to connect to Lendify
          </p>

          <div className="wallet-options-grid">
            {availableWallets.map((wallet) => (
              <div key={wallet.type} className="wallet-option-card">
                <button
                  className={`wallet-option-btn ${selectedWallet === wallet.type ? 'selected' : ''} ${!wallet.installed ? 'not-installed' : ''}`}
                  onClick={() => wallet.installed ? handleWalletSelect(wallet.type) : window.open(getInstallUrl(wallet.type), '_blank')}
                  disabled={isConnecting && selectedWallet !== wallet.type}
                >
                  <div className="wallet-option-content">
                    <div className="wallet-icon-container">
                      <span className="wallet-icon">{wallet.icon}</span>
                      {isConnecting && selectedWallet === wallet.type && (
                        <div className="connecting-spinner">
                          <div className="spinner"></div>
                        </div>
                      )}
                    </div>
                    
                    <div className="wallet-info">
                      <h3 className="wallet-name">{wallet.name}</h3>
                      <p className="wallet-description">
                        {wallet.installed ? getWalletDescription(wallet.type) : 'Not installed'}
                      </p>
                    </div>
                    
                    {!wallet.installed && (
                      <div className="install-indicator">
                        <span>Install</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="m7 17 10-10"></path>
                          <path d="M17 7v10"></path>
                        </svg>
                      </div>
                    )}
                  </div>
                </button>

                {/* Special handling for WalletConnect */}
                {wallet.type === WalletType.WALLETCONNECT && (
                  <div className="walletconnect-info">
                    <div className="supported-wallets">
                      <span>Supports:</span>
                      <div className="supported-wallet-icons">
                        <span title="Rainbow">🌈</span>
                        <span title="Trust Wallet">🛡️</span>
                        <span title="Argent">🏛️</span>
                        <span title="imToken">💎</span>
                        <span>+200 more</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Connection Status */}
          {isConnecting && (
            <div className="connection-status">
              <div className="connection-progress">
                <div className="progress-spinner"></div>
                <span>Connecting to {selectedWallet}...</span>
              </div>
            </div>
          )}

          {/* Error Display */}
          {(connectionError || error) && (
            <div className="wallet-error">
              <div className="error-icon">⚠️</div>
              <div className="error-content">
                <h4>Connection Failed</h4>
                <p>{connectionError || error}</p>
                <button 
                  className="retry-btn" 
                  onClick={() => {
                    setConnectionError(null)
                    if (selectedWallet) {
                      handleWalletSelect(selectedWallet)
                    }
                  }}
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Help Section */}
          <div className="wallet-help">
            <div className="help-section">
              <h4>New to wallets?</h4>
              <p>
                A wallet lets you connect to Lendify and manage your NFTs and crypto. 
                It's like a digital passport for the decentralized web.
              </p>
              <a 
                href="https://ethereum.org/en/wallets/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="learn-more-link"
              >
                Learn more about wallets
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m7 17 10-10"></path>
                  <path d="M17 7v10"></path>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WalletSelectionModal