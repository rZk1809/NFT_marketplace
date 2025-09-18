import React, { useState, useEffect } from 'react'
import './AdvancedDynamicNFT.css'

const AdvancedDynamicNFT = ({ userStats, setUserStats }) => {
  const [activeTab, setActiveTab] = useState('dynamic-nfts')
  const [selectedNFT, setSelectedNFT] = useState(null)
  const [aiPredictions, setAiPredictions] = useState([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // Mock dynamic NFT data
  const dynamicNFTs = [
    {
      id: 1,
      name: 'Evolving Digital Avatar #7834',
      collection: 'MetaMorph Beings',
      currentLevel: 15,
      maxLevel: 50,
      evolutionStage: 'Advanced',
      traits: {
        strength: 85,
        intelligence: 92,
        charisma: 78,
        agility: 88
      },
      dynamicProperties: {
        experience: 15420,
        battlesWon: 127,
        questsCompleted: 89,
        socialInteractions: 234
      },
      metadata: {
        lastUpdate: '2024-01-15 14:30:22',
        updateFrequency: 'Real-time',
        dataSource: 'Gaming API + Social Feed',
        triggers: ['Game Achievement', 'Social Milestone', 'Time Decay']
      },
      visualChanges: [
        { trigger: 'Level 10', change: 'Glowing Eyes Unlocked' },
        { trigger: 'Level 15', change: 'Ethereal Aura Added' },
        { trigger: '100+ Battles', change: 'Battle Scars Appearance' },
        { trigger: '200+ Social', change: 'Crown of Influence' }
      ],
      currentValue: '8.7 ETH',
      valueTrend: '+15.2%',
      rentalDemand: 'Very High'
    },
    {
      id: 2,
      name: 'Smart Contract Land #456',
      collection: 'Programmable Estates',
      currentLevel: 8,
      maxLevel: 20,
      evolutionStage: 'Developing',
      traits: {
        fertility: 78,
        accessibility: 95,
        development: 67,
        community: 84
      },
      dynamicProperties: {
        visitors: 2847,
        events_hosted: 23,
        revenue_generated: '12.4 ETH',
        buildings_constructed: 15
      },
      metadata: {
        lastUpdate: '2024-01-15 09:15:10',
        updateFrequency: 'Every 6 hours',
        dataSource: 'Metaverse Analytics',
        triggers: ['Visitor Milestone', 'Revenue Threshold', 'Event Success']
      },
      visualChanges: [
        { trigger: '1000+ Visitors', change: 'Popular District Badge' },
        { trigger: '10 ETH Revenue', change: 'Golden Border Upgrade' },
        { trigger: '20+ Events', change: 'Event Hub Designation' }
      ],
      currentValue: '15.3 ETH',
      valueTrend: '+8.7%',
      rentalDemand: 'High'
    },
    {
      id: 3,
      name: 'AI Music Generator #999',
      collection: 'Sonic Algorithms',
      currentLevel: 12,
      maxLevel: 30,
      evolutionStage: 'Learning',
      traits: {
        creativity: 89,
        technical_skill: 94,
        popularity: 71,
        originality: 96
      },
      dynamicProperties: {
        tracks_generated: 1247,
        streams: 45632,
        collaborations: 34,
        algorithm_updates: 67
      },
      metadata: {
        lastUpdate: '2024-01-15 16:45:33',
        updateFrequency: 'Continuous',
        dataSource: 'Music Streaming APIs',
        triggers: ['Stream Milestones', 'Collaboration Events', 'AI Learning']
      },
      visualChanges: [
        { trigger: '1000+ Tracks', change: 'Composer Aura Unlocked' },
        { trigger: '40K+ Streams', change: 'Viral Sound Waves' },
        { trigger: '30+ Collabs', change: 'Network Node Visualization' }
      ],
      currentValue: '4.2 ETH',
      valueTrend: '+22.1%',
      rentalDemand: 'Medium'
    }
  ]

  // AI Pricing Engine Data
  const pricingFactors = [
    {
      factor: 'Market Sentiment',
      weight: 25,
      current_value: 'Bullish',
      impact: '+12%',
      confidence: 87,
      description: 'Overall market sentiment for dynamic NFTs'
    },
    {
      factor: 'Usage Analytics',
      weight: 30,
      current_value: 'High Activity',
      impact: '+18%',
      confidence: 92,
      description: 'On-chain usage and interaction frequency'
    },
    {
      factor: 'Rarity Evolution',
      weight: 20,
      current_value: 'Ascending',
      impact: '+15%',
      confidence: 78,
      description: 'How trait combinations affect rarity over time'
    },
    {
      factor: 'Social Influence',
      weight: 15,
      current_value: 'Growing',
      impact: '+8%',
      confidence: 81,
      description: 'Social media mentions and influencer activity'
    },
    {
      factor: 'Utility Expansion',
      weight: 10,
      current_value: 'Strong',
      impact: '+5%',
      confidence: 95,
      description: 'New use cases and platform integrations'
    }
  ]

  // Programmable Asset Templates
  const programmableTemplates = [
    {
      id: 1,
      name: 'Experience-Based Evolution',
      description: 'NFT evolves based on user interactions and achievements',
      triggers: ['XP Milestones', 'Achievement Unlocks', 'Time Progression'],
      use_cases: ['Gaming', 'Education', 'Professional Development'],
      complexity: 'Medium',
      gas_cost: '0.05 ETH'
    },
    {
      id: 2,
      name: 'Market-Responsive Pricing',
      description: 'Rental price adjusts automatically based on demand and supply',
      triggers: ['Market Conditions', 'Demand Spikes', 'Competition Analysis'],
      use_cases: ['Rental Optimization', 'Revenue Maximization'],
      complexity: 'High',
      gas_cost: '0.08 ETH'
    },
    {
      id: 3,
      name: 'Social Reputation System',
      description: 'NFT properties change based on owner reputation and social metrics',
      triggers: ['Reputation Score', 'Social Engagement', 'Community Standing'],
      use_cases: ['Profile Enhancement', 'Trust Building', 'Social Proof'],
      complexity: 'Medium',
      gas_cost: '0.06 ETH'
    },
    {
      id: 4,
      name: 'Environmental Adaptation',
      description: 'NFT adapts to different metaverse environments and platforms',
      triggers: ['Platform Detection', 'Environment Rules', 'Context Awareness'],
      use_cases: ['Cross-Platform Gaming', 'Metaverse Navigation'],
      complexity: 'High',
      gas_cost: '0.12 ETH'
    }
  ]

  // AI Analysis Results
  const aiAnalysisResults = [
    {
      nft_id: 1,
      analysis: 'High Growth Potential',
      predicted_value: '12.4 ETH',
      confidence: 89,
      time_frame: '30 days',
      key_insights: [
        'Strong gaming integration driving demand',
        'Social features creating network effects',
        'Rarity increasing with each evolution'
      ],
      recommendations: [
        'Consider long-term holding for evolution benefits',
        'Rent during peak gaming seasons',
        'Monitor social engagement metrics'
      ]
    }
  ]

  const handleAnalyzeNFT = (nft) => {
    setIsAnalyzing(true)
    setSelectedNFT(nft)
    
    // Simulate AI analysis
    setTimeout(() => {
      setAiPredictions([
        {
          type: 'Price Prediction',
          value: `${(parseFloat(nft.currentValue) * 1.25).toFixed(1)} ETH`,
          confidence: Math.floor(Math.random() * 20 + 80),
          timeframe: '30 days'
        },
        {
          type: 'Evolution Forecast',
          value: `Level ${nft.currentLevel + Math.floor(Math.random() * 3 + 2)}`,
          confidence: Math.floor(Math.random() * 15 + 85),
          timeframe: '14 days'
        },
        {
          type: 'Rental Demand',
          value: 'Increasing',
          confidence: Math.floor(Math.random() * 10 + 90),
          timeframe: '7 days'
        }
      ])
      setIsAnalyzing(false)
    }, 3000)
  }

  const handleCreateProgrammableAsset = (template) => {
    alert(`Creating programmable NFT with ${template.name} template. Gas cost: ${template.gas_cost}`)
    // In real implementation, this would deploy a smart contract
  }

  return (
    <div className="advanced-dynamic-nft">
      <div className="dynamic-header">
        <h2>🤖 Dynamic NFT & AI Engine</h2>
        <p>Programmable assets with intelligent evolution and pricing</p>
      </div>

      <div className="dynamic-tabs">
        <button 
          className={`dynamic-tab ${activeTab === 'dynamic-nfts' ? 'active' : ''}`}
          onClick={() => setActiveTab('dynamic-nfts')}
        >
          Dynamic NFTs
        </button>
        <button 
          className={`dynamic-tab ${activeTab === 'ai-pricing' ? 'active' : ''}`}
          onClick={() => setActiveTab('ai-pricing')}
        >
          AI Pricing Engine
        </button>
        <button 
          className={`dynamic-tab ${activeTab === 'programmable' ? 'active' : ''}`}
          onClick={() => setActiveTab('programmable')}
        >
          Programmable Assets
        </button>
        <button 
          className={`dynamic-tab ${activeTab === 'ai-analysis' ? 'active' : ''}`}
          onClick={() => setActiveTab('ai-analysis')}
        >
          AI Analysis
        </button>
      </div>

      {/* Dynamic NFTs Tab */}
      {activeTab === 'dynamic-nfts' && (
        <div className="dynamic-nfts-section">
          <div className="section-header">
            <h3>🔄 Your Dynamic NFT Collection</h3>
            <p>NFTs that evolve and change based on real-world data</p>
          </div>

          <div className="dynamic-nfts-grid">
            {dynamicNFTs.map(nft => (
              <div key={nft.id} className="dynamic-nft-card">
                <div className="nft-header">
                  <div className="nft-basic-info">
                    <h4>{nft.name}</h4>
                    <p>{nft.collection}</p>
                  </div>
                  <div className="evolution-badge">
                    Level {nft.currentLevel}/{nft.maxLevel}
                  </div>
                </div>

                <div className="evolution-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${(nft.currentLevel / nft.maxLevel) * 100}%` }}
                    ></div>
                  </div>
                  <span className="evolution-stage">{nft.evolutionStage}</span>
                </div>

                <div className="traits-section">
                  <h5>Dynamic Traits</h5>
                  <div className="traits-grid">
                    {Object.entries(nft.traits).map(([trait, value]) => (
                      <div key={trait} className="trait-item">
                        <span className="trait-name">{trait}</span>
                        <div className="trait-bar">
                          <div 
                            className="trait-fill"
                            style={{ width: `${value}%` }}
                          ></div>
                        </div>
                        <span className="trait-value">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="dynamic-properties">
                  <h5>Live Properties</h5>
                  <div className="properties-grid">
                    {Object.entries(nft.dynamicProperties).map(([prop, value]) => (
                      <div key={prop} className="property-item">
                        <span className="property-name">{prop.replace(/_/g, ' ')}</span>
                        <span className="property-value">{value.toLocaleString?.() || value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="visual-changes">
                  <h5>Evolution History</h5>
                  <div className="changes-list">
                    {nft.visualChanges.map((change, index) => (
                      <div key={index} className="change-item">
                        <span className="change-trigger">{change.trigger}</span>
                        <span className="change-description">{change.change}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="nft-value-section">
                  <div className="value-info">
                    <span className="current-value">{nft.currentValue}</span>
                    <span className={`value-trend ${nft.valueTrend.includes('+') ? 'positive' : 'negative'}`}>
                      {nft.valueTrend}
                    </span>
                  </div>
                  <div className="rental-demand">
                    Rental Demand: <span className="demand-level">{nft.rentalDemand}</span>
                  </div>
                </div>

                <button 
                  className="analyze-btn"
                  onClick={() => handleAnalyzeNFT(nft)}
                >
                  🧠 AI Analysis
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Pricing Engine Tab */}
      {activeTab === 'ai-pricing' && (
        <div className="ai-pricing-section">
          <div className="pricing-header">
            <h3>🧠 AI-Powered Pricing Engine</h3>
            <p>Real-time price optimization using machine learning</p>
          </div>

          <div className="pricing-overview">
            <div className="pricing-stats">
              <div className="stat-card">
                <span className="stat-number">94.7%</span>
                <span className="stat-label">Accuracy Rate</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">1,247</span>
                <span className="stat-label">Assets Analyzed</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">+18.5%</span>
                <span className="stat-label">Avg Revenue Increase</span>
              </div>
            </div>
          </div>

          <div className="pricing-factors">
            <h4>Pricing Factors Analysis</h4>
            <div className="factors-grid">
              {pricingFactors.map((factor, index) => (
                <div key={index} className="factor-card">
                  <div className="factor-header">
                    <h5>{factor.factor}</h5>
                    <span className="weight-badge">{factor.weight}% Weight</span>
                  </div>
                  
                  <div className="factor-metrics">
                    <div className="metric-row">
                      <span>Current Value:</span>
                      <span className="metric-value">{factor.current_value}</span>
                    </div>
                    <div className="metric-row">
                      <span>Price Impact:</span>
                      <span className={`metric-value ${factor.impact.includes('+') ? 'positive' : 'negative'}`}>
                        {factor.impact}
                      </span>
                    </div>
                    <div className="metric-row">
                      <span>Confidence:</span>
                      <span className="metric-value">{factor.confidence}%</span>
                    </div>
                  </div>

                  <div className="confidence-bar">
                    <div 
                      className="confidence-fill"
                      style={{ width: `${factor.confidence}%` }}
                    ></div>
                  </div>

                  <p className="factor-description">{factor.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="pricing-controls">
            <h4>Dynamic Pricing Settings</h4>
            <div className="controls-grid">
              <div className="control-group">
                <label>Price Update Frequency</label>
                <select>
                  <option>Real-time</option>
                  <option>Every Hour</option>
                  <option>Every 6 Hours</option>
                  <option>Daily</option>
                </select>
              </div>
              <div className="control-group">
                <label>Maximum Price Change</label>
                <input type="range" min="1" max="50" defaultValue="20" />
                <span>±20%</span>
              </div>
              <div className="control-group">
                <label>Market Response Sensitivity</label>
                <select>
                  <option>Conservative</option>
                  <option>Balanced</option>
                  <option>Aggressive</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Programmable Assets Tab */}
      {activeTab === 'programmable' && (
        <div className="programmable-section">
          <div className="programmable-header">
            <h3>⚙️ Create Programmable Assets</h3>
            <p>Deploy smart contracts with custom logic and behavior</p>
          </div>

          <div className="templates-grid">
            {programmableTemplates.map(template => (
              <div key={template.id} className="template-card">
                <div className="template-header">
                  <h4>{template.name}</h4>
                  <div className={`complexity-badge ${template.complexity.toLowerCase()}`}>
                    {template.complexity}
                  </div>
                </div>

                <p className="template-description">{template.description}</p>

                <div className="template-details">
                  <div className="detail-section">
                    <h5>Triggers</h5>
                    <div className="triggers-list">
                      {template.triggers.map((trigger, index) => (
                        <span key={index} className="trigger-tag">{trigger}</span>
                      ))}
                    </div>
                  </div>

                  <div className="detail-section">
                    <h5>Use Cases</h5>
                    <div className="use-cases-list">
                      {template.use_cases.map((useCase, index) => (
                        <span key={index} className="use-case-tag">{useCase}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="template-footer">
                  <div className="gas-cost">
                    <span>Deployment Cost: {template.gas_cost}</span>
                  </div>
                  <button 
                    className="create-asset-btn"
                    onClick={() => handleCreateProgrammableAsset(template)}
                  >
                    Deploy Contract
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="custom-template">
            <h4>Create Custom Template</h4>
            <div className="custom-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Template Name</label>
                  <input type="text" placeholder="My Custom NFT Logic" />
                </div>
                <div className="form-group">
                  <label>Complexity Level</label>
                  <select>
                    <option>Simple</option>
                    <option>Medium</option>
                    <option>Advanced</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea placeholder="Describe how your NFT will behave and evolve"></textarea>
              </div>
              <button className="create-custom-btn">Create Custom Template</button>
            </div>
          </div>
        </div>
      )}

      {/* AI Analysis Tab */}
      {activeTab === 'ai-analysis' && (
        <div className="ai-analysis-section">
          <div className="analysis-header">
            <h3>🔍 Advanced AI Analysis</h3>
            <p>Deep learning insights for your NFT portfolio</p>
          </div>

          {selectedNFT && (
            <div className="selected-nft-analysis">
              <h4>Analyzing: {selectedNFT.name}</h4>
              
              {isAnalyzing ? (
                <div className="analysis-loading">
                  <div className="ai-spinner"></div>
                  <p>AI is analyzing market patterns, usage data, and evolution trends...</p>
                </div>
              ) : (
                <div className="analysis-results">
                  <div className="predictions-grid">
                    {aiPredictions.map((prediction, index) => (
                      <div key={index} className="prediction-card">
                        <h5>{prediction.type}</h5>
                        <div className="prediction-value">{prediction.value}</div>
                        <div className="confidence-meter">
                          <span>Confidence: {prediction.confidence}%</span>
                          <div className="confidence-bar">
                            <div 
                              className="confidence-fill"
                              style={{ width: `${prediction.confidence}%` }}
                            ></div>
                          </div>
                        </div>
                        <span className="timeframe">Timeframe: {prediction.timeframe}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="analysis-tools">
            <h4>AI Analysis Tools</h4>
            <div className="tools-grid">
              <div className="tool-card">
                <h5>🎯 Portfolio Optimizer</h5>
                <p>AI-powered recommendations for your NFT portfolio</p>
                <button className="tool-btn">Run Analysis</button>
              </div>
              <div className="tool-card">
                <h5>📈 Market Predictor</h5>
                <p>Predict market movements using deep learning</p>
                <button className="tool-btn">Generate Forecast</button>
              </div>
              <div className="tool-card">
                <h5>🔄 Evolution Simulator</h5>
                <p>Simulate NFT evolution paths and outcomes</p>
                <button className="tool-btn">Start Simulation</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdvancedDynamicNFT