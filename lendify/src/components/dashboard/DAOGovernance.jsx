import React, { useState } from 'react'

const DAOGovernance = ({ userStats }) => {
  const [activeProposal, setActiveProposal] = useState(null)
  
  const proposals = [
    {
      id: 1,
      title: 'Reduce Platform Fee to 1.5%',
      description: 'Proposal to reduce the platform fee from 2.5% to 1.5% to attract more users',
      status: 'Active',
      votesFor: 12450,
      votesAgainst: 3210,
      endDate: '2024-01-15',
      proposer: '0x1234...5678'
    },
    {
      id: 2,
      title: 'Add Solana Chain Support',
      description: 'Integrate Solana blockchain for faster and cheaper NFT rentals',
      status: 'Active',
      votesFor: 8920,
      votesAgainst: 1150,
      endDate: '2024-01-20',
      proposer: '0x9876...4321'
    },
    {
      id: 3,
      title: 'Treasury Allocation for Marketing',
      description: 'Allocate 100,000 LEND tokens for marketing and user acquisition',
      status: 'Passed',
      votesFor: 15670,
      votesAgainst: 4230,
      endDate: '2024-01-10',
      proposer: '0x5555...9999'
    }
  ]

  return (
    <div>
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <h2 className="gradient-text">🗳️ DAO Governance</h2>
        <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '2rem' }}>
          Participate in protocol governance and shape the future of Lendify
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div className="glass-card">
            <h3 style={{ color: '#667eea', margin: '0 0 0.5rem 0' }}>Your Voting Power</h3>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>{userStats.daoVotingPower}</div>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.8rem' }}>LEND tokens</p>
          </div>
          
          <div className="glass-card">
            <h3 style={{ color: '#50fa7b', margin: '0 0 0.5rem 0' }}>Active Proposals</h3>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>5</div>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.8rem' }}>Awaiting votes</p>
          </div>
          
          <div className="glass-card">
            <h3 style={{ color: '#ff6b6b', margin: '0 0 0.5rem 0' }}>Participation</h3>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>89%</div>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.8rem' }}>Your voting rate</p>
          </div>
        </div>

        <button className="primary-btn">Create New Proposal</button>
      </div>

      <div className="glass-card">
        <h3 style={{ color: 'white', marginBottom: '1.5rem' }}>📋 Active Proposals</h3>
        
        <div style={{ display: 'grid', gap: '1rem' }}>
          {proposals.map(proposal => (
            <div key={proposal.id} style={{
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '1.5rem',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                    <h4 style={{ color: 'white', margin: 0 }}>{proposal.title}</h4>
                    <span style={{
                      background: proposal.status === 'Active' ? 'rgba(50, 205, 50, 0.3)' : 'rgba(102, 126, 234, 0.3)',
                      color: proposal.status === 'Active' ? '#50fa7b' : '#667eea',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      fontSize: '0.8rem'
                    }}>
                      {proposal.status}
                    </span>
                  </div>
                  <p style={{ color: 'rgba(255, 255, 255, 0.8)', margin: '0 0 1rem 0' }}>
                    {proposal.description}
                  </p>
                  <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem', margin: 0 }}>
                    Proposed by {proposal.proposer} • Ends {proposal.endDate}
                  </p>
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: 'rgba(255, 255, 255, 0.8)' }}>For</span>
                    <span style={{ color: '#50fa7b' }}>{proposal.votesFor.toLocaleString()}</span>
                  </div>
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      background: '#50fa7b',
                      height: '4px',
                      width: `${(proposal.votesFor / (proposal.votesFor + proposal.votesAgainst)) * 100}%`
                    }}></div>
                  </div>
                </div>
                
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Against</span>
                    <span style={{ color: '#ff6b6b' }}>{proposal.votesAgainst.toLocaleString()}</span>
                  </div>
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      background: '#ff6b6b',
                      height: '4px',
                      width: `${(proposal.votesAgainst / (proposal.votesFor + proposal.votesAgainst)) * 100}%`
                    }}></div>
                  </div>
                </div>
              </div>
              
              {proposal.status === 'Active' && (
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button className="primary-btn" style={{ flex: 1 }}>Vote For</button>
                  <button className="secondary-btn" style={{ flex: 1 }}>Vote Against</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DAOGovernance