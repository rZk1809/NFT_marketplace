import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, Text } from '@react-three/drei'
import * as THREE from 'three'

// NFT data with safe colors
const nftData = [
  { id: 1, name: "Crypto Punk #1234", price: "2.5 ETH", rarity: "Legendary", color: "#667eea" },
  { id: 2, name: "Bored Ape #5678", price: "1.8 ETH", rarity: "Epic", color: "#764ba2" },
  { id: 3, name: "Art Block #9012", price: "0.9 ETH", rarity: "Rare", color: "#f093fb" },
  { id: 4, name: "Mutant Ape #3456", price: "1.2 ETH", rarity: "Epic", color: "#50fa7b" },
  { id: 5, name: "Cool Cat #7890", price: "0.7 ETH", rarity: "Uncommon", color: "#4ecdc4" },
  { id: 6, name: "Pudgy Penguin #1122", price: "1.1 ETH", rarity: "Rare", color: "#ff6b6b" }
]

// Individual NFT Card Component
function NFT3DCard({ nft, position, index, onSelect }) {
  const meshRef = useRef()
  const textRef = useRef()
  const [hovered, setHovered] = React.useState(false)
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      // Gentle floating animation
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.8 + index) * 0.3
      
      // Gentle rotation
      meshRef.current.rotation.y += delta * 0.2
      
      // Scale on hover
      const targetScale = hovered ? 1.2 : 1
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1)
    }
    
    if (textRef.current) {
      // Keep text facing camera
      textRef.current.lookAt(state.camera.position)
    }
  })

  return (
    <group position={position}>
      <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2}>
        {/* Main NFT Card */}
        <mesh
          ref={meshRef}
          onPointerEnter={() => setHovered(true)}
          onPointerLeave={() => setHovered(false)}
          onClick={() => onSelect(nft)}
        >
          <boxGeometry args={[2, 2.5, 0.2]} />
          <meshStandardMaterial 
            color={nft.color}
            metalness={0.3}
            roughness={0.4}
          />
        </mesh>
        
        {/* Card Frame */}
        <mesh position={[0, 0, 0.11]}>
          <boxGeometry args={[2.1, 2.6, 0.1]} />
          <meshStandardMaterial 
            color="#ffffff"
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
        
        {/* NFT ID Text */}
        <Text
          ref={textRef}
          position={[0, 0, 0.2]}
          fontSize={0.3}
          color="white"
          anchorX="center"
          anchorY="middle"
          font="https://fonts.gstatic.com/s/raleway/v14/1Ptrg8zYS_SKggPNwK4vaqI.woff"
        >
          #{nft.id}
        </Text>
        
        {/* Price Tag */}
        <mesh position={[0, -1, 0.2]}>
          <planeGeometry args={[1.5, 0.4]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.8} />
        </mesh>
        
        <Text
          position={[0, -1, 0.21]}
          fontSize={0.15}
          color="#50fa7b"
          anchorX="center"
          anchorY="middle"
        >
          {nft.price}
        </Text>
      </Float>
    </group>
  )
}

// Floating Particles Background
function FloatingParticles() {
  const pointsRef = useRef()
  const particleCount = 100
  
  const positions = useMemo(() => {
    const positions = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 30     // x
      positions[i + 1] = (Math.random() - 0.5) * 20 // y  
      positions[i + 2] = (Math.random() - 0.5) * 30 // z
    }
    return positions
  }, [])
  
  useFrame((state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.1
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
        size={0.1}
        color="#667eea"
        transparent
        opacity={0.6}
      />
    </points>
  )
}

// Geometric Background Elements
function BackgroundGeometry() {
  const groupRef = useRef()
  
  const shapes = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => ({
      position: [
        (Math.random() - 0.5) * 25,
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 25
      ],
      color: `hsl(${200 + i * 30}, 70%, 60%)`,
      speed: 0.1 + Math.random() * 0.2
    }))
  }, [])
  
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.children.forEach((shape, i) => {
        const data = shapes[i]
        shape.rotation.x += delta * data.speed
        shape.rotation.y += delta * data.speed * 0.7
      })
    }
  })

  return (
    <group ref={groupRef}>
      {shapes.map((shape, i) => (
        <Float key={i} speed={1} rotationIntensity={0.3} floatIntensity={0.3}>
          <mesh position={shape.position}>
            {i % 3 === 0 ? (
              <octahedronGeometry args={[0.5]} />
            ) : i % 3 === 1 ? (
              <tetrahedronGeometry args={[0.5]} />
            ) : (
              <icosahedronGeometry args={[0.5]} />
            )}
            <meshStandardMaterial
              color={shape.color}
              transparent
              opacity={0.2}
              wireframe
            />
          </mesh>
        </Float>
      ))}
    </group>
  )
}

// Platform/Ground
function Platform() {
  const meshRef = useRef()
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.material.opacity = 0.1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.05
    }
  })
  
  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -8, 0]}>
      <circleGeometry args={[15, 64]} />
      <meshStandardMaterial
        color="#667eea"
        transparent
        opacity={0.1}
        wireframe
      />
    </mesh>
  )
}

// Main Enhanced 3D Scene
export default function Enhanced3DScene({ onNFTSelect }) {
  console.log('🌟 Enhanced3DScene rendering')
  
  // Arrange NFTs in a circle
  const nftPositions = useMemo(() => {
    const radius = 6
    return nftData.map((nft, index) => {
      const angle = (index / nftData.length) * Math.PI * 2
      return [
        Math.cos(angle) * radius,
        2 + Math.sin(index) * 0.5, // Varying heights
        Math.sin(angle) * radius
      ]
    })
  }, [])

  return (
    <group>
      {/* Background Elements */}
      <FloatingParticles />
      <BackgroundGeometry />
      <Platform />
      
      {/* NFT Cards */}
      {nftData.map((nft, index) => (
        <NFT3DCard
          key={nft.id}
          nft={nft}
          position={nftPositions[index]}
          index={index}
          onSelect={onNFTSelect}
        />
      ))}
      
      {/* Welcome Text */}
      <Float speed={1} rotationIntensity={0.1} floatIntensity={0.2}>
        <Text
          position={[0, 8, 0]}
          fontSize={1}
          color="#667eea"
          anchorX="center"
          anchorY="middle"
          font="https://fonts.gstatic.com/s/raleway/v14/1Ptrg8zYS_SKggPNwK4vaqI.woff"
        >
          Your NFT Collection
        </Text>
        
        <Text
          position={[0, 7, 0]}
          fontSize={0.4}
          color="rgba(255, 255, 255, 0.8)"
          anchorX="center"
          anchorY="middle"
        >
          Click any NFT to view details
        </Text>
      </Float>
    </group>
  )
}
