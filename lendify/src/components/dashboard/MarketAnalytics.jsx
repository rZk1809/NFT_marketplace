import React, { useState, useEffect } from 'react'
import { aiAnalyticsService } from '../../services/aiAnalyticsService.js'
import './MarketAnalytics.css'

const MarketAnalytics = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [marketData, setMarketData] = useState(null)
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d')
  const [selectedMetric, setSelectedMetric] = useState('volume')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadMarketAnalytics()
  }, [selectedTimeframe])

  const loadMarketAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)

      const [marketAnalytics, platformStats] = await Promise.all([
        aiAnalyticsService.getMarketAnalytics(selectedTimeframe),
        aiAnalyticsService.getPlatformStats()
      ])

      setMarketData({
        ...marketAnalytics,
        platformStats
      })
    } catch (err) {
      console.error('Error loading market analytics:', err)
      setError('Failed to load market analytics. Please try again.')

      // Fallback to mock data
      const fallbackData = aiAnalyticsService.getMockMarketAnalytics(selectedTimeframe)
      setMarketData(fallbackData)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await aiAnalyticsService.clearCache()
      await loadMarketAnalytics()
    } catch (err) {
      setError('Failed to refresh data')
    } finally {
      setRefreshing(false)
    }
  }

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const formatCurrency = (amount) => {
    return `${amount.toFixed(2)} ETH`
  }

  const getChangeColor = (change) => {
    return change >= 0 ? '#00ff88' : '#ff4444'
  }

  const getChangeIcon = (change) => {
    return change >= 0 ? '↗' : '↘'
  }

  if (loading) {
    return (
      <div className="market-analytics-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading Market Analytics...</p>
        </div>
      </div>
    )
  }

  if (error && !marketData) {
    return (
      <div className="market-analytics-container">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <p>{error}</p>
          <button className="retry-btn" onClick={loadMarketAnalytics}>
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="market-analytics-container">
      {/* Header */}
      <div className="market-analytics-header">
        <div className="header-content">
          <h2 className="gradient-text">📊 Market Analytics</h2>
          <p className="header-subtitle">
            Comprehensive market insights and performance metrics
          </p>
        </div>

        <div className="header-controls">
          <div className="timeframe-selector">
            {['7d', '30d', '90d'].map(timeframe => (
              <button
                key={timeframe}
                className={`timeframe-btn ${selectedTimeframe === timeframe ? 'active' : ''}`}
                onClick={() => setSelectedTimeframe(timeframe)}
              >
                {timeframe}
              </button>
            ))}
          </div>

          <button
            className={`refresh-btn ${refreshing ? 'loading' : ''}`}
            onClick={handleRefresh}
            disabled={refreshing}
          >
            🔄 {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="key-metrics-grid">
        <div className="metric-card volume">
          <div className="metric-header">
            <h3>Total Volume</h3>
            <div
              className="metric-change"
              style={{ color: getChangeColor(marketData.volumeChange || 12.5) }}
            >
              {getChangeIcon(marketData.volumeChange || 12.5)} {Math.abs(marketData.volumeChange || 12.5)}%
            </div>
          </div>
          <div className="metric-value">{formatCurrency(marketData.totalVolume || 1234.56)}</div>
          <p className="metric-description">Total trading volume</p>
        </div>

        <div className="metric-card users">
          <div className="metric-header">
            <h3>Active Users</h3>
            <div
              className="metric-change"
              style={{ color: getChangeColor(marketData.userChange || 8.3) }}
            >
              {getChangeIcon(marketData.userChange || 8.3)} {Math.abs(marketData.userChange || 8.3)}%
            </div>
          </div>
          <div className="metric-value">{formatNumber(marketData.activeUsers || 5678)}</div>
          <p className="metric-description">Active platform users</p>
        </div>

        <div className="metric-card price">
          <div className="metric-header">
            <h3>Avg. Rental Price</h3>
            <div
              className="metric-change"
              style={{ color: getChangeColor(marketData.priceChange || -3.2) }}
            >
              {getChangeIcon(marketData.priceChange || -3.2)} {Math.abs(marketData.priceChange || -3.2)}%
            </div>
          </div>
          <div className="metric-value">{formatCurrency(marketData.averagePrice || 0.15)}</div>
          <p className="metric-description">Average daily rental price</p>
        </div>

        <div className="metric-card transactions">
          <div className="metric-header">
            <h3>Transactions</h3>
            <div
              className="metric-change"
              style={{ color: getChangeColor(marketData.transactionChange || 15.7) }}
            >
              {getChangeIcon(marketData.transactionChange || 15.7)} {Math.abs(marketData.transactionChange || 15.7)}%
            </div>
          </div>
          <div className="metric-value">{formatNumber(marketData.totalTransactions || 2341)}</div>
          <p className="metric-description">Total transactions</p>
        </div>
      </div>

      {/* Categories and Collections */}
      <div className="analytics-sections">
        <div className="categories-section">
          <div className="section-header">
            <h3>📊 Top Categories</h3>
            <div className="metric-selector">
              <button
                className={`metric-btn ${selectedMetric === 'volume' ? 'active' : ''}`}
                onClick={() => setSelectedMetric('volume')}
              >
                Volume
              </button>
              <button
                className={`metric-btn ${selectedMetric === 'transactions' ? 'active' : ''}`}
                onClick={() => setSelectedMetric('transactions')}
              >
                Transactions
              </button>
            </div>
          </div>

          <div className="categories-list">
            {(marketData.topCategories || []).map((category, index) => (
              <div key={index} className="category-item">
                <div className="category-info">
                  <div className="category-name">{category.name}</div>
                  <div className="category-volume">{formatCurrency(category.volume)}</div>
                </div>
                <div className="category-percentage">
                  <span>{category.percentage}%</span>
                  <div className="percentage-bar">
                    <div
                      className="percentage-fill"
                      style={{ width: `${category.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="collections-section">
          <div className="section-header">
            <h3>🏆 Top Collections</h3>
            <button className="view-all-btn">View All</button>
          </div>

          <div className="collections-list">
            {(marketData.topCollections || []).map((collection, index) => (
              <div key={index} className="collection-item">
                <div className="collection-rank">#{index + 1}</div>
                <div className="collection-info">
                  <div className="collection-name">{collection.name}</div>
                  <div className="collection-stats">
                    Volume: {formatCurrency(collection.volume)}
                  </div>
                </div>
                <div
                  className="collection-change"
                  style={{ color: getChangeColor(collection.change) }}
                >
                  {getChangeIcon(collection.change)} {Math.abs(collection.change)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="chart-section">
        <div className="chart-header">
          <h3>📈 Market Trends</h3>
          <div className="chart-controls">
            <div className="chart-type-selector">
              <button className="chart-type-btn active">Line</button>
              <button className="chart-type-btn">Bar</button>
              <button className="chart-type-btn">Area</button>
            </div>
          </div>
        </div>

        <div className="chart-container">
          <div className="chart-placeholder">
            <div className="chart-icon">📊</div>
            <h4>Interactive Chart</h4>
            <p>Real-time market data visualization</p>
            <div className="chart-features">
              <span>• Price History</span>
              <span>• Volume Trends</span>
              <span>• User Activity</span>
              <span>• Market Sentiment</span>
            </div>
            <button className="primary-btn">Enable Charts</button>
          </div>
        </div>
      </div>

      {/* Market Insights */}
      <div className="market-insights">
        <h3>💡 Market Insights</h3>
        <div className="insights-grid">
          <div className="insight-card bullish">
            <div className="insight-icon">🐂</div>
            <div className="insight-content">
              <h4>Bullish Trend</h4>
              <p>Gaming NFTs showing strong growth with 45% increase in rental volume</p>
            </div>
          </div>

          <div className="insight-card neutral">
            <div className="insight-icon">📊</div>
            <div className="insight-content">
              <h4>Market Stability</h4>
              <p>Average rental prices stabilizing around 0.15 ETH with low volatility</p>
            </div>
          </div>

          <div className="insight-card positive">
            <div className="insight-icon">👥</div>
            <div className="insight-content">
              <h4>User Growth</h4>
              <p>New user registrations up 23% this month, indicating healthy adoption</p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <span className="error-icon">⚠️</span>
          <span className="error-message">{error}</span>
          <button className="error-dismiss" onClick={() => setError(null)}>
            ✕
          </button>
        </div>
      )}
    </div>
  )
}

export default MarketAnalytics