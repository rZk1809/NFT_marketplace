import { Link } from 'react-router-dom'

export default function Header() {
  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/" className="logo">
          Lendify
        </Link>
        
        <ul className="nav-links">
          <li><a href="#home">Home</a></li>
          <li><a href="#how-it-works">How It Works</a></li>
          <li><a href="#features">Features</a></li>
          <li><a href="#about">About</a></li>
        </ul>
        
        <Link to="/app/login" className="cta-button">
          Launch App
        </Link>
      </div>
    </nav>
  )
}
