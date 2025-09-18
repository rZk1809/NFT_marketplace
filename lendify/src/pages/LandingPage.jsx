import React, { useEffect, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Import components with error boundaries
import Cursor from '../components/Cursor'
import Header from '../components/Header'
import Hero from '../components/Hero'
import HowItWorks from '../components/HowItWorks'
import Features from '../components/Features'
import About from '../components/About'
import ModelViewer from '../components/ModelViewer'
import Footer from '../components/Footer'
import GlobalParticleBackground from '../components/GlobalParticleBackground'

// Import new 3D models
import FinancialDataModel from '../components/FinancialDataModel'
import NetworkNodesModel from '../components/NetworkNodesModel_Simple'

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger)

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: 'white', background: 'red' }}>
          <h2>Something went wrong with {this.props.componentName}.</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

function LandingPage() {
  const [componentsLoaded, setComponentsLoaded] = useState({
    cursor: true,
    header: true,
    hero: false,
    howItWorks: true,
    features: true,
    about: true,
    modelViewer: false,
    financialDataModel: false,
    networkNodesModel: false,
    footer: true
  })

  useEffect(() => {
    // Delay loading of heavy components
    const timer1 = setTimeout(() => {
      setComponentsLoaded(prev => ({ ...prev, hero: true }))
    }, 1000)

    const timer2 = setTimeout(() => {
      setComponentsLoaded(prev => ({ ...prev, modelViewer: true }))
    }, 2000)
    
    const timer3 = setTimeout(() => {
      setComponentsLoaded(prev => ({ ...prev, financialDataModel: true }))
    }, 3000)
    
    const timer4 = setTimeout(() => {
      setComponentsLoaded(prev => ({ ...prev, networkNodesModel: true }))
    }, 4000)

    // Initialize scroll animations after components load
    const timer5 = setTimeout(() => {
      const scrollSections = gsap.utils.toArray('.scroll-section')
      
      scrollSections.forEach((section) => {
        gsap.fromTo(section, 
          {
            opacity: 0,
            y: 30
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.4,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 90%',
              end: 'bottom 10%',
              toggleActions: 'play none none reverse'
            }
          }
        )
      })
    }, 5000)

    // Cleanup function
    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      clearTimeout(timer4)
      clearTimeout(timer5)
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [])

  return (
    <>
      <GlobalParticleBackground />
      
      {componentsLoaded.cursor && (
        <ErrorBoundary componentName="Cursor">
          <Cursor />
        </ErrorBoundary>
      )}
      
      {componentsLoaded.header && (
        <ErrorBoundary componentName="Header">
          <Header />
        </ErrorBoundary>
      )}
      
      {componentsLoaded.hero && (
        <ErrorBoundary componentName="Hero">
          <Hero />
        </ErrorBoundary>
      )}
      
      {componentsLoaded.modelViewer && (
        <ErrorBoundary componentName="ModelViewer">
          <ModelViewer />
        </ErrorBoundary>
      )}
      
      {/* Financial Data Visualization */}
      {componentsLoaded.financialDataModel && (
        <ErrorBoundary componentName="FinancialDataModel">
          <section className="scroll-section" style={{ padding: '4rem 2rem', background: 'rgba(0,0,0,0.1)' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
              <h2 style={{ color: 'white', marginBottom: '2rem', fontSize: '2.5rem' }}>
                Real-Time Analytics Dashboard
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '3rem', fontSize: '1.1rem' }}>
                Visualize your financial data with our advanced 3D analytics engine
              </p>
              <FinancialDataModel />
            </div>
          </section>
        </ErrorBoundary>
      )}
      
      {/* Network Infrastructure - moved to appear right after Analytics */}
      {componentsLoaded.networkNodesModel && (
        <ErrorBoundary componentName="NetworkNodesModel">
          <section className="scroll-section" style={{ padding: '4rem 2rem' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
              <h2 style={{ color: 'white', marginBottom: '2rem', fontSize: '2.5rem' }}>
                Decentralized Network Infrastructure
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '3rem', fontSize: '1.1rem' }}>
                Our peer-to-peer network ensures maximum security and uptime
              </p>
              <NetworkNodesModel />
            </div>
          </section>
        </ErrorBoundary>
      )}
      
      {componentsLoaded.howItWorks && (
        <ErrorBoundary componentName="HowItWorks">
          <HowItWorks />
        </ErrorBoundary>
      )}
      
      {componentsLoaded.features && (
        <ErrorBoundary componentName="Features">
          <Features />
        </ErrorBoundary>
      )}
      
      {componentsLoaded.about && (
        <ErrorBoundary componentName="About">
          <About />
        </ErrorBoundary>
      )}
      
      {componentsLoaded.footer && (
        <ErrorBoundary componentName="Footer">
          <Footer />
        </ErrorBoundary>
      )}
    </>
  )
}

export default LandingPage
