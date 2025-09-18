export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Connect Wallet",
      description: "Connect your cryptocurrency wallet to the Lendify platform securely and start your journey."
    },
    {
      number: "02", 
      title: "Choose Terms",
      description: "Select your preferred lending or borrowing terms, interest rates, and duration that works for you."
    },
    {
      number: "03",
      title: "Start Earning",
      description: "Watch your assets grow with competitive interest rates in a fully decentralized environment."
    }
  ]

  return (
    <section className="how-it-works scroll-section" id="how-it-works">
      <div className="container">
        <h2 className="section-title gradient-text">
          How It Works
        </h2>
        <p style={{ textAlign: 'center', fontSize: '1.2rem', color: 'rgba(255, 255, 255, 0.8)', marginBottom: '3rem' }}>
          Get started with Lendify in three simple steps
        </p>
        
        <div className="steps-grid">
          {steps.map((step, index) => (
            <div key={index} className="step-card scroll-section">
              <div className="step-number">
                {step.number}
              </div>
              <h3 className="step-title">
                {step.title}
              </h3>
              <p className="step-description">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
