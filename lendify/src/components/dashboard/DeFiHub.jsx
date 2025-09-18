import React, { useState } from 'react'
import './DeFiHub.css'

const DeFiHub = ({ userStats, setUserStats }) => {
  const [activeTab, setActiveTab] = useState('lending')

  const lendingPools = [
    {
      id: 1,
      name: 'High-Value NFT Pool',
      tvl: '234.5 ETH',
      apy: '12.5%',
      minDeposit: '0.1 ETH',
      totalDeposits: 150,
      description: 'Lend against premium NFT collections'
    },
    {
      id: 2,
      name: 'Gaming Assets Pool',
      tvl: '87.3 ETH',
      apy: '15.2%',
      minDeposit: '0.05 ETH',
      totalDeposits: 89,
      description: 'Specialized pool for gaming NFTs'
    },
    {
      id: 3,
      name: 'Metaverse Land Pool',
      tvl: '456.7 ETH',
      apy: '9.8%',
      minDeposit: '0.5 ETH',
      totalDeposits: 45,
      description: 'Real estate in virtual worlds'
    }
  ]

  return (
    <div className="defi-hub">
      <div className="hub-header">
        <h2>DeFi Hub</h2>
        <p>Peer-to-Peer NFT Lending • Flash Loans • Liquidity Pools</p>
      </div>

      <div className="defi-tabs">
        <button 
          className={`defi-tab ${activeTab === 'lending' ? 'active' : ''}`}
          onClick={() => setActiveTab('lending')}
        >
          P2P Lending
        </button>
        <button 
          className={`defi-tab ${activeTab === 'flash' ? 'active' : ''}`}
          onClick={() => setActiveTab('flash')}
        >
          Flash Loans
        </button>
        <button 
          className={`defi-tab ${activeTab === 'pools' ? 'active' : ''}`}
          onClick={() => setActiveTab('pools')}
        >
          Liquidity Pools
        </button>
        <button 
          className={`defi-tab ${activeTab === 'collateral' ? 'active' : ''}`}
          onClick={() => setActiveTab('collateral')}
        >
          NFT Collateral
        </button>
      </div>

      {activeTab === 'lending' && (
        <div className="lending-section">
          <div className="lending-stats">
            <div className="stat-card">
              <span className="stat-number">$2.4M</span>
              <span className="stat-label">Total Lent</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">432</span>
              <span className="stat-label">Active Loans</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">13.2%</span>
              <span className="stat-label">Avg APY</span>
            </div>
          </div>

          <div className="lending-pools">
            <h3>Available Lending Pools</h3>
            <div className="pools-grid">
              {lendingPools.map(pool => (
                <div key={pool.id} className="pool-card">
                  <div className="pool-header">
                    <h4>{pool.name}</h4>
                    <span className="apy">{pool.apy} APY</span>
                  </div>
                  <p className="pool-description">{pool.description}</p>
                  <div className="pool-stats">
                    <div className="pool-stat">
                      <span className="label">TVL</span>
                      <span className="value">{pool.tvl}</span>
                    </div>
                    <div className="pool-stat">
                      <span className="label">Min Deposit</span>
                      <span className="value">{pool.minDeposit}</span>
                    </div>
                  </div>
                  <button className="deposit-btn">Deposit & Earn</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'flash' && (
        <div className="flash-loans-section">
          <div className="flash-info">
            <h3>⚡ Flash Loans & Automated Yield</h3>
            <p>Instant liquidity for NFT rentals + automated yield farming integration</p>
          </div>
          
          <div className="flash-advanced-grid">
            {/* Flash Loan Interface */}
            <div className="flash-form advanced-card">
              <h4>🚀 Flash Rent</h4>
              <div className="form-group">
                <label>NFT to Rent</label>
                <select>
                  <option>Bored Ape #1234 (0.5 ETH)</option>
                  <option>CryptoPunk #5678 (1.2 ETH)</option>
                  <option>Azuki #9012 (0.3 ETH)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Rental Duration</label>
                <select>
                  <option>1 Block (Instant)</option>
                  <option>1 Hour</option>
                  <option>1 Day</option>
                </select>
              </div>
              <div className="form-group">
                <label>Flash Loan Purpose</label>
                <select>
                  <option>Gaming Tournament</option>
                  <option>Metaverse Event</option>
                  <option>Arbitrage Opportunity</option>
                  <option>Social Profile Flex</option>
                </select>
              </div>
              <div className="flash-calculation">
                <div className="calc-row">
                  <span>NFT Rental Cost:</span>
                  <span>0.5 ETH</span>
                </div>
                <div className="calc-row">
                  <span>Flash Loan Fee (0.09%):</span>
                  <span>0.00045 ETH</span>
                </div>
                <div className="calc-row">
                  <span>Gas Estimate:</span>
                  <span>0.005 ETH</span>
                </div>
                <div className="calc-row total">
                  <span>Total Cost:</span>
                  <span>0.50545 ETH</span>
                </div>
              </div>
              <button className="flash-btn">⚡ Execute Flash Rent</button>
            </div>
            
            {/* Automated Yield Farming */}
            <div className="yield-farming-card advanced-card">
              <h4>🌾 Auto-Yield Farming</h4>
              <p className="yield-description">
                Automatically reinvest your rental earnings into DeFi protocols
              </p>
              
              <div className="yield-options">
                <div className="yield-option">
                  <div className="yield-header">
                    <span className="protocol-name">🦄 Uniswap V3</span>
                    <span className="apy">24.5% APY</span>
                  </div>
                  <div className="yield-details">
                    <small>ETH/USDC Liquidity Pool</small>
                  </div>
                </div>
                
                <div className="yield-option">
                  <div className="yield-header">
                    <span className="protocol-name">🏺 Aave</span>
                    <span className="apy">8.2% APY</span>
                  </div>
                  <div className="yield-details">
                    <small>Stable lending with aUSDC</small>
                  </div>
                </div>
                
                <div className="yield-option">
                  <div className="yield-header">
                    <span className="protocol-name">⚡ Compound</span>
                    <span className="apy">12.8% APY</span>
                  </div>
                  <div className="yield-details">
                    <small>Automated compounding</small>
                  </div>
                </div>
              </div>
              
              <div className="auto-settings">
                <label>
                  <input type="checkbox" /> Auto-invest 50% of rental income
                </label>
                <label>
                  <input type="checkbox" /> Compound rewards weekly
                </label>
                <label>
                  <input type="checkbox" /> Rebalance portfolio monthly
                </label>
              </div>
              
              <button className="yield-btn">🚀 Enable Auto-Yield</button>
            </div>
          </div>
          
          {/* Active Flash Loans */}
          <div className="active-flash-loans">
            <h4>📊 Your Active Flash Operations</h4>
            <div className="flash-loans-grid">
              <div className="flash-loan-item">
                <div className="flash-loan-header">
                  <span className="nft-name">Bored Ape #1234</span>
                  <span className="status active">Active</span>
                </div>
                <div className="flash-loan-details">
                  <div className="detail-row">
                    <span>Borrowed:</span>
                    <span>0.5 ETH</span>
                  </div>
                  <div className="detail-row">
                    <span>Expires in:</span>
                    <span>45 minutes</span>
                  </div>
                  <div className="detail-row">
                    <span>Profit so far:</span>
                    <span className="profit">+0.12 ETH</span>
                  </div>
                </div>
                <button className="repay-btn">Repay Early</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'pools' && (
        <div className="pools-section">
          <h3>💧 Liquidity Pools</h3>
          <p>Provide liquidity and earn fees from trading</p>
          
          <div className="pool-options">
            <div className="pool-option">
              <h4>ETH/LEND Pool</h4>
              <p>APY: 24.5%</p>
              <button className="add-liquidity-btn">Add Liquidity</button>
            </div>
            <div className="pool-option">
              <h4>NFT Fraction Pool</h4>
              <p>APY: 18.3%</p>
              <button className="add-liquidity-btn">Add Liquidity</button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'collateral' && (
        <div className="collateral-section">
          <h3>🏦 Advanced NFT Collateral Finance</h3>
          <p>Multi-protocol lending with AI-powered risk assessment & liquidation protection</p>
          
          <div className="collateral-advanced-grid">
            {/* NFT Selection with AI Valuation */}
            <div className="nft-collateral-card advanced-card">
              <h4>🗖️ Select Collateral NFT</h4>
              
              <div className="nft-grid-small">
                <div className="collateral-nft-item selected">
                  <div className="nft-preview">
                    <div className="nft-image-placeholder bape">BAYC #1234</div>
                  </div>
                  <div className="nft-valuation">
                    <div className="value-row">
                      <span>AI Valuation:</span>
                      <span className="value">25.5 ETH</span>
                    </div>
                    <div className="value-row">
                      <span>Floor Price:</span>
                      <span className="value">22.1 ETH</span>
                    </div>
                    <div className="value-row">
                      <span>Volatility:</span>
                      <span className="volatility medium">Medium</span>
                    </div>
                    <div className="ai-confidence">
                      <span>AI Confidence: 94%</span>
                      <div className="confidence-bar">
                        <div className="confidence-fill" style={{width: '94%'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="collateral-nft-item">
                  <div className="nft-preview">
                    <div className="nft-image-placeholder punk">Punk #5678</div>
                  </div>
                  <div className="nft-valuation">
                    <div className="value-row">
                      <span>AI Valuation:</span>
                      <span className="value">45.2 ETH</span>
                    </div>
                    <div className="value-row">
                      <span>Floor Price:</span>
                      <span className="value">43.8 ETH</span>
                    </div>
                    <div className="value-row">
                      <span>Volatility:</span>
                      <span className="volatility low">Low</span>
                    </div>
                    <div className="ai-confidence">
                      <span>AI Confidence: 98%</span>
                      <div className="confidence-bar">
                        <div className="confidence-fill" style={{width: '98%'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Multi-Protocol Lending */}
            <div className="lending-protocols-card advanced-card">
              <h4>🏦 Choose Lending Protocol</h4>
              
              <div className="protocol-options">
                <div className="protocol-option selected">
                  <div className="protocol-header">
                    <span className="protocol-logo">🏺</span>
                    <div className="protocol-info">
                      <span className="protocol-name">Aave</span>
                      <span className="protocol-tvl">$12.4B TVL</span>
                    </div>
                    <span className="best-rate">Best Rate</span>
                  </div>
                  <div className="protocol-terms">
                    <div className="term-row">
                      <span>Max LTV:</span>
                      <span>75%</span>
                    </div>
                    <div className="term-row">
                      <span>Interest Rate:</span>
                      <span className="rate">6.8% APR</span>
                    </div>
                    <div className="term-row">
                      <span>Liquidation Threshold:</span>
                      <span>80%</span>
                    </div>
                  </div>
                </div>
                
                <div className="protocol-option">
                  <div className="protocol-header">
                    <span className="protocol-logo">⚡</span>
                    <div className="protocol-info">
                      <span className="protocol-name">Compound</span>
                      <span className="protocol-tvl">$3.2B TVL</span>
                    </div>
                  </div>
                  <div className="protocol-terms">
                    <div className="term-row">
                      <span>Max LTV:</span>
                      <span>70%</span>
                    </div>
                    <div className="term-row">
                      <span>Interest Rate:</span>
                      <span className="rate">7.2% APR</span>
                    </div>
                    <div className="term-row">
                      <span>Liquidation Threshold:</span>
                      <span>75%</span>
                    </div>
                  </div>
                </div>
                
                <div className="protocol-option">
                  <div className="protocol-header">
                    <span className="protocol-logo">🔥</span>
                    <div className="protocol-info">
                      <span className="protocol-name">BendDAO</span>
                      <span className="protocol-tvl">$892M TVL</span>
                    </div>
                    <span className="nft-specialist">NFT Specialist</span>
                  </div>
                  <div className="protocol-terms">
                    <div className="term-row">
                      <span>Max LTV:</span>
                      <span>80%</span>
                    </div>
                    <div className="term-row">
                      <span>Interest Rate:</span>
                      <span className="rate">8.5% APR</span>
                    </div>
                    <div className="term-row">
                      <span>Liquidation Threshold:</span>
                      <span>85%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Loan Configuration */}
          <div className="loan-configuration advanced-card">
            <h4>⚙️ Loan Configuration & Risk Analysis</h4>
            
            <div className="config-grid">
              <div className="loan-amount-section">
                <label>Loan Amount</label>
                <div className="amount-input-group">
                  <input type="number" placeholder="15.3" className="amount-input" />
                  <span className="currency">ETH</span>
                  <div className="max-btn">MAX</div>
                </div>
                <div className="amount-info">
                  <span>Max: 19.1 ETH (75% LTV)</span>
                </div>
              </div>
              
              <div className="loan-term-section">
                <label>Loan Duration</label>
                <select className="term-select">
                  <option>30 days</option>
                  <option>60 days</option>
                  <option>90 days</option>
                  <option>180 days</option>
                  <option>365 days</option>
                </select>
              </div>
            </div>
            
            <div className="risk-analysis">
              <h5>🚨 Risk Analysis & Liquidation Protection</h5>
              
              <div className="risk-metrics">
                <div className="risk-metric">
                  <div className="metric-header">
                    <span>Liquidation Risk</span>
                    <span className="risk-level low">Low</span>
                  </div>
                  <div className="risk-bar">
                    <div className="risk-fill low" style={{width: '25%'}}></div>
                  </div>
                  <small>Current price would need to drop 35% to trigger liquidation</small>
                </div>
                
                <div className="risk-metric">
                  <div className="metric-header">
                    <span>Market Volatility</span>
                    <span className="volatility-level medium">Medium</span>
                  </div>
                  <div className="volatility-chart">
                    <span>30-day volatility: 12.3%</span>
                  </div>
                </div>
              </div>
              
              <div className="protection-options">
                <label className="protection-option">
                  <input type="checkbox" />
                  <div className="option-content">
                    <span className="option-title">🛡️ Auto-Liquidation Protection</span>
                    <span className="option-desc">Automatically add collateral when approaching liquidation (+0.1% fee)</span>
                  </div>
                </label>
                
                <label className="protection-option">
                  <input type="checkbox" />
                  <div className="option-content">
                    <span className="option-title">📱 SMS/Email Alerts</span>
                    <span className="option-desc">Get notified when your position approaches liquidation</span>
                  </div>
                </label>
                
                <label className="protection-option">
                  <input type="checkbox" checked />
                  <div className="option-content">
                    <span className="option-title">🤖 AI Monitoring</span>
                    <span className="option-desc">AI continuously monitors market conditions and suggests actions</span>
                  </div>
                </label>
              </div>
            </div>
            
            <div className="loan-summary">
              <div className="summary-row">
                <span>You will receive:</span>
                <span className="receive-amount">15.3 ETH</span>
              </div>
              <div className="summary-row">
                <span>Monthly interest:</span>
                <span>0.087 ETH</span>
              </div>
              <div className="summary-row">
                <span>Liquidation price:</span>
                <span className="liquidation-price">16.8 ETH</span>
              </div>
              <div className="summary-row">
                <span>Health factor:</span>
                <span className="health-factor good">2.45 (Good)</span>
              </div>
            </div>
            
            <button className="borrow-btn-advanced">🚀 Create Collateralized Loan</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default DeFiHub