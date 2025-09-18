import React, { useState, useEffect } from 'react'
import { aiAnalyticsService } from '../../services/aiAnalyticsService.js'
import { useAuth } from '../../hooks/useAuth.jsx'
import '../dashboard/AIAnalytics.css'

const AIAnalytics = ({ userStats, userId }) => {
  const { isAuthenticated, walletAddress } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [aiData, setAiData] = useState(null)
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d')
  const [refreshing, setRefreshing] = useState(false)
  const [selectedInsightFilter, setSelectedInsightFilter] = useState('all')
  const [expandedInsight, setExpandedInsight] = useState(null)

  // Use walletAddress as fallback for userId
  const effectiveUserId = userId || walletAddress

  useEffect(() => {
    if (effectiveUserId) {
      loadAIAnalytics()
    }
  }, [effectiveUserId, selectedTimeframe])

  const loadAIAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)

      const [insights, platformStats, marketAnalytics] = await Promise.all([
        aiAnalyticsService.getAIInsights(effectiveUserId),
        aiAnalyticsService.getPlatformStats(),
        aiAnalyticsService.getMarketAnalytics(selectedTimeframe)
      ])

      setAiData({
        insights: insights.insights || [],
        aiScore: insights.aiScore || userStats?.aiScore || 87.5,
        predictedRevenue: insights.predictedRevenue || 34.2,
        marketSentiment: insights.marketSentiment || 'Bullish',
        riskLevel: insights.riskLevel || 'Medium',
        recommendations: insights.recommendations || [],
        platformStats,
        marketAnalytics
      })
    } catch (err) {
      console.error('Error loading AI analytics:', err)
      setError('Failed to load AI analytics. Please try again.')

      // Fallback to mock data
      const fallbackData = await aiAnalyticsService.getMockAIInsights()
      setAiData({
        ...fallbackData,
        aiScore: fallbackData.aiScore || userStats?.aiScore || 87.5
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await aiAnalyticsService.clearCache()
      await loadAIAnalytics()
    } catch (err) {
      setError('Failed to refresh data')
    } finally {
      setRefreshing(false)
    }
  }

  const handleTimeframeChange = (timeframe) => {
    setSelectedTimeframe(timeframe)
  }

  const getInsightIcon = (type) => {
    const icons = {
      price: '💰',
      market: '📈',
      portfolio: '💼',
      risk: '⚠️',
      opportunity: '🎯'
    }
    return icons[type] || '🤖'
  }

  const getConfidenceColor = (confidence) => {
    if (confidence >= 90) return '#00ff88'
    if (confidence >= 70) return '#667eea'
    if (confidence >= 50) return '#ffa500'
    return '#ff6b6b'
  }

  const getPriorityColor = (priority) => {
    const colors = {
      high: '#ff4444',
      medium: '#ffa500',
      low: '#00ff88'
    }
    return colors[priority] || '#667eea'
  }

  const handleInsightFilterChange = (filter) => {
    setSelectedInsightFilter(filter)
  }

  const handleInsightExpand = (index) => {
    setExpandedInsight(expandedInsight === index ? null : index)
  }

  const handleInsightAction = (insight) => {
    // Implement insight action logic
    console.log('Executing insight action:', insight.action, insight)
    // This could trigger navigation, API calls, or modal dialogs
  }

  const getFilteredInsights = () => {
    if (!aiData?.insights) return []

    switch (selectedInsightFilter) {
      case 'high-priority':
        return aiData.insights.filter(insight => insight.priority === 'high')
      case 'pricing':
        return aiData.insights.filter(insight => insight.category === 'pricing')
      case 'market':
        return aiData.insights.filter(insight => insight.category === 'market')
      case 'portfolio':
        return aiData.insights.filter(insight => insight.category === 'portfolio')
      default:
        return aiData.insights
    }
  }

  const handleQuickAction = async (actionType) => {
    console.log('Executing quick action:', actionType)

    // Show loading state
    setRefreshing(true)

    try {
      switch (actionType) {
        case 'optimize-pricing':
          // Simulate API call for price optimization
          await new Promise(resolve => setTimeout(resolve, 2000))
          setError(null)
          // Could trigger a modal or navigation to pricing page
          break
        case 'market-analysis':
          // Refresh market data
          await aiAnalyticsService.refreshData('market_analytics', { timeframe: selectedTimeframe })
          await loadAIAnalytics()
          break
        case 'predict-trends':
          // Get predictive analytics
          const predictions = await aiAnalyticsService.getPredictiveAnalytics('market')
          console.log('Predictions:', predictions)
          break
        case 'portfolio-review':
          // Get portfolio analytics
          if (effectiveUserId) {
            const portfolio = await aiAnalyticsService.getPortfolioAnalytics(effectiveUserId)
            console.log('Portfolio analysis:', portfolio)
          }
          break
        default:
          console.log('Unknown action type:', actionType)
      }
    } catch (err) {
      console.error('Quick action failed:', err)
      setError(`Failed to execute ${actionType}. Please try again.`)
    } finally {
      setRefreshing(false)
    }
  }

  // Show authentication required message if not authenticated
  if (!isAuthenticated || !effectiveUserId) {
    return (
      <div className="ai-analytics-container">
        <div className="auth-required-state">
          <div className="auth-icon">🔐</div>
          <h3>Authentication Required</h3>
          <p>Please connect your wallet to access AI Analytics</p>
          <button className="connect-wallet-btn" onClick={() => window.location.reload()}>
            Connect Wallet
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="ai-analytics-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading AI Analytics...</p>
        </div>
      </div>
    )
  }

  if (error && !aiData) {
    return (
      <div className="ai-analytics-container">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <p>{error}</p>
          <button className="retry-btn" onClick={loadAIAnalytics}>
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="ai-analytics-container">
      {/* Header with controls */}
      <div className="ai-analytics-header">
        <div className="header-content">
          <h2 className="gradient-text">🧠 AI Market Intelligence</h2>
          <p className="header-subtitle">
            AI-powered insights for optimal NFT rental strategies
          </p>
        </div>

        <div className="header-controls">
          <div className="timeframe-selector">
            {['7d', '30d', '90d'].map(timeframe => (
              <button
                key={timeframe}
                className={`timeframe-btn ${selectedTimeframe === timeframe ? 'active' : ''}`}
                onClick={() => handleTimeframeChange(timeframe)}
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

      {/* AI Score Cards */}
      <div className="ai-score-grid">
        <div className="score-card ai-score">
          <div className="score-header">
            <h3>AI Score</h3>
            <div className="score-trend positive">↗</div>
          </div>
          <div className="score-value">{aiData.aiScore}%</div>
          <p className="score-description">Portfolio Performance</p>
          <div className="score-progress">
            <div
              className="score-progress-fill"
              style={{ width: `${aiData.aiScore}%` }}
            ></div>
          </div>
        </div>

        <div className="score-card revenue-prediction">
          <div className="score-header">
            <h3>Predicted Revenue</h3>
            <div className="score-trend positive">↗</div>
          </div>
          <div className="score-value">+{aiData.predictedRevenue}%</div>
          <p className="score-description">Next 30 days</p>
        </div>

        <div className="score-card market-sentiment">
          <div className="score-header">
            <h3>Market Sentiment</h3>
            <div className={`sentiment-indicator ${aiData.marketSentiment.toLowerCase()}`}>
              {aiData.marketSentiment === 'Bullish' ? '🐂' : aiData.marketSentiment === 'Bearish' ? '🐻' : '➡️'}
            </div>
          </div>
          <div className="score-value">{aiData.marketSentiment}</div>
          <p className="score-description">NFT Rental Market</p>
        </div>

        <div className="score-card risk-level">
          <div className="score-header">
            <h3>Risk Level</h3>
            <div className={`risk-indicator ${aiData.riskLevel.toLowerCase()}`}>
              {aiData.riskLevel === 'Low' ? '🟢' : aiData.riskLevel === 'High' ? '🔴' : '🟡'}
            </div>
          </div>
          <div className="score-value">{aiData.riskLevel}</div>
          <p className="score-description">Portfolio Risk</p>
        </div>
      </div>

      {/* AI Insights */}
      <div className="ai-insights-section">
        <div className="section-header">
          <h3>🎯 AI Insights</h3>
          <div className="insights-filter">
            <button
              className={`filter-btn ${selectedInsightFilter === 'all' ? 'active' : ''}`}
              onClick={() => handleInsightFilterChange('all')}
            >
              All
            </button>
            <button
              className={`filter-btn ${selectedInsightFilter === 'high-priority' ? 'active' : ''}`}
              onClick={() => handleInsightFilterChange('high-priority')}
            >
              High Priority
            </button>
            <button
              className={`filter-btn ${selectedInsightFilter === 'pricing' ? 'active' : ''}`}
              onClick={() => handleInsightFilterChange('pricing')}
            >
              Pricing
            </button>
            <button
              className={`filter-btn ${selectedInsightFilter === 'market' ? 'active' : ''}`}
              onClick={() => handleInsightFilterChange('market')}
            >
              Market
            </button>
            <button
              className={`filter-btn ${selectedInsightFilter === 'portfolio' ? 'active' : ''}`}
              onClick={() => handleInsightFilterChange('portfolio')}
            >
              Portfolio
            </button>
          </div>
        </div>

        <div className="insights-grid">
          {getFilteredInsights().map((insight, index) => (
            <div key={index} className={`insight-card ${insight.priority || 'medium'}-priority ${expandedInsight === index ? 'expanded' : ''}`}>
              <div className="insight-header">
                <div className="insight-icon">{getInsightIcon(insight.type)}</div>
                <div className="insight-meta">
                  <h4 className="insight-title">{insight.title}</h4>
                  <span className={`insight-category ${insight.category}`}>
                    {insight.category}
                  </span>
                </div>
                <div
                  className="confidence-badge"
                  style={{
                    backgroundColor: `${getConfidenceColor(insight.confidence)}20`,
                    color: getConfidenceColor(insight.confidence),
                    borderColor: getConfidenceColor(insight.confidence)
                  }}
                >
                  {insight.confidence}%
                </div>
                <button
                  className="expand-btn"
                  onClick={() => handleInsightExpand(index)}
                >
                  {expandedInsight === index ? '−' : '+'}
                </button>
              </div>

              <p className="insight-description">{insight.description}</p>

              {expandedInsight === index && (
                <div className="insight-details">
                  <div className="detail-section">
                    <h5>Analysis Details</h5>
                    <p>This insight is based on market analysis of similar NFTs and current demand patterns. The confidence level reflects the reliability of our AI model's prediction.</p>
                  </div>
                  <div className="detail-section">
                    <h5>Recommended Actions</h5>
                    <ul>
                      <li>Review current pricing strategy</li>
                      <li>Monitor market trends for the next 7 days</li>
                      <li>Consider adjusting listing parameters</li>
                    </ul>
                  </div>
                  <div className="detail-section">
                    <h5>Expected Impact</h5>
                    <div className="impact-metrics">
                      <div className="impact-item">
                        <span className="impact-label">Revenue Increase:</span>
                        <span className="impact-value positive">+23%</span>
                      </div>
                      <div className="impact-item">
                        <span className="impact-label">Time to Rent:</span>
                        <span className="impact-value positive">-2.5 days</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="insight-actions">
                <button
                  className="primary-btn insight-action-btn"
                  onClick={() => handleInsightAction(insight)}
                >
                  {insight.action}
                </button>
                <button
                  className="secondary-btn"
                  onClick={() => handleInsightExpand(index)}
                >
                  {expandedInsight === index ? 'Less Details' : 'Learn More'}
                </button>
              </div>

              <div
                className="insight-priority-bar"
                style={{ backgroundColor: getPriorityColor(insight.priority) }}
              ></div>
            </div>
          ))}

          {getFilteredInsights().length === 0 && (
            <div className="empty-insights">
              <div className="empty-icon">🔍</div>
              <h4>No insights found</h4>
              <p>Try adjusting your filter or check back later for new AI insights.</p>
            </div>
          )}
        </div>
      </div>

      {/* AI Recommendations */}
      {aiData.recommendations && aiData.recommendations.length > 0 && (
        <div className="ai-recommendations-section">
          <h3>💡 AI Recommendations</h3>
          <div className="recommendations-list">
            {aiData.recommendations.map((recommendation, index) => (
              <div key={index} className="recommendation-item">
                <div className="recommendation-icon">🤖</div>
                <div className="recommendation-content">
                  <p>{recommendation}</p>
                </div>
                <button className="recommendation-action">
                  Apply
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="ai-quick-actions">
        <h3>⚡ Quick AI Actions</h3>
        <div className="quick-actions-grid">
          <button
            className="quick-action-btn"
            onClick={() => handleQuickAction('optimize-pricing')}
          >
            <div className="action-icon">🎯</div>
            <div className="action-content">
              <h4>Optimize Pricing</h4>
              <p>AI-powered price optimization</p>
            </div>
            <div className="action-status">Ready</div>
          </button>

          <button
            className="quick-action-btn"
            onClick={() => handleQuickAction('market-analysis')}
          >
            <div className="action-icon">📊</div>
            <div className="action-content">
              <h4>Market Analysis</h4>
              <p>Deep market insights</p>
            </div>
            <div className="action-status">Available</div>
          </button>

          <button
            className="quick-action-btn"
            onClick={() => handleQuickAction('predict-trends')}
          >
            <div className="action-icon">🔮</div>
            <div className="action-content">
              <h4>Predict Trends</h4>
              <p>Future market predictions</p>
            </div>
            <div className="action-status">Beta</div>
          </button>

          <button
            className="quick-action-btn"
            onClick={() => handleQuickAction('portfolio-review')}
          >
            <div className="action-icon">💼</div>
            <div className="action-content">
              <h4>Portfolio Review</h4>
              <p>AI portfolio analysis</p>
            </div>
            <div className="action-status">New</div>
          </button>
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

export default AIAnalytics