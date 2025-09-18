import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Canvas } from '@react-three/fiber'
import { Environment, OrbitControls, Html } from '@react-three/drei'
import { useAuth } from '../hooks/useAuth.jsx'
import AmbientScene from '../components/scenes/AmbientScene'
import NFTCarousel from '../components/dashboard/NFTCarousel'
import NFTDetailView from '../components/dashboard/NFTDetailView'
import AuthDebug from '../components/AuthDebug'
import ErrorBoundary from '../components/ErrorBoundary'
import SimpleDashboard from '../components/SimpleDashboard'
import SafeDashboard from '../components/SafeDashboard'
import MinimalTest from '../components/MinimalTest'

const DashboardPage = () => {
  const { isAuthenticated, loading, walletAddress, formatAddress, disconnectWallet } = useAuth()
  const navigate = useNavigate()
  const [selectedNFT, setSelectedNFT] = useState(null)
  const [debugMode, setDebugMode] = useState(true) // Start in debug mode to isolate the issue
  const [minimalMode, setMinimalMode] = useState(true) // Ultra-minimal test first

  // Debug logging
  console.log('🔄 DashboardPage render:', {
    isAuthenticated,
    loading,
    walletAddress,
    selectedNFT,
    timestamp: new Date().toISOString()
  })

  console.log('📊 DashboardPage state:', {
    'Will render Canvas': isAuthenticated && !loading && !debugMode,
    'Will render SimpleDashboard': isAuthenticated && !loading && debugMode,
    'Will show loading': loading,
    'Will redirect': !loading && !isAuthenticated,
    debugMode
  })

  // Continuous monitoring - log every 2 seconds to track changes
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('⏰ State Monitor:', {
        timestamp: new Date().toLocaleTimeString(),
        isAuthenticated,
        loading,
        walletAddress: walletAddress ? 'Connected' : 'None',
        debugMode,
        currentURL: window.location.href
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [isAuthenticated, loading, walletAddress, debugMode])

  // Global error handlers
  useEffect(() => {
    const handleError = (event) => {
      console.error('🚨 Global Error:', event.error)
      console.error('Error message:', event.message)
      console.error('Error filename:', event.filename)
      console.error('Error line:', event.lineno)
    }

    const handleUnhandledRejection = (event) => {
      console.error('🚨 Unhandled Promise Rejection:', event.reason)
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  // Redirect to login if not authenticated - TEMPORARILY DISABLED FOR DEBUG
  useEffect(() => {
    console.log('Authentication check:', { loading, isAuthenticated })
    if (!loading && !isAuthenticated) {
      console.log('⚠️ REDIRECT DISABLED - Would redirect to login but debugging')
      // TEMPORARILY COMMENTED OUT THE REDIRECT
      // setTimeout(() => {
      //   navigate('/app/login')
      // }, 100)
    }
  }, [isAuthenticated, loading, navigate])

  // Function definitions - moved up to prevent hoisting issues
  const handleNFTSelect = (nft) => {
    console.log('NFT selected:', nft)
    setSelectedNFT(nft)
  }

  const handleListForRent = (nft) => {
    console.log('List for rent:', nft)
    // TODO: Implement rent listing functionality
    alert(`Listing ${nft.name} for rent!`)
    setSelectedNFT(null)
  }

  const handleDisconnect = async () => {
    await disconnectWallet()
    navigate('/app/login')
  }

  // Loading state while checking authentication
  if (loading) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 100%)',
        color: '#ffffff'
      }}>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid rgba(102, 126, 234, 0.2)',
            borderTop: '4px solid #667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem auto'
          }}></div>
          <h2 style={{ color: '#667eea', marginBottom: '0.5rem' }}>Loading Dashboard...</h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Checking wallet connection...</p>
        </div>
      </div>
    )
  }

  // TEMPORARILY DISABLED - Show dashboard regardless of auth state for debugging
  // if (!isAuthenticated) {
  //   return null
  // }
  
  console.log('📝 About to render dashboard component...')

  // Ultra-minimal mode - just test React rendering
  if (minimalMode) {
    console.log('🧪 Rendering MinimalTest mode')
    return (
      <>
        <AuthDebug />
        <MinimalTest />
        {/* Mode toggle */}
        <button
          onClick={() => setMinimalMode(false)}
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            background: 'linear-gradient(135deg, #50fa7b 0%, #4ecdc4 100%)',
            border: 'none',
            borderRadius: '12px',
            padding: '0.75rem 1.5rem',
            color: '#000000',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '700',
            zIndex: 9999
          }}
        >
          ⬆️ Next: SimpleDashboard
        </button>
      </>
    )
  }

  // Debug mode - render simple dashboard without 3D
  if (debugMode) {
    console.log('🎆 Rendering SimpleDashboard in debug mode')
    console.log('🔍 Props for SimpleDashboard:', { walletAddress, formatAddress: typeof formatAddress })
    return (
      <>
        <AuthDebug />
        <ErrorBoundary>
          <SafeDashboard 
            walletAddress={walletAddress}
          />
        </ErrorBoundary>
        {/* Debug mode toggle */}
        <button
          onClick={() => setDebugMode(false)}
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            borderRadius: '12px',
            padding: '0.75rem 1.5rem',
            color: '#ffffff',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '600',
            zIndex: 1001
          }}
        >
          🎮 Try 3D Mode
        </button>
      </>
    )
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 100%)',
      overflow: 'hidden'
    }}>
      {/* Debug Component */}
      <AuthDebug />
      {/* Dashboard Header */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '80px',
        background: 'rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderTop: 'none',
        borderLeft: 'none',
        borderRight: 'none',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem'
      }}>
        {/* Logo */}
        <div style={{
          color: '#ffffff',
          fontSize: '1.5rem',
          fontWeight: '700',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Lendify Dashboard
        </div>
        
        {/* User Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            padding: '0.5rem 1rem',
            color: '#ffffff',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#50fa7b'
            }}></div>
            {formatAddress(walletAddress)}
          </div>
          
          <button
            onClick={handleDisconnect}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              padding: '0.5rem 1rem',
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.15)'
              e.target.style.color = '#ffffff'
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.1)'
              e.target.style.color = 'rgba(255, 255, 255, 0.8)'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16,17 21,12 16,7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Disconnect
          </button>
        </div>
      </div>

      {/* 3D Dashboard Content */}
      <div style={{
        position: 'fixed',
        top: '80px',
        left: 0,
        right: 0,
        bottom: 0
      }}>
        <ErrorBoundary>
          {console.log('🎮 About to render Canvas...')}
          <Canvas
          camera={{ 
            position: [0, 3, 8], 
            fov: 60,
            near: 0.1,
            far: 100 
          }}
          gl={{ 
            antialias: true, 
            alpha: true,
            powerPreference: "high-performance"
          }}
          style={{ background: 'transparent' }}
        >
          {/* Ambient Background Scene */}
          <AmbientScene />
          
          {/* NFT Carousel */}
          <NFTCarousel onNFTSelect={handleNFTSelect} />
          
          {/* Welcome Text */}
          <Html position={[0, 4, 0]} transform occlude style={{ pointerEvents: 'none' }}>
            <div style={{
              textAlign: 'center',
              color: '#ffffff',
              background: 'rgba(0, 0, 0, 0.3)',
              backdropFilter: 'blur(10px)',
              padding: '1rem 2rem',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              userSelect: 'none'
            }}>
              <h1 style={{
                margin: '0 0 0.5rem 0',
                fontSize: '2rem',
                fontWeight: '700',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Your NFT Collection
              </h1>
              <p style={{
                margin: 0,
                fontSize: '1rem',
                color: 'rgba(255, 255, 255, 0.8)'
              }}>
                Click on any NFT to view details or list it for rent
              </p>
            </div>
          </Html>
          
          {/* Lighting */}
          <ambientLight intensity={0.4} />
          <directionalLight position={[10, 10, 10]} intensity={0.8} />
          <pointLight position={[-10, -10, -10]} color="#667eea" intensity={0.3} />
          
          {/* Environment */}
          <Environment preset="night" background={false} />
          
          {/* Fog for depth */}
          <fog attach="fog" args={['#0a0a0a', 8, 25]} />
          </Canvas>
        </ErrorBoundary>
        
        {/* NFT Detail View Overlay */}
        {selectedNFT && (
          <NFTDetailView
            nft={selectedNFT}
            onClose={() => setSelectedNFT(null)}
            onListForRent={handleListForRent}
          />
        )}
      </div>

      {/* Instructions */}
      <div style={{
        position: 'fixed',
        bottom: '2rem',
        left: '2rem',
        zIndex: 1001
      }}>
        <div style={{
          background: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '1rem',
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: '0.85rem',
          maxWidth: '300px'
        }}>
          <div style={{ marginBottom: '0.5rem', fontWeight: '600', color: '#ffffff' }}>
            🎮 Controls
          </div>
          <div>• Move mouse to rotate carousel</div>
          <div>• Hover over NFTs to highlight</div>
          <div>• Click NFTs to view details</div>
        </div>
      </div>
      
      {/* Debug mode toggle */}
      <button
        onClick={() => setDebugMode(true)}
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          background: 'rgba(255, 0, 0, 0.2)',
          border: '1px solid rgba(255, 0, 0, 0.3)',
          borderRadius: '12px',
          padding: '0.75rem 1.5rem',
          color: '#ff6b6b',
          cursor: 'pointer',
          fontSize: '0.9rem',
          fontWeight: '600',
          zIndex: 1001
        }}
      >
        🐛 Debug Mode
      </button>
    </div>
  )
}

export default DashboardPage
