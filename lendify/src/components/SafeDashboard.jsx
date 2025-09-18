import React from 'react'

const SafeDashboard = ({ walletAddress }) => {
  console.log('🛡️ SafeDashboard rendering with wallet:', walletAddress)
  
  // Safe address formatting
  const safeFormatAddress = (address) => {
    if (!address || typeof address !== 'string') return 'Unknown'
    try {
      return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
    } catch (e) {
      console.error('Error formatting address:', e)
      return 'Invalid Address'
    }
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 100%)',
      color: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        position: 'fixed',
        top: '2rem',
        right: '2rem',
        background: 'rgba(102, 126, 234, 0.2)',
        border: '1px solid rgba(102, 126, 234, 0.3)',
        borderRadius: '12px',
        padding: '1rem',
        color: '#50fa7b',
        fontFamily: 'monospace',
        fontSize: '0.9rem'
      }}>
        🔐 {safeFormatAddress(walletAddress)}
      </div>

      {/* Main Content */}
      <div style={{
        textAlign: 'center',
        maxWidth: '700px',
        padding: '2rem'
      }}>
        <h1 style={{
          fontSize: '4rem',
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, #50fa7b 0%, #4ecdc4 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          textShadow: '0 0 30px rgba(80, 250, 123, 0.3)'
        }}>
          🎉 SUCCESS!
        </h1>
        
        <div style={{
          background: 'rgba(80, 250, 123, 0.1)',
          border: '2px solid rgba(80, 250, 123, 0.3)',
          borderRadius: '20px',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 0 30px rgba(80, 250, 123, 0.1)'
        }}>
          <h2 style={{ 
            color: '#50fa7b', 
            marginBottom: '1rem',
            fontSize: '1.8rem'
          }}>
            ✅ Authentication Works!
          </h2>
          <p style={{
            fontSize: '1.2rem',
            color: 'rgba(255, 255, 255, 0.9)',
            lineHeight: '1.6'
          }}>
            Your wallet is connected and the dashboard is rendering properly.
            We've isolated the issue to the 3D Canvas components.
          </p>
        </div>

        {/* Status Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            padding: '1.5rem',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
            <div style={{ fontWeight: 'bold', color: '#50fa7b' }}>React</div>
            <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>Working</div>
          </div>
          
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            padding: '1.5rem',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
            <div style={{ fontWeight: 'bold', color: '#50fa7b' }}>Wallet</div>
            <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>Connected</div>
          </div>
          
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            padding: '1.5rem',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
            <div style={{ fontWeight: 'bold', color: '#50fa7b' }}>Routing</div>
            <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>Working</div>
          </div>
          
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            padding: '1.5rem',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔍</div>
            <div style={{ fontWeight: 'bold', color: '#667eea' }}>3D Canvas</div>
            <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>Investigating</div>
          </div>
        </div>

        {/* Debug Info */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '12px',
          padding: '1.5rem',
          fontFamily: 'monospace',
          fontSize: '0.9rem',
          textAlign: 'left',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{ color: '#667eea', fontWeight: 'bold', marginBottom: '1rem' }}>
            🔍 Debug Information:
          </div>
          <div>• Wallet: {walletAddress || 'Not provided'}</div>
          <div>• Formatted: {safeFormatAddress(walletAddress)}</div>
          <div>• Time: {new Date().toLocaleTimeString()}</div>
          <div>• Component: SafeDashboard v1.0</div>
          <div>• Status: ✅ Rendering successfully</div>
        </div>
      </div>
    </div>
  )
}

export default SafeDashboard
