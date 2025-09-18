import React, { useState, useEffect } from 'react'
import './AdvancedCrossChain.css'

const AdvancedCrossChain = ({ userStats, setUserStats }) => {
  const [activeTab, setActiveTab] = useState('bridge')
  const [selectedFromChain, setSelectedFromChain] = useState('ethereum')
  const [selectedToChain, setSelectedToChain] = useState('polygon')
  const [bridgeAmount, setBridgeAmount] = useState('')
  const [selectedNFT, setSelectedNFT] = useState(null)
  const [connectedWallets, setConnectedWallets] = useState({
    ethereum: true,
    polygon: false,
    bsc: false,
    solana: false,
    avalanche: false
  })

  // Supported blockchains
  const supportedChains = [
    {
      id: 'ethereum',
      name: 'Ethereum',
      symbol: 'ETH',
      color: '#627eea',
      icon: '⟠',
      gasPrice: '45 gwei',
      bridgeFee: '0.003 ETH',
      avgTime: '~15 minutes'
    },
    {
      id: 'polygon',
      name: 'Polygon',
      symbol: 'MATIC',
      color: '#8247e5',
      icon: '⬟',
      gasPrice: '30 gwei',
      bridgeFee: '2.5 MATIC',
      avgTime: '~7 minutes'
    },
    {
      id: 'bsc',
      name: 'BSC',
      symbol: 'BNB',
      color: '#f0b90b',
      icon: '⬢',
      gasPrice: '5 gwei',
      bridgeFee: '0.001 BNB',
      avgTime: '~3 minutes'
    },
    {
      id: 'solana',
      name: 'Solana',
      symbol: 'SOL',
      color: '#14f195',
      icon: '◎',
      gasPrice: '0.000005 SOL',
      bridgeFee: '0.01 SOL',
      avgTime: '~2 minutes'
    },
    {
      id: 'avalanche',
      name: 'Avalanche',
      symbol: 'AVAX',
      color: '#e84142',
      icon: '▲',
      gasPrice: '25 nAVAX',
      bridgeFee: '0.01 AVAX',
      avgTime: '~5 minutes'
    }
  ]

  // Cross-chain NFT assets
  const crossChainNFTs = [
    {
      id: 1,
      name: 'Cosmic Warrior #1234',
      collection: 'MetaGaming Heroes',
      currentChain: 'ethereum',
      availableChains: ['polygon', 'bsc'],
      estimatedValue: '2.5 ETH',
      utility: ['Gaming', 'Staking', 'Governance'],
      bridgeCost: '0.003 ETH'
    },
    {
      id: 2,
      name: 'Digital Land Parcel #567',
      collection: 'Virtual Worlds',
      currentChain: 'polygon',
      availableChains: ['ethereum', 'avalanche'],
      estimatedValue: '1.8 ETH',
      utility: ['Metaverse', 'Rental Income'],
      bridgeCost: '2.5 MATIC'
    },
    {
      id: 3,
      name: 'Rare Avatar #890',
      collection: 'Avatar Collection',
      currentChain: 'bsc',
      availableChains: ['ethereum', 'polygon', 'solana'],
      estimatedValue: '0.9 ETH',
      utility: ['Profile', 'Social Status'],
      bridgeCost: '0.001 BNB'
    }
  ]

  // Bridge transactions history
  const bridgeHistory = [
    {
      id: 1,
      type: 'NFT Bridge',
      asset: 'Gaming Sword #123',
      fromChain: 'ethereum',
      toChain: 'polygon',
      status: 'completed',
      timestamp: '2 hours ago',
      txHash: '0xabc123...'
    },
    {
      id: 2,
      type: 'Token Bridge',
      asset: '50 USDC',
      fromChain: 'polygon',
      toChain: 'ethereum',
      status: 'pending',
      timestamp: '1 hour ago',
      txHash: '0xdef456...'
    },
    {
      id: 3,
      type: 'NFT Bridge',
      asset: 'Land Plot #456',
      fromChain: 'bsc',
      toChain: 'avalanche',
      status: 'completed',
      timestamp: '5 hours ago',
      txHash: '0xghi789...'
    }
  ]

  // Multi-wallet management
  const walletOptions = [
    {
      id: 'metamask',
      name: 'MetaMask',
      chains: ['ethereum', 'polygon', 'bsc', 'avalanche'],
      icon: '🦊',
      status: 'connected'
    },
    {
      id: 'phantom',
      name: 'Phantom',
      chains: ['solana'],
      icon: '👻',
      status: 'disconnected'
    },
    {
      id: 'coinbase',
      name: 'Coinbase Wallet',
      chains: ['ethereum', 'polygon'],
      icon: '🔵',
      status: 'disconnected'
    },
    {
      id: 'trust',
      name: 'Trust Wallet',
      chains: ['ethereum', 'bsc'],
      icon: '🛡️',
      status: 'disconnected'
    }
  ]

  const handleChainSwitch = (chainId) => {
    alert(`Switching to ${supportedChains.find(c => c.id === chainId)?.name}...`)
    // In real implementation, this would call wallet provider to switch chains
  }

  const handleWalletConnect = (walletId) => {
    alert(`Connecting to ${walletOptions.find(w => w.id === walletId)?.name}...`)
    // In real implementation, this would initiate wallet connection
  }

  const handleBridgeNFT = (nft, targetChain) => {
    alert(`Bridging ${nft.name} to ${supportedChains.find(c => c.id === targetChain)?.name}`)
    // In real implementation, this would call bridge smart contract
  }

  const handleTokenBridge = () => {
    if (!bridgeAmount) {
      alert('Please enter amount to bridge')
      return
    }
    alert(`Bridging ${bridgeAmount} tokens from ${selectedFromChain} to ${selectedToChain}`)
    // In real implementation, this would call bridge contract
  }

  return (
    <div className="advanced-crosschain">
      <div className="crosschain-header">
        <h2>🌉 Cross-Chain Infrastructure</h2>
        <p>Bridge assets across multiple blockchains seamlessly</p>
      </div>

      <div className="crosschain-tabs">
        <button 
          className={`crosschain-tab ${activeTab === 'bridge' ? 'active' : ''}`}
          onClick={() => setActiveTab('bridge')}
        >
          Asset Bridge
        </button>
        <button 
          className={`crosschain-tab ${activeTab === 'nft-bridge' ? 'active' : ''}`}
          onClick={() => setActiveTab('nft-bridge')}
        >
          NFT Bridge
        </button>
        <button 
          className={`crosschain-tab ${activeTab === 'wallets' ? 'active' : ''}`}
          onClick={() => setActiveTab('wallets')}
        >
          Multi-Wallet
        </button>
        <button 
          className={`crosschain-tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          Bridge History
        </button>
      </div>

      {/* Chain Status Overview */}
      <div className="chain-status-overview">
        <h3>Network Status</h3>
        <div className="chains-grid">
          {supportedChains.map(chain => (
            <div key={chain.id} className="chain-card">
              <div className="chain-header">
                <span className="chain-icon" style={{color: chain.color}}>
                  {chain.icon}
                </span>
                <span className="chain-name">{chain.name}</span>
                <div className={`connection-status ${connectedWallets[chain.id] ? 'connected' : 'disconnected'}`}>
                  {connectedWallets[chain.id] ? '🟢' : '🔴'}
                </div>
              </div>
              
              <div className="chain-metrics">
                <div className="metric">
                  <span>Gas:</span>
                  <span>{chain.gasPrice}</span>
                </div>
                <div className="metric">
                  <span>Bridge Fee:</span>
                  <span>{chain.bridgeFee}</span>
                </div>
                <div className="metric">
                  <span>Time:</span>
                  <span>{chain.avgTime}</span>
                </div>
              </div>

              <button 
                className="chain-action-btn"
                onClick={() => handleChainSwitch(chain.id)}
                disabled={connectedWallets[chain.id]}
              >
                {connectedWallets[chain.id] ? 'Connected' : 'Connect'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Asset Bridge Section */}
      {activeTab === 'bridge' && (
        <div className="bridge-section">
          <div className="bridge-interface">
            <h3>🔄 Token Bridge</h3>
            
            <div className="bridge-form">
              <div className="bridge-row">
                <div className="chain-selector">
                  <label>From Chain</label>
                  <select 
                    value={selectedFromChain}
                    onChange={(e) => setSelectedFromChain(e.target.value)}
                  >
                    {supportedChains.map(chain => (
                      <option key={chain.id} value={chain.id}>
                        {chain.icon} {chain.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bridge-arrow">⇄</div>

                <div className="chain-selector">
                  <label>To Chain</label>
                  <select 
                    value={selectedToChain}
                    onChange={(e) => setSelectedToChain(e.target.value)}
                  >
                    {supportedChains
                      .filter(chain => chain.id !== selectedFromChain)
                      .map(chain => (
                        <option key={chain.id} value={chain.id}>
                          {chain.icon} {chain.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="amount-input">
                <label>Amount to Bridge</label>
                <input 
                  type="number"
                  value={bridgeAmount}
                  onChange={(e) => setBridgeAmount(e.target.value)}
                  placeholder="Enter amount"
                />
                <span className="token-symbol">
                  {supportedChains.find(c => c.id === selectedFromChain)?.symbol}
                </span>
              </div>

              <div className="bridge-summary">
                <div className="summary-row">
                  <span>Bridge Fee:</span>
                  <span>{supportedChains.find(c => c.id === selectedFromChain)?.bridgeFee}</span>
                </div>
                <div className="summary-row">
                  <span>Estimated Time:</span>
                  <span>{supportedChains.find(c => c.id === selectedToChain)?.avgTime}</span>
                </div>
                <div className="summary-row">
                  <span>You'll Receive:</span>
                  <span className="receive-amount">
                    ~{bridgeAmount || '0'} {supportedChains.find(c => c.id === selectedToChain)?.symbol}
                  </span>
                </div>
              </div>

              <button 
                className="bridge-execute-btn"
                onClick={handleTokenBridge}
                disabled={!bridgeAmount}
              >
                Bridge Tokens
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NFT Bridge Section */}
      {activeTab === 'nft-bridge' && (
        <div className="nft-bridge-section">
          <div className="nft-bridge-header">
            <h3>🖼️ NFT Cross-Chain Bridge</h3>
            <p>Move your NFTs across different blockchains</p>
          </div>

          <div className="nft-bridge-grid">
            {crossChainNFTs.map(nft => (
              <div key={nft.id} className="nft-bridge-card">
                <div className="nft-bridge-info">
                  <h4>{nft.name}</h4>
                  <p>{nft.collection}</p>
                  <div className="current-chain">
                    <span className="chain-indicator">
                      {supportedChains.find(c => c.id === nft.currentChain)?.icon}
                    </span>
                    <span>Current: {supportedChains.find(c => c.id === nft.currentChain)?.name}</span>
                  </div>
                </div>

                <div className="nft-metrics">
                  <div className="metric">
                    <span>Value:</span>
                    <span>{nft.estimatedValue}</span>
                  </div>
                  <div className="metric">
                    <span>Bridge Cost:</span>
                    <span>{nft.bridgeCost}</span>
                  </div>
                </div>

                <div className="utility-tags">
                  {nft.utility.map(util => (
                    <span key={util} className="utility-tag">{util}</span>
                  ))}
                </div>

                <div className="available-chains">
                  <span className="available-label">Bridge to:</span>
                  <div className="chain-options">
                    {nft.availableChains.map(chainId => {
                      const chain = supportedChains.find(c => c.id === chainId)
                      return (
                        <button 
                          key={chainId}
                          className="chain-option"
                          onClick={() => handleBridgeNFT(nft, chainId)}
                          style={{borderColor: chain?.color}}
                        >
                          <span style={{color: chain?.color}}>{chain?.icon}</span>
                          {chain?.name}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Multi-Wallet Section */}
      {activeTab === 'wallets' && (
        <div className="wallet-section">
          <div className="wallet-header">
            <h3>💼 Multi-Wallet Management</h3>
            <p>Connect multiple wallets for different blockchains</p>
          </div>

          <div className="wallet-grid">
            {walletOptions.map(wallet => (
              <div key={wallet.id} className="wallet-card">
                <div className="wallet-info">
                  <span className="wallet-icon">{wallet.icon}</span>
                  <div className="wallet-details">
                    <h4>{wallet.name}</h4>
                    <div className="supported-chains">
                      {wallet.chains.map(chainId => {
                        const chain = supportedChains.find(c => c.id === chainId)
                        return (
                          <span 
                            key={chainId} 
                            className="supported-chain"
                            style={{color: chain?.color}}
                          >
                            {chain?.icon}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                </div>

                <div className="wallet-status">
                  <div className={`status-indicator ${wallet.status}`}>
                    {wallet.status === 'connected' ? '🟢' : '🔴'}
                  </div>
                  <span className={`status-text ${wallet.status}`}>
                    {wallet.status === 'connected' ? 'Connected' : 'Disconnected'}
                  </span>
                </div>

                <button 
                  className={`wallet-action-btn ${wallet.status}`}
                  onClick={() => handleWalletConnect(wallet.id)}
                  disabled={wallet.status === 'connected'}
                >
                  {wallet.status === 'connected' ? 'Connected' : 'Connect Wallet'}
                </button>
              </div>
            ))}
          </div>

          <div className="wallet-actions">
            <button className="action-btn primary">
              Add Custom Wallet
            </button>
            <button className="action-btn secondary">
              Manage Permissions
            </button>
          </div>
        </div>
      )}

      {/* Bridge History Section */}
      {activeTab === 'history' && (
        <div className="history-section">
          <div className="history-header">
            <h3>📋 Bridge History</h3>
            <p>Track all your cross-chain transactions</p>
          </div>

          <div className="history-filters">
            <select className="filter-select">
              <option>All Chains</option>
              <option>Ethereum</option>
              <option>Polygon</option>
              <option>BSC</option>
            </select>
            <select className="filter-select">
              <option>All Types</option>
              <option>NFT Bridge</option>
              <option>Token Bridge</option>
            </select>
          </div>

          <div className="history-list">
            {bridgeHistory.map(transaction => (
              <div key={transaction.id} className="history-item">
                <div className="transaction-info">
                  <div className="transaction-type">{transaction.type}</div>
                  <div className="transaction-asset">{transaction.asset}</div>
                  <div className="transaction-route">
                    <span className="from-chain">
                      {supportedChains.find(c => c.id === transaction.fromChain)?.icon}
                      {supportedChains.find(c => c.id === transaction.fromChain)?.name}
                    </span>
                    <span className="arrow">→</span>
                    <span className="to-chain">
                      {supportedChains.find(c => c.id === transaction.toChain)?.icon}
                      {supportedChains.find(c => c.id === transaction.toChain)?.name}
                    </span>
                  </div>
                </div>

                <div className="transaction-status">
                  <div className={`status-badge ${transaction.status}`}>
                    {transaction.status === 'completed' ? '✅' : 
                     transaction.status === 'pending' ? '🔄' : '❌'}
                    {transaction.status}
                  </div>
                  <div className="transaction-time">{transaction.timestamp}</div>
                </div>

                <div className="transaction-actions">
                  <button className="view-tx-btn">
                    View TX
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default AdvancedCrossChain