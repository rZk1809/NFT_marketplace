import React, { useState, useEffect } from 'react'
import './AdvancedNFTFi.css'

const AdvancedNFTFi = ({ userStats, setUserStats }) => {
  const [activeTab, setActiveTab] = useState('p2p-lending')
  const [selectedCollateral, setSelectedCollateral] = useState(null)
  const [loanDetails, setLoanDetails] = useState({
    amount: '',
    duration: '30',
    interestRate: '12'
  })

  // Mock data for P2P lending pools
  const lendingPools = [
    {
      id: 1,
      name: 'Blue Chip NFT Pool',
      tvl: '1,234.5 ETH',
      apy: '15.2%',
      totalLenders: 89,
      totalBorrowers: 156,
      collectionTypes: ['CryptoPunks', 'BAYC', 'Azuki'],
      riskLevel: 'Low',
      minCollateralValue: '10 ETH'
    },
    {
      id: 2,
      name: 'Gaming Assets Pool',
      tvl: '567.8 ETH',
      apy: '22.1%',
      totalLenders: 45,
      totalBorrowers: 78,
      collectionTypes: ['Axie Infinity', 'The Sandbox', 'Gods Unchained'],
      riskLevel: 'Medium',
      minCollateralValue: '2 ETH'
    },
    {
      id: 3,
      name: 'Metaverse Land Pool',
      tvl: '890.2 ETH',
      apy: '18.7%',
      totalLenders: 67,
      totalBorrowers: 234,
      collectionTypes: ['Decentraland', 'Cryptovoxels', 'Somnium Space'],
      riskLevel: 'Medium',
      minCollateralValue: '5 ETH'
    }
  ]

  // Mock flash loan opportunities
  const flashLoanOpportunities = [
    {
      id: 1,
      type: 'Arbitrage',
      description: 'BAYC #1234 price difference between OpenSea and LooksRare',
      estimatedProfit: '0.45 ETH',
      requiredCapital: '15.2 ETH',
      successProbability: '89%',
      timeWindow: '12 minutes',
      gasEstimate: '0.05 ETH'
    },
    {
      id: 2,
      type: 'Liquidation',
      description: 'Undervalued CryptoPunk liquidation opportunity',
      estimatedProfit: '1.2 ETH',
      requiredCapital: '25.7 ETH',
      successProbability: '76%',
      timeWindow: '8 minutes',
      gasEstimate: '0.08 ETH'
    },
    {
      id: 3,
      type: 'Yield Farming',
      description: 'Compound lending with NFT collateral unlock',
      estimatedProfit: '0.67 ETH',
      requiredCapital: '8.9 ETH',
      successProbability: '94%',
      timeWindow: '45 minutes',
      gasEstimate: '0.03 ETH'
    }
  ]

  // Mock user's NFTs for collateral
  const userNFTs = [
    {
      id: 1,
      name: 'Bored Ape #5678',
      collection: 'Bored Ape Yacht Club',
      estimatedValue: '45.2 ETH',
      maxLoanValue: '31.6 ETH', // 70% LTV
      riskScore: 'A+',
      liquidityRating: 'High'
    },
    {
      id: 2,
      name: 'CryptoPunk #9012',
      collection: 'CryptoPunks',
      estimatedValue: '78.9 ETH',
      maxLoanValue: '55.2 ETH',
      riskScore: 'A+',
      liquidityRating: 'Very High'
    },
    {
      id: 3,
      name: 'Azuki #3456',
      collection: 'Azuki',
      estimatedValue: '12.4 ETH',
      maxLoanValue: '8.7 ETH',
      riskScore: 'A',
      liquidityRating: 'High'
    }
  ]

  const handleFlashLoan = (opportunity) => {
    alert(`Initiating flash loan for ${opportunity.type} - Est. profit: ${opportunity.estimatedProfit}`)
    // In real implementation, this would call smart contract
  }

  const handleP2PLend = (pool) => {
    alert(`Depositing to ${pool.name} - APY: ${pool.apy}`)
    // In real implementation, this would call lending smart contract
  }

  const handleCollateralLoan = () => {
    if (!selectedCollateral) {
      alert('Please select NFT collateral first')
      return
    }
    alert(`Requesting loan of ${loanDetails.amount} ETH against ${selectedCollateral.name}`)
    // In real implementation, this would call collateral lending contract
  }

  return (
    <div className="advanced-nftfi">
      <div className="nftfi-header">
        <h2>🏦 Advanced NFT-Fi Hub</h2>
        <p>Decentralized Finance powered by NFT collateral</p>
      </div>

      <div className="nftfi-tabs">
        <button 
          className={`nftfi-tab ${activeTab === 'p2p-lending' ? 'active' : ''}`}
          onClick={() => setActiveTab('p2p-lending')}
        >
          P2P Lending
        </button>
        <button 
          className={`nftfi-tab ${activeTab === 'flash-loans' ? 'active' : ''}`}
          onClick={() => setActiveTab('flash-loans')}
        >
          Flash Loans
        </button>
        <button 
          className={`nftfi-tab ${activeTab === 'collateral-loans' ? 'active' : ''}`}
          onClick={() => setActiveTab('collateral-loans')}
        >
          Collateral Loans
        </button>
        <button 
          className={`nftfi-tab ${activeTab === 'liquidity-pools' ? 'active' : ''}`}
          onClick={() => setActiveTab('liquidity-pools')}
        >
          Liquidity Pools
        </button>
      </div>

      {/* P2P Lending Section */}
      {activeTab === 'p2p-lending' && (
        <div className="p2p-section">
          <div className="lending-stats">
            <div className="stat-card">
              <span className="stat-number">$12.4M</span>
              <span className="stat-label">Total Lent</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">1,247</span>
              <span className="stat-label">Active Loans</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">18.3%</span>
              <span className="stat-label">Avg APY</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">94.2%</span>
              <span className="stat-label">Loan Success Rate</span>
            </div>
          </div>

          <div className="lending-pools-grid">
            {lendingPools.map(pool => (
              <div key={pool.id} className="pool-card">
                <div className="pool-header">
                  <h4>{pool.name}</h4>
                  <div className={`risk-badge ${pool.riskLevel.toLowerCase()}`}>
                    {pool.riskLevel} Risk
                  </div>
                </div>
                
                <div className="pool-metrics">
                  <div className="metric">
                    <span className="label">TVL</span>
                    <span className="value">{pool.tvl}</span>
                  </div>
                  <div className="metric">
                    <span className="label">APY</span>
                    <span className="value highlight">{pool.apy}</span>
                  </div>
                  <div className="metric">
                    <span className="label">Lenders</span>
                    <span className="value">{pool.totalLenders}</span>
                  </div>
                  <div className="metric">
                    <span className="label">Borrowers</span>
                    <span className="value">{pool.totalBorrowers}</span>
                  </div>
                </div>

                <div className="collection-types">
                  <span className="collections-label">Supported Collections:</span>
                  <div className="collection-tags">
                    {pool.collectionTypes.map(collection => (
                      <span key={collection} className="collection-tag">{collection}</span>
                    ))}
                  </div>
                </div>

                <button 
                  className="pool-action-btn"
                  onClick={() => handleP2PLend(pool)}
                >
                  Lend to Pool
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Flash Loans Section */}
      {activeTab === 'flash-loans' && (
        <div className="flash-section">
          <div className="flash-info">
            <h3>⚡ Flash Loan Opportunities</h3>
            <p>AI-detected profitable opportunities requiring no upfront capital</p>
          </div>

          <div className="opportunities-grid">
            {flashLoanOpportunities.map(opportunity => (
              <div key={opportunity.id} className="opportunity-card">
                <div className="opportunity-header">
                  <h4>{opportunity.type}</h4>
                  <div className="profit-indicator">
                    +{opportunity.estimatedProfit}
                  </div>
                </div>
                
                <p className="opportunity-description">{opportunity.description}</p>
                
                <div className="opportunity-metrics">
                  <div className="metric-row">
                    <span>Required Capital:</span>
                    <span>{opportunity.requiredCapital}</span>
                  </div>
                  <div className="metric-row">
                    <span>Success Rate:</span>
                    <span className="success-rate">{opportunity.successProbability}</span>
                  </div>
                  <div className="metric-row">
                    <span>Time Window:</span>
                    <span>{opportunity.timeWindow}</span>
                  </div>
                  <div className="metric-row">
                    <span>Gas Cost:</span>
                    <span>{opportunity.gasEstimate}</span>
                  </div>
                </div>

                <button 
                  className="flash-execute-btn"
                  onClick={() => handleFlashLoan(opportunity)}
                >
                  ⚡ Execute Flash Loan
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Collateral Loans Section */}
      {activeTab === 'collateral-loans' && (
        <div className="collateral-section">
          <div className="collateral-header">
            <h3>🏛️ NFT Collateral Loans</h3>
            <p>Use your NFTs as collateral to borrow against their value</p>
          </div>

          <div className="collateral-interface">
            <div className="collateral-selection">
              <h4>Select NFT Collateral</h4>
              <div className="nft-collateral-grid">
                {userNFTs.map(nft => (
                  <div 
                    key={nft.id} 
                    className={`collateral-nft ${selectedCollateral?.id === nft.id ? 'selected' : ''}`}
                    onClick={() => setSelectedCollateral(nft)}
                  >
                    <div className="nft-info">
                      <h5>{nft.name}</h5>
                      <p>{nft.collection}</p>
                    </div>
                    <div className="nft-metrics">
                      <div className="metric">
                        <span>Value: {nft.estimatedValue}</span>
                      </div>
                      <div className="metric">
                        <span>Max Loan: {nft.maxLoanValue}</span>
                      </div>
                      <div className="risk-score">{nft.riskScore}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedCollateral && (
              <div className="loan-configurator">
                <h4>Loan Configuration</h4>
                <div className="loan-form">
                  <div className="form-group">
                    <label>Loan Amount (ETH)</label>
                    <input 
                      type="number" 
                      value={loanDetails.amount}
                      onChange={(e) => setLoanDetails({...loanDetails, amount: e.target.value})}
                      placeholder={`Max: ${selectedCollateral.maxLoanValue}`}
                    />
                  </div>
                  <div className="form-group">
                    <label>Duration (Days)</label>
                    <select 
                      value={loanDetails.duration}
                      onChange={(e) => setLoanDetails({...loanDetails, duration: e.target.value})}
                    >
                      <option value="7">7 Days</option>
                      <option value="14">14 Days</option>
                      <option value="30">30 Days</option>
                      <option value="60">60 Days</option>
                      <option value="90">90 Days</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Interest Rate</label>
                    <span className="rate-display">{loanDetails.interestRate}% APR</span>
                  </div>

                  <div className="loan-summary">
                    <div className="summary-row">
                      <span>Collateral:</span>
                      <span>{selectedCollateral.name}</span>
                    </div>
                    <div className="summary-row">
                      <span>Loan Amount:</span>
                      <span>{loanDetails.amount} ETH</span>
                    </div>
                    <div className="summary-row">
                      <span>Total Repayment:</span>
                      <span>{(parseFloat(loanDetails.amount || 0) * (1 + parseFloat(loanDetails.interestRate) / 100 * parseFloat(loanDetails.duration) / 365)).toFixed(4)} ETH</span>
                    </div>
                  </div>

                  <button 
                    className="request-loan-btn"
                    onClick={handleCollateralLoan}
                    disabled={!loanDetails.amount}
                  >
                    Request Loan
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Liquidity Pools Section */}
      {activeTab === 'liquidity-pools' && (
        <div className="liquidity-section">
          <div className="liquidity-header">
            <h3>💧 NFT Liquidity Pools</h3>
            <p>Provide liquidity for instant NFT rentals and earn fees</p>
          </div>

          <div className="pool-overview">
            <div className="overview-stat">
              <span className="stat-number">$45.2M</span>
              <span className="stat-label">Total Value Locked</span>
            </div>
            <div className="overview-stat">
              <span className="stat-number">156</span>
              <span className="stat-label">Active Pools</span>
            </div>
            <div className="overview-stat">
              <span className="stat-number">23.4%</span>
              <span className="stat-label">Avg Pool APY</span>
            </div>
          </div>

          <div className="liquidity-actions">
            <button className="liquidity-btn primary">
              Create New Pool
            </button>
            <button className="liquidity-btn secondary">
              Browse All Pools
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdvancedNFTFi