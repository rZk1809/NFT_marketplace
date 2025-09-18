import React, { useState } from 'react'
import './DashboardSidebar.css'

// Professional SVG Icons
const Icons = {
  marketplace: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M7 4V2C7 1.45 7.45 1 8 1H16C16.55 1 17 1.45 17 2V4H20C20.55 4 21 4.45 21 5S20.55 6 20 6H19V19C19 20.1 18.1 21 17 21H7C5.9 21 5 20.1 5 19V6H4C3.45 6 3 5.55 3 5S3.45 4 4 4H7ZM9 3V4H15V3H9ZM7 6V19H17V6H7Z"/>
      <path d="M9 8V17H11V8H9ZM13 8V17H15V8H13Z"/>
    </svg>
  ),
  defi: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1L9 7V9C9 10.1 9.9 11 11 11V13.5L7.5 15C7.09 15.17 6.6 15.24 6.13 15.22C5.65 15.2 5.19 15.08 4.78 14.87L3.8 14.4C3.31 14.13 2.7 14.29 2.43 14.78C2.16 15.27 2.32 15.88 2.81 16.15L3.79 16.62C4.36 16.91 4.98 17.08 5.61 17.12C6.24 17.16 6.88 17.07 7.47 16.85L12 15L16.53 16.85C17.12 17.07 17.76 17.16 18.39 17.12C19.02 17.08 19.64 16.91 20.21 16.62L21.19 16.15C21.68 15.88 21.84 15.27 21.57 14.78C21.3 14.29 20.69 14.13 20.2 14.4L19.22 14.87C18.81 15.08 18.35 15.2 17.87 15.22C17.4 15.24 16.91 15.17 16.5 15L13 13.5V11C14.1 11 15 10.1 15 9H21Z"/>
    </svg>
  ),
  crosschain: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6.99 11L3 15L6.99 19V16H14V14H6.99V11ZM21 9L17.01 5V8H10V10H17.01V13L21 9Z"/>
    </svg>
  ),
  analytics: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2ZM13 17H11V11H13V17ZM13 9H11V7H13V9Z"/>
      <circle cx="12" cy="12" r="3" opacity="0.3"/>
    </svg>
  ),
  governance: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19Z"/>
      <path d="M7.5 18L12 15.5L16.5 18V6H7.5V18Z"/>
    </svg>
  ),
  reputation: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z"/>
    </svg>
  ),
  metaverse: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M21 6H15L13.5 7.5C13.1 7.9 12.6 8.1 12 8.1S10.9 7.9 10.5 7.5L9 6H3C1.9 6 1 6.9 1 8V19C1 20.1 1.9 21 3 21H21C22.1 21 23 20.1 23 19V8C23 6.9 22.1 6 21 6ZM21 19H3V8H8.82L10.32 9.5C11.1 10.3 12.9 10.3 13.68 9.5L15.18 8H21V19Z"/>
      <circle cx="7" cy="14" r="2"/>
      <circle cx="17" cy="14" r="2"/>
    </svg>
  ),
  reports: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19Z"/>
      <path d="M7 10H9V17H7V10ZM11 7H13V17H11V7ZM15 13H17V17H15V13Z"/>
    </svg>
  ),
  overview: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M13 13H18V18H13V13ZM6 13H11V18H6V13ZM13 6H18V11H13V6ZM6 6H11V11H6V6Z"/>
    </svg>
  )
}

const DashboardSidebar = ({ activeTab, setActiveTab, userStats, onCollapsedChange }) => {
  const [collapsed, setCollapsed] = useState(false);
  const menuItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: Icons.overview,
      description: 'Dashboard',
      badge: null
    },
    {
      id: 'marketplace',
      label: 'Marketplace',
      icon: Icons.marketplace,
      description: 'NFT Trading',
      badge: userStats.nftOwned
    },
    {
      id: 'defi',
      label: 'DeFi',
      icon: Icons.defi,
      description: 'Lending',
      badge: userStats.activeLoans
    },
    {
      id: 'crosschain',
      label: 'Cross-Chain',
      icon: Icons.crosschain,
      description: 'Multi-chain',
      badge: userStats.crossChainAssets
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: Icons.analytics,
      description: 'AI Insights',
      badge: `${userStats.aiScore}%`
    },
    {
      id: 'governance',
      label: 'Governance',
      icon: Icons.governance,
      description: 'DAO Voting',
      badge: Math.floor(userStats.daoVotingPower / 100)
    },
    {
      id: 'reputation',
      label: 'Reputation',
      icon: Icons.reputation,
      description: 'DID System',
      badge: userStats.reputation.toFixed(1)
    }
  ]

  const toggleSidebar = () => {
    const newCollapsed = !collapsed;
    setCollapsed(newCollapsed);
    if (onCollapsedChange) {
      onCollapsedChange(newCollapsed);
    }
  };

  return (
    <div className={`dashboard-sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Logo Section */}
      <div className="sidebar-header">
        <div className="logo">
          <button className="toggle-sidebar" onClick={toggleSidebar}>
            {collapsed ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6-6-6z" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12l4.58-4.59z" />
              </svg>
            )}
          </button>
          <div className="logo-icon">L</div>
          <div className="logo-text">
            <span className="logo-main">Lendify</span>
            <span className="logo-sub">Protocol</span>
          </div>
        </div>
      </div>

      {/* User Profile Summary */}
      <div className="user-summary">
        <div className="avatar">
          <div className="avatar-gradient"></div>
        </div>
        <div className="user-stats-mini">
          <div className="stat-mini">
            <span className="value">{userStats.totalRentals}</span>
            <span className="label">Rentals</span>
          </div>
          <div className="stat-mini">
            <span className="value">{userStats.earnings}</span>
            <span className="label">ETH</span>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="sidebar-nav">
        <div className="nav-section">
          <h3 className="section-title">Dashboard</h3>
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              data-tooltip={item.label}
            >
              <div className="nav-item-content">
                <div className="nav-icon">{item.icon}</div>
                <div className="nav-text">
                  <span className="nav-label">{item.label}</span>
                  <span className="nav-description">{item.description}</span>
                </div>
              </div>
              {item.badge && (
                <div className="nav-badge">{item.badge}</div>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Quick Actions */}
      <div className="sidebar-footer">
        <div className="quick-actions">
          <button className="quick-action">
            <span className="action-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 2V13H10V22L17 10H13L17 2H7Z"/>
              </svg>
            </span>
            <span>Flash Rent</span>
          </button>
          <button className="quick-action">
            <span className="action-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6.99 11L3 15L6.99 19V16H14V14H6.99V11ZM21 9L17.01 5V8H10V10H17.01V13L21 9Z"/>
              </svg>
            </span>
            <span>Bridge</span>
          </button>
        </div>
        
        {/* Protocol Status */}
        <div className="protocol-status">
          <div className="status-item">
            <div className="status-dot active"></div>
            <span>Protocol Active</span>
          </div>
          <div className="gas-price">
            <span className="gas-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.77 7.23L19.78 7.22L16.06 3.5L15 4.56L17.11 6.67C16.17 7.03 15.5 7.93 15.5 9V18.5C15.5 19.33 14.83 20 14 20S12.5 19.33 12.5 18.5V14C12.5 12.62 11.38 11.5 10 11.5S7.5 12.62 7.5 14V18.5C7.5 20.43 9.07 22 11 22S14.5 20.43 14.5 18.5V9C14.5 8.17 15.17 7.5 16 7.5S17.5 8.17 17.5 9V11.5L19.77 9.23C19.89 9.11 20 8.94 20 8.77S19.89 8.43 19.77 8.31V7.23Z"/>
              </svg>
            </span>
            <span>25 gwei</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardSidebar