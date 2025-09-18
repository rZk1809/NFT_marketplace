import React from 'react'

const SimpleDashboard = ({ walletAddress, formatAddress, onDisconnect }) => {
  console.log('🎯 SimpleDashboard rendering...', { walletAddress, formatAddress: typeof formatAddress, onDisconnect: typeof onDisconnect })
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 100%)',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {/* Header */}
      <div style={{
        position: 'fixed',
        top: '2rem',
        right: '2rem',
        background: 'rgba(255, 255, 255, 0.1)',
        padding: '1rem',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <div style={{ color: '#50fa7b' }}>
          Connected: {formatAddress && walletAddress ? formatAddress(walletAddress) : (walletAddress || 'Unknown')}
        </div>
        <button 
          onClick={onDisconnect || (() => console.log('No disconnect handler'))}
          style={{
            background: 'rgba(255, 0, 0, 0.2)',
            border: '1px solid rgba(255, 0, 0, 0.3)',
            color: '#ff6b6b',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Disconnect
        </button>
      </div>

      {/* Main Content */}
      <div style={{
        textAlign: 'center',
        maxWidth: '600px',
        padding: '2rem'
      }}>
        <h1 style={{
          fontSize: '3rem',
          marginBottom: '1rem',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          ✅ Dashboard Loaded Successfully!
        </h1>
        
        <p style={{
          fontSize: '1.2rem',
          color: 'rgba(255, 255, 255, 0.8)',
          marginBottom: '2rem'
        }}>
          Your wallet is connected and the dashboard is working.
          The 3D components will be added back once we identify the issue.
        </p>

        <div style={{
          background: 'rgba(102, 126, 234, 0.1)',
          border: '1px solid rgba(102, 126, 234, 0.3)',
          borderRadius: '16px',
          padding: '2rem',
          marginBottom: '2rem'
        }}>
          <h3 style={{ color: '#667eea', marginBottom: '1rem' }}>
            🎮 Next Steps:
          </h3>
          <ul style={{
            textAlign: 'left',
            color: 'rgba(255, 255, 255, 0.8)',
            lineHeight: '1.6'
          }}>
            <li>✅ Wallet connection: Working</li>
            <li>✅ Authentication flow: Working</li>
            <li>✅ Page routing: Working</li>
            <li>🔍 3D Canvas: Investigating...</li>
          </ul>
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '12px',
          padding: '1.5rem',
          fontFamily: 'monospace',
          fontSize: '0.9rem',
          textAlign: 'left'
        }}>
          <strong>Debug Info:</strong><br/>
          Wallet: {walletAddress}<br/>
          Time: {new Date().toLocaleTimeString()}<br/>
          Status: Dashboard rendered without 3D components
        </div>
      </div>
    </div>
  )
}

export default SimpleDashboard
