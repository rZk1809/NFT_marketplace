import { useRef, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import * as THREE from 'three'

// Simple Animated Bar Chart with cursor interaction
function SimpleBarChart({ position = [0, 0, 0] }) {
  const groupRef = useRef()
  const { mouse } = useThree()
  
  const bars = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => ({
      height: 0.5 + Math.random() * 1.5,
      color: `hsl(${200 + i * 20}, 70%, 60%)`,
      x: i * 0.4 - 1
    }))
  }, [])

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Base rotation with cursor influence
      const mouseInfluence = mouse.x * 0.5
      groupRef.current.rotation.y += delta * (0.3 + mouseInfluence * 0.2)
      
      // Tilt based on mouse position
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        -mouse.y * 0.3,
        0.05
      )
      groupRef.current.rotation.z = THREE.MathUtils.lerp(
        groupRef.current.rotation.z,
        mouse.x * 0.1,
        0.05
      )
      
      // Animate bars with cursor-based intensity
      groupRef.current.children.forEach((bar, i) => {
        const time = state.clock.elapsedTime
        const mouseIntensity = 1 + Math.abs(mouse.x + mouse.y) * 0.5
        const scale = 1 + Math.sin(time + i * 0.5) * 0.2 * mouseIntensity
        bar.scale.y = scale
        bar.position.y = bars[i].height * scale / 2
      })
    }
  })

  return (
    <group ref={groupRef} position={position}>
      {bars.map((bar, i) => (
        <mesh key={i} position={[bar.x, bar.height / 2, 0]}>
          <boxGeometry args={[0.3, bar.height, 0.3]} />
          <meshStandardMaterial 
            color={bar.color}
            emissive={bar.color}
            emissiveIntensity={0.2}
          />
        </mesh>
      ))}
    </group>
  )
}

// Simple Data Points with cursor interaction
function SimpleDataPoints({ position = [0, 0, 0] }) {
  const groupRef = useRef()
  const { mouse } = useThree()
  
  const points = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      x: i * 0.3 - 1.2,
      y: Math.sin(i * 0.8) * 0.5,
      z: 0,
      color: `hsl(${180 + i * 15}, 70%, 60%)`,
      baseX: i * 0.3 - 1.2,
      baseZ: 0
    }))
  }, [])

  useFrame((state, delta) => {
    if (groupRef.current) {
      const time = state.clock.elapsedTime
      
      groupRef.current.children.forEach((point, i) => {
        const data = points[i]
        
        // Cursor-based position offset
        const cursorForceX = mouse.x * 0.3
        const cursorForceZ = mouse.y * 0.2
        
        point.position.x = data.baseX + cursorForceX
        point.position.y = data.y + Math.sin(time + i * 0.5) * 0.2 + mouse.y * 0.1
        point.position.z = data.baseZ + cursorForceZ
        
        // Enhanced scaling with cursor influence
        const mouseDistance = Math.sqrt(mouse.x * mouse.x + mouse.y * mouse.y)
        const cursorScale = 1 + mouseDistance * 0.3
        const scale = cursorScale * (1 + Math.sin(time * 2 + i) * 0.2)
        point.scale.setScalar(scale)
      })
    }
  })

  return (
    <group ref={groupRef} position={position}>
      {points.map((point, i) => (
        <mesh key={i} position={[point.x, point.y, point.z]}>
          <sphereGeometry args={[0.06, 12, 12]} />
          <meshStandardMaterial 
            color={point.color}
            emissive={point.color}
            emissiveIntensity={0.3}
          />
        </mesh>
      ))}
    </group>
  )
}

// Main Financial Scene with cursor responsiveness
function FinancialDataScene() {
  const mainGroupRef = useRef()
  const { mouse } = useThree()

  useFrame((state, delta) => {
    if (mainGroupRef.current) {
      // Cursor-influenced rotation
      const mouseRotationY = mouse.x * 0.2
      mainGroupRef.current.rotation.y += delta * (0.1 + Math.abs(mouseRotationY) * 0.1)
      
      // Smooth camera-like movement based on cursor
      mainGroupRef.current.rotation.x = THREE.MathUtils.lerp(
        mainGroupRef.current.rotation.x,
        -mouse.y * 0.15,
        0.03
      )
      
      // Enhanced floating with cursor influence
      const mouseFloat = mouse.y * 0.05
      mainGroupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1 + mouseFloat
      
      // Slight horizontal movement
      mainGroupRef.current.position.x = THREE.MathUtils.lerp(
        mainGroupRef.current.position.x,
        mouse.x * 0.1,
        0.02
      )
    }
  })

  return (
    <group ref={mainGroupRef}>
      <SimpleBarChart position={[-1.5, 0, 0]} />
      <SimpleDataPoints position={[1.5, 0, 0]} />
      
      {/* Central display ring */}
      <mesh position={[0, 1, 0]}>
        <torusGeometry args={[0.8, 0.1, 16, 32]} />
        <meshStandardMaterial 
          color="#64ffda"
          emissive="#64ffda"
          emissiveIntensity={0.2}
        />
      </mesh>
      
      {/* Floating cubes */}
      {Array.from({ length: 5 }, (_, i) => (
        <mesh 
          key={i} 
          position={[
            Math.cos(i * 1.26) * 2,
            Math.sin(i * 0.8) * 0.5,
            Math.sin(i * 1.26) * 2
          ]}
        >
          <boxGeometry args={[0.1, 0.1, 0.1]} />
          <meshStandardMaterial 
            color={`hsl(${200 + i * 30}, 70%, 60%)`}
            emissive={`hsl(${200 + i * 30}, 70%, 60%)`}
            emissiveIntensity={0.3}
          />
        </mesh>
      ))}
    </group>
  )
}

// Error Fallback Component
function FinancialDataFallback() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '300px',
      fontSize: '1.1rem',
      color: '#64ffda',
      textAlign: 'center',
      background: 'rgba(100, 255, 218, 0.1)',
      borderRadius: '10px',
      border: '1px solid rgba(100, 255, 218, 0.3)'
    }}>
      📊 Financial Analytics Dashboard<br/>
      <small style={{ opacity: 0.7 }}>Real-time data visualization</small>
    </div>
  )
}

// Main Export Component
export default function FinancialDataModel() {
  return (
    <div style={{ 
      width: '100%', 
      height: '400px', 
      position: 'relative',
      borderRadius: '15px',
      overflow: 'hidden'
    }}>
      <Canvas
        camera={{ position: [4, 2, 4], fov: 60 }}
        gl={{ antialias: true }}
        onError={() => console.warn('FinancialDataModel Canvas error')}
        fallback={<FinancialDataFallback />}
      >
        <FinancialDataScene />
        
        <Environment preset="city" background={false} />
        
        {/* Lighting setup */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -5]} color="#64ffda" intensity={0.5} />
        <spotLight 
          position={[0, 5, 0]} 
          angle={0.3} 
          penumbra={1} 
          intensity={0.8}
          color="#ffffff"
        />
      </Canvas>
    </div>
  )
}
