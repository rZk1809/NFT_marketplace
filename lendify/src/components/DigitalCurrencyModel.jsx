import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import * as THREE from 'three'

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

// Ethereum Coin Component
function EthereumCoin({ position = [0, 0, 0], scale = 1 }) {
  const coinRef = useRef()
  
  useFrame((state, delta) => {
    if (coinRef.current) {
      coinRef.current.rotation.y -= delta * 0.6
      coinRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.3) * 0.05
      coinRef.current.position.y = position[1] + Math.cos(state.clock.elapsedTime + position[0]) * 0.15
    }
  })

  return (
    <group ref={coinRef} position={position} scale={scale}>
      {/* Main coin body */}
      <mesh>
        <cylinderGeometry args={[0.15, 0.15, 0.02, 32]} />
        <meshPhysicalMaterial
          color="#627eea"
          metalness={0.8}
          roughness={0.2}
          transmission={0.1}
          thickness={0.5}
        />
      </mesh>
      
      {/* Ethereum diamond symbol */}
      <mesh position={[0, 0, 0.011]}>
        <octahedronGeometry args={[0.06, 0]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      
      {/* Inner glow */}
      <mesh>
        <cylinderGeometry args={[0.17, 0.17, 0.025, 32]} />
        <meshBasicMaterial 
          color="#627eea" 
          transparent 
          opacity={0.15}
        />
      </mesh>
    </group>
  )
}

// Generic Altcoin Component
function AltCoin({ position = [0, 0, 0], scale = 1, color = "#50fa7b", symbol = "◊" }) {
  const coinRef = useRef()
  
  useFrame((state, delta) => {
    if (coinRef.current) {
      coinRef.current.rotation.y += delta * 0.4
      coinRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.4 + position[2]) * 0.08
      coinRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.6 + position[0] * 2) * 0.08
    }
  })

  return (
    <group ref={coinRef} position={position} scale={scale}>
      <mesh>
        <cylinderGeometry args={[0.12, 0.12, 0.015, 24]} />
        <meshPhysicalMaterial
          color={color}
          metalness={0.7}
          roughness={0.3}
          emissive={color}
          emissiveIntensity={0.1}
        />
      </mesh>
      
      {/* Symbol placeholder */}
      <mesh position={[0, 0, 0.008]}>
        <circleGeometry args={[0.05, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  )
}

// Orbital Ring System Component
function OrbitalRingSystem({ position = [0, 0, 0] }) {
  const ringGroupRef = useRef()
  
  const ringData = useMemo(() => [
    { radius: 1.5, speed: 0.5, color: "#f7931a", opacity: 0.2 },
    { radius: 2, speed: -0.3, color: "#627eea", opacity: 0.15 },
    { radius: 2.5, speed: 0.2, color: "#50fa7b", opacity: 0.1 }
  ], [])

  useFrame((state, delta) => {
    if (ringGroupRef.current) {
      ringGroupRef.current.children.forEach((ring, i) => {
        ring.rotation.y += delta * ringData[i].speed
        ring.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1
      })
    }
  })

  return (
    <group ref={ringGroupRef} position={position}>
      {ringData.map((ring, i) => (
        <mesh key={i} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[ring.radius - 0.02, ring.radius + 0.02, 64]} />
          <meshBasicMaterial 
            color={ring.color}
            transparent
            opacity={ring.opacity}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
      
      {/* Central energy core */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshBasicMaterial 
          color="#ffffff"
          transparent
          opacity={0.8}
        />
      </mesh>
    </group>
  )
}

// Floating Currency Cloud Component
function FloatingCurrencyCloud({ position = [0, 0, 0] }) {
  const cloudRef = useRef()
  
  const coins = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      position: [
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 3,
        (Math.random() - 0.5) * 6
      ],
      color: `hsl(${Math.random() * 360}, 70%, 60%)`,
      scale: 0.3 + Math.random() * 0.4,
      rotationSpeed: 0.2 + Math.random() * 0.6,
      floatOffset: Math.random() * Math.PI * 2,
      orbitRadius: 1 + Math.random() * 2,
      orbitSpeed: 0.1 + Math.random() * 0.3
    }))
  }, [])

  useFrame((state, delta) => {
    if (cloudRef.current) {
      const time = state.clock.elapsedTime
      
      cloudRef.current.children.forEach((coin, i) => {
        const data = coins[i]
        
        // Orbital motion
        const orbitAngle = time * data.orbitSpeed + data.floatOffset
        coin.position.x = data.position[0] + Math.cos(orbitAngle) * data.orbitRadius * 0.3
        coin.position.z = data.position[2] + Math.sin(orbitAngle) * data.orbitRadius * 0.3
        coin.position.y = data.position[1] + Math.sin(time + data.floatOffset) * 0.2
        
        // Individual rotation
        coin.rotation.y += delta * data.rotationSpeed
        coin.rotation.x = Math.sin(time + data.floatOffset) * 0.1
      })
    }
  })

  return (
    <group ref={cloudRef} position={position}>
      {coins.map((coin, i) => (
        <AltCoin
          key={i}
          position={coin.position}
          scale={coin.scale}
          color={coin.color}
        />
      ))}
    </group>
  )
}

// Main Currency Scene Component
function DigitalCurrencyScene() {
  const mainGroupRef = useRef()

  useFrame((state, delta) => {
    if (mainGroupRef.current) {
      mainGroupRef.current.rotation.y += delta * 0.05
      mainGroupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1
    }
  })

  return (
    <group ref={mainGroupRef}>
      {/* Main cryptocurrencies */}
      <BitcoinCoin position={[-2, 0, 0]} scale={1.2} />
      <EthereumCoin position={[2, 0, 0]} scale={1.1} />
      
      {/* Altcoins around the scene */}
      <AltCoin position={[0, 1.5, -2]} color="#ff6b6b" scale={0.8} />
      <AltCoin position={[-3, -1, 1]} color="#4ecdc4" scale={0.7} />
      <AltCoin position={[3, -0.5, 1.5]} color="#45b7d1" scale={0.9} />
      <AltCoin position={[0, -2, -1]} color="#f9ca24" scale={0.6} />
      
      {/* Orbital ring system */}
      <OrbitalRingSystem position={[0, 0, 0]} />
      
      {/* Floating currency cloud */}
      <FloatingCurrencyCloud position={[0, 2, 2]} />
      
      {/* Energy connections between main coins */}
      <group>
        <mesh position={[0, 0, 0]} rotation={[0, 0, 0]}>
          <cylinderGeometry args={[0.01, 0.01, 4, 8]} />
          <meshBasicMaterial 
            color="#64ffda" 
            transparent 
            opacity={0.4}
          />
        </mesh>
      </group>
    </group>
  )
}

// Error Fallback Component
function DigitalCurrencyFallback() {
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
      ₿ Digital Currency Exchange ₿<br/>
      <span style={{ color: '#627eea', fontSize: '0.9rem' }}>
        Ξ Multi-blockchain support Ξ
      </span>
    </div>
  )
}

// Main Export Component
export default function DigitalCurrencyModel() {
  return (
    <div style={{ 
      width: '100%', 
      height: '450px', 
      position: 'relative',
      borderRadius: '15px',
      overflow: 'hidden',
      background: 'linear-gradient(135deg, rgba(247,147,26,0.1) 0%, rgba(98,126,234,0.1) 100%)'
    }}>
      <Canvas
        camera={{ position: [5, 3, 5], fov: 55 }}
        gl={{ antialias: true, alpha: true }}
        onError={() => console.warn('DigitalCurrencyModel Canvas error')}
        fallback={<DigitalCurrencyFallback />}
      >
        <DigitalCurrencyScene />
        
        <Environment preset="sunset" background={false} />
        
        {/* Enhanced lighting for metallic coins */}
        <ambientLight intensity={0.3} />
        <directionalLight position={[10, 10, 5]} intensity={1.2} />
        <pointLight position={[-5, 5, 5]} color="#f7931a" intensity={0.8} />
        <pointLight position={[5, -5, -5]} color="#627eea" intensity={0.6} />
        <spotLight 
          position={[0, 8, 0]} 
          angle={0.4} 
          penumbra={1} 
          intensity={1}
          color="#ffffff"
          castShadow
        />
      </Canvas>
    </div>
  )
}
