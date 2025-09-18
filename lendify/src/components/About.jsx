export default function About() {
  const stats = [
    {
      number: "$2.5B+",
      label: "Total Value Locked"
    },
    {
      number: "500K+",
      label: "Active Users"
    },
    {
      number: "150+",
      label: "Supported Assets"
    },
    {
      number: "99.9%",
      label: "Uptime"
    }
  ]

  const team = [
    {
      name: "Alex Chen",
      role: "CEO & Co-Founder",
      background: "Former Goldman Sachs, Stanford MBA"
    },
    {
      name: "Sarah Kumar",
      role: "CTO & Co-Founder", 
      background: "Ex-Google, MIT Computer Science"
    },
    {
      name: "Marcus Williams",
      role: "Head of Security",
      background: "Former Ethereum Foundation"
    }
  ]

  return (
    <section className="about scroll-section" id="about">
      <div className="container">
        <div className="about-content">
          <div className="about-text">
            <h2 className="section-title gradient-text">
              About Lendify
            </h2>
            <div className="about-description">
              <p>
                Lendify is pioneering the future of decentralized finance by making lending and borrowing 
                accessible, transparent, and efficient for everyone. Built on cutting-edge blockchain technology, 
                we're creating a financial ecosystem that operates without traditional intermediaries.
              </p>
              <p>
                Our mission is to democratize access to financial services globally, providing users with 
                unprecedented control over their assets while ensuring security, transparency, and competitive 
                returns through innovative DeFi protocols.
              </p>
              <p>
                Since our launch in 2023, we've processed over $2.5 billion in transactions and have become 
                one of the most trusted names in decentralized finance, serving users across 50+ countries.
              </p>
            </div>
          </div>
          
          <div className="stats-section scroll-section">
            <h3 className="stats-title">Our Impact</h3>
            <div className="stats-grid">
              {stats.map((stat, index) => (
                <div key={index} className="stat-item">
                  <div className="stat-number">{stat.number}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="team-section scroll-section">
            <h3 className="team-title">Meet Our Team</h3>
            <div className="team-grid">
              {team.map((member, index) => (
                <div key={index} className="team-member">
                  <h4 className="member-name">{member.name}</h4>
                  <p className="member-role">{member.role}</p>
                  <p className="member-background">{member.background}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
