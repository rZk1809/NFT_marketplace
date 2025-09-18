import React, { useState, useEffect } from 'react';
import './AdvancedAnalyticsDashboard.css';
import AIAnalytics from './AIAnalytics.jsx';

const AdvancedAnalyticsDashboard = ({ userStats, platformData, userId }) => {
  const [activeTab, setActiveTab] = useState('market');
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('volume');
  const [chartData, setChartData] = useState({});
  const [loading, setLoading] = useState(false);
  const [realtimeData, setRealtimeData] = useState({});

  // Mock market analytics data
  const marketAnalytics = {
    overview: {
      totalVolume: '45.7M',
      volumeChange: '+15.3%',
      totalRentals: '12,847',
      rentalChange: '+8.7%',
      avgRentalPrice: '0.045 ETH',
      priceChange: '+2.1%',
      activeRentals: '8,934',
      utilization: '67.2%'
    },
    topCategories: [
      {
        category: 'Gaming Assets',
        volume: '12.3M ETH',
        change: '+18.5%',
        share: 27.2,
        color: '#00ff88'
      },
      {
        category: 'Digital Art',
        volume: '8.9M ETH',
        change: '+12.1%',
        share: 19.5,
        color: '#8a2be2'
      },
      {
        category: 'Virtual Land',
        volume: '7.1M ETH',
        change: '+9.8%',
        share: 15.6,
        color: '#ffd700'
      },
      {
        category: 'Collectibles',
        volume: '6.4M ETH',
        change: '+14.2%',
        share: 14.1,
        color: '#ff4444'
      },
      {
        category: 'Music NFTs',
        volume: '4.8M ETH',
        change: '+22.7%',
        share: 10.5,
        color: '#00aaff'
      },
      {
        category: 'Utility',
        volume: '3.2M ETH',
        change: '+6.9%',
        share: 7.0,
        color: '#ff8800'
      },
      {
        category: 'Other',
        volume: '2.8M ETH',
        change: '+4.3%',
        share: 6.1,
        color: '#888888'
      }
    ],
    priceAnalysis: {
      '24h': {
        high: '0.089 ETH',
        low: '0.032 ETH',
        average: '0.045 ETH',
        median: '0.041 ETH'
      },
      '7d': {
        high: '0.125 ETH',
        low: '0.028 ETH',
        average: '0.047 ETH',
        median: '0.043 ETH'
      },
      '30d': {
        high: '0.156 ETH',
        low: '0.018 ETH',
        average: '0.042 ETH',
        median: '0.038 ETH'
      }
    }
  };

  // Mock rental analytics data
  const rentalAnalytics = {
    patterns: {
      peakHours: [
        { hour: '00', rentals: 45 },
        { hour: '06', rentals: 78 },
        { hour: '12', rentals: 156 },
        { hour: '18', rentals: 234 },
        { hour: '21', rentals: 189 }
      ],
      dayOfWeek: [
        { day: 'Mon', rentals: 1245, revenue: '23.4 ETH' },
        { day: 'Tue', rentals: 1189, revenue: '21.8 ETH' },
        { day: 'Wed', rentals: 1456, revenue: '28.9 ETH' },
        { day: 'Thu', rentals: 1678, revenue: '34.2 ETH' },
        { day: 'Fri', rentals: 1934, revenue: '42.1 ETH' },
        { day: 'Sat', rentals: 2143, revenue: '45.6 ETH' },
        { day: 'Sun', rentals: 1876, revenue: '38.7 ETH' }
      ]
    },
    demographics: {
      byRegion: [
        { region: 'North America', share: 34.2, users: 4892 },
        { region: 'Europe', share: 28.7, users: 4108 },
        { region: 'Asia Pacific', share: 24.1, users: 3451 },
        { region: 'South America', share: 8.3, users: 1189 },
        { region: 'Africa', share: 3.4, users: 487 },
        { region: 'Other', share: 1.3, users: 186 }
      ],
      byAge: [
        { range: '18-24', share: 23.4, activity: 'High' },
        { range: '25-34', share: 41.2, activity: 'Very High' },
        { range: '35-44', share: 22.1, activity: 'Medium' },
        { range: '45-54', share: 9.8, activity: 'Low' },
        { range: '55+', share: 3.5, activity: 'Very Low' }
      ]
    },
    cohortAnalysis: {
      retention: [
        { period: 'Week 1', cohort2023Q1: 89.2, cohort2023Q2: 91.4, cohort2023Q3: 88.7, cohort2023Q4: 92.1 },
        { period: 'Week 2', cohort2023Q1: 76.3, cohort2023Q2: 79.8, cohort2023Q3: 74.5, cohort2023Q4: 81.2 },
        { period: 'Month 1', cohort2023Q1: 68.4, cohort2023Q2: 72.1, cohort2023Q3: 69.8, cohort2023Q4: 75.3 },
        { period: 'Month 3', cohort2023Q1: 45.7, cohort2023Q2: 49.2, cohort2023Q3: 47.1, cohort2023Q4: 52.4 }
      ]
    }
  };

  // Mock portfolio analytics
  const portfolioAnalytics = {
    performance: {
      totalValue: '234.7 ETH',
      valueChange: '+18.3%',
      realizedGains: '45.2 ETH',
      unrealizedGains: '12.1 ETH',
      totalReturn: '24.7%',
      sharpeRatio: 1.34,
      maxDrawdown: '-8.9%',
      winRate: '68.2%'
    },
    diversification: {
      byCategory: [
        { category: 'Art', allocation: 35.2, value: '82.7 ETH', performance: '+21.4%' },
        { category: 'Gaming', allocation: 28.9, value: '67.8 ETH', performance: '+15.8%' },
        { category: 'Collectibles', allocation: 18.3, value: '43.0 ETH', performance: '+12.1%' },
        { category: 'Utility', allocation: 12.1, value: '28.4 ETH', performance: '+8.9%' },
        { category: 'Land', allocation: 5.5, value: '12.9 ETH', performance: '+31.2%' }
      ],
      riskMetrics: {
        volatility: '24.7%',
        beta: 1.12,
        correlation: 0.73,
        var95: '-12.4%',
        expectedShortfall: '-18.9%'
      }
    },
    recommendations: [
      {
        type: 'rebalance',
        title: 'Portfolio Rebalancing Suggested',
        description: 'Your art allocation is 10% above target. Consider reducing exposure.',
        impact: 'Moderate',
        urgency: 'Low'
      },
      {
        type: 'opportunity',
        title: 'Utility NFTs Undervalued',
        description: 'Technical analysis suggests utility NFTs are 15% undervalued.',
        impact: 'High',
        urgency: 'Medium'
      },
      {
        type: 'risk',
        title: 'High Correlation Warning',
        description: 'Your portfolio correlation with ETH is above optimal range.',
        impact: 'High',
        urgency: 'High'
      }
    ]
  };

  // Mock predictive analytics
  const predictiveAnalytics = {
    priceForecasts: [
      {
        asset: 'Gaming Assets',
        currentPrice: '0.045 ETH',
        prediction7d: { price: '0.052 ETH', confidence: 73.2, direction: 'up' },
        prediction30d: { price: '0.061 ETH', confidence: 68.9, direction: 'up' },
        factors: ['Metaverse adoption', 'Gaming season', 'New platform launches']
      },
      {
        asset: 'Digital Art',
        currentPrice: '0.089 ETH',
        prediction7d: { price: '0.084 ETH', confidence: 69.1, direction: 'down' },
        prediction30d: { price: '0.095 ETH', confidence: 71.8, direction: 'up' },
        factors: ['Market correction', 'Institutional interest', 'Creator partnerships']
      },
      {
        asset: 'Virtual Land',
        currentPrice: '0.234 ETH',
        prediction7d: { price: '0.267 ETH', confidence: 81.4, direction: 'up' },
        prediction30d: { price: '0.289 ETH', confidence: 76.2, direction: 'up' },
        factors: ['Metaverse expansion', 'Virtual events', 'Development announcements']
      }
    ],
    marketSentiment: {
      overall: 72.4,
      social: 68.9,
      onchain: 75.1,
      technical: 71.8,
      trends: [
        { keyword: 'metaverse', sentiment: 84.2, mentions: 15400 },
        { keyword: 'gaming NFT', sentiment: 79.1, mentions: 12800 },
        { keyword: 'rental', sentiment: 71.5, mentions: 8900 },
        { keyword: 'utility token', sentiment: 67.3, mentions: 6200 }
      ]
    },
    riskAssessment: {
      marketRisk: {
        level: 'Moderate',
        score: 6.2,
        factors: ['Market volatility', 'Regulatory uncertainty', 'Liquidity concerns']
      },
      liquidityRisk: {
        level: 'Low',
        score: 3.8,
        factors: ['High trading volume', 'Multiple platforms', 'Active market makers']
      },
      technicalRisk: {
        level: 'Low',
        score: 2.9,
        factors: ['Proven smart contracts', 'Regular audits', 'Bug bounty programs']
      }
    }
  };

  useEffect(() => {
    // Simulate real-time data updates
    const interval = setInterval(() => {
      setRealtimeData(prev => ({
        ...prev,
        timestamp: new Date().toLocaleTimeString(),
        activeUsers: Math.floor(Math.random() * 1000) + 8000,
        liveRentals: Math.floor(Math.random() * 50) + 150,
        volumeFlow: (Math.random() * 10 - 5).toFixed(2)
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  const handleMetricChange = (metric) => {
    setSelectedMetric(metric);
    // Simulate chart data update
    setLoading(true);
    setTimeout(() => setLoading(false), 800);
  };

  const renderMarketAnalytics = () => (
    <div className="analytics-market-section">
      <div className="market-header">
        <div className="market-title">
          <h2>Market Analytics</h2>
          <div className="realtime-indicator">
            <span className="pulse-dot"></span>
            <span>Live Data</span>
            <span className="timestamp">{realtimeData.timestamp}</span>
          </div>
        </div>
        
        <div className="time-range-selector">
          {['24h', '7d', '30d', '90d', '1y'].map(range => (
            <button
              key={range}
              className={`time-btn ${timeRange === range ? 'active' : ''}`}
              onClick={() => handleTimeRangeChange(range)}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="market-overview">
        <div className="overview-cards">
          <div className="overview-card">
            <div className="card-icon">📊</div>
            <div className="card-content">
              <h3>Total Volume</h3>
              <div className="card-value">
                <span className="main-value">{marketAnalytics.overview.totalVolume}</span>
                <span className="change positive">{marketAnalytics.overview.volumeChange}</span>
              </div>
            </div>
          </div>

          <div className="overview-card">
            <div className="card-icon">🏠</div>
            <div className="card-content">
              <h3>Total Rentals</h3>
              <div className="card-value">
                <span className="main-value">{marketAnalytics.overview.totalRentals}</span>
                <span className="change positive">{marketAnalytics.overview.rentalChange}</span>
              </div>
            </div>
          </div>

          <div className="overview-card">
            <div className="card-icon">💰</div>
            <div className="card-content">
              <h3>Avg Rental Price</h3>
              <div className="card-value">
                <span className="main-value">{marketAnalytics.overview.avgRentalPrice}</span>
                <span className="change positive">{marketAnalytics.overview.priceChange}</span>
              </div>
            </div>
          </div>

          <div className="overview-card">
            <div className="card-icon">⚡</div>
            <div className="card-content">
              <h3>Active Rentals</h3>
              <div className="card-value">
                <span className="main-value">{marketAnalytics.overview.activeRentals}</span>
                <span className="utilization">{marketAnalytics.overview.utilization}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="market-charts">
        <div className="chart-container main-chart">
          <div className="chart-header">
            <h3>Market Trends</h3>
            <div className="metric-selector">
              {[
                { key: 'volume', label: 'Volume' },
                { key: 'price', label: 'Price' },
                { key: 'rentals', label: 'Rentals' },
                { key: 'utilization', label: 'Utilization' }
              ].map(metric => (
                <button
                  key={metric.key}
                  className={`metric-btn ${selectedMetric === metric.key ? 'active' : ''}`}
                  onClick={() => handleMetricChange(metric.key)}
                >
                  {metric.label}
                </button>
              ))}
            </div>
          </div>
          <div className="chart-placeholder">
            <div className="chart-visual">
              <div className="chart-bars">
                {Array.from({ length: 20 }, (_, i) => (
                  <div
                    key={i}
                    className="chart-bar"
                    style={{ 
                      height: `${Math.random() * 80 + 20}%`,
                      background: `linear-gradient(180deg, #00ff88, ${['#8a2be2', '#ffd700', '#ff4444'][i % 3]})` 
                    }}
                  ></div>
                ))}
              </div>
              <div className="chart-line">
                <svg width="100%" height="100%" viewBox="0 0 400 100">
                  <path
                    d="M 0 80 Q 50 60 100 65 T 200 45 T 300 35 T 400 20"
                    stroke="#00ff88"
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray="5,5"
                  />
                </svg>
              </div>
            </div>
            {loading && <div className="chart-loading">Updating...</div>}
          </div>
        </div>

        <div className="chart-container category-chart">
          <div className="chart-header">
            <h3>Category Distribution</h3>
          </div>
          <div className="category-breakdown">
            {marketAnalytics.topCategories.map((category, index) => (
              <div key={index} className="category-item">
                <div className="category-info">
                  <div className="category-name">
                    <div 
                      className="category-color" 
                      style={{ backgroundColor: category.color }}
                    ></div>
                    <span>{category.category}</span>
                  </div>
                  <div className="category-metrics">
                    <span className="category-volume">{category.volume}</span>
                    <span className={`category-change ${category.change.startsWith('+') ? 'positive' : 'negative'}`}>
                      {category.change}
                    </span>
                  </div>
                </div>
                <div className="category-bar">
                  <div 
                    className="category-fill"
                    style={{ 
                      width: `${category.share}%`,
                      backgroundColor: category.color 
                    }}
                  ></div>
                </div>
                <div className="category-share">{category.share}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="price-analysis">
        <h3>Price Analysis</h3>
        <div className="price-stats">
          {Object.entries(marketAnalytics.priceAnalysis).map(([period, data]) => (
            <div key={period} className="price-period">
              <h4>{period.toUpperCase()}</h4>
              <div className="price-metrics">
                <div className="price-metric">
                  <span className="metric-label">High</span>
                  <span className="metric-value">{data.high}</span>
                </div>
                <div className="price-metric">
                  <span className="metric-label">Low</span>
                  <span className="metric-value">{data.low}</span>
                </div>
                <div className="price-metric">
                  <span className="metric-label">Average</span>
                  <span className="metric-value">{data.average}</span>
                </div>
                <div className="price-metric">
                  <span className="metric-label">Median</span>
                  <span className="metric-value">{data.median}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderRentalAnalytics = () => (
    <div className="analytics-rental-section">
      <div className="rental-header">
        <h2>Rental Analytics</h2>
        <div className="live-stats">
          <div className="live-stat">
            <span className="live-label">Live Rentals</span>
            <span className="live-value">{realtimeData.liveRentals || 167}</span>
          </div>
          <div className="live-stat">
            <span className="live-label">Active Users</span>
            <span className="live-value">{realtimeData.activeUsers || 8234}</span>
          </div>
        </div>
      </div>

      <div className="rental-patterns">
        <div className="pattern-chart hourly">
          <h3>Hourly Rental Patterns</h3>
          <div className="hourly-chart">
            {rentalAnalytics.patterns.peakHours.map((data, index) => (
              <div key={index} className="hour-bar">
                <div 
                  className="hour-fill"
                  style={{ height: `${(data.rentals / 250) * 100}%` }}
                ></div>
                <span className="hour-label">{data.hour}:00</span>
                <span className="hour-value">{data.rentals}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="pattern-chart weekly">
          <h3>Weekly Rental Distribution</h3>
          <div className="weekly-chart">
            {rentalAnalytics.patterns.dayOfWeek.map((data, index) => (
              <div key={index} className="day-item">
                <div className="day-header">
                  <span className="day-name">{data.day}</span>
                  <span className="day-revenue">{data.revenue}</span>
                </div>
                <div className="day-bar">
                  <div 
                    className="day-fill"
                    style={{ width: `${(data.rentals / 2200) * 100}%` }}
                  ></div>
                </div>
                <div className="day-rentals">{data.rentals} rentals</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="demographics-analysis">
        <div className="demographics-chart region">
          <h3>Geographic Distribution</h3>
          <div className="region-breakdown">
            {rentalAnalytics.demographics.byRegion.map((region, index) => (
              <div key={index} className="region-item">
                <div className="region-info">
                  <span className="region-name">{region.region}</span>
                  <span className="region-users">{region.users.toLocaleString()} users</span>
                </div>
                <div className="region-bar">
                  <div 
                    className="region-fill"
                    style={{ width: `${region.share}%` }}
                  ></div>
                </div>
                <div className="region-share">{region.share}%</div>
              </div>
            ))}
          </div>
        </div>

        <div className="demographics-chart age">
          <h3>Age Demographics</h3>
          <div className="age-breakdown">
            {rentalAnalytics.demographics.byAge.map((age, index) => (
              <div key={index} className="age-item">
                <div className="age-range">{age.range}</div>
                <div className="age-bar">
                  <div 
                    className="age-fill"
                    style={{ width: `${age.share}%` }}
                  ></div>
                </div>
                <div className="age-stats">
                  <span className="age-share">{age.share}%</span>
                  <span className={`age-activity ${age.activity.toLowerCase().replace(' ', '-')}`}>
                    {age.activity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="cohort-analysis">
        <h3>User Retention Cohort Analysis</h3>
        <div className="cohort-table">
          <div className="cohort-header">
            <div className="cohort-cell period">Period</div>
            <div className="cohort-cell">Q1 2023</div>
            <div className="cohort-cell">Q2 2023</div>
            <div className="cohort-cell">Q3 2023</div>
            <div className="cohort-cell">Q4 2023</div>
          </div>
          {rentalAnalytics.cohortAnalysis.retention.map((row, index) => (
            <div key={index} className="cohort-row">
              <div className="cohort-cell period">{row.period}</div>
              <div className="cohort-cell">
                <span className="retention-rate">{row.cohort2023Q1}%</span>
                <div 
                  className="retention-bar"
                  style={{ width: `${row.cohort2023Q1}%` }}
                ></div>
              </div>
              <div className="cohort-cell">
                <span className="retention-rate">{row.cohort2023Q2}%</span>
                <div 
                  className="retention-bar"
                  style={{ width: `${row.cohort2023Q2}%` }}
                ></div>
              </div>
              <div className="cohort-cell">
                <span className="retention-rate">{row.cohort2023Q3}%</span>
                <div 
                  className="retention-bar"
                  style={{ width: `${row.cohort2023Q3}%` }}
                ></div>
              </div>
              <div className="cohort-cell">
                <span className="retention-rate">{row.cohort2023Q4}%</span>
                <div 
                  className="retention-bar"
                  style={{ width: `${row.cohort2023Q4}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPortfolioAnalytics = () => (
    <div className="analytics-portfolio-section">
      <div className="portfolio-header">
        <h2>Portfolio Analytics</h2>
        <div className="portfolio-summary">
          <div className="summary-card">
            <span className="summary-label">Total Value</span>
            <span className="summary-value">{portfolioAnalytics.performance.totalValue}</span>
          </div>
          <div className="summary-card">
            <span className="summary-label">Total Return</span>
            <span className="summary-value positive">{portfolioAnalytics.performance.totalReturn}</span>
          </div>
          <div className="summary-card">
            <span className="summary-label">Sharpe Ratio</span>
            <span className="summary-value">{portfolioAnalytics.performance.sharpeRatio}</span>
          </div>
        </div>
      </div>

      <div className="performance-metrics">
        <div className="metrics-grid">
          <div className="metric-card">
            <h4>Value Change</h4>
            <span className="metric-value positive">{portfolioAnalytics.performance.valueChange}</span>
          </div>
          <div className="metric-card">
            <h4>Realized Gains</h4>
            <span className="metric-value">{portfolioAnalytics.performance.realizedGains}</span>
          </div>
          <div className="metric-card">
            <h4>Unrealized Gains</h4>
            <span className="metric-value">{portfolioAnalytics.performance.unrealizedGains}</span>
          </div>
          <div className="metric-card">
            <h4>Max Drawdown</h4>
            <span className="metric-value negative">{portfolioAnalytics.performance.maxDrawdown}</span>
          </div>
          <div className="metric-card">
            <h4>Win Rate</h4>
            <span className="metric-value">{portfolioAnalytics.performance.winRate}</span>
          </div>
        </div>
      </div>

      <div className="diversification-analysis">
        <div className="allocation-chart">
          <h3>Asset Allocation</h3>
          <div className="allocation-breakdown">
            {portfolioAnalytics.diversification.byCategory.map((category, index) => (
              <div key={index} className="allocation-item">
                <div className="allocation-header">
                  <span className="allocation-category">{category.category}</span>
                  <span className="allocation-percentage">{category.allocation}%</span>
                </div>
                <div className="allocation-details">
                  <span className="allocation-value">{category.value}</span>
                  <span className={`allocation-performance ${category.performance.startsWith('+') ? 'positive' : 'negative'}`}>
                    {category.performance}
                  </span>
                </div>
                <div className="allocation-bar">
                  <div 
                    className="allocation-fill"
                    style={{ width: `${category.allocation}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="risk-metrics">
          <h3>Risk Metrics</h3>
          <div className="risk-grid">
            {Object.entries(portfolioAnalytics.diversification.riskMetrics).map(([key, value]) => (
              <div key={key} className="risk-item">
                <span className="risk-label">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </span>
                <span className="risk-value">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="portfolio-recommendations">
        <h3>AI Recommendations</h3>
        <div className="recommendations-list">
          {portfolioAnalytics.recommendations.map((rec, index) => (
            <div key={index} className={`recommendation-card ${rec.type}`}>
              <div className="recommendation-header">
                <div className="recommendation-icon">
                  {rec.type === 'rebalance' ? '⚖️' : rec.type === 'opportunity' ? '💡' : '⚠️'}
                </div>
                <div className="recommendation-meta">
                  <h4>{rec.title}</h4>
                  <div className="recommendation-badges">
                    <span className={`impact-badge ${rec.impact.toLowerCase()}`}>{rec.impact} Impact</span>
                    <span className={`urgency-badge ${rec.urgency.toLowerCase()}`}>{rec.urgency} Urgency</span>
                  </div>
                </div>
              </div>
              <p className="recommendation-description">{rec.description}</p>
              <div className="recommendation-actions">
                <button className="action-btn primary">View Details</button>
                <button className="action-btn secondary">Dismiss</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPredictiveAnalytics = () => (
    <div className="analytics-predictive-section">
      <div className="predictive-header">
        <h2>Predictive Analytics</h2>
        <div className="ai-indicator">
          <span className="ai-icon">🤖</span>
          <span>AI-Powered Insights</span>
        </div>
      </div>

      <div className="price-forecasts">
        <h3>Price Forecasts</h3>
        <div className="forecasts-grid">
          {predictiveAnalytics.priceForecasts.map((forecast, index) => (
            <div key={index} className="forecast-card">
              <div className="forecast-header">
                <h4>{forecast.asset}</h4>
                <span className="current-price">{forecast.currentPrice}</span>
              </div>
              
              <div className="forecast-predictions">
                <div className="prediction-item">
                  <div className="prediction-period">7 Day Forecast</div>
                  <div className="prediction-details">
                    <span className={`prediction-price ${forecast.prediction7d.direction}`}>
                      {forecast.prediction7d.price}
                    </span>
                    <span className="prediction-confidence">{forecast.prediction7d.confidence}% confidence</span>
                  </div>
                  <div className="prediction-arrow">
                    {forecast.prediction7d.direction === 'up' ? '↗️' : '↘️'}
                  </div>
                </div>
                
                <div className="prediction-item">
                  <div className="prediction-period">30 Day Forecast</div>
                  <div className="prediction-details">
                    <span className={`prediction-price ${forecast.prediction30d.direction}`}>
                      {forecast.prediction30d.price}
                    </span>
                    <span className="prediction-confidence">{forecast.prediction30d.confidence}% confidence</span>
                  </div>
                  <div className="prediction-arrow">
                    {forecast.prediction30d.direction === 'up' ? '↗️' : '↘️'}
                  </div>
                </div>
              </div>

              <div className="forecast-factors">
                <h5>Key Factors</h5>
                <div className="factors-list">
                  {forecast.factors.map((factor, i) => (
                    <span key={i} className="factor-tag">{factor}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="sentiment-analysis">
        <div className="sentiment-overview">
          <h3>Market Sentiment</h3>
          <div className="sentiment-gauge">
            <div className="gauge-container">
              <div 
                className="gauge-fill"
                style={{ 
                  transform: `rotate(${(predictiveAnalytics.marketSentiment.overall - 50) * 1.8}deg)` 
                }}
              ></div>
              <div className="gauge-value">
                {predictiveAnalytics.marketSentiment.overall}
              </div>
            </div>
            <div className="gauge-labels">
              <span>Bearish</span>
              <span>Bullish</span>
            </div>
          </div>
        </div>

        <div className="sentiment-breakdown">
          <div className="sentiment-sources">
            <div className="sentiment-source">
              <span className="source-label">Social Media</span>
              <div className="source-bar">
                <div 
                  className="source-fill"
                  style={{ width: `${predictiveAnalytics.marketSentiment.social}%` }}
                ></div>
              </div>
              <span className="source-value">{predictiveAnalytics.marketSentiment.social}</span>
            </div>
            <div className="sentiment-source">
              <span className="source-label">On-Chain Data</span>
              <div className="source-bar">
                <div 
                  className="source-fill"
                  style={{ width: `${predictiveAnalytics.marketSentiment.onchain}%` }}
                ></div>
              </div>
              <span className="source-value">{predictiveAnalytics.marketSentiment.onchain}</span>
            </div>
            <div className="sentiment-source">
              <span className="source-label">Technical Analysis</span>
              <div className="source-bar">
                <div 
                  className="source-fill"
                  style={{ width: `${predictiveAnalytics.marketSentiment.technical}%` }}
                ></div>
              </div>
              <span className="source-value">{predictiveAnalytics.marketSentiment.technical}</span>
            </div>
          </div>

          <div className="trending-keywords">
            <h4>Trending Keywords</h4>
            <div className="keywords-list">
              {predictiveAnalytics.marketSentiment.trends.map((trend, index) => (
                <div key={index} className="keyword-item">
                  <span className="keyword-name">{trend.keyword}</span>
                  <div className="keyword-metrics">
                    <span className="keyword-sentiment">{trend.sentiment}</span>
                    <span className="keyword-mentions">{trend.mentions.toLocaleString()} mentions</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="risk-assessment">
        <h3>Risk Assessment</h3>
        <div className="risk-categories">
          {Object.entries(predictiveAnalytics.riskAssessment).map(([category, data]) => (
            <div key={category} className="risk-category">
              <div className="risk-header">
                <h4>
                  {category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </h4>
                <div className="risk-level-container">
                  <span className={`risk-level ${data.level.toLowerCase()}`}>{data.level}</span>
                  <span className="risk-score">{data.score}/10</span>
                </div>
              </div>
              <div className="risk-progress">
                <div 
                  className={`risk-fill ${data.level.toLowerCase()}`}
                  style={{ width: `${data.score * 10}%` }}
                ></div>
              </div>
              <div className="risk-factors">
                {data.factors.map((factor, index) => (
                  <span key={index} className="risk-factor">{factor}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="advanced-analytics-dashboard">
      {loading && (
        <div className="analytics-loading-overlay">
          <div className="analytics-loading-spinner">
            <div className="spinner-segment"></div>
            <div className="spinner-segment"></div>
            <div className="spinner-segment"></div>
            <div className="spinner-segment"></div>
          </div>
          <p>Analyzing data...</p>
        </div>
      )}

      <div className="analytics-header">
        <div className="analytics-title-section">
          <h1 className="analytics-title">📊 Advanced Analytics</h1>
          <p className="analytics-subtitle">Comprehensive market insights and data-driven intelligence</p>
        </div>
        
        <div className="analytics-controls">
          <div className="export-options">
            <button className="export-btn">📤 Export</button>
            <button className="refresh-btn">🔄 Refresh</button>
          </div>
          <div className="view-options">
            <button className="view-btn">📱 Mobile View</button>
            <button className="view-btn">🖥️ Desktop View</button>
          </div>
        </div>
      </div>

      <div className="analytics-tabs">
        <button 
          className={`analytics-tab ${activeTab === 'market' ? 'active' : ''}`}
          onClick={() => setActiveTab('market')}
        >
          📈 Market Analytics
        </button>
        <button 
          className={`analytics-tab ${activeTab === 'rental' ? 'active' : ''}`}
          onClick={() => setActiveTab('rental')}
        >
          🏠 Rental Insights
        </button>
        <button 
          className={`analytics-tab ${activeTab === 'portfolio' ? 'active' : ''}`}
          onClick={() => setActiveTab('portfolio')}
        >
          💼 Portfolio Analysis
        </button>
        <button
          className={`analytics-tab ${activeTab === 'predictive' ? 'active' : ''}`}
          onClick={() => setActiveTab('predictive')}
        >
          🔮 Predictive AI
        </button>
        <button
          className={`analytics-tab ${activeTab === 'ai-analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('ai-analytics')}
        >
          🤖 AI Analytics
        </button>
      </div>

      <div className="analytics-content">
        {activeTab === 'market' && renderMarketAnalytics()}
        {activeTab === 'rental' && renderRentalAnalytics()}
        {activeTab === 'portfolio' && renderPortfolioAnalytics()}
        {activeTab === 'predictive' && renderPredictiveAnalytics()}
        {activeTab === 'ai-analytics' && (
          <AIAnalytics
            userStats={userStats}
            userId={userId || userStats?.walletAddress}
          />
        )}
      </div>
    </div>
  );
};

export default AdvancedAnalyticsDashboard;