import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, Text, Sphere, Points, PointMaterial } from '@react-three/drei'
import { useAuth } from '../hooks/useAuth.jsx'
import { useDashboardData } from '../hooks/useDashboardData.js'
import './Enhanced3DDashboard.css'

// Import background components from landing page
import GlobalParticleBackground from '../components/GlobalParticleBackground'

// Import advanced dashboard components
import DashboardSidebar from '../components/dashboard/DashboardSidebar'
import NFTMarketplace from '../components/dashboard/NFTMarketplace'
import DeFiHub from '../components/dashboard/DeFiHub'
import CrossChainBridge from '../components/dashboard/CrossChainBridge'
import AIAnalytics from '../components/dashboard/AIAnalytics'
import DAOGovernance from '../components/dashboard/DAOGovernance'
import ReputationSystem from '../components/dashboard/ReputationSystem'
import MetaverseIntegration from '../components/dashboard/MetaverseIntegration'
import MarketAnalytics from '../components/dashboard/MarketAnalytics'

// Import new advanced components
import AdvancedNFTFi from '../components/dashboard/AdvancedNFTFi'
import AdvancedCrossChain from '../components/dashboard/AdvancedCrossChain'
import AdvancedReputationSystem from '../components/dashboard/AdvancedReputationSystem'
import AdvancedDynamicNFT from '../components/dashboard/AdvancedDynamicNFT'
import AdvancedDAOGovernance from '../components/dashboard/AdvancedDAOGovernance'
import AdvancedMetaverseIntegration from '../components/dashboard/AdvancedMetaverseIntegration'
import AdvancedAnalyticsDashboard from '../components/dashboard/AdvancedAnalyticsDashboard'
import SummaryOverview from '../components/dashboard/SummaryOverview'
import RealTimeOverview from '../components/dashboard/RealTimeOverview'

const Enhanced3DDashboard = () => {
  const { isAuthenticated, loading: authLoading, walletAddress, formatAddress, disconnectWallet } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [enable3D, setEnable3D] = useState(false) // Default to false for better performance
  const [backgroundMode, setBackgroundMode] = useState('css') // 'css', 'particles', or '3d'
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  
  // Use real dashboard data
  const {
    platformStats,
    userStats,
    userProfile,
    availableNFTs,
    trendingNFTs,
    availableRentals,
    loanRequests,
    loading: dashboardLoading,
    error: dashboardError,
    refreshAllData
  } = useDashboardData(walletAddress)

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/app/login')
    }
  }, [isAuthenticated, authLoading, navigate])

  // WebGL context management and error handling
  useEffect(() => {
    const handleWebGLContextLost = (event) => {
      console.warn('WebGL context lost, switching to CSS background')
      event.preventDefault()
      setEnable3D(false)
      setBackgroundMode('css')
    }

    // Conservative WebGL support check
    const checkWebGLSupport = () => {
      try {
        const canvas = document.createElement('canvas')
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
        
        if (!gl) {
          console.warn('WebGL not supported, using CSS background')
          setBackgroundMode('css')
          return false
        }

        // Check for common GPU memory issues
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
        if (debugInfo) {
          const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL).toLowerCase()
          
          // Be very conservative with integrated GPUs and older cards
          if (renderer.includes('intel') || renderer.includes('integrated') || 
              renderer.includes('mobile') || renderer.includes('adreno')) {
            console.warn('Low-performance GPU detected, using CSS background')
            setBackgroundMode('css')
            return false
          }
        }

        // Test WebGL with a small rendering to check for immediate failures
        gl.clearColor(0.0, 0.0, 0.0, 1.0)
        gl.clear(gl.COLOR_BUFFER_BIT)
        
        const error = gl.getError()
        if (error !== gl.NO_ERROR) {
          console.warn('WebGL error detected, using CSS background:', error)
          setBackgroundMode('css')
          return false
        }

        canvas.addEventListener('webglcontextlost', handleWebGLContextLost)
        return true
      } catch (error) {
        console.warn('WebGL check failed:', error)
        setBackgroundMode('css')
        return false
      }
    }

    // Only enable WebGL features if they pass all checks
    const webglSupported = checkWebGLSupport()
    
    // Performance-based automatic mode selection
    const detectPerformanceMode = () => {
      try {
        // Check system memory (approximate)
        const nav = navigator
        const connection = nav.connection || nav.mozConnection || nav.webkitConnection
        
        // Check for slow connection (indicates mobile/low-end device)
        if (connection && (connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g')) {
          console.log('Slow connection detected, using CSS background')
          setBackgroundMode('css')
          return 'css'
        }
        
        // Check device memory if available
        if (nav.deviceMemory && nav.deviceMemory < 4) {
          console.log('Low device memory detected, using CSS background')
          setBackgroundMode('css')
          return 'css'
        }
        
        // Check hardware concurrency (CPU cores)
        if (nav.hardwareConcurrency && nav.hardwareConcurrency < 4) {
          console.log('Low-end CPU detected, using lightweight particles')
          setBackgroundMode('particles')
          return 'particles'
        }
        
        // Check user agent for mobile devices
        const userAgent = nav.userAgent.toLowerCase()
        if (userAgent.includes('mobile') || userAgent.includes('android') || userAgent.includes('iphone')) {
          console.log('Mobile device detected, using CSS background')
          setBackgroundMode('css')
          return 'css'
        }
        
        // If WebGL is supported and system seems capable, allow particles by default
        if (webglSupported) {
          console.log('High-performance system detected, allowing particle background')
          setBackgroundMode('particles')
          return 'particles'
        }
        
        return 'css'
      } catch (error) {
        console.warn('Performance detection failed, using CSS background:', error)
        setBackgroundMode('css')
        return 'css'
      }
    }
    
    detectPerformanceMode()
  }, [])

  // Ultra-lightweight CSS background component
  const CSSBackground = () => {
    return (
      <div 
        className="css-background"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: -2,
          background: `
            radial-gradient(ellipse at 20% 20%, rgba(0, 255, 136, 0.1) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 80%, rgba(138, 43, 226, 0.08) 0%, transparent 50%),
            radial-gradient(ellipse at 60% 30%, rgba(0, 123, 255, 0.05) 0%, transparent 50%),
            linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(15, 15, 35, 0.95) 100%)
          `,
          animation: 'backgroundFloat 20s ease-in-out infinite'
        }}
      />
    )
  }

  // Memory-optimized particle background (only 200 particles instead of 3000)
  const LightweightParticles = ({ count = 200 }) => {
    const mesh = useRef()
    
    const positions = useMemo(() => {
      const positions = new Float32Array(count * 3)
      for (let i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 8
        positions[i * 3 + 1] = (Math.random() - 0.5) * 8
        positions[i * 3 + 2] = (Math.random() - 0.5) * 8
      }
      return positions
    }, [count])

    useFrame((state) => {
      if (mesh.current) {
        mesh.current.rotation.y += 0.001
      }
    })

    return (
      <Points ref={mesh} positions={positions}>
        <PointMaterial
          transparent
          color="#ffffff"
          size={0.01}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.6}
        />
      </Points>
    )
  }

  // Ultra-minimal 3D background
  const Minimal3DBackground = () => {
    return (
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        style={{ position: 'fixed', top: 0, left: 0, zIndex: -1, opacity: 0.3 }}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: "low-power",
          failIfMajorPerformanceCaveat: true
        }}
        dpr={1} // Force pixel ratio to 1 to save memory
      >
        <ambientLight intensity={0.3} />
        {/* Single sphere instead of multiple */}
        <Sphere args={[0.5]} position={[0, 0, 0]}>
          <meshBasicMaterial color="#00ff88" transparent opacity={0.1} wireframe />
        </Sphere>
      </Canvas>
    )
  }

  const LightweightParticleBackground = () => {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        pointerEvents: 'none'
      }}>
        <Canvas 
          camera={{ position: [0, 0, 5], fov: 75 }}
          gl={{ 
            alpha: true, 
            antialias: false,
            powerPreference: "low-power"
          }}
          dpr={1} // Force pixel ratio to 1
          style={{ background: 'transparent' }}
        >
          <LightweightParticles />
        </Canvas>
      </div>
    )
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'overview':
        return <RealTimeOverview 
          userStats={userStats} 
          platformStats={platformStats}
          availableNFTs={availableNFTs}
          availableRentals={availableRentals}
          loanRequests={loanRequests}
          loading={dashboardLoading}
          error={dashboardError}
          onRefresh={refreshAllData}
        />
      case 'marketplace':
        return <NFTMarketplace 
          userStats={userStats} 
          availableNFTs={availableNFTs}
          trendingNFTs={trendingNFTs}
          loading={dashboardLoading}
          error={dashboardError}
          onRefresh={refreshAllData}
        />
      case 'defi':
        return <AdvancedNFTFi userStats={userStats} />
      case 'crosschain':
        return <AdvancedCrossChain userStats={userStats} />
      case 'analytics':
        return <AdvancedAnalyticsDashboard
          userStats={userStats}
          userId={walletAddress}
          platformData={{
            totalUsers: platformStats?.totalUsers || 0,
            totalVolume: platformStats?.totalVolume || 0,
            totalTransactions: (platformStats?.totalRentals || 0) + (platformStats?.totalLoans || 0),
            avgTransactionValue: 0.52,
            activeUsers24h: Math.round((platformStats?.totalUsers || 0) * 0.1)
          }}
        />
      case 'governance':
        return <AdvancedDAOGovernance userStats={userStats} />
      case 'reputation':
        return <AdvancedReputationSystem userStats={userStats} />
      case 'metaverse':
        return <AdvancedMetaverseIntegration />
      case 'reports':
        return <MarketAnalytics />
      case 'dynamic-nft':
        return <AdvancedDynamicNFT userStats={userStats} />
      // Legacy components for fallback
      case 'legacy-defi':
        return <DeFiHub userStats={userStats} />
      case 'legacy-crosschain':
        return <CrossChainBridge />
      case 'legacy-reputation':
        return <ReputationSystem userStats={userStats} />
      default:
        return <NFTMarketplace 
          userStats={userStats} 
          availableNFTs={availableNFTs}
          trendingNFTs={trendingNFTs}
          loading={dashboardLoading}
          error={dashboardError}
          onRefresh={refreshAllData}
        />
    }
  }

  // Loading state
  if (authLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading Lendify Protocol...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="auth-required">
        <h2>Please connect your wallet to access the dashboard</h2>
      </div>
    )
  }

  const handleDisconnect = async () => {
    await disconnectWallet()
    navigate('/app/login')
  }

  // Render appropriate background based on mode
  const renderBackground = () => {
    switch (backgroundMode) {
      case 'particles':
        return <LightweightParticleBackground />
      case '3d':
        return enable3D ? <Minimal3DBackground /> : <CSSBackground />
      case 'css':
      default:
        return <CSSBackground />
    }
  }

  return (
    <div className="enhanced-dashboard">
      {renderBackground()}
      
      {/* Main Dashboard Layout */}
      <div className="dashboard-container">
        <DashboardSidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          userStats={userStats}
          onCollapsedChange={setSidebarCollapsed}
        />
        
        <main className={`dashboard-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
          <div className="dashboard-header">
            <div className="header-left">
              <h1>Lendify Protocol</h1>
              <p className="protocol-version">v2.0 - Cross-Chain DeFi NFT Rental Platform</p>
            </div>
            <div className="header-right">
              <div className="network-status">
                <div className="network-indicator active"></div>
                <span>Ethereum Mainnet</span>
              </div>
              <button 
                onClick={() => {
                  // Cycle through background modes: css -> particles -> 3d -> css
                  if (backgroundMode === 'css') {
                    setBackgroundMode('particles')
                    setEnable3D(false)
                  } else if (backgroundMode === 'particles') {
                    setBackgroundMode('3d')
                    setEnable3D(true)
                  } else {
                    setBackgroundMode('css')
                    setEnable3D(false)
                  }
                }} 
                className="toggle-3d-btn"
                title={`Background: ${backgroundMode.toUpperCase()} - Click to cycle`}
              >
                {backgroundMode === 'css' ? '🎨' : backgroundMode === 'particles' ? '✨' : '🌐'}
              </button>
              {dashboardError && (
                <button 
                  onClick={refreshAllData}
                  className="refresh-btn error"
                  title="Refresh data - there was an error loading"
                >
                  🔄 Retry
                </button>
              )}
              {!dashboardError && (
                <button 
                  onClick={refreshAllData}
                  className="refresh-btn"
                  title="Refresh dashboard data"
                  disabled={dashboardLoading}
                >
                  {dashboardLoading ? '⟳' : '🔄'}
                </button>
              )}
              <div className="user-info">
                <span>{formatAddress(walletAddress)}</span>
                <button onClick={handleDisconnect} className="disconnect-btn">
                  Disconnect
                </button>
              </div>
            </div>
          </div>
          
          {/* Quick Stats Bar - Only show on overview page */}
          {activeTab === 'overview' && (
            <div className="quick-stats">
              <div className="stat-item">
                <span className="stat-value">{userStats.totalRentals}</span>
                <span className="stat-label">Total Rentals</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{userStats.earnings} ETH</span>
                <span className="stat-label">Earnings</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{userStats.reputation}/5.0</span>
                <span className="stat-label">Reputation</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{userStats.daoVotingPower}</span>
                <span className="stat-label">DAO Power</span>
              </div>
            </div>
          )}
          
          <div className="dashboard-content">
            {renderActiveTab()}
          </div>
        </main>
      </div>
    </div>
  )
}

export default Enhanced3DDashboard
