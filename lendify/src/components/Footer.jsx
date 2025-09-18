export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>Lendify</h3>
          <p>
            The future of decentralized lending. Join thousands of users who trust 
            Lendify for secure, transparent, and efficient financial services.
          </p>
        </div>
        
        <div className="footer-section">
          <h3>Product</h3>
          <p><a href="#lending">Lending</a></p>
          <p><a href="#borrowing">Borrowing</a></p>
          <p><a href="#staking">Staking</a></p>
          <p><a href="#governance">Governance</a></p>
        </div>
        
        <div className="footer-section">
          <h3>Resources</h3>
          <p><a href="#docs">Documentation</a></p>
          <p><a href="#whitepaper">Whitepaper</a></p>
          <p><a href="#blog">Blog</a></p>
          <p><a href="#support">Support</a></p>
        </div>
        
        <div className="footer-section">
          <h3>Community</h3>
          <p><a href="#discord">Discord</a></p>
          <p><a href="#twitter">Twitter</a></p>
          <p><a href="#telegram">Telegram</a></p>
          <p><a href="#github">GitHub</a></p>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; 2024 Lendify. All rights reserved. | Powering the future of DeFi</p>
      </div>
    </footer>
  )
}
