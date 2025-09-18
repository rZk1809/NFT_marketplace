import React, { useState, useEffect } from 'react';
import './AdvancedDAOGovernance.css';

const AdvancedDAOGovernance = () => {
  const [activeTab, setActiveTab] = useState('proposals');
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [votingPower, setVotingPower] = useState(0);
  const [delegatedVotes, setDelegatedVotes] = useState(0);
  const [userVotes, setUserVotes] = useState({});
  const [loading, setLoading] = useState(false);

  // Mock data for proposals
  const [proposals, setProposals] = useState([
    {
      id: 'prop-001',
      title: 'Implement Cross-Chain NFT Bridge',
      description: 'Proposal to implement a decentralized bridge for NFT transfers between Ethereum, Polygon, and Arbitrum networks.',
      proposer: '0x1234...5678',
      status: 'active',
      category: 'technical',
      votesFor: 125000,
      votesAgainst: 43000,
      totalVotes: 168000,
      quorum: 100000,
      deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      created: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      executionDelay: 48,
      fundingRequested: '500 ETH',
      impact: 'high'
    },
    {
      id: 'prop-002',
      title: 'Reduce Platform Transaction Fees',
      description: 'Proposal to reduce the platform transaction fee from 2.5% to 1.5% to increase competitiveness.',
      proposer: '0x9876...4321',
      status: 'active',
      category: 'economic',
      votesFor: 89000,
      votesAgainst: 67000,
      totalVotes: 156000,
      quorum: 100000,
      deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      created: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      executionDelay: 24,
      fundingRequested: '0 ETH',
      impact: 'high'
    },
    {
      id: 'prop-003',
      title: 'Add New NFT Categories',
      description: 'Proposal to add support for real estate, music rights, and patent NFTs on the platform.',
      proposer: '0x5555...1111',
      status: 'pending',
      category: 'product',
      votesFor: 0,
      votesAgainst: 0,
      totalVotes: 0,
      quorum: 100000,
      deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      created: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      executionDelay: 72,
      fundingRequested: '200 ETH',
      impact: 'medium'
    },
    {
      id: 'prop-004',
      title: 'Treasury Management Protocol',
      description: 'Implement automated treasury management with yield farming and diversification strategies.',
      proposer: '0x7777...3333',
      status: 'executed',
      category: 'treasury',
      votesFor: 200000,
      votesAgainst: 25000,
      totalVotes: 225000,
      quorum: 100000,
      deadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      created: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      executionDelay: 48,
      fundingRequested: '1000 ETH',
      impact: 'high'
    }
  ]);

  // Mock governance statistics
  const governanceStats = {
    totalProposals: 47,
    activeProposals: 2,
    passedProposals: 38,
    rejectedProposals: 7,
    totalTokenHolders: 15420,
    activeVoters: 8934,
    averageParticipation: 58.3,
    treasuryValue: '12,450 ETH',
    circulatingSupply: '10,000,000 LEND',
    marketCap: '$45,200,000',
    votingPowerDistribution: {
      whales: 25.5,
      dolphins: 42.3,
      minnows: 32.2
    }
  };

  // Mock user governance data
  const [userGovernanceData, setUserGovernanceData] = useState({
    tokenBalance: 15750,
    votingPower: 15750,
    delegatedTo: null,
    receivedDelegations: 2340,
    totalVotingPower: 18090,
    proposalsVoted: 23,
    participationRate: 89.5,
    reputationScore: 847
  });

  // Mock delegates data
  const delegates = [
    {
      address: '0xaaa...bbb',
      name: 'TechExpert.eth',
      votingPower: 125000,
      delegators: 234,
      participationRate: 95.2,
      expertise: ['Technical', 'Security'],
      avatar: '🔧',
      statement: 'Focused on technical excellence and security improvements'
    },
    {
      address: '0xccc...ddd',
      name: 'EconGuru.eth',
      votingPower: 89000,
      delegators: 156,
      participationRate: 92.8,
      expertise: ['Economics', 'Treasury'],
      avatar: '📊',
      statement: 'Optimizing tokenomics and treasury management'
    },
    {
      address: '0xeee...fff',
      name: 'CommunityLead.eth',
      votingPower: 67000,
      delegators: 189,
      participationRate: 88.4,
      expertise: ['Community', 'Governance'],
      avatar: '🌟',
      statement: 'Building inclusive and engaged community governance'
    }
  ];

  useEffect(() => {
    // Simulate loading governance data
    setLoading(true);
    setTimeout(() => {
      setVotingPower(userGovernanceData.totalVotingPower);
      setDelegatedVotes(userGovernanceData.receivedDelegations);
      setLoading(false);
    }, 1000);
  }, []);

  const handleVote = async (proposalId, voteType) => {
    setLoading(true);
    
    // Simulate voting transaction
    setTimeout(() => {
      setUserVotes(prev => ({
        ...prev,
        [proposalId]: voteType
      }));
      
      // Update proposal vote counts
      setProposals(prev => prev.map(proposal => {
        if (proposal.id === proposalId) {
          const voteWeight = userGovernanceData.totalVotingPower;
          return {
            ...proposal,
            votesFor: voteType === 'for' ? proposal.votesFor + voteWeight : proposal.votesFor,
            votesAgainst: voteType === 'against' ? proposal.votesAgainst + voteWeight : proposal.votesAgainst,
            totalVotes: proposal.totalVotes + voteWeight
          };
        }
        return proposal;
      }));
      
      setLoading(false);
      alert(`Vote "${voteType}" cast successfully for proposal ${proposalId}!`);
    }, 2000);
  };

  const handleDelegate = (delegateAddress) => {
    setLoading(true);
    setTimeout(() => {
      setUserGovernanceData(prev => ({
        ...prev,
        delegatedTo: delegateAddress
      }));
      setLoading(false);
      alert(`Successfully delegated voting power to ${delegateAddress}!`);
    }, 1500);
  };

  const formatTimeRemaining = (deadline) => {
    const now = new Date();
    const diff = deadline - now;
    
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h remaining`;
    return `${hours}h remaining`;
  };

  const getProposalStatusColor = (status) => {
    switch (status) {
      case 'active': return '#00ff88';
      case 'pending': return '#ffd700';
      case 'executed': return '#8a2be2';
      case 'rejected': return '#ff4444';
      default: return '#666';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'technical': return '⚙️';
      case 'economic': return '💰';
      case 'product': return '🚀';
      case 'treasury': return '🏦';
      default: return '📋';
    }
  };

  const renderProposals = () => (
    <div className="dao-proposals-section">
      <div className="proposals-header">
        <div className="proposals-stats">
          <div className="stat-item">
            <span className="stat-label">Active Proposals</span>
            <span className="stat-value">{governanceStats.activeProposals}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Your Voting Power</span>
            <span className="stat-value">{userGovernanceData.totalVotingPower.toLocaleString()}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Participation Rate</span>
            <span className="stat-value">{userGovernanceData.participationRate}%</span>
          </div>
        </div>
      </div>

      <div className="proposals-grid">
        {proposals.map((proposal) => (
          <div 
            key={proposal.id} 
            className={`proposal-card ${selectedProposal?.id === proposal.id ? 'selected' : ''}`}
            onClick={() => setSelectedProposal(proposal)}
          >
            <div className="proposal-header">
              <div className="proposal-meta">
                <span className="proposal-category">
                  {getCategoryIcon(proposal.category)} {proposal.category}
                </span>
                <span 
                  className="proposal-status"
                  style={{ color: getProposalStatusColor(proposal.status) }}
                >
                  {proposal.status.toUpperCase()}
                </span>
              </div>
              <div className="proposal-impact">
                <span className={`impact-badge ${proposal.impact}`}>
                  {proposal.impact.toUpperCase()} IMPACT
                </span>
              </div>
            </div>

            <div className="proposal-content">
              <h3 className="proposal-title">{proposal.title}</h3>
              <p className="proposal-description">{proposal.description}</p>
              
              <div className="proposal-details">
                <div className="detail-item">
                  <span className="detail-label">Proposer:</span>
                  <span className="detail-value">{proposal.proposer}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Funding:</span>
                  <span className="detail-value">{proposal.fundingRequested}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Deadline:</span>
                  <span className="detail-value">{formatTimeRemaining(proposal.deadline)}</span>
                </div>
              </div>
            </div>

            <div className="proposal-voting">
              <div className="vote-stats">
                <div className="vote-bar">
                  <div 
                    className="vote-progress for"
                    style={{ 
                      width: `${(proposal.votesFor / Math.max(proposal.totalVotes, proposal.quorum)) * 100}%` 
                    }}
                  ></div>
                  <div 
                    className="vote-progress against"
                    style={{ 
                      width: `${(proposal.votesAgainst / Math.max(proposal.totalVotes, proposal.quorum)) * 100}%` 
                    }}
                  ></div>
                  <div 
                    className="vote-progress quorum"
                    style={{ 
                      left: `${(proposal.quorum / Math.max(proposal.totalVotes, proposal.quorum)) * 100}%` 
                    }}
                  ></div>
                </div>
                <div className="vote-numbers">
                  <span className="votes-for">For: {proposal.votesFor.toLocaleString()}</span>
                  <span className="votes-against">Against: {proposal.votesAgainst.toLocaleString()}</span>
                  <span className="votes-quorum">Quorum: {proposal.quorum.toLocaleString()}</span>
                </div>
              </div>

              {proposal.status === 'active' && (
                <div className="vote-buttons">
                  <button 
                    className={`vote-btn for ${userVotes[proposal.id] === 'for' ? 'voted' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleVote(proposal.id, 'for');
                    }}
                    disabled={loading || userVotes[proposal.id]}
                  >
                    {userVotes[proposal.id] === 'for' ? '✓ Voted For' : 'Vote For'}
                  </button>
                  <button 
                    className={`vote-btn against ${userVotes[proposal.id] === 'against' ? 'voted' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleVote(proposal.id, 'against');
                    }}
                    disabled={loading || userVotes[proposal.id]}
                  >
                    {userVotes[proposal.id] === 'against' ? '✓ Voted Against' : 'Vote Against'}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTokenomics = () => (
    <div className="dao-tokenomics-section">
      <div className="tokenomics-header">
        <h2>LEND Token Economics</h2>
        <div className="token-overview">
          <div className="token-stat">
            <span className="token-label">Market Cap</span>
            <span className="token-value">{governanceStats.marketCap}</span>
          </div>
          <div className="token-stat">
            <span className="token-label">Circulating Supply</span>
            <span className="token-value">{governanceStats.circulatingSupply}</span>
          </div>
          <div className="token-stat">
            <span className="token-label">Treasury Value</span>
            <span className="token-value">{governanceStats.treasuryValue}</span>
          </div>
        </div>
      </div>

      <div className="tokenomics-grid">
        <div className="tokenomics-card">
          <h3>Voting Power Distribution</h3>
          <div className="distribution-chart">
            <div className="distribution-item">
              <div className="distribution-bar">
                <div 
                  className="distribution-fill whales"
                  style={{ width: `${governanceStats.votingPowerDistribution.whales}%` }}
                ></div>
              </div>
              <div className="distribution-info">
                <span className="distribution-label">Whales (&gt;100k tokens)</span>
                <span className="distribution-value">{governanceStats.votingPowerDistribution.whales}%</span>
              </div>
            </div>
            <div className="distribution-item">
              <div className="distribution-bar">
                <div 
                  className="distribution-fill dolphins"
                  style={{ width: `${governanceStats.votingPowerDistribution.dolphins}%` }}
                ></div>
              </div>
              <div className="distribution-info">
                <span className="distribution-label">Dolphins (10k-100k tokens)</span>
                <span className="distribution-value">{governanceStats.votingPowerDistribution.dolphins}%</span>
              </div>
            </div>
            <div className="distribution-item">
              <div className="distribution-bar">
                <div 
                  className="distribution-fill minnows"
                  style={{ width: `${governanceStats.votingPowerDistribution.minnows}%` }}
                ></div>
              </div>
              <div className="distribution-info">
                <span className="distribution-label">Minnows (&lt;10k tokens)</span>
                <span className="distribution-value">{governanceStats.votingPowerDistribution.minnows}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="tokenomics-card">
          <h3>Your Token Holdings</h3>
          <div className="user-holdings">
            <div className="holding-item">
              <span className="holding-label">Token Balance</span>
              <span className="holding-value">{userGovernanceData.tokenBalance.toLocaleString()} LEND</span>
            </div>
            <div className="holding-item">
              <span className="holding-label">Direct Voting Power</span>
              <span className="holding-value">{userGovernanceData.votingPower.toLocaleString()}</span>
            </div>
            <div className="holding-item">
              <span className="holding-label">Delegated to You</span>
              <span className="holding-value">{userGovernanceData.receivedDelegations.toLocaleString()}</span>
            </div>
            <div className="holding-item total">
              <span className="holding-label">Total Voting Power</span>
              <span className="holding-value">{userGovernanceData.totalVotingPower.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="tokenomics-card">
          <h3>Treasury Breakdown</h3>
          <div className="treasury-breakdown">
            <div className="treasury-item">
              <div className="treasury-icon">💰</div>
              <div className="treasury-info">
                <span className="treasury-label">Operational Fund</span>
                <span className="treasury-value">4,500 ETH (36%)</span>
              </div>
            </div>
            <div className="treasury-item">
              <div className="treasury-icon">📈</div>
              <div className="treasury-info">
                <span className="treasury-label">Development Fund</span>
                <span className="treasury-value">3,200 ETH (26%)</span>
              </div>
            </div>
            <div className="treasury-item">
              <div className="treasury-icon">🌱</div>
              <div className="treasury-info">
                <span className="treasury-label">Ecosystem Growth</span>
                <span className="treasury-value">2,850 ETH (23%)</span>
              </div>
            </div>
            <div className="treasury-item">
              <div className="treasury-icon">🛡️</div>
              <div className="treasury-info">
                <span className="treasury-label">Insurance Reserve</span>
                <span className="treasury-value">1,900 ETH (15%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDelegation = () => (
    <div className="dao-delegation-section">
      <div className="delegation-header">
        <h2>Vote Delegation</h2>
        <p>Delegate your voting power to trusted community members or vote directly on proposals.</p>
      </div>

      <div className="delegation-status">
        <div className="delegation-card current">
          <h3>Your Delegation Status</h3>
          <div className="delegation-info">
            {userGovernanceData.delegatedTo ? (
              <>
                <div className="delegation-active">
                  <span className="delegation-label">Delegated To:</span>
                  <span className="delegation-value">{userGovernanceData.delegatedTo}</span>
                </div>
                <button 
                  className="revoke-delegation-btn"
                  onClick={() => handleDelegate(null)}
                  disabled={loading}
                >
                  Revoke Delegation
                </button>
              </>
            ) : (
              <div className="delegation-inactive">
                <span className="delegation-label">Status:</span>
                <span className="delegation-value">Self-Voting</span>
                <p>You are voting directly on proposals</p>
              </div>
            )}
          </div>
        </div>

        <div className="delegation-card stats">
          <h3>Delegation Statistics</h3>
          <div className="delegation-stats">
            <div className="stat-item">
              <span className="stat-label">Votes Delegated to You</span>
              <span className="stat-value">{userGovernanceData.receivedDelegations.toLocaleString()}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Number of Delegators</span>
              <span className="stat-value">47</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Reputation Score</span>
              <span className="stat-value">{userGovernanceData.reputationScore}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="delegates-list">
        <h3>Featured Delegates</h3>
        <div className="delegates-grid">
          {delegates.map((delegate, index) => (
            <div key={index} className="delegate-card">
              <div className="delegate-header">
                <div className="delegate-avatar">{delegate.avatar}</div>
                <div className="delegate-info">
                  <h4 className="delegate-name">{delegate.name}</h4>
                  <p className="delegate-address">{delegate.address}</p>
                </div>
              </div>

              <div className="delegate-stats">
                <div className="delegate-stat">
                  <span className="delegate-stat-label">Voting Power</span>
                  <span className="delegate-stat-value">{delegate.votingPower.toLocaleString()}</span>
                </div>
                <div className="delegate-stat">
                  <span className="delegate-stat-label">Delegators</span>
                  <span className="delegate-stat-value">{delegate.delegators}</span>
                </div>
                <div className="delegate-stat">
                  <span className="delegate-stat-label">Participation</span>
                  <span className="delegate-stat-value">{delegate.participationRate}%</span>
                </div>
              </div>

              <div className="delegate-expertise">
                <span className="expertise-label">Expertise:</span>
                <div className="expertise-tags">
                  {delegate.expertise.map((exp, i) => (
                    <span key={i} className="expertise-tag">{exp}</span>
                  ))}
                </div>
              </div>

              <p className="delegate-statement">{delegate.statement}</p>

              <button 
                className={`delegate-btn ${userGovernanceData.delegatedTo === delegate.address ? 'delegated' : ''}`}
                onClick={() => handleDelegate(delegate.address)}
                disabled={loading || userGovernanceData.delegatedTo === delegate.address}
              >
                {userGovernanceData.delegatedTo === delegate.address ? 'Currently Delegated' : 'Delegate to This Address'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="advanced-dao-governance">
      {loading && (
        <div className="dao-loading-overlay">
          <div className="dao-loading-spinner">
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
          </div>
          <p>Processing governance transaction...</p>
        </div>
      )}

      <div className="dao-header">
        <div className="dao-title-section">
          <h1 className="dao-title">🏛️ DAO Governance</h1>
          <p className="dao-subtitle">Participate in decentralized governance and shape the future of Lendify</p>
        </div>
        
        <div className="dao-quick-stats">
          <div className="quick-stat">
            <span className="quick-stat-value">{governanceStats.totalProposals}</span>
            <span className="quick-stat-label">Total Proposals</span>
          </div>
          <div className="quick-stat">
            <span className="quick-stat-value">{governanceStats.activeVoters.toLocaleString()}</span>
            <span className="quick-stat-label">Active Voters</span>
          </div>
          <div className="quick-stat">
            <span className="quick-stat-value">{governanceStats.averageParticipation}%</span>
            <span className="quick-stat-label">Avg Participation</span>
          </div>
        </div>
      </div>

      <div className="dao-tabs">
        <button 
          className={`dao-tab ${activeTab === 'proposals' ? 'active' : ''}`}
          onClick={() => setActiveTab('proposals')}
        >
          📋 Proposals
        </button>
        <button 
          className={`dao-tab ${activeTab === 'tokenomics' ? 'active' : ''}`}
          onClick={() => setActiveTab('tokenomics')}
        >
          💰 Tokenomics
        </button>
        <button 
          className={`dao-tab ${activeTab === 'delegation' ? 'active' : ''}`}
          onClick={() => setActiveTab('delegation')}
        >
          🗳️ Delegation
        </button>
      </div>

      <div className="dao-content">
        {activeTab === 'proposals' && renderProposals()}
        {activeTab === 'tokenomics' && renderTokenomics()}
        {activeTab === 'delegation' && renderDelegation()}
      </div>

      {selectedProposal && (
        <div className="proposal-modal-overlay" onClick={() => setSelectedProposal(null)}>
          <div className="proposal-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedProposal.title}</h2>
              <button 
                className="modal-close"
                onClick={() => setSelectedProposal(null)}
              >
                ✕
              </button>
            </div>
            <div className="modal-content">
              <div className="proposal-full-details">
                <p className="proposal-full-description">{selectedProposal.description}</p>
                
                <div className="proposal-metadata">
                  <div className="metadata-grid">
                    <div className="metadata-item">
                      <span className="metadata-label">Proposal ID:</span>
                      <span className="metadata-value">{selectedProposal.id}</span>
                    </div>
                    <div className="metadata-item">
                      <span className="metadata-label">Category:</span>
                      <span className="metadata-value">
                        {getCategoryIcon(selectedProposal.category)} {selectedProposal.category}
                      </span>
                    </div>
                    <div className="metadata-item">
                      <span className="metadata-label">Status:</span>
                      <span 
                        className="metadata-value"
                        style={{ color: getProposalStatusColor(selectedProposal.status) }}
                      >
                        {selectedProposal.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="metadata-item">
                      <span className="metadata-label">Proposer:</span>
                      <span className="metadata-value">{selectedProposal.proposer}</span>
                    </div>
                    <div className="metadata-item">
                      <span className="metadata-label">Funding Requested:</span>
                      <span className="metadata-value">{selectedProposal.fundingRequested}</span>
                    </div>
                    <div className="metadata-item">
                      <span className="metadata-label">Execution Delay:</span>
                      <span className="metadata-value">{selectedProposal.executionDelay}h</span>
                    </div>
                    <div className="metadata-item">
                      <span className="metadata-label">Created:</span>
                      <span className="metadata-value">{selectedProposal.created.toLocaleDateString()}</span>
                    </div>
                    <div className="metadata-item">
                      <span className="metadata-label">Deadline:</span>
                      <span className="metadata-value">{formatTimeRemaining(selectedProposal.deadline)}</span>
                    </div>
                  </div>
                </div>

                <div className="proposal-voting-details">
                  <h4>Voting Results</h4>
                  <div className="detailed-vote-stats">
                    <div className="vote-stat">
                      <span className="vote-stat-label">Votes For:</span>
                      <span className="vote-stat-value for">{selectedProposal.votesFor.toLocaleString()}</span>
                    </div>
                    <div className="vote-stat">
                      <span className="vote-stat-label">Votes Against:</span>
                      <span className="vote-stat-value against">{selectedProposal.votesAgainst.toLocaleString()}</span>
                    </div>
                    <div className="vote-stat">
                      <span className="vote-stat-label">Total Votes:</span>
                      <span className="vote-stat-value">{selectedProposal.totalVotes.toLocaleString()}</span>
                    </div>
                    <div className="vote-stat">
                      <span className="vote-stat-label">Quorum Required:</span>
                      <span className="vote-stat-value">{selectedProposal.quorum.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedDAOGovernance;