import { useRef, Suspense, useState, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF, Environment } from '@react-three/drei'
import * as THREE from 'three'

// GLTF Model URL - Local file
const GLTF_URL = '/ethereum_crystal.glb'

// Simple Crystal Model Component (fallback)
function SimpleCrystal({ isLoading = false }) {
  const meshRef = useRef()
  const { mouse } = useThree()

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Smooth cursor-driven rotation
      const targetRotationY = mouse.x * Math.PI * 0.5
      const targetRotationX = -mouse.y * Math.PI * 0.3
      
      // Lerp for smooth movement
      meshRef.current.rotation.y = THREE.MathUtils.lerp(
        meshRef.current.rotation.y,
        targetRotationY,
        0.05
      )
      meshRef.current.rotation.x = THREE.MathUtils.lerp(
        meshRef.current.rotation.x,
        targetRotationX,
        0.05
      )
      
      // Add subtle floating animation
      meshRef.current.position.y = Math.sin(Date.now() * 0.001) * 0.2
      
      // Extra rotation for loading state
      if (isLoading) {
        meshRef.current.rotation.z += delta * 0.5
      }
    }
  })

  return (
    <group>
      <mesh ref={meshRef}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial 
          color={isLoading ? "#ff6b6b" : "#667eea"} 
          metalness={0.8} 
          roughness={0.2}
          transparent
          opacity={isLoading ? 0.7 : 0.9}
        />
      </mesh>
      {/* Add text if loading */}
      {isLoading && (
        <mesh position={[0, -2, 0]}>
          <planeGeometry args={[3, 0.5]} />
          <meshBasicMaterial transparent opacity={0.8} color="#ffffff" />
        </mesh>
      )}
    </group>
  )
}

// Beautiful Ethereum Crystal Component
function EthereumCrystal() {
  const meshRef = useRef()
  const innerMeshRef = useRef()
  const { mouse } = useThree()

  useFrame((state, delta) => {
    if (meshRef.current) {
      const targetRotationY = mouse.x * Math.PI * 0.5
      const targetRotationX = -mouse.y * Math.PI * 0.3
      
      meshRef.current.rotation.y = THREE.MathUtils.lerp(
        meshRef.current.rotation.y,
        targetRotationY,
        0.05
      )
      meshRef.current.rotation.x = THREE.MathUtils.lerp(
        meshRef.current.rotation.x,
        targetRotationX,
        0.05
      )
      
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2
    }

    if (innerMeshRef.current) {
      innerMeshRef.current.rotation.x += delta * 0.3
      innerMeshRef.current.rotation.y += delta * 0.2
    }
  })

  return (
    <group ref={meshRef}>
      {/* Main crystal body */}
      <mesh>
        <octahedronGeometry args={[1.2, 0]} />
        <meshPhysicalMaterial
          color="#667eea"
          metalness={0.1}
          roughness={0.1}
          transmission={0.9}
          thickness={0.5}
          transparent
          opacity={0.8}
        />
      </mesh>
      
      {/* Inner glowing core */}
      <mesh ref={innerMeshRef} scale={0.6}>
        <dodecahedronGeometry args={[0.5, 0]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.4}
        />
      </mesh>
      
      {/* Outer energy field */}
      <mesh scale={1.4}>
        <icosahedronGeometry args={[1, 0]} />
        <meshBasicMaterial
          color="#764ba2"
          wireframe
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* Particle effects */}
      <group>
        {[...Array(8)].map((_, i) => (
          <mesh
            key={i}
            position={[
              Math.cos((i / 8) * Math.PI * 2) * 2,
              Math.sin((i / 4) * Math.PI) * 0.5,
              Math.sin((i / 8) * Math.PI * 2) * 2
            ]}
          >
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshBasicMaterial
              color="#f093fb"
              transparent
              opacity={0.8}
            />
          </mesh>
        ))}
      </group>
    </group>
  )
}

// ModelViewer with improved error handling
export default function ModelViewer() {
  const [hasCanvasError, setHasCanvasError] = useState(false)
  
  if (hasCanvasError) {
    return (
      <section className="model-viewer">
        <div className="model-overlay">
          <h2 className="model-title gradient-text">
            Powered by Blockchain
          </h2>
          <p className="model-description">
            Our platform leverages cutting-edge blockchain technology to ensure 
            transparency, security, and efficiency in every transaction. 
            Experience the future of decentralized finance.
          </p>
        </div>
        
        <div className="model-canvas" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          fontSize: '1.2rem',
          color: '#667eea'
        }}>
          ⬢ Blockchain Crystal (3D unavailable) ⬢
        </div>
      </section>
    )
  }

  return (
    <section className="model-viewer">
      <div className="model-overlay">
        <h2 className="model-title gradient-text">
          Powered by Blockchain
        </h2>
        <p className="model-description">
          Our platform leverages cutting-edge blockchain technology to ensure 
          transparency, security, and efficiency in every transaction. 
          Experience the future of decentralized finance.
        </p>
      </div>
      
      <Canvas 
        className="model-canvas"
        camera={{ position: [0, 0, 4], fov: 50 }}
        gl={{ antialias: true }}
        onError={() => {
          console.warn('Canvas error occurred')
          setHasCanvasError(true)
        }}
      >
        <Suspense fallback={<SimpleCrystal isLoading={true} />}>
          <EthereumCrystal />
        </Suspense>
        
        <Environment preset="city" background={false} />
        
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight 
          position={[5, 5, 5]} 
          intensity={1}
          castShadow 
        />
        <pointLight position={[-5, -5, -5]} intensity={0.5} color="#667eea" />
      </Canvas>
    </section>
  )
}

// Using procedural crystal - no external assets to preload
