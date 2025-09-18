import React, { useState, useEffect } from 'react';
import './AdvancedMetaverseIntegration.css';

const AdvancedMetaverseIntegration = () => {
  const [activeTab, setActiveTab] = useState('gaming');
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [connectedPlatforms, setConnectedPlatforms] = useState([]);
  const [nftAssets, setNFTAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [vrMode, setVrMode] = useState(false);
  const [arMode, setArMode] = useState(false);

  // Mock gaming platforms data
  const gamingPlatforms = [
    {
      id: 'sandbox',
      name: 'The Sandbox',
      icon: '🏝️',
      description: 'Voxel-based gaming metaverse where users can create, own, and monetize gaming experiences.',
      status: 'connected',
      users: '2.3M',
      landParcels: '166,464',
      averageValue: '2.4 ETH',
      integration: {
        nftSupport: true,
        landRental: true,
        gameAssets: true,
        avatarItems: true
      },
      api: {
        endpoint: 'https://api.sandbox.game/v1/',
        authenticated: true,
        rateLimit: '1000/hour'
      }
    },
    {
      id: 'decentraland',
      name: 'Decentraland',
      icon: '🏙️',
      description: 'A virtual reality platform powered by the Ethereum blockchain.',
      status: 'connected',
      users: '800K',
      landParcels: '90,601',
      averageValue: '3.1 ETH',
      integration: {
        nftSupport: true,
        landRental: true,
        gameAssets: true,
        avatarItems: true
      },
      api: {
        endpoint: 'https://api.decentraland.org/v1/',
        authenticated: true,
        rateLimit: '500/hour'
      }
    },
    {
      id: 'axie',
      name: 'Axie Infinity',
      icon: '🐾',
      description: 'Play-to-earn game where players breed, battle, and trade fantasy creatures called Axies.',
      status: 'available',
      users: '2.8M',
      landParcels: '220,356',
      averageValue: '1.8 ETH',
      integration: {
        nftSupport: true,
        landRental: false,
        gameAssets: true,
        avatarItems: false
      },
      api: {
        endpoint: 'https://api.axieinfinity.com/v2/',
        authenticated: false,
        rateLimit: '100/minute'
      }
    },
    {
      id: 'horizon',
      name: 'Horizon Worlds',
      icon: '🌐',
      description: 'Meta\'s social VR platform for building and exploring virtual worlds.',
      status: 'available',
      users: '300K',
      landParcels: 'Unlimited',
      averageValue: 'Free',
      integration: {
        nftSupport: false,
        landRental: false,
        gameAssets: true,
        avatarItems: true
      },
      api: {
        endpoint: 'https://graph.oculus.com/v1/',
        authenticated: true,
        rateLimit: '200/hour'
      }
    },
    {
      id: 'roblox',
      name: 'Roblox',
      icon: '🎮',
      description: 'A global platform where millions of people gather to create, share experiences.',
      status: 'beta',
      users: '58.8M',
      landParcels: 'Unlimited',
      averageValue: 'Robux',
      integration: {
        nftSupport: false,
        landRental: false,
        gameAssets: true,
        avatarItems: true
      },
      api: {
        endpoint: 'https://api.roblox.com/v1/',
        authenticated: true,
        rateLimit: '1200/hour'
      }
    },
    {
      id: 'vrchat',
      name: 'VRChat',
      icon: '👥',
      description: 'Social virtual reality platform with user-generated content and experiences.',
      status: 'available',
      users: '4M',
      landParcels: 'Unlimited',
      averageValue: 'Free',
      integration: {
        nftSupport: false,
        landRental: false,
        gameAssets: true,
        avatarItems: true
      },
      api: {
        endpoint: 'https://api.vrchat.cloud/api/1/',
        authenticated: true,
        rateLimit: '60/minute'
      }
    }
  ];

  // Mock VR/AR devices data
  const vrArDevices = [
    {
      id: 'meta-quest',
      name: 'Meta Quest 2/3',
      type: 'VR',
      icon: '🥽',
      status: 'supported',
      compatibility: 95,
      features: ['Hand Tracking', '6DOF', 'Wireless', 'Eye Tracking']
    },
    {
      id: 'apple-vision',
      name: 'Apple Vision Pro',
      type: 'AR/VR',
      icon: '👓',
      status: 'supported',
      compatibility: 88,
      features: ['Eye Tracking', 'Hand Tracking', 'Spatial Audio', 'Mixed Reality']
    },
    {
      id: 'hololens',
      name: 'Microsoft HoloLens',
      type: 'AR',
      icon: '🔬',
      status: 'beta',
      compatibility: 72,
      features: ['Holographic Display', 'Spatial Mapping', 'Voice Commands']
    },
    {
      id: 'valve-index',
      name: 'Valve Index',
      type: 'VR',
      icon: '🎧',
      status: 'supported',
      compatibility: 90,
      features: ['Finger Tracking', 'High Refresh Rate', 'Precise Tracking']
    },
    {
      id: 'magic-leap',
      name: 'Magic Leap 2',
      type: 'AR',
      icon: '✨',
      status: 'beta',
      compatibility: 68,
      features: ['Spatial Computing', 'Hand Tracking', 'Voice Control']
    }
  ];

  // Mock developer tools data
  const developerTools = [
    {
      id: 'unity-sdk',
      name: 'Unity SDK',
      description: 'Complete SDK for Unity developers to integrate NFT functionality',
      version: '2.1.4',
      downloads: '45.2K',
      rating: 4.8,
      language: 'C#',
      platform: 'Unity Engine',
      features: ['NFT Display', 'Wallet Integration', 'Marketplace API', 'Real-time Updates']
    },
    {
      id: 'unreal-plugin',
      name: 'Unreal Engine Plugin',
      description: 'Blueprint and C++ plugin for Unreal Engine metaverse integration',
      version: '1.8.2',
      downloads: '23.7K',
      rating: 4.6,
      language: 'C++/Blueprint',
      platform: 'Unreal Engine',
      features: ['Blueprint Nodes', 'Asset Streaming', 'VR Support', 'Multiplayer']
    },
    {
      id: 'web-sdk',
      name: 'WebXR SDK',
      description: 'JavaScript SDK for web-based metaverse applications',
      version: '3.2.1',
      downloads: '156.8K',
      rating: 4.9,
      language: 'JavaScript/TypeScript',
      platform: 'Web Browsers',
      features: ['WebXR Support', 'Three.js Integration', 'Mobile AR', 'Progressive Loading']
    },
    {
      id: 'mobile-sdk',
      name: 'Mobile AR SDK',
      description: 'Native mobile SDK for iOS and Android AR applications',
      version: '2.5.0',
      downloads: '78.3K',
      rating: 4.7,
      language: 'Swift/Kotlin',
      platform: 'iOS/Android',
      features: ['ARCore/ARKit', 'Image Tracking', 'Plane Detection', 'Occlusion']
    }
  ];

  // Mock NFT integration data
  const [integratedNFTs, setIntegratedNFTs] = useState([
    {
      id: 'nft-001',
      name: 'Cyberpunk Avatar',
      platform: 'decentraland',
      type: 'Avatar',
      status: 'active',
      usageStats: {
        sessions: 234,
        hours: 89.5,
        interactions: 1567
      },
      integration: {
        animation: true,
        physics: true,
        interaction: true,
        customization: true
      }
    },
    {
      id: 'nft-002',
      name: 'Digital Land Plot',
      platform: 'sandbox',
      type: 'Land',
      status: 'rented',
      usageStats: {
        visitors: 1245,
        events: 12,
        revenue: 2.3
      },
      integration: {
        building: true,
        events: true,
        monetization: true,
        analytics: true
      }
    },
    {
      id: 'nft-003',
      name: 'Legendary Weapon',
      platform: 'axie',
      type: 'Game Asset',
      status: 'equipped',
      usageStats: {
        battles: 89,
        wins: 67,
        experience: 4520
      },
      integration: {
        combat: true,
        upgrade: true,
        trading: true,
        stats: true
      }
    }
  ]);

  useEffect(() => {
    // Simulate loading metaverse data
    setLoading(true);
    setTimeout(() => {
      setConnectedPlatforms(['sandbox', 'decentraland']);
      setNFTAssets(integratedNFTs);
      setLoading(false);
    }, 1500);
  }, []);

  const handleConnectPlatform = async (platformId) => {
    setLoading(true);
    
    setTimeout(() => {
      setConnectedPlatforms(prev => [...prev, platformId]);
      setLoading(false);
      alert(`Successfully connected to ${gamingPlatforms.find(p => p.id === platformId)?.name}!`);
    }, 2000);
  };

  const handleDisconnectPlatform = (platformId) => {
    setConnectedPlatforms(prev => prev.filter(id => id !== platformId));
    alert(`Disconnected from ${gamingPlatforms.find(p => p.id === platformId)?.name}`);
  };

  const handleToggleVR = () => {
    setVrMode(!vrMode);
    if (!vrMode) {
      alert('VR Mode activated! Put on your VR headset for immersive experience.');
    } else {
      alert('VR Mode deactivated.');
    }
  };

  const handleToggleAR = () => {
    setArMode(!arMode);
    if (!arMode) {
      alert('AR Mode activated! Point your device camera at NFTs for augmented view.');
    } else {
      alert('AR Mode deactivated.');
    }
  };

  const handleDeployAsset = (assetId) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert(`Asset ${assetId} successfully deployed to selected metaverse platforms!`);
    }, 3000);
  };

  const getPlatformStatus = (platformId) => {
    const platform = gamingPlatforms.find(p => p.id === platformId);
    if (connectedPlatforms.includes(platformId)) return 'connected';
    return platform?.status || 'available';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected': return '#00ff88';
      case 'available': return '#ffd700';
      case 'beta': return '#8a2be2';
      default: return '#666';
    }
  };

  const renderGamingIntegration = () => (
    <div className="metaverse-gaming-section">
      <div className="gaming-header">
        <h2>Gaming Platform Integration</h2>
        <div className="gaming-controls">
          <button 
            className={`vr-toggle ${vrMode ? 'active' : ''}`}
            onClick={handleToggleVR}
          >
            🥽 {vrMode ? 'Exit VR' : 'Enter VR'}
          </button>
          <button 
            className={`ar-toggle ${arMode ? 'active' : ''}`}
            onClick={handleToggleAR}
          >
            📱 {arMode ? 'Exit AR' : 'Enter AR'}
          </button>
        </div>
      </div>

      <div className="platforms-grid">
        {gamingPlatforms.map((platform) => (
          <div 
            key={platform.id} 
            className={`platform-card ${selectedPlatform?.id === platform.id ? 'selected' : ''}`}
            onClick={() => setSelectedPlatform(platform)}
          >
            <div className="platform-header">
              <div className="platform-icon">{platform.icon}</div>
              <div className="platform-info">
                <h3>{platform.name}</h3>
                <span 
                  className="platform-status"
                  style={{ color: getStatusColor(getPlatformStatus(platform.id)) }}
                >
                  {getPlatformStatus(platform.id).toUpperCase()}
                </span>
              </div>
            </div>

            <p className="platform-description">{platform.description}</p>

            <div className="platform-stats">
              <div className="stat">
                <span className="stat-label">Users</span>
                <span className="stat-value">{platform.users}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Land Parcels</span>
                <span className="stat-value">{platform.landParcels}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Avg Value</span>
                <span className="stat-value">{platform.averageValue}</span>
              </div>
            </div>

            <div className="integration-features">
              <h4>Integration Features</h4>
              <div className="features-grid">
                <div className={`feature ${platform.integration.nftSupport ? 'supported' : 'unavailable'}`}>
                  <span className="feature-icon">{platform.integration.nftSupport ? '✅' : '❌'}</span>
                  <span>NFT Support</span>
                </div>
                <div className={`feature ${platform.integration.landRental ? 'supported' : 'unavailable'}`}>
                  <span className="feature-icon">{platform.integration.landRental ? '✅' : '❌'}</span>
                  <span>Land Rental</span>
                </div>
                <div className={`feature ${platform.integration.gameAssets ? 'supported' : 'unavailable'}`}>
                  <span className="feature-icon">{platform.integration.gameAssets ? '✅' : '❌'}</span>
                  <span>Game Assets</span>
                </div>
                <div className={`feature ${platform.integration.avatarItems ? 'supported' : 'unavailable'}`}>
                  <span className="feature-icon">{platform.integration.avatarItems ? '✅' : '❌'}</span>
                  <span>Avatar Items</span>
                </div>
              </div>
            </div>

            <div className="platform-actions">
              {connectedPlatforms.includes(platform.id) ? (
                <button 
                  className="disconnect-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDisconnectPlatform(platform.id);
                  }}
                >
                  Disconnect
                </button>
              ) : (
                <button 
                  className="connect-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleConnectPlatform(platform.id);
                  }}
                  disabled={loading}
                >
                  {loading ? 'Connecting...' : 'Connect'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderVRARSupport = () => (
    <div className="metaverse-vrar-section">
      <div className="vrar-header">
        <h2>VR/AR Device Support</h2>
        <div className="vrar-stats">
          <div className="vrar-stat">
            <span className="stat-value">{vrArDevices.filter(d => d.status === 'supported').length}</span>
            <span className="stat-label">Supported Devices</span>
          </div>
          <div className="vrar-stat">
            <span className="stat-value">{Math.round(vrArDevices.reduce((acc, d) => acc + d.compatibility, 0) / vrArDevices.length)}%</span>
            <span className="stat-label">Avg Compatibility</span>
          </div>
        </div>
      </div>

      <div className="devices-grid">
        {vrArDevices.map((device) => (
          <div key={device.id} className="device-card">
            <div className="device-header">
              <div className="device-icon">{device.icon}</div>
              <div className="device-info">
                <h3>{device.name}</h3>
                <span className="device-type">{device.type}</span>
              </div>
              <div 
                className="device-status"
                style={{ color: getStatusColor(device.status) }}
              >
                {device.status.toUpperCase()}
              </div>
            </div>

            <div className="compatibility-bar">
              <div className="compatibility-label">
                <span>Compatibility</span>
                <span>{device.compatibility}%</span>
              </div>
              <div className="compatibility-progress">
                <div 
                  className="compatibility-fill"
                  style={{ width: `${device.compatibility}%` }}
                ></div>
              </div>
            </div>

            <div className="device-features">
              <h4>Key Features</h4>
              <div className="features-list">
                {device.features.map((feature, index) => (
                  <span key={index} className="feature-tag">{feature}</span>
                ))}
              </div>
            </div>

            <div className="device-actions">
              <button className="test-device-btn">
                Test Device
              </button>
              <button className="calibrate-btn">
                Calibrate
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="immersive-experiences">
        <h3>Immersive NFT Experiences</h3>
        <div className="experiences-grid">
          <div className="experience-card">
            <div className="experience-icon">🏛️</div>
            <h4>Virtual Gallery</h4>
            <p>Display your NFT collection in a stunning 3D virtual gallery space</p>
            <button className="launch-experience-btn">Launch Gallery</button>
          </div>
          <div className="experience-card">
            <div className="experience-icon">🎮</div>
            <h4>Interactive Showcase</h4>
            <p>Interactive 3D models of your NFTs with animations and sound</p>
            <button className="launch-experience-btn">Start Showcase</button>
          </div>
          <div className="experience-card">
            <div className="experience-icon">🌍</div>
            <h4>Virtual Worlds</h4>
            <p>Explore NFT-powered virtual environments and social spaces</p>
            <button className="launch-experience-btn">Enter World</button>
          </div>
          <div className="experience-card">
            <div className="experience-icon">🛍️</div>
            <h4>AR Shopping</h4>
            <p>Preview NFTs in your real environment before purchasing</p>
            <button className="launch-experience-btn">Start AR</button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDeveloperTools = () => (
    <div className="metaverse-developer-section">
      <div className="developer-header">
        <h2>Developer Tools & SDKs</h2>
        <div className="developer-stats">
          <div className="dev-stat">
            <span className="stat-value">{developerTools.length}</span>
            <span className="stat-label">Available SDKs</span>
          </div>
          <div className="dev-stat">
            <span className="stat-value">{Math.round(developerTools.reduce((acc, tool) => acc + tool.downloads.replace('K', ''), 0) / 1000)}K+</span>
            <span className="stat-label">Total Downloads</span>
          </div>
          <div className="dev-stat">
            <span className="stat-value">{Math.round(developerTools.reduce((acc, tool) => acc + tool.rating, 0) / developerTools.length * 10) / 10}</span>
            <span className="stat-label">Avg Rating</span>
          </div>
        </div>
      </div>

      <div className="tools-grid">
        {developerTools.map((tool) => (
          <div key={tool.id} className="tool-card">
            <div className="tool-header">
              <h3>{tool.name}</h3>
              <div className="tool-meta">
                <span className="tool-version">v{tool.version}</span>
                <div className="tool-rating">
                  <span>⭐ {tool.rating}</span>
                </div>
              </div>
            </div>

            <p className="tool-description">{tool.description}</p>

            <div className="tool-details">
              <div className="tool-detail">
                <span className="detail-label">Language:</span>
                <span className="detail-value">{tool.language}</span>
              </div>
              <div className="tool-detail">
                <span className="detail-label">Platform:</span>
                <span className="detail-value">{tool.platform}</span>
              </div>
              <div className="tool-detail">
                <span className="detail-label">Downloads:</span>
                <span className="detail-value">{tool.downloads}</span>
              </div>
            </div>

            <div className="tool-features">
              <h4>Features</h4>
              <div className="features-list">
                {tool.features.map((feature, index) => (
                  <span key={index} className="feature-tag">{feature}</span>
                ))}
              </div>
            </div>

            <div className="tool-actions">
              <button className="download-btn">Download SDK</button>
              <button className="docs-btn">Documentation</button>
              <button className="sample-btn">View Samples</button>
            </div>
          </div>
        ))}
      </div>

      <div className="api-playground">
        <h3>API Playground</h3>
        <div className="playground-container">
          <div className="playground-section">
            <h4>Test API Endpoints</h4>
            <div className="api-testing">
              <select className="endpoint-select">
                <option value="/nft/metadata">GET /nft/metadata</option>
                <option value="/nft/deploy">POST /nft/deploy</option>
                <option value="/platform/connect">POST /platform/connect</option>
                <option value="/asset/render">GET /asset/render</option>
              </select>
              <textarea 
                className="request-body"
                placeholder="Request body (JSON)"
                rows="6"
              ></textarea>
              <button className="test-api-btn">Send Request</button>
            </div>
          </div>

          <div className="playground-section">
            <h4>Response</h4>
            <div className="api-response">
              <pre className="response-body">
{`{
  "status": "success",
  "data": {
    "nft_id": "nft-001",
    "deployed_platforms": ["sandbox", "decentraland"],
    "deployment_time": "2024-01-15T10:30:00Z",
    "gas_used": 0.0045,
    "transaction_hash": "0x123..."
  }
}`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAssetDeployment = () => (
    <div className="metaverse-deployment-section">
      <div className="deployment-header">
        <h2>NFT Asset Deployment</h2>
        <div className="deployment-stats">
          <div className="deploy-stat">
            <span className="stat-value">{integratedNFTs.length}</span>
            <span className="stat-label">Deployed Assets</span>
          </div>
          <div className="deploy-stat">
            <span className="stat-value">{connectedPlatforms.length}</span>
            <span className="stat-label">Connected Platforms</span>
          </div>
          <div className="deploy-stat">
            <span className="stat-value">{integratedNFTs.filter(nft => nft.status === 'active').length}</span>
            <span className="stat-label">Active Assets</span>
          </div>
        </div>
      </div>

      <div className="deployed-assets">
        <h3>Your Deployed Assets</h3>
        <div className="assets-grid">
          {integratedNFTs.map((nft) => (
            <div key={nft.id} className="asset-card">
              <div className="asset-header">
                <h4>{nft.name}</h4>
                <div className="asset-meta">
                  <span className="asset-type">{nft.type}</span>
                  <span 
                    className="asset-status"
                    style={{ color: nft.status === 'active' ? '#00ff88' : '#ffd700' }}
                  >
                    {nft.status.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="asset-platform">
                <span className="platform-label">Platform:</span>
                <span className="platform-name">
                  {gamingPlatforms.find(p => p.id === nft.platform)?.name}
                </span>
              </div>

              <div className="asset-stats">
                <h5>Usage Statistics</h5>
                <div className="stats-grid">
                  {Object.entries(nft.usageStats).map(([key, value]) => (
                    <div key={key} className="usage-stat">
                      <span className="usage-label">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                      <span className="usage-value">
                        {typeof value === 'number' && key !== 'revenue' 
                          ? value.toLocaleString() 
                          : key === 'revenue' 
                          ? `${value} ETH` 
                          : value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="asset-features">
                <h5>Integration Features</h5>
                <div className="integration-grid">
                  {Object.entries(nft.integration).map(([feature, supported]) => (
                    <div key={feature} className={`integration-feature ${supported ? 'enabled' : 'disabled'}`}>
                      <span className="feature-icon">{supported ? '✅' : '❌'}</span>
                      <span className="feature-name">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="asset-actions">
                <button className="view-asset-btn">View in Platform</button>
                <button className="manage-asset-btn">Manage</button>
                <button className="analytics-btn">Analytics</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="deployment-tools">
        <h3>Deploy New Assets</h3>
        <div className="deployment-form">
          <div className="form-row">
            <div className="form-group">
              <label>Select NFT to Deploy</label>
              <select className="nft-select">
                <option>Choose from your collection...</option>
                <option>Mystic Dragon #1234</option>
                <option>Cyber Warrior Avatar</option>
                <option>Digital Land Deed</option>
                <option>Legendary Sword</option>
              </select>
            </div>
            <div className="form-group">
              <label>Target Platforms</label>
              <div className="platform-checkboxes">
                {connectedPlatforms.map((platformId) => {
                  const platform = gamingPlatforms.find(p => p.id === platformId);
                  return (
                    <label key={platformId} className="platform-checkbox">
                      <input type="checkbox" defaultChecked />
                      <span>{platform?.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Deployment Configuration</label>
              <div className="config-options">
                <label className="config-option">
                  <input type="checkbox" defaultChecked />
                  <span>Enable 3D Model</span>
                </label>
                <label className="config-option">
                  <input type="checkbox" defaultChecked />
                  <span>Add Physics Properties</span>
                </label>
                <label className="config-option">
                  <input type="checkbox" />
                  <span>Enable Interactions</span>
                </label>
                <label className="config-option">
                  <input type="checkbox" />
                  <span>Add Sound Effects</span>
                </label>
              </div>
            </div>
          </div>

          <div className="deployment-preview">
            <h4>Deployment Preview</h4>
            <div className="preview-container">
              <div className="preview-placeholder">
                <span>🎮</span>
                <p>3D preview will appear here</p>
              </div>
              <div className="preview-details">
                <div className="preview-stat">
                  <span>Estimated Gas Cost:</span>
                  <span>0.0082 ETH</span>
                </div>
                <div className="preview-stat">
                  <span>Deployment Time:</span>
                  <span>~3-5 minutes</span>
                </div>
                <div className="preview-stat">
                  <span>Platforms:</span>
                  <span>{connectedPlatforms.length} selected</span>
                </div>
              </div>
            </div>
          </div>

          <button 
            className="deploy-asset-btn"
            onClick={() => handleDeployAsset('new-asset')}
            disabled={loading}
          >
            {loading ? 'Deploying...' : 'Deploy to Metaverse'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="advanced-metaverse-integration">
      {loading && (
        <div className="metaverse-loading-overlay">
          <div className="metaverse-loading-spinner">
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
          </div>
          <p>Connecting to metaverse...</p>
        </div>
      )}

      <div className="metaverse-header">
        <div className="metaverse-title-section">
          <h1 className="metaverse-title">🌐 Metaverse Integration</h1>
          <p className="metaverse-subtitle">Connect, deploy, and manage your NFTs across virtual worlds</p>
        </div>
        
        <div className="metaverse-quick-stats">
          <div className="quick-stat">
            <span className="quick-stat-value">{connectedPlatforms.length}</span>
            <span className="quick-stat-label">Connected Platforms</span>
          </div>
          <div className="quick-stat">
            <span className="quick-stat-value">{integratedNFTs.length}</span>
            <span className="quick-stat-label">Deployed Assets</span>
          </div>
          <div className="quick-stat">
            <span className="quick-stat-value">{vrArDevices.filter(d => d.status === 'supported').length}</span>
            <span className="quick-stat-label">VR/AR Devices</span>
          </div>
        </div>
      </div>

      <div className="metaverse-tabs">
        <button 
          className={`metaverse-tab ${activeTab === 'gaming' ? 'active' : ''}`}
          onClick={() => setActiveTab('gaming')}
        >
          🎮 Gaming Platforms
        </button>
        <button 
          className={`metaverse-tab ${activeTab === 'vrar' ? 'active' : ''}`}
          onClick={() => setActiveTab('vrar')}
        >
          🥽 VR/AR Support
        </button>
        <button 
          className={`metaverse-tab ${activeTab === 'developer' ? 'active' : ''}`}
          onClick={() => setActiveTab('developer')}
        >
          🛠️ Developer Tools
        </button>
        <button 
          className={`metaverse-tab ${activeTab === 'deployment' ? 'active' : ''}`}
          onClick={() => setActiveTab('deployment')}
        >
          🚀 Asset Deployment
        </button>
      </div>

      <div className="metaverse-content">
        {activeTab === 'gaming' && renderGamingIntegration()}
        {activeTab === 'vrar' && renderVRARSupport()}
        {activeTab === 'developer' && renderDeveloperTools()}
        {activeTab === 'deployment' && renderAssetDeployment()}
      </div>

      {selectedPlatform && (
        <div className="platform-modal-overlay" onClick={() => setSelectedPlatform(null)}>
          <div className="platform-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-platform-info">
                <span className="modal-platform-icon">{selectedPlatform.icon}</span>
                <h2>{selectedPlatform.name}</h2>
              </div>
              <button 
                className="modal-close"
                onClick={() => setSelectedPlatform(null)}
              >
                ✕
              </button>
            </div>
            <div className="modal-content">
              <div className="platform-details">
                <p className="platform-full-description">{selectedPlatform.description}</p>
                
                <div className="platform-api-info">
                  <h4>API Information</h4>
                  <div className="api-details">
                    <div className="api-detail">
                      <span className="api-label">Endpoint:</span>
                      <span className="api-value">{selectedPlatform.api.endpoint}</span>
                    </div>
                    <div className="api-detail">
                      <span className="api-label">Authentication:</span>
                      <span className="api-value">{selectedPlatform.api.authenticated ? 'Required' : 'Not Required'}</span>
                    </div>
                    <div className="api-detail">
                      <span className="api-label">Rate Limit:</span>
                      <span className="api-value">{selectedPlatform.api.rateLimit}</span>
                    </div>
                  </div>
                </div>

                <div className="platform-capabilities">
                  <h4>Platform Capabilities</h4>
                  <div className="capabilities-grid">
                    {Object.entries(selectedPlatform.integration).map(([capability, supported]) => (
                      <div key={capability} className={`capability ${supported ? 'supported' : 'unsupported'}`}>
                        <span className="capability-icon">{supported ? '✅' : '❌'}</span>
                        <span className="capability-name">
                          {capability.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedMetaverseIntegration;