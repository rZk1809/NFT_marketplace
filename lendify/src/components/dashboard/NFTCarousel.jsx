import React, { useRef, useMemo, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import * as THREE from 'three'

// Mock NFT data with programmatic colors
const mockNFTs = [
  {
    id: 1,
    name: "Crypto Punk #1234",
    color: "#667eea",
    description: "A rare CryptoPunk from the genesis collection",
    price: "2.5 ETH",
    rarity: "Legendary"
  },
  {
    id: 2,
    name: "Bored Ape #5678",
    color: "#764ba2",
    description: "A unique Bored Ape with rare traits",
    price: "1.8 ETH",
    rarity: "Epic"
  },
  {
    id: 3,
    name: "Art Block #9012",
    color: "#f093fb",
    description: "Generative art piece from Art Blocks",
    price: "0.9 ETH",
    rarity: "Rare"
  },
  {
    id: 4,
    name: "Mutant Ape #3456",
    color: "#50fa7b",
    description: "A mutant version of the famous ape",
    price: "1.2 ETH",
    rarity: "Epic"
  },
  {
    id: 5,
    name: "Cool Cat #7890",
    color: "#4ecdc4",
    description: "A cool cat with unique accessories",
    price: "0.7 ETH",
    rarity: "Uncommon"
  },
  {
    id: 6,
    name: "Pudgy Penguin #1122",
    color: "#ff6b6b",
    description: "An adorable penguin from Antarctica",
    price: "1.1 ETH",
    rarity: "Rare"
  }
]

// Individual NFT Card Component
function NFTCard({ nft, position, rotation, scale, isHovered, isSelected, onClick, onHover, onHoverOut }) {
  const meshRef = useRef()
  const glowRef = useRef()
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      // Hover animation
      if (isHovered) {
        meshRef.current.scale.lerp(new THREE.Vector3(1.2, 1.2, 1.2), 0.1)
      } else if (isSelected) {
        meshRef.current.scale.lerp(new THREE.Vector3(1.1, 1.1, 1.1), 0.1)
      } else {
        meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1)
      }
      
      // Subtle floating animation
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5 + position[0]) * 0.1
      
      // Rotation animation
      if (isSelected) {
        meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 2) * 0.05
      }
    }
    
    // Glow effect
    if (glowRef.current) {
      if (isHovered) {
        glowRef.current.material.opacity = THREE.MathUtils.lerp(glowRef.current.material.opacity, 0.3, 0.1)
      } else if (isSelected) {
        glowRef.current.material.opacity = THREE.MathUtils.lerp(glowRef.current.material.opacity, 0.2, 0.1)
      } else {
        glowRef.current.material.opacity = THREE.MathUtils.lerp(glowRef.current.material.opacity, 0, 0.1)
      }
    }
  })

  return (
    <group 
      position={position} 
      rotation={rotation}
      onPointerEnter={onHover}
      onPointerLeave={onHoverOut}
      onClick={onClick}
    >
      {/* Glow effect */}
      <mesh ref={glowRef}>
        <planeGeometry args={[2.2, 2.2]} />
        <meshBasicMaterial
          color="#667eea"
          transparent
          opacity={0}
        />
      </mesh>
      
      {/* NFT Frame */}
      <mesh ref={meshRef}>
        <planeGeometry args={[1.8, 1.8]} />
        <meshStandardMaterial
          color="#ffffff"
          metalness={0.1}
          roughness={0.1}
        />
      </mesh>
      
      {/* Ultra-Simple NFT Card */}
      <Float speed={1} rotationIntensity={0.1} floatIntensity={0.1}>
        <mesh position={[0, 0, 0.01]}>
          <boxGeometry args={[1.6, 1.6, 0.1]} />
          <meshBasicMaterial color={nft.color} />
        </mesh>
      </Float>
      
      {/* Border frame */}
      <mesh position={[0, 0, 0.02]}>
        <ringGeometry args={[0.9, 1, 32]} />
        <meshBasicMaterial 
          color={isHovered ? "#667eea" : isSelected ? "#764ba2" : "#cccccc"}
          transparent
          opacity={0.8}
        />
      </mesh>
    </group>
  )
}

// Main NFTCarousel Component
export default function NFTCarousel({ onNFTSelect }) {
  const groupRef = useRef()
  const { mouse } = useThree()
  const [hoveredNFT, setHoveredNFT] = useState(null)
  const [selectedNFT, setSelectedNFT] = useState(null)
  const [rotation, setRotation] = useState(0)

  // Debug logging
  console.log('NFTCarousel rendered with', mockNFTs.length, 'NFTs')

  // Calculate NFT positions in a circle
  const nftPositions = useMemo(() => {
    const radius = 4
    return mockNFTs.map((nft, index) => {
      const angle = (index / mockNFTs.length) * Math.PI * 2
      return {
        position: [
          Math.cos(angle) * radius,
          0,
          Math.sin(angle) * radius
        ],
        rotation: [0, -angle + Math.PI / 2, 0],
        nft
      }
    })
  }, [])

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Mouse-controlled rotation
      const mouseInfluence = mouse.x * 2
      const targetRotation = rotation + mouseInfluence * delta
      
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        targetRotation,
        0.05
      )
      
      // Auto rotation when not interacting
      if (Math.abs(mouse.x) < 0.1 && Math.abs(mouse.y) < 0.1) {
        groupRef.current.rotation.y += delta * 0.1
      }
      
      // Slight tilt based on mouse Y
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        -mouse.y * 0.2,
        0.03
      )
    }
  })

  const handleNFTClick = (nft) => {
    console.log('NFT clicked:', nft.name)
    setSelectedNFT(selectedNFT?.id === nft.id ? null : nft)
    if (onNFTSelect) {
      onNFTSelect(selectedNFT?.id === nft.id ? null : nft)
    }
  }

  const handleNFTHover = (nft) => {
    setHoveredNFT(nft)
    document.body.style.cursor = 'pointer'
  }

  const handleNFTHoverOut = () => {
    setHoveredNFT(null)
    document.body.style.cursor = 'default'
  }

  return (
    <group ref={groupRef}>
      {nftPositions.map(({ position, rotation, nft }, index) => (
        <NFTCard
          key={nft.id}
          nft={nft}
          position={position}
          rotation={rotation}
          isHovered={hoveredNFT?.id === nft.id}
          isSelected={selectedNFT?.id === nft.id}
          onClick={() => handleNFTClick(nft)}
          onHover={() => handleNFTHover(nft)}
          onHoverOut={handleNFTHoverOut}
        />
      ))}
      
      {/* Center indicator */}
      <mesh position={[0, -2, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.5, 8]} />
        <meshStandardMaterial
          color="#667eea"
          emissive="#667eea"
          emissiveIntensity={0.2}
          transparent
          opacity={0.6}
        />
      </mesh>
      
      {/* Carousel base */}
      <mesh position={[0, -2.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3, 5, 32]} />
        <meshStandardMaterial
          color="#667eea"
          transparent
          opacity={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}
