export default function Features() {
  const features = [
    {
      icon: "🔒",
      title: "Secure & Transparent",
      description: "All transactions are secured by blockchain technology with complete transparency and immutable records."
    },
    {
      icon: "⚡",
      title: "Lightning Fast",
      description: "Experience instant lending and borrowing with our optimized smart contracts and Layer 2 solutions."
    },
    {
      icon: "🌍",
      title: "Global Access",
      description: "Access DeFi lending from anywhere in the world, 24/7, without traditional banking restrictions."
    },
    {
      icon: "📈",
      title: "Competitive Rates",
      description: "Enjoy industry-leading interest rates powered by automated market makers and liquidity pools."
    },
    {
      icon: "🔄",
      title: "Flexible Terms",
      description: "Choose from various lending and borrowing options with customizable terms that fit your needs."
    },
    {
      icon: "💎",
      title: "Multi-Asset Support",
      description: "Lend and borrow across multiple cryptocurrencies including ETH, BTC, USDC, and many more."
    }
  ]

  return (
    <section className="features scroll-section" id="features">
      <div className="container">
        <h2 className="section-title gradient-text">
          Powerful Features
        </h2>
        <p style={{ 
          textAlign: 'center', 
          fontSize: '1.2rem', 
          color: 'rgba(255, 255, 255, 0.8)', 
          marginBottom: '4rem',
          maxWidth: '600px',
          margin: '0 auto 4rem'
        }}>
          Discover what makes Lendify the future of decentralized finance
        </p>
        
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card scroll-section">
              <div className="feature-icon">
                {feature.icon}
              </div>
              <h3 className="feature-title">
                {feature.title}
              </h3>
              <p className="feature-description">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
