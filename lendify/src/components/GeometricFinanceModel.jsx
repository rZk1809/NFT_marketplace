import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import * as THREE from 'three'

// Morphing Financial Shape Component
function MorphingShape({ position = [0, 0, 0], color = "#667eea", scale = 1 }) {
  const shapeRef = useRef()
  const materialRef = useRef()
  
  useFrame((state, delta) => {
    if (shapeRef.current) {
      const time = state.clock.elapsedTime
      
      // Complex morphing rotation
      shapeRef.current.rotation.x = Math.sin(time * 0.3) * 0.5
      shapeRef.current.rotation.y += delta * 0.4
      shapeRef.current.rotation.z = Math.cos(time * 0.2) * 0.3
      
      // Floating motion
      shapeRef.current.position.y = position[1] + Math.sin(time * 0.4 + position[0]) * 0.2
      
      // Pulsing scale
      const pulseScale = scale * (1 + Math.sin(time * 2) * 0.1)
      shapeRef.current.scale.setScalar(pulseScale)
    }
    
    if (materialRef.current) {
      const time = state.clock.elapsedTime
      // Animate distortion for organic feel
      materialRef.current.distort = 0.3 + Math.sin(time) * 0.2
      materialRef.current.speed = 2 + Math.sin(time * 0.5) * 1
    }
  })

  return (
    <mesh ref={shapeRef} position={position}>
      <icosahedronGeometry args={[1, 4]} />
      <meshPhysicalMaterial
        color={color}
        metalness={0.8}
        roughness={0.2}
        emissive={color}
        emissiveIntensity={0.2}
        transparent
        opacity={0.9}
        transmission={0.1}
        thickness={0.5}
      />
    </mesh>
  )
}

// Financial Growth Spiral Component (using connected spheres)
function GrowthSpiral({ position = [0, 0, 0], color = "#f093fb" }) {
  const spiralRef = useRef()
  
  const spiralPoints = useMemo(() => {
    const points = []
    for (let i = 0; i < 25; i++) {
      const t = i / 25
      const radius = t * 2
      const height = t * 3
      const angle = t * Math.PI * 8
      
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
      {/* Growth spiral using spheres */}
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

// Financial Pyramid Component
function FinancialPyramid({ position = [0, 0, 0], color = "#50fa7b" }) {
  const pyramidRef = useRef()
  const ringsRef = useRef()
  
  useFrame((state, delta) => {
    if (pyramidRef.current) {
      pyramidRef.current.rotation.y += delta * 0.3
      pyramidRef.current.position.y = position[1] + Math.cos(state.clock.elapsedTime * 0.4) * 0.1
    }
    
    if (ringsRef.current) {
      ringsRef.current.children.forEach((ring, i) => {
        ring.rotation.z += delta * (0.2 + i * 0.1)
        ring.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2 + i) * 0.1)
      })
    }
  })

  return (
    <group ref={pyramidRef} position={position}>
      {/* Main pyramid structure */}
      <mesh>
        <coneGeometry args={[1, 2, 4]} />
        <meshPhysicalMaterial
          color={color}
          metalness={0.7}
          roughness={0.3}
          transmission={0.2}
          thickness={0.5}
          emissive={color}
          emissiveIntensity={0.1}
        />
      </mesh>
      
      {/* Floating rings around pyramid */}
      <group ref={ringsRef}>
        {[0.6, 0.8, 1.2].map((radius, i) => (
          <mesh key={i} position={[0, i * 0.5 - 0.5, 0]}>
            <ringGeometry args={[radius - 0.02, radius + 0.02, 16]} />
            <meshBasicMaterial 
              color={color}
              transparent
              opacity={0.6 - i * 0.1}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}
      </group>
    </group>
  )
}

// Market Flow Component
function MarketFlow({ position = [0, 0, 0] }) {
  const flowRef = useRef()
  
  const flowParticles = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => ({
      position: [
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 3,
        (Math.random() - 0.5) * 4
      ],
      velocity: [
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.01,
        (Math.random() - 0.5) * 0.02
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
        const data = flowParticles[i]
        
        // Update positions
        particle.position.x += data.velocity[0]
        particle.position.y += data.velocity[1]
        particle.position.z += data.velocity[2]
        
        // Boundary wrapping
        if (Math.abs(particle.position.x) > 2) particle.position.x *= -0.8
        if (Math.abs(particle.position.y) > 1.5) particle.position.y *= -0.8
        if (Math.abs(particle.position.z) > 2) particle.position.z *= -0.8
        
        // Floating motion
        particle.position.y += Math.sin(time + data.life) * 0.002
        
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
      {flowParticles.map((particle, i) => (
        <mesh key={i} position={particle.position}>
          <octahedronGeometry args={[0.1, 1]} />
          <meshStandardMaterial 
            color={particle.color}
            emissive={particle.color}
            emissiveIntensity={0.3}
            metalness={0.6}
            roughness={0.4}
            transparent
            opacity={0.8}
          />
        </mesh>
      ))}
    </group>
  )
}

// Financial DNA Helix Component
function FinancialHelix({ position = [0, 0, 0], color = "#ff6b6b" }) {
  const helixRef = useRef()
  
  const helixPoints = useMemo(() => {
    const points1 = []
    const points2 = []
    
    for (let i = 0; i < 50; i++) {
      const t = i / 50
      const height = t * 4 - 2
      const angle1 = t * Math.PI * 6
      const angle2 = angle1 + Math.PI
      const radius = 0.5
      
      points1.push([
        radius * Math.cos(angle1),
        height,
        radius * Math.sin(angle1)
      ])
      
      points2.push([
        radius * Math.cos(angle2),
        height,
        radius * Math.sin(angle2)
      ])
    }
    
    return { points1, points2 }
  }, [])
  
  useFrame((state, delta) => {
    if (helixRef.current) {
      helixRef.current.rotation.y += delta * 0.4
      helixRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.15
    }
  })

  return (
    <group ref={helixRef} position={position}>
      {/* Helix strands */}
      {[helixPoints.points1, helixPoints.points2].map((points, strandIndex) => (
        <group key={strandIndex}>
          {points.map((point, i) => (
            <mesh key={i} position={point}>
              <sphereGeometry args={[0.04, 8, 8]} />
              <meshStandardMaterial 
                color={strandIndex === 0 ? color : "#4ecdc4"}
                emissive={strandIndex === 0 ? color : "#4ecdc4"}
                emissiveIntensity={0.4}
              />
            </mesh>
          ))}
          
          {/* Connecting cylinders between strands */}
          {points.map((point, i) => {
            if (i % 4 === 0 && i < points.length - 1) {
              const otherStrand = strandIndex === 0 ? helixPoints.points2 : helixPoints.points1
              const otherPoint = otherStrand[i]
              const midPoint = [
                (point[0] + otherPoint[0]) / 2,
                (point[1] + otherPoint[1]) / 2,
                (point[2] + otherPoint[2]) / 2
              ]
              const distance = Math.sqrt(
                Math.pow(otherPoint[0] - point[0], 2) +
                Math.pow(otherPoint[1] - point[1], 2) +
                Math.pow(otherPoint[2] - point[2], 2)
              )
              return (
                <mesh key={`connection-${i}`} position={midPoint}>
                  <cylinderGeometry args={[0.01, 0.01, distance, 6]} />
                  <meshBasicMaterial color="#ffffff" transparent opacity={0.4} />
                </mesh>
              )
            }
            return null
          })}
        </group>
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
      
      {/* Financial DNA helix */}
      <FinancialHelix position={[0, 0, -3]} color="#ff6b6b" />
      
      {/* Surrounding geometric shapes */}
      <MorphingShape position={[-1.5, 2, 1.5]} color="#4ecdc4" scale={0.5} />
      <MorphingShape position={[1.5, -2, 1.5]} color="#f9ca24" scale={0.6} />
      <MorphingShape position={[0, 1.5, 3]} color="#e17055" scale={0.4} />
      
      {/* Background geometric grid */}
      <mesh position={[0, 0, -5]}>
        <planeGeometry args={[20, 20, 20, 20]} />
        <meshBasicMaterial 
          color="#667eea"
          wireframe
          transparent
          opacity={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}

// Error Fallback Component
function GeometricFinanceFallback() {
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
      border: '1px solid rgba(102,126,234,0.3)',
      flexDirection: 'column'
    }}>
      <div style={{ fontSize: '2rem', marginBottom: '10px' }}>◊</div>
      Abstract Financial Models<br/>
      <small style={{ opacity: 0.7, marginTop: '5px' }}>
        Mathematical visualization of growth
      </small>
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
      overflow: 'hidden',
      background: 'linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(240,147,251,0.1) 50%, rgba(80,250,123,0.1) 100%)'
    }}>
      <Canvas
        camera={{ position: [6, 3, 6], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
        onError={() => console.warn('GeometricFinanceModel Canvas error')}
        fallback={<GeometricFinanceFallback />}
      >
        <GeometricFinanceScene />
        
        <Environment preset="studio" background={false} />
        
        {/* Dynamic lighting for geometric shapes */}
        <ambientLight intensity={0.3} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-5, 5, -5]} color="#667eea" intensity={0.8} />
        <pointLight position={[5, -5, 5]} color="#f093fb" intensity={0.6} />
        <spotLight 
          position={[0, 10, 0]} 
          angle={0.5} 
          penumbra={1} 
          intensity={0.8}
          color="#ffffff"
        />
      </Canvas>
    </div>
  )
}
