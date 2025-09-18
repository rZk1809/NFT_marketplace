import React, { useEffect, useState } from 'react'

const MinimalTest = () => {
  const [counter, setCounter] = useState(0)

  // Simple counter to prove React is working
  useEffect(() => {
    console.log('⚡ MinimalTest mounted')
    const interval = setInterval(() => {
      setCounter(prev => {
        const newValue = prev + 1
        console.log(`⏱️ MinimalTest counter: ${newValue}`)
        return newValue
      })
    }, 1000)

    return () => {
      console.log('⚡ MinimalTest unmounting')
      clearInterval(interval)
    }
  }, [])

  console.log('🔄 MinimalTest rendering, counter:', counter)

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 100%)',
      color: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      fontSize: '1.5rem',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        padding: '2rem',
        borderRadius: '16px',
        textAlign: 'center',
        marginBottom: '2rem'
      }}>
        <h1 style={{ 
          color: '#50fa7b',
          fontSize: '3rem',
          margin: '0 0 1rem 0'
        }}>
          ✅ MINIMAL TEST
        </h1>
        <div style={{
          fontSize: '2rem',
          color: '#667eea',
          fontFamily: 'monospace'
        }}>
          Counter: {counter}
        </div>
        <div style={{
          fontSize: '1rem',
          color: 'rgba(255, 255, 255, 0.7)',
          marginTop: '1rem'
        }}>
          If you can see this counting, React is working fine
        </div>
      </div>

      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        padding: '1.5rem',
        borderRadius: '12px',
        fontFamily: 'monospace',
        fontSize: '0.9rem',
        maxWidth: '500px'
      }}>
        <div><strong>🔍 Debug Status:</strong></div>
        <div>• React: ✅ Rendering</div>
        <div>• State: ✅ Updating ({counter})</div>
        <div>• Timers: ✅ Working</div>
        <div>• DOM: ✅ Visible</div>
        <div>• Time: {new Date().toLocaleTimeString()}</div>
      </div>
    </div>
  )
}

export default MinimalTest
