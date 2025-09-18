import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import * as THREE from 'three'

// Individual Network Node Component
function NetworkNode({ position, scale = 1, color = "#64ffda", pulseOffset = 0 }) {
  const nodeRef = useRef()
  const coreRef = useRef()
  
  useFrame((state, delta) => {
    if (nodeRef.current) {
      const time = state.clock.elapsedTime
      
      // Gentle floating motion
      nodeRef.current.position.y = position[1] + Math.sin(time * 0.5 + pulseOffset) * 0.1
      
      // Pulsing effect
      const pulse = 1 + Math.sin(time * 2 + pulseOffset) * 0.2
      nodeRef.current.scale.setScalar(scale * pulse)
      
      // Slow rotation
      nodeRef.current.rotation.y += delta * 0.3
    }
    
    if (coreRef.current) {
      coreRef.current.rotation.x += delta * 0.8
      coreRef.current.rotation.z += delta * 0.4
    }
  })

  return (
    <group ref={nodeRef} position={position}>
      {/* Outer glowing sphere */}
      <mesh>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshBasicMaterial 
          color={color}
          transparent
          opacity={0.3}
        />
      </mesh>
      
      {/* Core sphere */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshStandardMaterial 
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      {/* Inner rotating structure */}
      <mesh>
        <octahedronGeometry args={[0.05, 0]} />
        <meshBasicMaterial 
          color="#ffffff"
          transparent
          opacity={0.8}
        />
      </mesh>
    </group>
  )
}

// Animated Connection Line Component (using cylinders)
function ConnectionLine({ start, end, color = "#64ffda", opacity = 0.6 }) {
  const lineRef = useRef()
  
  const { position, rotation, length } = useMemo(() => {
    const startVec = new THREE.Vector3(...start)
    const endVec = new THREE.Vector3(...end)
    const direction = new THREE.Vector3().subVectors(endVec, startVec)
    const length = direction.length()
    const position = new THREE.Vector3().addVectors(startVec, endVec).multiplyScalar(0.5)
    
    // Calculate rotation to point cylinder along the line
    const axis = new THREE.Vector3(0, 1, 0)
    const quaternion = new THREE.Quaternion().setFromUnitVectors(axis, direction.normalize())
    const euler = new THREE.Euler().setFromQuaternion(quaternion)
    
    return { position: position.toArray(), rotation: [euler.x, euler.y, euler.z], length }
  }, [start, end])
  
  useFrame((state, delta) => {
    if (lineRef.current) {
      const time = state.clock.elapsedTime
      lineRef.current.material.opacity = opacity * (0.5 + Math.sin(time * 2) * 0.3)
    }
  })

  return (
    <mesh ref={lineRef} position={position} rotation={rotation}>
      <cylinderGeometry args={[0.01, 0.01, length, 6]} />
      <meshBasicMaterial 
        color={color}
        transparent
        opacity={opacity}
      />
    </mesh>
  )
}

// Data Flow Particles Component
function DataFlowParticles({ start, end, color = "#ffffff" }) {
  const particlesRef = useRef()
  
  const particles = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => ({
      offset: i * 0.2,
      speed: 0.5 + Math.random() * 0.5
    }))
  }, [])
  
  useFrame((state, delta) => {
    if (particlesRef.current) {
      const time = state.clock.elapsedTime
      
      particlesRef.current.children.forEach((particle, i) => {
        const data = particles[i]
        const progress = ((time * data.speed + data.offset) % 1)
        
        // Interpolate between start and end positions
        particle.position.x = start[0] + (end[0] - start[0]) * progress
        particle.position.y = start[1] + (end[1] - start[1]) * progress
        particle.position.z = start[2] + (end[2] - start[2]) * progress
        
        // Fade out near the ends
        const fadeDistance = 0.1
        let opacity = 1
        if (progress < fadeDistance) {
          opacity = progress / fadeDistance
        } else if (progress > 1 - fadeDistance) {
          opacity = (1 - progress) / fadeDistance
        }
        
        particle.material.opacity = opacity
      })
    }
  })

  return (
    <group ref={particlesRef}>
      {particles.map((_, i) => (
        <mesh key={i}>
          <sphereGeometry args={[0.02, 6, 6]} />
          <meshBasicMaterial 
            color={color}
            transparent
            opacity={1}
          />
        </mesh>
      ))}
    </group>
  )
}

// Central Hub Component
function CentralHub({ position = [0, 0, 0] }) {
  const hubRef = useRef()
  const ringsRef = useRef()
  
  useFrame((state, delta) => {
    if (hubRef.current) {
      hubRef.current.rotation.y += delta * 0.2
      hubRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.3) * 0.05
    }
    
    if (ringsRef.current) {
      ringsRef.current.children.forEach((ring, i) => {
        ring.rotation.x += delta * (0.3 + i * 0.1)
        ring.rotation.z += delta * (0.2 + i * 0.05)
      })
    }
  })

  return (
    <group ref={hubRef} position={position}>
      {/* Core hub */}
      <mesh>
        <sphereGeometry args={[0.25, 20, 20]} />
        <meshPhysicalMaterial
          color="#ff6b6b"
          emissive="#ff6b6b"
          emissiveIntensity={0.3}
          metalness={0.9}
          roughness={0.1}
          transmission={0.1}
        />
      </mesh>
      
      {/* Rotating rings */}
      <group ref={ringsRef}>
        {[0.4, 0.55, 0.7].map((radius, i) => (
          <mesh key={i} rotation={[Math.PI / 2, 0, i * Math.PI / 3]}>
            <ringGeometry args={[radius - 0.02, radius + 0.02, 24]} />
            <meshBasicMaterial 
              color="#ff6b6b"
              transparent
              opacity={0.4 - i * 0.1}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}
      </group>
      
      {/* Energy pulses */}
      <mesh>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshBasicMaterial 
          color="#ff6b6b"
          transparent
          opacity={0.1}
        />
      </mesh>
    </group>
  )
}

// Satellite Nodes Component
function SatelliteNodes({ hubPosition = [0, 0, 0] }) {
  const satelliteRef = useRef()
  
  const satellites = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => {
      const angle = (i / 8) * Math.PI * 2
      const radius = 2.5 + Math.random() * 1
      return {
        position: [
          Math.cos(angle) * radius,
          (Math.random() - 0.5) * 2,
          Math.sin(angle) * radius
        ],
        color: `hsl(${180 + Math.random() * 120}, 70%, 60%)`,
        orbitSpeed: 0.1 + Math.random() * 0.2,
        pulseOffset: i * 0.5
      }
    })
  }, [])

  useFrame((state, delta) => {
    if (satelliteRef.current) {
      const time = state.clock.elapsedTime
      
      satelliteRef.current.children.forEach((satellite, i) => {
        const data = satellites[i]
        const orbitAngle = time * data.orbitSpeed + data.pulseOffset
        const radius = 2.5 + Math.sin(time + data.pulseOffset) * 0.3
        
        satellite.position.x = Math.cos(orbitAngle) * radius
        satellite.position.z = Math.sin(orbitAngle) * radius
      })
    }
  })

  return (
    <group ref={satelliteRef}>
      {satellites.map((satellite, i) => (
        <group key={i}>
          <NetworkNode 
            position={satellite.position}
            color={satellite.color}
            pulseOffset={satellite.pulseOffset}
            scale={0.8}
          />
          <ConnectionLine 
            start={hubPosition}
            end={satellite.position}
            color={satellite.color}
            opacity={0.4}
          />
          <DataFlowParticles 
            start={hubPosition}
            end={satellite.position}
            color={satellite.color}
          />
        </group>
      ))}
    </group>
  )
}

// Interconnected Network Grid Component
function NetworkGrid() {
  const gridRef = useRef()
  
  const gridNodes = useMemo(() => {
    const nodes = []
    for (let x = -2; x <= 2; x++) {
      for (let z = -2; z <= 2; z++) {
        if (x !== 0 || z !== 0) { // Skip center position (reserved for hub)
          nodes.push({
            position: [x * 1.5, Math.random() * 1 - 0.5, z * 1.5],
            color: `hsl(${200 + Math.random() * 60}, 60%, 50%)`,
            pulseOffset: Math.random() * Math.PI * 2
          })
        }
      }
    }
    return nodes
  }, [])
  
  const connections = useMemo(() => {
    const conns = []
    for (let i = 0; i < gridNodes.length; i++) {
      for (let j = i + 1; j < gridNodes.length; j++) {
        const dist = new THREE.Vector3(...gridNodes[i].position)
          .distanceTo(new THREE.Vector3(...gridNodes[j].position))
        
        // Only connect nearby nodes
        if (dist < 2.5) {
          conns.push({
            start: gridNodes[i].position,
            end: gridNodes[j].position,
            color: "#4ecdc4"
          })
        }
      }
    }
    return conns
  }, [gridNodes])

  return (
    <group ref={gridRef}>
      {/* Grid nodes */}
      {gridNodes.map((node, i) => (
        <NetworkNode 
          key={i}
          position={node.position}
          color={node.color}
          pulseOffset={node.pulseOffset}
          scale={0.6}
        />
      ))}
      
      {/* Grid connections */}
      {connections.map((conn, i) => (
        <ConnectionLine 
          key={i}
          start={conn.start}
          end={conn.end}
          color={conn.color}
          opacity={0.2}
        />
      ))}
    </group>
  )
}

// Main Network Scene Component
function NetworkScene() {
  const mainGroupRef = useRef()

  useFrame((state, delta) => {
    if (mainGroupRef.current) {
      mainGroupRef.current.rotation.y += delta * 0.03
      mainGroupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.1
    }
  })

  return (
    <group ref={mainGroupRef}>
      <CentralHub position={[0, 0, 0]} />
      <SatelliteNodes hubPosition={[0, 0, 0]} />
      <NetworkGrid />
      
      {/* Background network effect */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[6, 32, 32]} />
        <meshBasicMaterial 
          color="#64ffda"
          transparent
          opacity={0.02}
          side={THREE.BackSide}
          wireframe
        />
      </mesh>
    </group>
  )
}

// Error Fallback Component
function NetworkNodesFallback() {
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
      border: '1px solid rgba(100, 255, 218, 0.3)',
      flexDirection: 'column'
    }}>
      <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🌐</div>
      Decentralized Network<br/>
      <small style={{ opacity: 0.7, marginTop: '5px' }}>
        Peer-to-peer connections
      </small>
    </div>
  )
}

// Main Export Component
export default function NetworkNodesModel() {
  return (
    <div style={{ 
      width: '100%', 
      height: '500px', 
      position: 'relative',
      borderRadius: '15px',
      overflow: 'hidden',
      background: 'radial-gradient(circle at center, rgba(100,255,218,0.1) 0%, rgba(64,255,218,0.05) 100%)'
    }}>
      <Canvas
        camera={{ position: [6, 4, 6], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        onError={() => console.warn('NetworkNodesModel Canvas error')}
        fallback={<NetworkNodesFallback />}
      >
        <NetworkScene />
        
        <Environment preset="night" background={false} />
        
        {/* Network-appropriate lighting */}
        <ambientLight intensity={0.2} />
        <directionalLight position={[10, 10, 5]} intensity={0.8} />
        <pointLight position={[0, 0, 0]} color="#ff6b6b" intensity={1} />
        <pointLight position={[-5, 5, -5]} color="#64ffda" intensity={0.8} />
        <pointLight position={[5, -5, 5]} color="#4ecdc4" intensity={0.6} />
      </Canvas>
    </div>
  )
}
