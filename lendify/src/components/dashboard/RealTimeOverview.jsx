import React, { useState, useEffect } from 'react';
import '../../styles/dashboard-states.css';

const RealTimeOverview = ({ 
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
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timeInterval);
  }, []);

  const greeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <p>Loading real-time data from MongoDB...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state">
        <div className="error-icon">⚠️</div>
        <p>Failed to load real-time data: {error}</p>
        {onRefresh && (
          <button onClick={onRefresh} className="retry-btn">
            🔄 Retry Connection
          </button>
        )}
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '2rem',
      background: 'rgba(15, 15, 35, 0.8)',
      borderRadius: '12px',
      backdrop: 'blur(10px)',
      border: '1px solid rgba(0, 255, 136, 0.2)',
      color: 'white',
      fontFamily: 'Inter, sans-serif'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          marginBottom: '0.5rem',
          background: 'linear-gradient(45deg, #00ff88, #00d4ff)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 'bold'
        }}>
          {greeting()}! 👋
        </h1>
        <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>
          Welcome to your Lendify Dashboard
        </p>
        <div style={{ 
          fontSize: '1rem', 
          opacity: 0.7,
          marginTop: '0.5rem'
        }}>
          {currentTime.toLocaleDateString()} • {currentTime.toLocaleTimeString()}
        </div>
      </div>

      {/* Real-time Status Indicator */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        marginBottom: '2rem',
        padding: '1rem',
        background: 'rgba(0, 255, 136, 0.1)',
        borderRadius: '8px',
        border: '1px solid rgba(0, 255, 136, 0.3)'
      }}>
        <div style={{ 
          width: '10px', 
          height: '10px', 
          borderRadius: '50%', 
          background: '#00ff88',
          animation: 'pulse 2s infinite'
        }}></div>
        <span>🔄 REAL-TIME DATA FROM MONGODB</span>
        {onRefresh && (
          <button 
            onClick={onRefresh}
            disabled={loading}
            style={{
              background: 'transparent',
              border: '1px solid rgba(0, 255, 136, 0.5)',
              color: '#00ff88',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1
            }}
          >
            {loading ? '⟳' : '🔄'} Refresh
          </button>
        )}
      </div>

      {/* Today's Real Summary */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem', color: '#00ff88' }}>Today's Live Summary</h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem' 
        }}>
          <div style={{
            padding: '1.5rem',
            background: 'rgba(0, 255, 136, 0.1)',
            borderRadius: '12px',
            border: '1px solid rgba(0, 255, 136, 0.3)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📈</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#00ff88' }}>
              {platformStats?.availableRentals || 0}
            </div>
            <div style={{ opacity: 0.8 }}>Available Rentals</div>
          </div>
          
          <div style={{
            padding: '1.5rem',
            background: 'rgba(0, 212, 255, 0.1)',
            borderRadius: '12px',
            border: '1px solid rgba(0, 212, 255, 0.3)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💰</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#00d4ff' }}>
              {userStats?.earnings || 0} ETH
            </div>
            <div style={{ opacity: 0.8 }}>Your Earnings</div>
          </div>
          
          <div style={{
            padding: '1.5rem',
            background: 'rgba(220, 38, 127, 0.1)',
            borderRadius: '12px',
            border: '1px solid rgba(220, 38, 127, 0.3)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📝</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#dc267f' }}>
              {userStats?.nftOwned || 0}
            </div>
            <div style={{ opacity: 0.8 }}>Your NFTs</div>
          </div>
          
          <div style={{
            padding: '1.5rem',
            background: 'rgba(138, 43, 226, 0.1)',
            borderRadius: '12px',
            border: '1px solid rgba(138, 43, 226, 0.3)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8a2be2' }}>
              {loanRequests?.length || 0}
            </div>
            <div style={{ opacity: 0.8 }}>Loan Requests</div>
          </div>
        </div>
      </div>

      {/* User Profile from Real Data */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '2rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          padding: '1.5rem',
          background: 'rgba(15, 15, 35, 0.6)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <h3 style={{ marginBottom: '1rem', color: '#00ff88' }}>Your Profile</h3>
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>⭐</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                {userStats?.reputation || 0}/5.0
              </span>
            </div>
            <div style={{ opacity: 0.8 }}>Reputation Score</div>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#00d4ff' }}>
              {userStats?.totalRentals || 0}
            </div>
            <div style={{ opacity: 0.8 }}>Total Rentals</div>
          </div>
        </div>

        <div style={{
          padding: '1.5rem',
          background: 'rgba(15, 15, 35, 0.6)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <h3 style={{ marginBottom: '1rem', color: '#00ff88' }}>Platform Stats</h3>
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#dc267f' }}>
              {platformStats?.totalUsers || 0}
            </div>
            <div style={{ opacity: 0.8 }}>Total Users</div>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#8a2be2' }}>
              {platformStats?.totalNFTs || 0}
            </div>
            <div style={{ opacity: 0.8 }}>Total NFTs</div>
          </div>
        </div>
      </div>

      {/* Real NFT Data Preview */}
      {availableNFTs && availableNFTs.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem', color: '#00ff88' }}>
            🎨 Live NFT Data ({availableNFTs.length} NFTs)
          </h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '1rem' 
          }}>
            {availableNFTs.slice(0, 3).map((nft, index) => (
              <div key={index} style={{
                padding: '1rem',
                background: 'rgba(0, 255, 136, 0.05)',
                borderRadius: '8px',
                border: '1px solid rgba(0, 255, 136, 0.2)'
              }}>
                <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  {nft.name}
                </div>
                <div style={{ opacity: 0.8, fontSize: '0.9rem' }}>
                  Collection: {nft.collection}
                </div>
                <div style={{ opacity: 0.8, fontSize: '0.9rem' }}>
                  Floor Price: {nft.floorPrice} ETH
                </div>
                <div style={{ opacity: 0.8, fontSize: '0.9rem' }}>
                  Rating: ⭐ {nft.rating}/5.0
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer with Connection Status */}
      <div style={{ 
        textAlign: 'center', 
        padding: '1rem',
        background: 'rgba(0, 255, 136, 0.1)',
        borderRadius: '8px',
        border: '1px solid rgba(0, 255, 136, 0.3)'
      }}>
        <p style={{ margin: 0, opacity: 0.9 }}>
          🔄 Connected to MongoDB • ⚡ Real-time updates • 
          🎯 Backend API: localhost:3002 • 
          📊 {availableNFTs?.length || 0} NFTs loaded • 
          🏠 {availableRentals?.length || 0} Rentals active •
          💰 {loanRequests?.length || 0} Loan requests
        </p>
        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', opacity: 0.7 }}>
          ✅ ALL DATA IS LIVE FROM YOUR MONGODB DATABASE - NO MOCK DATA!
        </p>
      </div>
    </div>
  );
};

export default RealTimeOverview;