import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth.jsx'

// Import page components
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import Enhanced3DDashboard from './pages/Enhanced3DDashboard'
import MarketplacePage from './pages/MarketplacePage'
import CollectionsPage from './pages/CollectionsPage'
import AuctionsPage from './pages/AuctionsPage'
import NotificationsPage from './pages/NotificationsPage'

// Import notification system
import { ToastContainer } from './components/common/NotificationCenter'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/app/login" element={<LoginPage />} />
          <Route path="/app/dashboard" element={<Enhanced3DDashboard />} />
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/collections" element={<CollectionsPage />} />
          <Route path="/auctions" element={<AuctionsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
        </Routes>
        
        {/* Global Toast Notifications */}
        <ToastContainer />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
