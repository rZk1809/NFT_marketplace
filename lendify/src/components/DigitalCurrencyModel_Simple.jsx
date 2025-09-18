import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment } from '@react-three/drei'

// Simple Coin Component
function SimpleCoin({ position = [0, 0, 0], color = "#f7931a", scale = 1 }) {
  const coinRef = useRef()
  
  useFrame((state, delta) => {
    if (coinRef.current) {
      coinRef.current.rotation.y += delta * 0.5
      coinRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.1
    }
  })

  return (
    <group ref={coinRef} position={position} scale={scale}>
      <mesh>
        <cylinderGeometry args={[0.2, 0.2, 0.05, 16]} />
        <meshStandardMaterial
          color={color}
          metalness={0.8}
          roughness={0.2}
          emissive={color}
          emissiveIntensity={0.1}
        />
      </mesh>
    </group>
  )
}

// Main Currency Scene
function CurrencyScene() {
  const mainGroupRef = useRef()

  useFrame((state, delta) => {
    if (mainGroupRef.current) {
      mainGroupRef.current.rotation.y += delta * 0.05
    }
  })

  return (
    <group ref={mainGroupRef}>
      {/* Main coins */}
      <SimpleCoin position={[-2, 0, 0]} color="#f7931a" scale={1.2} />
      <SimpleCoin position={[2, 0, 0]} color="#627eea" scale={1.1} />
      <SimpleCoin position={[0, 1.5, -1]} color="#50fa7b" scale={0.9} />
      
      {/* Floating coins */}
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i / 8) * Math.PI * 2
        return (
          <SimpleCoin
            key={i}
            position={[
              Math.cos(angle) * 3,
              Math.sin(angle * 2) * 0.5,
              Math.sin(angle) * 3
            ]}
            color={`hsl(${i * 45}, 70%, 60%)`}
            scale={0.7}
          />
        )
      })}
      
      {/* Central ring */}
      <mesh>
        <torusGeometry args={[2, 0.1, 16, 32]} />
        <meshStandardMaterial 
          color="#64ffda"
          emissive="#64ffda"
          emissiveIntensity={0.3}
          transparent
          opacity={0.6}
        />
      </mesh>
    </group>
  )
}

// Error Fallback
function CurrencyFallback() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '350px',
      fontSize: '1.2rem',
      color: '#f7931a',
      textAlign: 'center',
      background: 'rgba(247, 147, 26, 0.1)',
      borderRadius: '12px',
      border: '1px solid rgba(247, 147, 26, 0.3)'
    }}>
      ₿ Digital Currency Exchange ₿
    </div>
  )
}

// Main Export
export default function DigitalCurrencyModel() {
  return (
    <div style={{ 
      width: '100%', 
      height: '450px', 
      position: 'relative',
      borderRadius: '15px',
      overflow: 'hidden'
    }}>
      <Canvas
        camera={{ position: [5, 3, 5], fov: 55 }}
        gl={{ antialias: true }}
        onError={() => console.warn('DigitalCurrencyModel Canvas error')}
        fallback={<CurrencyFallback />}
      >
        <CurrencyScene />
        
        <Environment preset="city" background={false} />
        
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-5, 5, 5]} color="#f7931a" intensity={0.8} />
      </Canvas>
    </div>
  )
}
