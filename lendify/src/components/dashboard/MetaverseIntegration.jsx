import React from 'react'

const MetaverseIntegration = () => {
  const gameIntegrations = [
    { name: 'The Sandbox', status: 'Active', nfts: 45, revenue: '2.3 ETH' },
    { name: 'Decentraland', status: 'Active', nfts: 23, revenue: '1.8 ETH' },
    { name: 'Axie Infinity', status: 'Pending', nfts: 12, revenue: '0.9 ETH' },
    { name: 'VRChat', status: 'Coming Soon', nfts: 0, revenue: '0 ETH' }
  ]

  return (
    <div>
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <h2 className="gradient-text">🎮 Metaverse Integration</h2>
        <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '2rem' }}>
          Direct integration with games and metaverse platforms
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          <div className="glass-card">
            <h3 style={{ color: '#50fa7b', margin: '0 0 0.5rem 0' }}>Connected Games</h3>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>4</div>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.8rem' }}>Platforms integrated</p>
          </div>
          
          <div className="glass-card">
            <h3 style={{ color: '#667eea', margin: '0 0 0.5rem 0' }}>API Calls</h3>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>12.5K</div>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.8rem' }}>This month</p>
          </div>
          
          <div className="glass-card">
            <h3 style={{ color: '#ff6b6b', margin: '0 0 0.5rem 0' }}>In-Game Revenue</h3>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>5.2 ETH</div>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.8rem' }}>Total earned</p>
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ color: 'white', marginBottom: '1.5rem' }}>🔌 Game Integrations</h3>
        
        <div style={{ display: 'grid', gap: '1rem' }}>
          {gameIntegrations.map((game, index) => (
            <div key={index} style={{
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '1.5rem',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'grid',
              gridTemplateColumns: '1fr auto auto auto auto',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <div>
                <h4 style={{ color: 'white', margin: '0 0 0.25rem 0' }}>{game.name}</h4>
                <span style={{
                  background: 
                    game.status === 'Active' ? 'rgba(50, 205, 50, 0.3)' :
                    game.status === 'Pending' ? 'rgba(255, 165, 0, 0.3)' : 
                    'rgba(128, 128, 128, 0.3)',
                  color:
                    game.status === 'Active' ? '#50fa7b' :
                    game.status === 'Pending' ? '#ffa500' :
                    '#gray',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '12px',
                  fontSize: '0.8rem'
                }}>
                  {game.status}
                </span>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: 'white', fontWeight: 'bold' }}>{game.nfts}</div>
                <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.8rem' }}>NFTs</div>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: 'white', fontWeight: 'bold' }}>{game.revenue}</div>
                <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.8rem' }}>Revenue</div>
              </div>
              
              <button 
                className={game.status === 'Active' ? 'secondary-btn' : 'primary-btn'}
                style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
              >
                {game.status === 'Active' ? 'Configure' : 'Connect'}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card">
        <h3 style={{ color: 'white', marginBottom: '1.5rem' }}>🛠️ Developer API</h3>
        <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '1.5rem' }}>
          Integrate Lendify rental functionality directly into your game or application
        </p>
        
        <div style={{ 
          background: 'rgba(0, 0, 0, 0.3)', 
          padding: '1rem', 
          borderRadius: '8px',
          fontFamily: 'monospace',
          color: '#50fa7b',
          fontSize: '0.9rem',
          marginBottom: '1.5rem',
          overflow: 'auto'
        }}>
          {`// Example: Rent NFT directly in-game
const rental = await lendify.rentNFT({
  tokenId: "1234",
  duration: 7, // days
  maxPrice: "0.1" // ETH
});`}
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="primary-btn">Get API Key</button>
          <button className="secondary-btn">View Documentation</button>
        </div>
      </div>
    </div>
  )
}

export default MetaverseIntegration