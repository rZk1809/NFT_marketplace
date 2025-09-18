import { useState, useEffect, createContext, useContext } from 'react'
import { ethers } from 'ethers'
import walletService, { WalletType } from '../services/walletService.js'

// Create Auth Context
const AuthContext = createContext()

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [walletAddress, setWalletAddress] = useState(null)
  const [walletType, setWalletType] = useState(null)
  const [chainId, setChainId] = useState(null)
  const [availableWallets, setAvailableWallets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Check if user is already connected on app load
  useEffect(() => {
    initializeAuth()
  }, [])

  const initializeAuth = async () => {
    try {
      // Detect available wallets
      const wallets = walletService.detectAvailableWallets()
      setAvailableWallets(wallets)
      
      // Check for existing connection
      const connectionInfo = await walletService.checkConnection()
      if (connectionInfo) {
        setWalletAddress(connectionInfo.address)
        setWalletType(connectionInfo.walletType)
        setChainId(connectionInfo.chainId)
        setIsAuthenticated(true)
      }
    } catch (err) {
      console.error('Error initializing auth:', err)
      setError('Failed to initialize wallet connection')
    } finally {
      setLoading(false)
    }
  }

  const connectWallet = async (selectedWalletType = WalletType.METAMASK) => {
    try {
      setLoading(true)
      setError(null)

      const connectionInfo = await walletService.connectWallet(selectedWalletType)
      
      setWalletAddress(connectionInfo.address)
      setWalletType(connectionInfo.walletType)
      setChainId(connectionInfo.chainId)
      setIsAuthenticated(true)
      
      // Save connection state
      walletService.saveConnection()

      return connectionInfo
    } catch (err) {
      console.error('Error connecting wallet:', err)
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const disconnectWallet = async () => {
    try {
      await walletService.disconnect()
      
      setWalletAddress(null)
      setWalletType(null)
      setChainId(null)
      setIsAuthenticated(false)
      setError(null)
    } catch (err) {
      console.error('Error disconnecting wallet:', err)
      setError('Failed to disconnect wallet')
    }
  }

  // Listen for wallet events
  useEffect(() => {
    const handleAccountChanged = (event) => {
      setWalletAddress(event.detail.address)
    }

    const handleChainChanged = (event) => {
      setChainId(event.detail.chainId)
    }

    const handleWalletDisconnected = () => {
      disconnectWallet()
    }

    // Add custom event listeners for wallet service events
    window.addEventListener('walletAccountChanged', handleAccountChanged)
    window.addEventListener('walletChainChanged', handleChainChanged)
    window.addEventListener('walletDisconnected', handleWalletDisconnected)

    // Cleanup listeners
    return () => {
      window.removeEventListener('walletAccountChanged', handleAccountChanged)
      window.removeEventListener('walletChainChanged', handleChainChanged)
      window.removeEventListener('walletDisconnected', handleWalletDisconnected)
    }
  }, [])

  // Format wallet address for display
  const formatAddress = (address) => {
    if (!address) return ''
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  // Additional wallet management methods
  const switchNetwork = async (chainId) => {
    try {
      await walletService.switchNetwork(chainId)
      setChainId(chainId)
    } catch (err) {
      console.error('Error switching network:', err)
      setError(err.message)
      throw err
    }
  }

  const getWalletInfo = () => {
    return walletService.getWalletInfo()
  }

  const value = {
    isAuthenticated,
    walletAddress,
    walletType,
    chainId,
    availableWallets,
    loading,
    error,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    getWalletInfo,
    formatAddress,
    // Expose wallet service for advanced usage
    walletService
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default useAuth
