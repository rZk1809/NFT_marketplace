import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'

// Simple NFT data
const mockNFTs = [
  { id: 1, name: "Crypto Punk #1234", price: "2.5 ETH", rarity: "Legendary", color: "#667eea" },
  { id: 2, name: "Bored Ape #5678", price: "1.8 ETH", rarity: "Epic", color: "#764ba2" },
  { id: 3, name: "Art Block #9012", price: "0.9 ETH", rarity: "Rare", color: "#f093fb" },
  { id: 4, name: "Mutant Ape #3456", price: "1.2 ETH", rarity: "Epic", color: "#50fa7b" },
  { id: 5, name: "Cool Cat #7890", price: "0.7 ETH", rarity: "Uncommon", color: "#4ecdc4" },
  { id: 6, name: "Pudgy Penguin #1122", price: "1.1 ETH", rarity: "Rare", color: "#ff6b6b" }
]

const SimpleDashboardPage = () => {
  const { isAuthenticated, loading, walletAddress, formatAddress, disconnectWallet } = useAuth()
  const navigate = useNavigate()
  const [selectedNFT, setSelectedNFT] = useState(null)

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/app/login')
    }
  }, [isAuthenticated, loading, navigate])

  // Loading state
  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading Dashboard...</p>
      </div>
    )
  }

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null
  }

  const handleDisconnect = async () => {
    await disconnectWallet()
    navigate('/app/login')
  }

  const handleListForRent = (nft) => {
    alert(`Listing ${nft.name} for rent!`)
    setSelectedNFT(null)
  }

  return (
    <div className="simple-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">Lendify Dashboard</h1>
          
          <div className="user-section">
            <div className="wallet-info">
              <div className="status-dot"></div>
              <span>{formatAddress(walletAddress)}</span>
            </div>
            <button onClick={handleDisconnect} className="disconnect-btn">
              Disconnect
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="dashboard-content">
          <div className="welcome-section">
            <h2>Your NFT Collection</h2>
            <p>Manage and list your NFTs for rent</p>
          </div>

          {/* NFT Grid */}
          <div className="nft-grid">
            {mockNFTs.map((nft) => (
              <div key={nft.id} className="nft-card" onClick={() => setSelectedNFT(nft)}>
                <div className="nft-visual" style={{ backgroundColor: nft.color }}>
                  <div className="nft-id">#{nft.id}</div>
                </div>
                <div className="nft-info">
                  <h3>{nft.name}</h3>
                  <div className="nft-details">
                    <span className="nft-price">{nft.price}</span>
                    <span className={`nft-rarity ${nft.rarity.toLowerCase()}`}>
                      {nft.rarity}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* NFT Detail Modal */}
      {selectedNFT && (
        <div className="modal-overlay" onClick={() => setSelectedNFT(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedNFT(null)}>
              ×
            </button>
            
            <div className="modal-visual" style={{ backgroundColor: selectedNFT.color }}>
              <div className="modal-nft-id">#{selectedNFT.id}</div>
            </div>
            
            <div className="modal-info">
              <h2>{selectedNFT.name}</h2>
              <div className="modal-details">
                <div className="detail-row">
                  <span>Price:</span>
                  <span className="price">{selectedNFT.price}</span>
                </div>
                <div className="detail-row">
                  <span>Rarity:</span>
                  <span className={`rarity ${selectedNFT.rarity.toLowerCase()}`}>
                    {selectedNFT.rarity}
                  </span>
                </div>
              </div>
              
              <button 
                className="list-btn" 
                onClick={() => handleListForRent(selectedNFT)}
              >
                List for Rent
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .simple-dashboard {
          min-height: 100vh;
          background: linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 100%);
          color: #ffffff;
        }

        .dashboard-header {
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .header-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 1rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .dashboard-title {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0;
          font-size: 1.8rem;
          font-weight: 700;
        }

        .user-section {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .wallet-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.1);
          padding: 0.5rem 1rem;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .status-dot {
          width: 8px;
          height: 8px;
          background: #50fa7b;
          border-radius: 50%;
        }

        .disconnect-btn {
          background: rgba(255, 0, 0, 0.2);
          border: 1px solid rgba(255, 0, 0, 0.3);
          color: #ff6b6b;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .disconnect-btn:hover {
          background: rgba(255, 0, 0, 0.3);
          transform: translateY(-1px);
        }

        .dashboard-main {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        .welcome-section {
          text-align: center;
          margin-bottom: 3rem;
        }

        .welcome-section h2 {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .welcome-section p {
          color: rgba(255, 255, 255, 0.7);
          font-size: 1.1rem;
        }

        .nft-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2rem;
        }

        .nft-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .nft-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          border-color: rgba(102, 126, 234, 0.5);
        }

        .nft-visual {
          height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          font-weight: bold;
          position: relative;
        }

        .nft-id {
          color: rgba(255, 255, 255, 0.9);
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
        }

        .nft-info {
          padding: 1.5rem;
        }

        .nft-info h3 {
          margin: 0 0 1rem 0;
          font-size: 1.2rem;
        }

        .nft-details {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .nft-price {
          font-weight: 600;
          color: #667eea;
          font-size: 1.1rem;
        }

        .nft-rarity {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .nft-rarity.legendary { background: #ff6b6b; }
        .nft-rarity.epic { background: #764ba2; }
        .nft-rarity.rare { background: #667eea; }
        .nft-rarity.uncommon { background: #50fa7b; }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 2rem;
        }

        .modal-content {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(30px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          max-width: 400px;
          width: 100%;
          position: relative;
        }

        .modal-close {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: rgba(255, 255, 255, 0.1);
          border: none;
          color: white;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-visual {
          height: 250px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3rem;
          font-weight: bold;
          border-radius: 20px 20px 0 0;
        }

        .modal-nft-id {
          color: rgba(255, 255, 255, 0.9);
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
        }

        .modal-info {
          padding: 2rem;
        }

        .modal-info h2 {
          margin: 0 0 1.5rem 0;
          font-size: 1.5rem;
        }

        .modal-details {
          margin-bottom: 2rem;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1rem;
        }

        .detail-row .price {
          color: #667eea;
          font-weight: 600;
        }

        .list-btn {
          width: 100%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          color: white;
          padding: 1rem;
          border-radius: 12px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .list-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }

        .dashboard-loading {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 3px solid rgba(102, 126, 234, 0.2);
          border-top: 3px solid #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .header-content {
            padding: 1rem;
            flex-direction: column;
            gap: 1rem;
          }
          
          .dashboard-main {
            padding: 1rem;
          }
          
          .nft-grid {
            grid-template-columns: 1fr;
          }
          
          .modal-overlay {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  )
}

export default SimpleDashboardPage
