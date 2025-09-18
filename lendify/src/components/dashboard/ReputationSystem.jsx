import React from 'react'

const ReputationSystem = ({ userStats }) => {
  const credentials = [
    { name: 'Verified Renter', issuer: 'Lendify Protocol', date: '2024-01-01', verified: true },
    { name: 'Gaming Expert', issuer: 'MetaGaming DAO', date: '2023-12-15', verified: true },
    { name: 'Trusted Trader', issuer: 'OpenSea', date: '2023-11-20', verified: false }
  ]

  return (
    <div>
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <h2 className="gradient-text">⭐ Reputation System</h2>
        <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '2rem' }}>
          Your decentralized identity and verifiable credentials
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div className="glass-card">
            <h3 style={{ color: '#50fa7b', margin: '0 0 0.5rem 0' }}>Reputation Score</h3>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>{userStats.reputation}/5.0</div>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.8rem' }}>Based on {userStats.totalRentals} rentals</p>
          </div>
          
          <div className="glass-card">
            <h3 style={{ color: '#667eea', margin: '0 0 0.5rem 0' }}>Trust Level</h3>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>Diamond</div>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.8rem' }}>Top 5% of users</p>
          </div>
          
          <div className="glass-card">
            <h3 style={{ color: '#ff6b6b', margin: '0 0 0.5rem 0' }}>Credentials</h3>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>7</div>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.8rem' }}>Verified badges</p>
          </div>
        </div>
      </div>

      <div className="glass-card">
        <h3 style={{ color: 'white', marginBottom: '1.5rem' }}>🏆 Verifiable Credentials</h3>
        
        <div style={{ display: 'grid', gap: '1rem' }}>
          {credentials.map((cred, index) => (
            <div key={index} style={{
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '1.5rem',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h4 style={{ color: 'white', margin: '0 0 0.5rem 0' }}>{cred.name}</h4>
                <p style={{ color: 'rgba(255, 255, 255, 0.6)', margin: 0, fontSize: '0.9rem' }}>
                  Issued by {cred.issuer} on {cred.date}
                </p>
              </div>
              <div style={{
                background: cred.verified ? 'rgba(50, 205, 50, 0.3)' : 'rgba(255, 165, 0, 0.3)',
                color: cred.verified ? '#50fa7b' : '#ffa500',
                padding: '0.5rem 1rem',
                borderRadius: '20px',
                fontSize: '0.9rem'
              }}>
                {cred.verified ? '✓ Verified' : 'Pending'}
              </div>
            </div>
          ))}
        </div>
        
        <button className="primary-btn" style={{ marginTop: '1.5rem' }}>
          Request New Credential
        </button>
      </div>
    </div>
  )
}

export default ReputationSystem