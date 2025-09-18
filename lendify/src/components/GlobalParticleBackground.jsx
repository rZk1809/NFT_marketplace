import { useRef, useMemo, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'

// Enhanced particle system with cursor interaction and floating motion
function EnhancedParticles({ count = 3000 }) {
  const mesh = useRef()
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const { mouse, viewport } = useThree()
  
  const [positions, colors, originalPositions] = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const originalPositions = new Float32Array(count * 3)
    
    for (let i = 0; i < count; i++) {
      // Spread particles across a larger area
      const x = (Math.random() - 0.5) * 15
      const y = (Math.random() - 0.5) * 15
      const z = (Math.random() - 0.5) * 15
      
      positions[i * 3] = x
      positions[i * 3 + 1] = y
      positions[i * 3 + 2] = z
      
      originalPositions[i * 3] = x
      originalPositions[i * 3 + 1] = y
      originalPositions[i * 3 + 2] = z
      
      // Enhanced color palette with more vibrant colors
      const colorVariant = Math.random()
      if (colorVariant < 0.3) {
        // Blue tones
        colors[i * 3] = 0.4 + Math.random() * 0.3     // R
        colors[i * 3 + 1] = 0.6 + Math.random() * 0.4 // G
        colors[i * 3 + 2] = 0.9 + Math.random() * 0.1 // B
      } else if (colorVariant < 0.6) {
        // Purple tones
        colors[i * 3] = 0.6 + Math.random() * 0.4     // R
        colors[i * 3 + 1] = 0.3 + Math.random() * 0.3 // G
        colors[i * 3 + 2] = 0.9 + Math.random() * 0.1 // B
      } else {
        // Pink/white tones
        colors[i * 3] = 0.8 + Math.random() * 0.2     // R
        colors[i * 3 + 1] = 0.7 + Math.random() * 0.3 // G
        colors[i * 3 + 2] = 0.9 + Math.random() * 0.1 // B
      }
    }
    
    return [positions, colors, originalPositions]
  }, [count])

  useFrame((state, delta) => {
    if (mesh.current) {
      const time = state.clock.elapsedTime
      const positions = mesh.current.geometry.attributes.position.array
      
      // Convert mouse coordinates to world space
      const mouseX = (mouse.x * viewport.width) / 2
      const mouseY = (mouse.y * viewport.height) / 2
      
      for (let i = 0; i < count; i++) {
        const i3 = i * 3
        
        // Original position with gentle floating
        const originalX = originalPositions[i3]
        const originalY = originalPositions[i3 + 1]
        const originalZ = originalPositions[i3 + 2]
        
        // Add gentle floating motion
        const floatX = Math.sin(time * 0.5 + i * 0.01) * 0.1
        const floatY = Math.cos(time * 0.3 + i * 0.01) * 0.1
        const floatZ = Math.sin(time * 0.4 + i * 0.02) * 0.05
        
        // Calculate distance to mouse
        const dx = positions[i3] - mouseX
        const dy = positions[i3 + 1] - mouseY
        const distance = Math.sqrt(dx * dx + dy * dy)
        
        // Mouse interaction force (both attraction and repulsion)
        let forceX = 0
        let forceY = 0
        
        if (distance < 3) {
          const force = (3 - distance) / 3
          const angle = Math.atan2(dy, dx)
          
          // Repulsion effect when very close
          if (distance < 1) {
            forceX = Math.cos(angle) * force * 0.5
            forceY = Math.sin(angle) * force * 0.5
          } else {
            // Gentle attraction when further away
            forceX = -Math.cos(angle) * force * 0.2
            forceY = -Math.sin(angle) * force * 0.2
          }
        }
        
        // Apply all forces
        positions[i3] = originalX + floatX + forceX
        positions[i3 + 1] = originalY + floatY + forceY
        positions[i3 + 2] = originalZ + floatZ
      }
      
      mesh.current.geometry.attributes.position.needsUpdate = true
      
      // Slow background rotation
      mesh.current.rotation.x += delta * 0.05
      mesh.current.rotation.y += delta * 0.03
    }
  })

  return (
    <Points ref={mesh} positions={positions} colors={colors}>
      <PointMaterial
        transparent
        color="#ffffff"
        size={0.015} // Larger particles for better visibility
        sizeAttenuation={true}
        depthWrite={false}
        vertexColors
        blending={THREE.AdditiveBlending}
        opacity={0.9}
      />
    </Points>
  )
}

// Enhanced global particle background component
export default function GlobalParticleBackground() {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: 0,
      pointerEvents: 'none',
      background: 'transparent'
    }}>
      <Canvas 
        camera={{ position: [0, 0, 5], fov: 75 }}
        gl={{ alpha: true, premultipliedAlpha: false }}
        style={{ background: 'transparent' }}
      >
        <EnhancedParticles />
        {/* Subtle ambient lighting for better particle visibility */}
        <ambientLight intensity={0.1} />
      </Canvas>
    </div>
  )
}
