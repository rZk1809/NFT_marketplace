import { useRef, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import * as THREE from 'three'
// Simple Network Node with cursor interaction
function SimpleNode({ position, color = "#64ffda", scale = 1 }) {
  const nodeRef = useRef()
  const { mouse } = useThree()
  
  useFrame((state, delta) => {
    if (nodeRef.current) {
      const time = state.clock.elapsedTime
      
      // Cursor-influenced floating
      const mouseInfluence = Math.sin(mouse.x + mouse.y) * 0.05
      nodeRef.current.position.y = position[1] + Math.sin(time + position[0]) * 0.1 + mouseInfluence
      
      // Enhanced pulsing with cursor interaction
      const mouseDistance = Math.sqrt(mouse.x * mouse.x + mouse.y * mouse.y)
      const cursorPulse = 1 + mouseDistance * 0.3
      const pulse = 1 + Math.sin(time * 2 + position[0]) * 0.2
      nodeRef.current.scale.setScalar(scale * pulse * cursorPulse)
      
      // Slight rotation toward cursor
      nodeRef.current.rotation.y = THREE.MathUtils.lerp(
        nodeRef.current.rotation.y,
        mouse.x * 0.5,
        0.02
      )
    }
  })

  return (
    <group ref={nodeRef} position={position}>
      <mesh>
        <sphereGeometry args={[0.1, 12, 12]} />
        <meshStandardMaterial 
          color={color}
          emissive={color}
          emissiveIntensity={0.4}
        />
      </mesh>
      
      {/* Glow effect */}
      <mesh>
        <sphereGeometry args={[0.15, 12, 12]} />
        <meshBasicMaterial 
          color={color}
          transparent
          opacity={0.2}
        />
      </mesh>
    </group>
  )
}

// Central Hub with cursor interaction
function CentralHub({ position = [0, 0, 0] }) {
  const hubRef = useRef()
  const { mouse } = useThree()
  
  useFrame((state, delta) => {
    if (hubRef.current) {
      // Cursor-influenced rotation speed
      const mouseRotationSpeed = 0.5 + Math.abs(mouse.x) * 0.5
      hubRef.current.rotation.y += delta * mouseRotationSpeed
      
      // Enhanced floating with cursor influence
      const cursorFloat = mouse.y * 0.02
      hubRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.3) * 0.05 + cursorFloat
      
      // Tilt based on cursor position
      hubRef.current.rotation.x = THREE.MathUtils.lerp(
        hubRef.current.rotation.x,
        -mouse.y * 0.2,
        0.03
      )
      hubRef.current.rotation.z = THREE.MathUtils.lerp(
        hubRef.current.rotation.z,
        mouse.x * 0.1,
        0.03
      )
    }
  })

  return (
    <group ref={hubRef} position={position}>
      <mesh>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial
          color="#ff6b6b"
          emissive="#ff6b6b"
          emissiveIntensity={0.4}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      {/* Rotating rings - smaller */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.35, 0.015, 12, 24]} />
        <meshBasicMaterial color="#ff6b6b" transparent opacity={0.5} />
      </mesh>
      
      <mesh rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[0.4, 0.015, 12, 24]} />
        <meshBasicMaterial color="#ff6b6b" transparent opacity={0.4} />
      </mesh>
    </group>
  )
}

// Network Scene with cursor interaction
function NetworkScene() {
  const mainGroupRef = useRef()
  const { mouse } = useThree()
  
  const nodes = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => {
      const angle = (i / 8) * Math.PI * 2
      const radius = 1.2 + Math.random() * 0.5
      return {
        position: [
          Math.cos(angle) * radius,
          (Math.random() - 0.5) * 1,
          Math.sin(angle) * radius
        ],
        color: `hsl(${180 + Math.random() * 120}, 70%, 60%)`
      }
    })
  }, [])

  useFrame((state, delta) => {
    if (mainGroupRef.current) {
      // Cursor-influenced main rotation
      const mouseRotation = mouse.x * 0.1
      mainGroupRef.current.rotation.y += delta * (0.02 + Math.abs(mouseRotation) * 0.05)
      
      // Smooth tilting based on cursor
      mainGroupRef.current.rotation.x = THREE.MathUtils.lerp(
        mainGroupRef.current.rotation.x,
        -mouse.y * 0.1,
        0.02
      )
      
      // Slight position offset for dynamic feel
      mainGroupRef.current.position.x = THREE.MathUtils.lerp(
        mainGroupRef.current.position.x,
        mouse.x * 0.05,
        0.01
      )
      mainGroupRef.current.position.z = THREE.MathUtils.lerp(
        mainGroupRef.current.position.z,
        -mouse.y * 0.05,
        0.01
      )
    }
  })

  return (
    <group ref={mainGroupRef}>
      <CentralHub position={[0, 0, 0]} />
      
      {/* Satellite nodes */}
      {nodes.map((node, i) => (
        <SimpleNode 
          key={i}
          position={node.position}
          color={node.color}
          scale={0.8}
        />
      ))}
      
      {/* Connection lines (simplified as thin cylinders) */}
      {nodes.slice(0, 6).map((node, i) => {
        const length = Math.sqrt(node.position[0]**2 + node.position[1]**2 + node.position[2]**2)
        return (
          <mesh 
            key={`conn-${i}`}
            position={[node.position[0] / 2, node.position[1] / 2, node.position[2] / 2]}
            rotation={[
              Math.atan2(node.position[1], Math.sqrt(node.position[0]**2 + node.position[2]**2)),
              Math.atan2(node.position[0], node.position[2]),
              0
            ]}
          >
            <cylinderGeometry args={[0.01, 0.01, length, 6]} />
            <meshBasicMaterial 
              color={node.color}
              transparent 
              opacity={0.4}
            />
          </mesh>
        )
      })}
      
      {/* Background sphere - smaller */}
      <mesh>
        <sphereGeometry args={[2.5, 24, 24]} />
        <meshBasicMaterial 
          color="#64ffda"
          transparent
          opacity={0.08}
          side={2} // THREE.BackSide
          wireframe
        />
      </mesh>
    </group>
  )
}

// Fallback Component
function NetworkFallback() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '400px',
      fontSize: '1.1rem',
      color: '#64ffda',
      textAlign: 'center',
      background: 'rgba(100, 255, 218, 0.1)',
      borderRadius: '12px',
      border: '1px solid rgba(100, 255, 218, 0.3)'
    }}>
      🌐 Decentralized Network 🌐
    </div>
  )
}

// Main Export
export default function NetworkNodesModel() {
  return (
    <div style={{ 
      width: '100%', 
      height: '500px', 
      position: 'relative',
      borderRadius: '15px',
      overflow: 'hidden'
    }}>
      <Canvas
        camera={{ position: [4, 2.5, 4], fov: 60 }}
        gl={{ antialias: true }}
        onError={() => console.warn('NetworkNodesModel Canvas error')}
        fallback={<NetworkFallback />}
      >
        <NetworkScene />
        
        <Environment preset="night" background={false} />
        
        <ambientLight intensity={0.3} />
        <directionalLight position={[10, 10, 5]} intensity={0.8} />
        <pointLight position={[0, 0, 0]} color="#ff6b6b" intensity={1} />
      </Canvas>
    </div>
  )
}
