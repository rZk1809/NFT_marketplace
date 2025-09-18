import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment } from '@react-three/drei'

// Morphing Shape Component
function MorphingShape({ position = [0, 0, 0], color = "#667eea", scale = 1 }) {
  const shapeRef = useRef()
  
  useFrame((state, delta) => {
    if (shapeRef.current) {
      const time = state.clock.elapsedTime
      
      // Morphing rotation
      shapeRef.current.rotation.x = Math.sin(time * 0.3) * 0.5
      shapeRef.current.rotation.y += delta * 0.4
      shapeRef.current.rotation.z = Math.cos(time * 0.2) * 0.3
      
      // Floating motion
      shapeRef.current.position.y = position[1] + Math.sin(time * 0.4 + position[0]) * 0.2
      
      // Pulsing scale
      const pulseScale = scale * (1 + Math.sin(time * 2) * 0.1)
      shapeRef.current.scale.setScalar(pulseScale)
    }
  })

  return (
    <mesh ref={shapeRef} position={position}>
      <icosahedronGeometry args={[1, 2]} />
      <meshStandardMaterial
        color={color}
        metalness={0.8}
        roughness={0.2}
        emissive={color}
        emissiveIntensity={0.2}
      />
    </mesh>
  )
}

// Growth Spiral using Spheres
function GrowthSpiral({ position = [0, 0, 0], color = "#f093fb" }) {
  const spiralRef = useRef()
  
  const spiralPoints = useMemo(() => {
    const points = []
    for (let i = 0; i < 20; i++) {
      const t = i / 20
      const radius = t * 2
      const height = t * 3
      const angle = t * Math.PI * 6
      
      points.push({
        x: radius * Math.cos(angle),
        y: height - 1.5,
        z: radius * Math.sin(angle)
      })
    }
    return points
  }, [])
  
  useFrame((state, delta) => {
    if (spiralRef.current) {
      spiralRef.current.rotation.y += delta * 0.5
      spiralRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.3) * 0.1
      
      // Animate individual points
      spiralRef.current.children.forEach((point, i) => {
        if (point.scale) {
          const scale = 1 + Math.sin(state.clock.elapsedTime * 2 + i * 0.2) * 0.3
          point.scale.setScalar(scale)
        }
      })
    }
  })

  return (
    <group ref={spiralRef} position={position}>
      {spiralPoints.map((point, i) => (
        <mesh key={i} position={[point.x, point.y, point.z]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial 
            color={color}
            emissive={color}
            emissiveIntensity={0.4}
            metalness={0.6}
            roughness={0.4}
          />
        </mesh>
      ))}
    </group>
  )
}

// Financial Pyramid
function FinancialPyramid({ position = [0, 0, 0], color = "#50fa7b" }) {
  const pyramidRef = useRef()
  
  useFrame((state, delta) => {
    if (pyramidRef.current) {
      pyramidRef.current.rotation.y += delta * 0.3
      pyramidRef.current.position.y = position[1] + Math.cos(state.clock.elapsedTime * 0.4) * 0.1
    }
  })

  return (
    <group ref={pyramidRef} position={position}>
      <mesh>
        <coneGeometry args={[1, 2, 6]} />
        <meshStandardMaterial
          color={color}
          metalness={0.7}
          roughness={0.3}
          emissive={color}
          emissiveIntensity={0.1}
        />
      </mesh>
      
      {/* Floating rings */}
      {[0.6, 0.8, 1.2].map((radius, i) => (
        <mesh key={i} position={[0, i * 0.5 - 0.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[radius, 0.05, 8, 16]} />
          <meshBasicMaterial 
            color={color}
            transparent
            opacity={0.6 - i * 0.1}
          />
        </mesh>
      ))}
    </group>
  )
}

// Market Flow Particles
function MarketFlow({ position = [0, 0, 0] }) {
  const flowRef = useRef()
  
  const particles = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      position: [
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 3,
        (Math.random() - 0.5) * 4
      ],
      color: `hsl(${180 + Math.random() * 120}, 70%, ${50 + Math.random() * 30}%)`,
      scale: 0.5 + Math.random() * 0.5,
      life: Math.random() * Math.PI * 2
    }))
  }, [])
  
  useFrame((state, delta) => {
    if (flowRef.current) {
      const time = state.clock.elapsedTime
      
      flowRef.current.children.forEach((particle, i) => {
        const data = particles[i]
        
        // Floating motion
        particle.position.y = data.position[1] + Math.sin(time + data.life) * 0.2
        
        // Scaling animation
        const scale = data.scale * (1 + Math.sin(time * 3 + data.life) * 0.3)
        particle.scale.setScalar(scale)
        
        // Rotation
        particle.rotation.x += delta * 0.5
        particle.rotation.y += delta * 0.3
      })
    }
  })

  return (
    <group ref={flowRef} position={position}>
      {particles.map((particle, i) => (
        <mesh key={i} position={particle.position}>
          <octahedronGeometry args={[0.1, 1]} />
          <meshStandardMaterial 
            color={particle.color}
            emissive={particle.color}
            emissiveIntensity={0.3}
            metalness={0.6}
            roughness={0.4}
          />
        </mesh>
      ))}
    </group>
  )
}

// Main Geometric Finance Scene
function GeometricFinanceScene() {
  const mainGroupRef = useRef()

  useFrame((state, delta) => {
    if (mainGroupRef.current) {
      mainGroupRef.current.rotation.y += delta * 0.02
      mainGroupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.05
    }
  })

  return (
    <group ref={mainGroupRef}>
      {/* Central morphing shape */}
      <MorphingShape position={[0, 0, 0]} color="#667eea" scale={0.8} />
      
      {/* Growth spiral */}
      <GrowthSpiral position={[-3, 0, 0]} color="#f093fb" />
      
      {/* Financial pyramid */}
      <FinancialPyramid position={[3, 0, 0]} color="#50fa7b" />
      
      {/* Market flow particles */}
      <MarketFlow position={[0, 0, 0]} />
      
      {/* Surrounding shapes */}
      <MorphingShape position={[-1.5, 2, 1.5]} color="#4ecdc4" scale={0.5} />
      <MorphingShape position={[1.5, -2, 1.5]} color="#f9ca24" scale={0.6} />
      <MorphingShape position={[0, 1.5, 3]} color="#e17055" scale={0.4} />
    </group>
  )
}

// Error Fallback Component
function GeometricFallback() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '450px',
      fontSize: '1.1rem',
      color: '#667eea',
      textAlign: 'center',
      background: 'linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(240,147,251,0.1) 100%)',
      borderRadius: '12px',
      border: '1px solid rgba(102,126,234,0.3)'
    }}>
      ◊ Advanced Financial Models ◊
    </div>
  )
}

// Main Export Component
export default function GeometricFinanceModel() {
  return (
    <div style={{ 
      width: '100%', 
      height: '550px', 
      position: 'relative',
      borderRadius: '15px',
      overflow: 'hidden'
    }}>
      <Canvas
        camera={{ position: [6, 3, 6], fov: 60 }}
        gl={{ antialias: true }}
        onError={() => console.warn('GeometricFinanceModel Canvas error')}
        fallback={<GeometricFallback />}
      >
        <GeometricFinanceScene />
        
        <Environment preset="studio" background={false} />
        
        <ambientLight intensity={0.3} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-5, 5, -5]} color="#667eea" intensity={0.8} />
        <pointLight position={[5, -5, 5]} color="#f093fb" intensity={0.6} />
      </Canvas>
    </div>
  )
}
