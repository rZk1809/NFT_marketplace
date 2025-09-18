import React, { useState, useEffect } from 'react'
import './AdvancedReputationSystem.css'

const AdvancedReputationSystem = ({ userStats, setUserStats }) => {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedCredential, setSelectedCredential] = useState(null)
  const [showCredentialModal, setShowCredentialModal] = useState(false)

  // Mock user reputation data
  const reputationProfile = {
    overallScore: 4.8,
    totalTransactions: 247,
    successRate: 94.3,
    trustScore: 892,
    credibilityRating: 'AAA',
    didAddress: 'did:lendify:0x742d35cc88451456789...',
    verificationLevel: 'KYC Verified',
    memberSince: 'Jan 2023',
    badges: [
      { id: 1, name: 'Early Adopter', earned: 'Jan 2023', rarity: 'Legendary' },
      { id: 2, name: 'Power Lender', earned: 'Mar 2023', rarity: 'Epic' },
      { id: 3, name: 'Community Guardian', earned: 'Jun 2023', rarity: 'Rare' },
      { id: 4, name: 'Flash Loan Expert', earned: 'Aug 2023', rarity: 'Epic' }
    ]
  }

  // Verifiable Credentials
  const verifiableCredentials = [
    {
      id: 1,
      type: 'KYC Verification',
      issuer: 'Civic Identity',
      issueDate: '2023-01-15',
      expiryDate: '2024-01-15',
      status: 'Active',
      credibility: 95,
      schema: 'https://schema.org/KnowYourCustomer',
      claims: {
        identity: 'Verified',
        residence: 'US Citizen',
        ageVerification: '21+',
        sanctions: 'Clear'
      }
    },
    {
      id: 2,
      type: 'Creditworthiness Score',
      issuer: 'DeFi Credit Bureau',
      issueDate: '2023-08-20',
      expiryDate: '2024-02-20',
      status: 'Active',
      credibility: 88,
      schema: 'https://schema.org/CreditScore',
      claims: {
        creditScore: '785',
        riskLevel: 'Low',
        paymentHistory: 'Excellent',
        debtToIncome: '12%'
      }
    },
    {
      id: 3,
      type: 'Gaming Achievement',
      issuer: 'MetaGame Alliance',
      issueDate: '2023-09-10',
      expiryDate: 'Permanent',
      status: 'Active',
      credibility: 76,
      schema: 'https://schema.org/Achievement',
      claims: {
        achievement: 'Tournament Winner',
        game: 'DeFi Warriors',
        rank: 'Grandmaster',
        earnings: '$2,500'
      }
    },
    {
      id: 4,
      type: 'Professional License',
      issuer: 'Digital Asset Bureau',
      issueDate: '2023-07-05',
      expiryDate: '2025-07-05',
      status: 'Active',
      credibility: 92,
      schema: 'https://schema.org/License',
      claims: {
        license: 'Certified DeFi Advisor',
        authority: 'DAB-2023-7845',
        specialization: 'NFT Valuations',
        jurisdiction: 'Global'
      }
    }
  ]

  // Soulbound Tokens (SBTs)
  const soulboundTokens = [
    {
      id: 1,
      name: 'Lendify Genesis Member',
      description: 'First 1000 users of the Lendify protocol',
      mintDate: '2023-01-20',
      traits: {
        memberNumber: '#00247',
        joinDate: 'Genesis',
        platform: 'Lendify',
        transferable: false
      },
      significance: 'Platform Loyalty'
    },
    {
      id: 2,
      name: 'DeFi Summer 2023 Participant',
      description: 'Active participation in DeFi Summer 2023 campaign',
      mintDate: '2023-06-15',
      traits: {
        campaign: 'DeFi Summer 2023',
        participation: 'Active',
        rewards: '2,500 LEND',
        transferable: false
      },
      significance: 'Event Participation'
    },
    {
      id: 3,
      name: 'Cross-Chain Pioneer',
      description: 'First to bridge assets across 5+ chains',
      mintDate: '2023-08-30',
      traits: {
        chainsUsed: '7',
        bridgeVolume: '15.2 ETH',
        firstBridge: 'ETH → Polygon',
        transferable: false
      },
      significance: 'Technical Achievement'
    }
  ]

  // Reputation metrics breakdown
  const reputationMetrics = [
    {
      category: 'Lending History',
      score: 4.9,
      weight: 30,
      details: {
        totalLoans: 45,
        defaultRate: '0%',
        avgLoanSize: '2.3 ETH',
        onTimePayments: '100%'
      }
    },
    {
      category: 'Borrowing Behavior', 
      score: 4.7,
      weight: 25,
      details: {
        totalBorrowed: '89.5 ETH',
        repaymentRate: '98.2%',
        latePayments: 2,
        avgRepayTime: '6.2 days early'
      }
    },
    {
      category: 'NFT Rental Activity',
      score: 4.8,
      weight: 20,
      details: {
        totalRentals: 156,
        damageReports: 0,
        returnedOnTime: '95.5%',
        avgRentalDuration: '5.2 days'
      }
    },
    {
      category: 'Community Engagement',
      score: 4.6,
      weight: 15,
      details: {
        forumPosts: 89,
        helpfulVotes: 234,
        proposalsVoted: 23,
        governanceScore: '78%'
      }
    },
    {
      category: 'Platform Loyalty',
      score: 5.0,
      weight: 10,
      details: {
        membershipLength: '11 months',
        referrals: 8,
        stakingAmount: '1,250 LEND',
        platformUsage: 'Daily'
      }
    }
  ]

  // Privacy preferences
  const [privacySettings, setPrivacySettings] = useState({
    publicProfile: true,
    showTransactionHistory: true,
    showCredentials: false,
    allowDataSharing: true,
    anonymousMode: false
  })

  const handleCredentialVerify = (credential) => {
    alert(`Verifying ${credential.type} from ${credential.issuer}...`)
    // In real implementation, this would verify the credential on-chain
  }

  const handleRevealCredential = (credential) => {
    setSelectedCredential(credential)
    setShowCredentialModal(true)
  }

  const handleMintSBT = (achievement) => {
    alert(`Minting Soulbound Token: ${achievement}`)
    // In real implementation, this would mint an SBT
  }

  const calculateWeightedScore = () => {
    return reputationMetrics.reduce((total, metric) => {
      return total + (metric.score * metric.weight / 100)
    }, 0).toFixed(1)
  }

  return (
    <div className="advanced-reputation">
      <div className="reputation-header">
        <h2>🏅 Advanced Reputation System</h2>
        <p>Decentralized Identity & Verifiable Credentials</p>
      </div>

      <div className="reputation-tabs">
        <button 
          className={`reputation-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Reputation Overview
        </button>
        <button 
          className={`reputation-tab ${activeTab === 'credentials' ? 'active' : ''}`}
          onClick={() => setActiveTab('credentials')}
        >
          Verifiable Credentials
        </button>
        <button 
          className={`reputation-tab ${activeTab === 'soulbound' ? 'active' : ''}`}
          onClick={() => setActiveTab('soulbound')}
        >
          Soulbound Tokens
        </button>
        <button 
          className={`reputation-tab ${activeTab === 'privacy' ? 'active' : ''}`}
          onClick={() => setActiveTab('privacy')}
        >
          Privacy Settings
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="overview-section">
          {/* Main Reputation Card */}
          <div className="reputation-main-card">
            <div className="reputation-score-display">
              <div className="score-circle">
                <span className="score-number">{reputationProfile.overallScore}</span>
                <span className="score-label">/5.0</span>
              </div>
              <div className="score-details">
                <h3>Reputation Score</h3>
                <p className="credibility-rating">{reputationProfile.credibilityRating} Rated</p>
                <div className="did-address">
                  <span>DID: {reputationProfile.didAddress}</span>
                </div>
              </div>
            </div>

            <div className="reputation-stats">
              <div className="stat-item">
                <span className="stat-value">{reputationProfile.totalTransactions}</span>
                <span className="stat-label">Total Transactions</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{reputationProfile.successRate}%</span>
                <span className="stat-label">Success Rate</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{reputationProfile.trustScore}</span>
                <span className="stat-label">Trust Score</span>
              </div>
            </div>
          </div>

          {/* Reputation Breakdown */}
          <div className="reputation-breakdown">
            <h3>Reputation Breakdown</h3>
            <div className="metrics-grid">
              {reputationMetrics.map((metric, index) => (
                <div key={index} className="metric-card">
                  <div className="metric-header">
                    <h4>{metric.category}</h4>
                    <div className="metric-score">
                      <span className="score">{metric.score}</span>
                      <span className="weight">({metric.weight}% weight)</span>
                    </div>
                  </div>
                  
                  <div className="score-bar">
                    <div 
                      className="score-fill"
                      style={{ width: `${(metric.score / 5) * 100}%` }}
                    ></div>
                  </div>

                  <div className="metric-details">
                    {Object.entries(metric.details).map(([key, value]) => (
                      <div key={key} className="detail-row">
                        <span className="detail-key">{key.replace(/([A-Z])/g, ' $1')}:</span>
                        <span className="detail-value">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Achievement Badges */}
          <div className="achievement-badges">
            <h3>Achievement Badges</h3>
            <div className="badges-grid">
              {reputationProfile.badges.map(badge => (
                <div key={badge.id} className={`badge-item ${badge.rarity.toLowerCase()}`}>
                  <div className="badge-icon">🏆</div>
                  <h4>{badge.name}</h4>
                  <p>Earned: {badge.earned}</p>
                  <span className={`rarity-tag ${badge.rarity.toLowerCase()}`}>
                    {badge.rarity}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Verifiable Credentials Tab */}
      {activeTab === 'credentials' && (
        <div className="credentials-section">
          <div className="credentials-header">
            <h3>🎓 Verifiable Credentials</h3>
            <p>Digital credentials issued by trusted authorities</p>
            <button className="add-credential-btn">+ Request New Credential</button>
          </div>

          <div className="credentials-grid">
            {verifiableCredentials.map(credential => (
              <div key={credential.id} className="credential-card">
                <div className="credential-header">
                  <h4>{credential.type}</h4>
                  <div className={`status-badge ${credential.status.toLowerCase()}`}>
                    {credential.status}
                  </div>
                </div>

                <div className="credential-issuer">
                  <span>Issued by: <strong>{credential.issuer}</strong></span>
                </div>

                <div className="credential-dates">
                  <div className="date-item">
                    <span>Issued: {credential.issueDate}</span>
                  </div>
                  <div className="date-item">
                    <span>Expires: {credential.expiryDate}</span>
                  </div>
                </div>

                <div className="credibility-meter">
                  <span>Credibility: {credential.credibility}%</span>
                  <div className="credibility-bar">
                    <div 
                      className="credibility-fill"
                      style={{ width: `${credential.credibility}%` }}
                    ></div>
                  </div>
                </div>

                <div className="credential-claims">
                  <h5>Claims:</h5>
                  {Object.entries(credential.claims).map(([key, value]) => (
                    <div key={key} className="claim-item">
                      <span className="claim-key">{key}:</span>
                      <span className="claim-value">{value}</span>
                    </div>
                  ))}
                </div>

                <div className="credential-actions">
                  <button 
                    className="verify-btn"
                    onClick={() => handleCredentialVerify(credential)}
                  >
                    Verify On-Chain
                  </button>
                  <button 
                    className="reveal-btn"
                    onClick={() => handleRevealCredential(credential)}
                  >
                    Reveal Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Soulbound Tokens Tab */}
      {activeTab === 'soulbound' && (
        <div className="soulbound-section">
          <div className="soulbound-header">
            <h3>🔗 Soulbound Tokens (SBTs)</h3>
            <p>Non-transferable tokens representing your achievements</p>
          </div>

          <div className="sbt-stats">
            <div className="sbt-stat">
              <span className="stat-number">{soulboundTokens.length}</span>
              <span className="stat-label">Total SBTs</span>
            </div>
            <div className="sbt-stat">
              <span className="stat-number">3</span>
              <span className="stat-label">Categories</span>
            </div>
            <div className="sbt-stat">
              <span className="stat-number">100%</span>
              <span className="stat-label">Authenticity</span>
            </div>
          </div>

          <div className="sbt-grid">
            {soulboundTokens.map(sbt => (
              <div key={sbt.id} className="sbt-card">
                <div className="sbt-visual">
                  <div className="sbt-icon">🏅</div>
                  <div className="sbt-chain">⛓️</div>
                </div>

                <div className="sbt-info">
                  <h4>{sbt.name}</h4>
                  <p>{sbt.description}</p>
                  <div className="mint-date">
                    Minted: {sbt.mintDate}
                  </div>
                </div>

                <div className="sbt-traits">
                  <h5>Traits:</h5>
                  {Object.entries(sbt.traits).map(([key, value]) => (
                    <div key={key} className="trait-item">
                      <span className="trait-key">{key}:</span>
                      <span className="trait-value">{value.toString()}</span>
                    </div>
                  ))}
                </div>

                <div className="sbt-significance">
                  <span className="significance-label">Significance:</span>
                  <span className="significance-value">{sbt.significance}</span>
                </div>

                <div className="sbt-footer">
                  <span className="non-transferable">🔒 Non-Transferable</span>
                </div>
              </div>
            ))}
          </div>

          <div className="available-achievements">
            <h3>Available Achievements</h3>
            <div className="achievement-list">
              <div className="achievement-item">
                <span>🎯 Complete 100 rentals</span>
                <button 
                  className="claim-btn"
                  onClick={() => handleMintSBT('Rental Master')}
                >
                  Claim SBT
                </button>
              </div>
              <div className="achievement-item">
                <span>💎 Hold 10+ ETH in protocol</span>
                <button className="claim-btn disabled" disabled>
                  6.2/10 ETH
                </button>
              </div>
              <div className="achievement-item">
                <span>🏛️ Participate in 50 DAO votes</span>
                <button className="claim-btn disabled" disabled>
                  23/50 votes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Settings Tab */}
      {activeTab === 'privacy' && (
        <div className="privacy-section">
          <div className="privacy-header">
            <h3>🔐 Privacy Settings</h3>
            <p>Control what information is shared publicly</p>
          </div>

          <div className="privacy-controls">
            <div className="privacy-group">
              <h4>Profile Visibility</h4>
              {Object.entries(privacySettings).map(([setting, value]) => (
                <div key={setting} className="privacy-control">
                  <div className="control-info">
                    <span className="control-name">
                      {setting.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </span>
                    <span className="control-description">
                      {getPrivacyDescription(setting)}
                    </span>
                  </div>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox"
                      checked={value}
                      onChange={(e) => setPrivacySettings({
                        ...privacySettings,
                        [setting]: e.target.checked
                      })}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              ))}
            </div>

            <div className="privacy-group">
              <h4>Data Control</h4>
              <div className="data-control-actions">
                <button className="privacy-action-btn primary">
                  Export My Data
                </button>
                <button className="privacy-action-btn secondary">
                  Revoke All Permissions
                </button>
                <button className="privacy-action-btn danger">
                  Delete Profile Data
                </button>
              </div>
            </div>

            <div className="privacy-group">
              <h4>Zero-Knowledge Proofs</h4>
              <div className="zk-proof-options">
                <div className="zk-option">
                  <h5>Age Verification</h5>
                  <p>Prove you're over 18 without revealing exact age</p>
                  <button className="zk-btn">Generate ZK Proof</button>
                </div>
                <div className="zk-option">
                  <h5>Income Range</h5>
                  <p>Prove income bracket without revealing exact amount</p>
                  <button className="zk-btn">Generate ZK Proof</button>
                </div>
                <div className="zk-option">
                  <h5>Location Verification</h5>
                  <p>Prove jurisdiction without revealing exact location</p>
                  <button className="zk-btn">Generate ZK Proof</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Credential Detail Modal */}
      {showCredentialModal && selectedCredential && (
        <div className="credential-modal-overlay" onClick={() => setShowCredentialModal(false)}>
          <div className="credential-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Credential Details</h3>
              <button 
                className="close-btn"
                onClick={() => setShowCredentialModal(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-content">
              <div className="credential-full-details">
                <h4>{selectedCredential.type}</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <strong>Issuer:</strong> {selectedCredential.issuer}
                  </div>
                  <div className="detail-item">
                    <strong>Schema:</strong> {selectedCredential.schema}
                  </div>
                  <div className="detail-item">
                    <strong>Issue Date:</strong> {selectedCredential.issueDate}
                  </div>
                  <div className="detail-item">
                    <strong>Expiry:</strong> {selectedCredential.expiryDate}
                  </div>
                </div>
                
                <div className="claims-section">
                  <h5>Verified Claims:</h5>
                  {Object.entries(selectedCredential.claims).map(([key, value]) => (
                    <div key={key} className="claim-detail">
                      <strong>{key}:</strong> {value}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  function getPrivacyDescription(setting) {
    const descriptions = {
      publicProfile: 'Make your reputation profile visible to other users',
      showTransactionHistory: 'Display your lending/borrowing history',
      showCredentials: 'Show your verifiable credentials publicly',
      allowDataSharing: 'Allow aggregated data sharing for research',
      anonymousMode: 'Hide your identity in all public interactions'
    }
    return descriptions[setting] || ''
  }
}

export default AdvancedReputationSystem