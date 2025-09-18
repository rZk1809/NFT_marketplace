import React, { useState } from 'react'

const CrossChainBridge = () => {
  const [fromChain, setFromChain] = useState('ethereum')
  const [toChain, setToChain] = useState('polygon')
  const [selectedNFT, setSelectedNFT] = useState(null)
  const [bridgeMode, setBridgeMode] = useState('single') // single or batch
  const [activeTab, setActiveTab] = useState('bridge')

  const chainData = {
    ethereum: { name: 'Ethereum', icon: '⟠', color: '#627EEA', fee: '0.015 ETH', time: '12-15 min' },
    polygon: { name: 'Polygon', icon: '🟣', color: '#8247E5', fee: '0.001 MATIC', time: '2-3 min' },
    bsc: { name: 'BSC', icon: '🟡', color: '#F3BA2F', fee: '0.005 BNB', time: '3-5 min' },
    arbitrum: { name: 'Arbitrum', icon: '🔵', color: '#28A0F0', fee: '0.002 ETH', time: '5-8 min' },
    optimism: { name: 'Optimism', icon: '🔴', color: '#FF0420', fee: '0.003 ETH', time: '7-10 min' },
    avalanche: { name: 'Avalanche', icon: '🏔️', color: '#E84142', fee: '0.01 AVAX', time: '1-2 min' },
    solana: { name: 'Solana', icon: '🌈', color: '#9945FF', fee: '0.1 SOL', time: '30 sec' }
  }

  const myNFTs = [
    { id: 1, name: 'Bored Ape #1234', collection: 'BAYC', chain: 'ethereum', value: '25.5 ETH' },
    { id: 2, name: 'Azuki #5678', collection: 'Azuki', chain: 'ethereum', value: '8.2 ETH' },
    { id: 3, name: 'Doodle #9012', collection: 'Doodles', chain: 'polygon', value: '3.1 ETH' }
  ]

  return (
    <div>
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <h2 className="gradient-text">🌉 Advanced Cross-Chain Bridge</h2>
        <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '2rem' }}>
          Multi-protocol bridge with LayerZero & Wormhole integration
        </p>
        
        {/* Bridge Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
          <button 
            className={`secondary-btn ${activeTab === 'bridge' ? 'active' : ''}`}
            onClick={() => setActiveTab('bridge')}
            style={{ background: activeTab === 'bridge' ? 'rgba(102, 126, 234, 0.3)' : 'rgba(255, 255, 255, 0.1)' }}
          >
            🌉 Bridge NFTs
          </button>
          <button 
            className={`secondary-btn ${activeTab === 'wrap' ? 'active' : ''}`}
            onClick={() => setActiveTab('wrap')}
            style={{ background: activeTab === 'wrap' ? 'rgba(102, 126, 234, 0.3)' : 'rgba(255, 255, 255, 0.1)' }}
          >
            📦 Wrap/Unwrap
          </button>
          <button 
            className={`secondary-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
            style={{ background: activeTab === 'history' ? 'rgba(102, 126, 234, 0.3)' : 'rgba(255, 255, 255, 0.1)' }}
          >
            📊 Bridge History
          </button>
        </div>

        {activeTab === 'bridge' && (
          <div style={{ display: 'grid', gap: '2rem' }}>
            {/* Chain Selection with Visual Representation */}
            <div className="chain-selector-advanced">
              <div className="chain-selection-grid">
                <div className="chain-selection-column">
                  <h4 style={{ color: 'white', marginBottom: '1rem' }}>From Chain</h4>
                  <div className="chain-options">
                    {Object.entries(chainData).map(([key, chain]) => (
                      <div 
                        key={key}
                        className={`chain-option ${fromChain === key ? 'selected' : ''}`}
                        onClick={() => setFromChain(key)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          padding: '1rem',
                          background: fromChain === key ? chain.color + '40' : 'rgba(255, 255, 255, 0.05)',
                          border: `1px solid ${fromChain === key ? chain.color : 'rgba(255, 255, 255, 0.1)'}`,
                          borderRadius: '12px',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <span style={{ fontSize: '1.5rem' }}>{chain.icon}</span>
                        <div>
                          <div style={{ color: 'white', fontWeight: '500' }}>{chain.name}</div>
                          <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.8rem' }}>Fee: {chain.fee}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ 
                    fontSize: '2rem', 
                    background: 'rgba(102, 126, 234, 0.2)',
                    padding: '1rem',
                    borderRadius: '50%',
                    color: '#667eea'
                  }}>🔄</div>
                </div>
                
                <div className="chain-selection-column">
                  <h4 style={{ color: 'white', marginBottom: '1rem' }}>To Chain</h4>
                  <div className="chain-options">
                    {Object.entries(chainData).filter(([key]) => key !== fromChain).map(([key, chain]) => (
                      <div 
                        key={key}
                        className={`chain-option ${toChain === key ? 'selected' : ''}`}
                        onClick={() => setToChain(key)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          padding: '1rem',
                          background: toChain === key ? chain.color + '40' : 'rgba(255, 255, 255, 0.05)',
                          border: `1px solid ${toChain === key ? chain.color : 'rgba(255, 255, 255, 0.1)'}`,
                          borderRadius: '12px',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <span style={{ fontSize: '1.5rem' }}>{chain.icon}</span>
                        <div>
                          <div style={{ color: 'white', fontWeight: '500' }}>{chain.name}</div>
                          <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.8rem' }}>Fee: {chain.fee}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* NFT Selection */}
            <div className="nft-selection-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ color: 'white', margin: 0 }}>Select NFTs to Bridge</h4>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    className={`mode-btn ${bridgeMode === 'single' ? 'active' : ''}`}
                    onClick={() => setBridgeMode('single')}
                    style={{ 
                      padding: '0.5rem 1rem', 
                      fontSize: '0.8rem',
                      background: bridgeMode === 'single' ? 'rgba(102, 126, 234, 0.3)' : 'rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    Single
                  </button>
                  <button 
                    className={`mode-btn ${bridgeMode === 'batch' ? 'active' : ''}`}
                    onClick={() => setBridgeMode('batch')}
                    style={{ 
                      padding: '0.5rem 1rem', 
                      fontSize: '0.8rem',
                      background: bridgeMode === 'batch' ? 'rgba(102, 126, 234, 0.3)' : 'rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    Batch (Save Gas)
                  </button>
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                {myNFTs.filter(nft => nft.chain === fromChain).map(nft => (
                  <div 
                    key={nft.id}
                    className={`nft-bridge-item ${selectedNFT?.id === nft.id ? 'selected' : ''}`}
                    onClick={() => setSelectedNFT(nft)}
                    style={{
                      padding: '1.5rem',
                      background: selectedNFT?.id === nft.id ? 'rgba(102, 126, 234, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                      border: `1px solid ${selectedNFT?.id === nft.id ? '#667eea' : 'rgba(255, 255, 255, 0.1)'}`,
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <div style={{ color: 'white', fontWeight: '600', marginBottom: '0.5rem' }}>{nft.name}</div>
                    <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{nft.collection}</div>
                    <div style={{ color: '#50fa7b', fontSize: '0.9rem', fontWeight: '500' }}>Value: {nft.value}</div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Bridge Summary & Advanced Options */}
            <div className="bridge-summary" style={{
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '2rem',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <h4 style={{ color: 'white', marginBottom: '1.5rem' }}>🔍 Bridge Summary</h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div className="bridge-details">
                  <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Bridge Protocol:</span>
                    <span style={{ color: 'white', fontWeight: '500' }}>
                      {fromChain === 'solana' || toChain === 'solana' ? '🌈 Wormhole' : '⚡ LayerZero'}
                    </span>
                  </div>
                  <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Bridge Fee:</span>
                    <span style={{ color: 'white', fontWeight: '500' }}>{chainData[fromChain].fee}</span>
                  </div>
                  <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Estimated Time:</span>
                    <span style={{ color: 'white', fontWeight: '500' }}>{chainData[toChain].time}</span>
                  </div>
                  <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Security Level:</span>
                    <span style={{ color: '#50fa7b', fontWeight: '500' }}>🔒 Maximum</span>
                  </div>
                </div>
                
                <div className="advanced-options">
                  <h5 style={{ color: 'white', marginBottom: '1rem' }}>⚙️ Advanced Options</h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255, 255, 255, 0.8)' }}>
                      <input type="checkbox" /> Fast Bridge (Higher Fee)
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255, 255, 255, 0.8)' }}>
                      <input type="checkbox" /> Auto-Unwrap on Destination
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255, 255, 255, 0.8)' }}>
                      <input type="checkbox" defaultChecked /> Enable MEV Protection
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255, 255, 255, 0.8)' }}>
                      <input type="checkbox" /> Bridge Insurance (+0.1% fee)
                    </label>
                  </div>
                </div>
              </div>
              
              <button 
                className="primary-btn" 
                style={{ width: '100%', marginTop: '2rem', fontSize: '1.1rem' }}
                disabled={!selectedNFT}
              >
                🌉 {bridgeMode === 'batch' ? 'Batch Bridge NFTs' : 'Bridge NFT'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'wrap' && (
          <div className="wrap-interface">
            <h3 style={{ color: 'white', marginBottom: '1rem' }}>📦 Wrap/Unwrap Assets</h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '2rem' }}>
              Create wrapped versions of your NFTs for cross-chain compatibility
            </p>
            
            {/* Wrap interface would go here */}
            <div style={{ 
              padding: '3rem',
              textAlign: 'center',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚧</div>
              <h4 style={{ color: 'white' }}>Wrap/Unwrap Interface</h4>
              <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Coming soon - ERC-721 to wNFT conversion</p>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bridge-history">
            <h3 style={{ color: 'white', marginBottom: '1rem' }}>📊 Bridge Transaction History</h3>
            
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div style={{
                padding: '1.5rem',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                border: '1px solid rgba(50, 205, 50, 0.3)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span style={{ color: 'white', fontWeight: '600' }}>Bored Ape #1234</span>
                  <span style={{ color: '#50fa7b', fontSize: '0.9rem', fontWeight: '500' }}>✅ Completed</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', fontSize: '0.9rem' }}>
                  <div>
                    <div style={{ color: 'rgba(255, 255, 255, 0.6)' }}>From:</div>
                    <div style={{ color: 'white' }}>🟠 Ethereum</div>
                  </div>
                  <div>
                    <div style={{ color: 'rgba(255, 255, 255, 0.6)' }}>To:</div>
                    <div style={{ color: 'white' }}>🟣 Polygon</div>
                  </div>
                  <div>
                    <div style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Time:</div>
                    <div style={{ color: 'white' }}>12 minutes</div>
                  </div>
                </div>
              </div>
              
              <div style={{
                padding: '1.5rem',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 165, 0, 0.3)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span style={{ color: 'white', fontWeight: '600' }}>CryptoPunk #5678</span>
                  <span style={{ color: '#ffa500', fontSize: '0.9rem', fontWeight: '500' }}>⏳ In Progress (Step 2/3)</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', fontSize: '0.9rem' }}>
                  <div>
                    <div style={{ color: 'rgba(255, 255, 255, 0.6)' }}>From:</div>
                    <div style={{ color: 'white' }}>🟠 Ethereum</div>
                  </div>
                  <div>
                    <div style={{ color: 'rgba(255, 255, 255, 0.6)' }}>To:</div>
                    <div style={{ color: 'white' }}>🔵 Arbitrum</div>
                  </div>
                  <div>
                    <div style={{ color: 'rgba(255, 255, 255, 0.6)' }}>ETA:</div>
                    <div style={{ color: 'white' }}>5 minutes</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CrossChainBridge