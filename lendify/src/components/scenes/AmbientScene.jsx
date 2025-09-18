import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import * as THREE from 'three'

// Generate random particle positions
function AmbientParticles() {
  const pointsRef = useRef()
  const particleCount = 200
  
  const positions = useMemo(() => {
    const positions = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 40     // x
      positions[i + 1] = (Math.random() - 0.5) * 20 // y  
      positions[i + 2] = (Math.random() - 0.5) * 40 // z
    }
    return positions
  }, [])
  
  useFrame((state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.05
      pointsRef.current.rotation.x += delta * 0.02
    }
  })
  
  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#667eea"
        transparent
        opacity={0.6}
      />
    </points>
  )
}

// Generate floating geometric shapes
function FloatingGeometry() {
  const groupRef = useRef()
  
  const shapes = useMemo(() => {
    return Array.from({ length: 8 }, () => ({
      position: [
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 20
      ],
      rotation: [
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      ],
      scale: [
        0.2 + Math.random() * 0.5,
        0.2 + Math.random() * 0.5,
        0.2 + Math.random() * 0.5
      ],
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
            <meshBasicMaterial
              color={shape.color}
              transparent
              opacity={0.3}
              wireframe
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

// Main Ambient Scene Component (Canvas-free)
export default function AmbientScene() {
  console.log('🌌 AmbientScene rendering (Canvas-free)')
  
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
