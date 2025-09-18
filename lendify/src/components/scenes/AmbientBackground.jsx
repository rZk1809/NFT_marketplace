import { useRef, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Float } from '@react-three/drei'
import * as THREE from 'three'

// Ambient Particle Field
function AmbientParticles({ count = 200 }) {
  const mesh = useRef()
  const { mouse } = useThree()
  
  const [positions, colors] = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    
    for (let i = 0; i < count; i++) {
      // Spread particles in a large sphere
      positions[i * 3] = (Math.random() - 0.5) * 20
      positions[i * 3 + 1] = (Math.random() - 0.5) * 15
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20
      
      // Subtle color variations
      const colorVariant = Math.random()
      if (colorVariant < 0.4) {
        // Soft blues
        colors[i * 3] = 0.3 + Math.random() * 0.3     // R
        colors[i * 3 + 1] = 0.5 + Math.random() * 0.4 // G
        colors[i * 3 + 2] = 0.8 + Math.random() * 0.2 // B
      } else if (colorVariant < 0.7) {
        // Soft purples
        colors[i * 3] = 0.5 + Math.random() * 0.3     // R
        colors[i * 3 + 1] = 0.3 + Math.random() * 0.3 // G
        colors[i * 3 + 2] = 0.8 + Math.random() * 0.2 // B
      } else {
        // Soft whites
        colors[i * 3] = 0.7 + Math.random() * 0.3     // R
        colors[i * 3 + 1] = 0.7 + Math.random() * 0.3 // G
        colors[i * 3 + 2] = 0.8 + Math.random() * 0.2 // B
      }
    }
    
    return [positions, colors]
  }, [count])

  useFrame((state, delta) => {
    if (mesh.current) {
      const time = state.clock.elapsedTime
      
      // Very subtle rotation
      mesh.current.rotation.y += delta * 0.02
      mesh.current.rotation.x += delta * 0.01
      
      // Gentle mouse interaction
      const mouseInfluenceX = mouse.x * 0.01
      const mouseInfluenceY = mouse.y * 0.01
      
      mesh.current.rotation.y += mouseInfluenceX
      mesh.current.rotation.x += mouseInfluenceY
    }
  })

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        transparent
        opacity={0.6}
        vertexColors
        blending={THREE.AdditiveBlending}
        sizeAttenuation={true}
      />
    </points>
  )
}

// Floating Geometric Elements
function FloatingGeometry() {
  const groupRef = useRef()
  
  const shapes = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      position: [
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 15
      ],
      rotation: [
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      ],
      scale: 0.2 + Math.random() * 0.3,
      color: `hsl(${200 + Math.random() * 100}, 60%, ${40 + Math.random() * 30}%)`,
      speed: 0.1 + Math.random() * 0.2
    }))
  }, [])
  
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.children.forEach((shape, i) => {
        const data = shapes[i]
        shape.rotation.x += delta * data.speed
        shape.rotation.y += delta * data.speed * 0.7
        shape.rotation.z += delta * data.speed * 0.5
      })
    }
  })

  return (
    <group ref={groupRef}>
      {shapes.map((shape, i) => (
        <Float
          key={i}
          speed={1 + Math.random()}
          rotationIntensity={0.5}
          floatIntensity={0.5}
        >
          <mesh
            position={shape.position}
            rotation={shape.rotation}
            scale={shape.scale}
          >
            {i % 3 === 0 ? (
              <octahedronGeometry args={[1, 0]} />
            ) : i % 3 === 1 ? (
              <tetrahedronGeometry args={[1, 0]} />
            ) : (
              <icosahedronGeometry args={[1, 0]} />
            )}
            <meshStandardMaterial
              color={shape.color}
              transparent
              opacity={0.3}
              wireframe
              emissive={shape.color}
              emissiveIntensity={0.1}
            />
          </mesh>
        </Float>
      ))}
    </group>
  )
}

// Subtle Grid Floor
function GridFloor() {
  const gridRef = useRef()
  
  useFrame((state, delta) => {
    if (gridRef.current) {
      gridRef.current.material.opacity = 0.1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.05
    }
  })

  return (
    <mesh ref={gridRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]}>
      <planeGeometry args={[50, 50, 50, 50]} />
      <meshBasicMaterial
        color="#667eea"
        wireframe
        transparent
        opacity={0.1}
      />
    </mesh>
  )
}

// Main Ambient Scene Component
function AmbientScene() {
  const sceneRef = useRef()
  
  useFrame((state, delta) => {
    if (sceneRef.current) {
      // Very subtle scene movement
      sceneRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.2
    }
  })

  return (
    <group ref={sceneRef}>
      <AmbientParticles />
      <FloatingGeometry />
      <GridFloor />
    </group>
  )
}

// Main AmbientBackground Component
export default function AmbientBackground({ children }) {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: -1
    }}>
      <Canvas
        camera={{ 
          position: [0, 2, 8], 
          fov: 60,
          near: 0.1,
          far: 100 
        }}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: "high-performance"
        }}
        style={{ background: 'transparent' }}
      >
        <AmbientScene />
        
        {/* Subtle lighting */}
        <ambientLight intensity={0.2} />
        <directionalLight position={[10, 10, 10]} intensity={0.3} />
        <pointLight position={[-10, -10, -10]} color="#667eea" intensity={0.2} />
        
        {/* Environment for reflections */}
        <Environment preset="night" background={false} />
        
        {/* Fog for depth */}
        <fog attach="fog" args={['#0a0a0a', 5, 30]} />
      </Canvas>
      
      {/* Render children on top of the 3D scene */}
      {children}
    </div>
  )
}
