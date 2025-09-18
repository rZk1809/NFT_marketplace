import React from 'react'
import { useAuth } from '../hooks/useAuth'

const AuthDebug = () => {
  const { isAuthenticated, loading, walletAddress, error } = useAuth()

  if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
    return (
      <div style={{
        position: 'fixed',
        top: '10px',
        left: '10px',
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '12px',
        fontFamily: 'monospace',
        zIndex: 9999,
        maxWidth: '300px'
      }}>
        <div><strong>🔍 Auth Debug:</strong></div>
        <div>Loading: {loading ? '✅' : '❌'}</div>
        <div>Authenticated: {isAuthenticated ? '✅' : '❌'}</div>
        <div>Wallet: {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : '❌'}</div>
        <div>Error: {error || 'None'}</div>
        <div>MetaMask: {window.ethereum ? '✅' : '❌'}</div>
      </div>
    )
  }

  return null
}

export default AuthDebug
