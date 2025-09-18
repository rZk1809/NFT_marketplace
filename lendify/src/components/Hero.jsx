import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import { Link } from 'react-router-dom'
import * as THREE from 'three'

// Particle system component
function Particles({ count = 5000 }) {
  const mesh = useRef()
  const [positions, colors] = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10
      
      colors[i * 3] = Math.random()
      colors[i * 3 + 1] = 0.5 + Math.random() * 0.5
      colors[i * 3 + 2] = 1
    }
    
    return [positions, colors]
  }, [count])

  useFrame((state, delta) => {
    if (mesh.current) {
      mesh.current.rotation.x += delta * 0.1
      mesh.current.rotation.y += delta * 0.05
      
      // Mouse interaction
      const mouse = state.mouse
      mesh.current.rotation.x += mouse.y * delta * 0.1
      mesh.current.rotation.y += mouse.x * delta * 0.1
    }
  })

  return (
    <Points ref={mesh} positions={positions} colors={colors}>
      <PointMaterial
        transparent
        color="#ffffff"
        size={0.002}
        sizeAttenuation={true}
        depthWrite={false}
        vertexColors
        blending={THREE.AdditiveBlending}
      />
    </Points>
  )
}

export default function Hero() {
  return (
    <section className="hero" id="home">
      <div className="hero-content">
        <h1 className="hero-title gradient-text">
          The Future of
          <br />
          Decentralized Lending
        </h1>
        <p className="hero-subtitle">
          Experience seamless, secure, and transparent lending powered by blockchain technology.
          Join thousands of users who trust Lendify for their financial needs.
        </p>
        <div>
          <Link to="/app/login" className="hero-cta">
            Get Started
          </Link>
          <button className="hero-cta secondary">
            Learn More
          </button>
        </div>
      </div>
    </section>
  )
}
