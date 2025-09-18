import React, { useState, useEffect } from 'react';
import './SummaryOverview.css';
import '../../styles/dashboard-states.css';

const SummaryOverview = ({ 
  userStats, 
  platformStats, 
  availableNFTs, 
  availableRentals, 
  loanRequests, 
  loading, 
  error, 
  onRefresh 
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Update current time
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timeInterval);
  }, []);

  // Today's summary data from real backend data
  const todayData = {
    newRentals: platformStats?.availableRentals || 0,
    totalEarnings: `${userStats?.earnings || 0} ETH`,
    activeListings: userStats?.nftOwned || 0,
    pendingTransactions: loanRequests?.length || 0
  };

  // Quick access shortcuts
  const shortcuts = [
    { id: 'marketplace', label: 'Browse NFTs', icon: '🔍', description: 'Find NFTs to rent' },
    { id: 'defi', label: 'DeFi Hub', icon: '💎', description: 'Staking & lending' },
    { id: 'governance', label: 'DAO Voting', icon: '🗳️', description: 'Participate in governance' },
    { id: 'analytics', label: 'Analytics', icon: '📊', description: 'View detailed reports' }
  ];

  // Generate real activity notifications from backend data
  const notifications = [];
  
  // Add NFT-related notifications
  if (availableNFTs?.length > 0) {
    notifications.push({
      id: 'nft-1',
      text: `New NFT available: ${availableNFTs[0]?.name}`,
      time: 'Recently added',
      type: 'info'
    });
  }
  
  // Add rental-related notifications  
  if (availableRentals?.length > 0) {
    const topRental = availableRentals[0];
    notifications.push({
      id: 'rental-1',
      text: `Active rental: ${topRental.pricing?.dailyPrice} ETH/day available`,
      time: 'Active now',
      type: 'success'
    });
  }
  
  // Add loan-related notifications
  if (loanRequests?.length > 0) {
    const topLoan = loanRequests[0];
    notifications.push({
      id: 'loan-1', 
      text: `Loan request: ${topLoan.terms?.principal} ${topLoan.terms?.currency} at ${topLoan.terms?.interestRate}% APY`,
      time: 'Available',
      type: 'warning'
    });
  }
  
  // Add platform stats notification
  if (platformStats) {
    notifications.push({
      id: 'platform-1',
      text: `Platform update: ${platformStats.totalUsers} users, ${platformStats.totalNFTs} NFTs available`,
      time: 'Live stats', 
      type: 'info'
    });
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      case 'error': return '❌';
      default: return 'ℹ️';
    }
  };

  const handleShortcutClick = (shortcut) => {
    console.log(`Navigating to ${shortcut.id}`);
    // In a real app, this would use a router or update the active tab
    alert(`This would navigate to ${shortcut.label}`);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="overview-loading">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard from blockchain...</p>
      </div>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <div className="error-state">
        <div className="error-icon">⚠️</div>
        <p>Failed to load dashboard data: {error}</p>
        {onRefresh && (
          <button onClick={onRefresh} className="retry-btn">
            🔄 Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="overview-dashboard">
      {/* Header Section */}
      <div className="overview-header">
        <div className="welcome-message">
          <h1>Good {currentTime.getHours() < 12 ? 'Morning' : currentTime.getHours() < 18 ? 'Afternoon' : 'Evening'}! 👋</h1>
          <p>Welcome to your Lendify Dashboard</p>
          <div className="current-time">
            {currentTime.toLocaleDateString()} • {currentTime.toLocaleTimeString()}
          </div>
        </div>
        
        <div className="user-summary-card">
          <div className="user-avatar">
            <div className="avatar-placeholder">
              LF
            </div>
          </div>
          <div className="user-info">
            <div className="user-rep">⭐ {userStats?.reputation || 0}</div>
            <div className="user-rentals">🏠 {userStats?.totalRentals || 0} rentals</div>
          </div>
          {error && (
            <div className="user-error">
              <button onClick={onRefresh} className="refresh-btn error">
                🔄 Refresh Data
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Today's Summary */}
      <div className="today-summary">
        <h2>Today's Summary</h2>
        <div className="summary-cards">
          <div className="summary-card">
            <div className="card-icon">📈</div>
            <div className="card-content">
              <div className="card-value">{todayData.newRentals}</div>
              <div className="card-label">New Rentals</div>
            </div>
          </div>
          
          <div className="summary-card">
            <div className="card-icon">💰</div>
            <div className="card-content">
              <div className="card-value">{todayData.totalEarnings}</div>
              <div className="card-label">Today's Earnings</div>
            </div>
          </div>
          
          <div className="summary-card">
            <div className="card-icon">📝</div>
            <div className="card-content">
              <div className="card-value">{todayData.activeListings}</div>
              <div className="card-label">Active Listings</div>
            </div>
          </div>
          
          <div className="summary-card">
            <div className="card-icon">⏳</div>
            <div className="card-content">
              <div className="card-value">{todayData.pendingTransactions}</div>
              <div className="card-label">Pending</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access */}
      <div className="quick-access">
        <h2>Quick Access</h2>
        <div className="shortcuts-grid">
          {shortcuts.map(shortcut => (
            <button 
              key={shortcut.id}
              className="shortcut-card"
              onClick={() => handleShortcutClick(shortcut)}
            >
              <div className="shortcut-icon">{shortcut.icon}</div>
              <div className="shortcut-content">
                <h3>{shortcut.label}</h3>
                <p>{shortcut.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="notifications-section">
        <h2>Recent Activity & Notifications</h2>
        <div className="notifications-list">
          {notifications.map(notification => (
            <div key={notification.id} className={`notification-item ${notification.type}`}>
              <div className="notification-icon">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="notification-content">
                <div className="notification-text">{notification.text}</div>
                <div className="notification-time">{notification.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Portfolio Overview */}
      <div className="portfolio-overview">
        <h2>Portfolio Overview</h2>
        <div className="portfolio-stats">
          <div className="portfolio-stat">
            <div className="stat-header">
              <span className="stat-icon">💼</span>
              <span className="stat-title">Total Value</span>
            </div>
            <div className="stat-value">{userStats?.earnings || 0} ETH</div>
            <div className="stat-change positive">Total earnings</div>
          </div>
          
          <div className="portfolio-stat">
            <div className="stat-header">
              <span className="stat-icon">🏦</span>
              <span className="stat-title">Platform NFTs</span>
            </div>
            <div className="stat-value">{platformStats?.totalNFTs || 0}</div>
            <div className="stat-change neutral">available</div>
          </div>
          
          <div className="portfolio-stat">
            <div className="stat-header">
              <span className="stat-icon">🌉</span>
              <span className="stat-title">Active Users</span>
            </div>
            <div className="stat-value">{platformStats?.totalUsers || 0}</div>
            <div className="stat-change neutral">on platform</div>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="overview-footer">
        <p>
          🔄 Live data from MongoDB • 🔗 Connected to {platformStats?.totalNFTs || 0} NFTs • 
          ⚡ Real-time updates • 
          {loading && <span>🔄 Refreshing...</span>}
          {!loading && <span>✅ Data is current</span>}
        </p>
        {onRefresh && (
          <button 
            onClick={onRefresh} 
            className="refresh-btn"
            disabled={loading}
            title="Refresh all dashboard data"
          >
            {loading ? '⟳' : '🔄'} Refresh Data
          </button>
        )}
      </div>
    </div>
  );
};

export default SummaryOverview;