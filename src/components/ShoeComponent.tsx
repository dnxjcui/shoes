import React, { useRef, useState, useEffect } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import * as THREE from 'three'

interface ShoeComponentProps {
  id: string
  initialPosition: [number, number, number]
  initialVelocity: [number, number, number]
  thrower: 'player' | 'npc'
  onRemove: (id: string) => void
  onHitBush: () => void
  onHitPlayer: () => void
}

export function ShoeComponent({ 
  id, 
  initialPosition, 
  initialVelocity, 
  thrower, 
  onRemove,
  onHitBush,
  onHitPlayer 
}: ShoeComponentProps) {
  const meshRef = useRef<THREE.Group>(null!)
  const [position, setPosition] = useState(initialPosition)
  const [velocity, setVelocity] = useState(initialVelocity)
  const [lifetime, setLifetime] = useState(0)

  // Load shoe model
  const gltf = useLoader(GLTFLoader, '/models/shoe_low.glb')

  // Apply PS1-style materials on load
  useEffect(() => {
    if (gltf.scene) {
      gltf.scene.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const mesh = obj as THREE.Mesh
          const src = mesh.material as THREE.Material & { map?: THREE.Texture }
          
          // Create PS1-style material
          const psxMat = new THREE.MeshLambertMaterial({
            map: (src as any).map ?? null,
            vertexColors: true,
            flatShading: true,
            color: 0xffffff
          })
          
          // Apply PS1 texture filtering
          if (psxMat.map) {
            psxMat.map.colorSpace = THREE.SRGBColorSpace
            psxMat.map.magFilter = THREE.NearestFilter
            psxMat.map.minFilter = THREE.NearestFilter
            psxMat.map.generateMipmaps = false
          }
          
          mesh.material = psxMat
        }
      })
    }
  }, [gltf])

  // Animation loop
  useFrame((state, deltaTime) => {
    if (!meshRef.current) return

    // Update lifetime
    setLifetime(prev => prev + deltaTime)

    // Remove shoe after 10 seconds
    if (lifetime > 10) {
      onRemove(id)
      return
    }

    // Apply gravity
    const gravity = -9.8
    setVelocity(prev => [prev[0], prev[1] + gravity * deltaTime, prev[2]])

    // Update position
    setPosition(prev => [
      prev[0] + velocity[0] * deltaTime,
      prev[1] + velocity[1] * deltaTime,
      prev[2] + velocity[2] * deltaTime
    ])

    // Update mesh position
    meshRef.current.position.set(position[0], position[1], position[2])

    // Rotate shoe for visual effect
    meshRef.current.rotation.x += deltaTime * 5
    meshRef.current.rotation.y += deltaTime * 3

    // Collision detection
    const tolerance = 0.5

    // Check collision with bush (at z=8, x varies, y around 1)
    if (thrower === 'player') {
      const bushX = 0 // We'd need to get this from bush component state in a real implementation
      const distanceX = Math.abs(position[0] - bushX)
      const distanceZ = Math.abs(position[2] - 8)
      const distanceY = Math.abs(position[1] - 1)

      if (distanceX < tolerance && distanceZ < tolerance && distanceY < tolerance) {
        onHitBush()
        onRemove(id)
        return
      }
    }

    // Check collision with player (at z=0, x varies, y around 0.8)
    if (thrower === 'npc') {
      const playerX = 0 // We'd need to get this from cat component state in a real implementation
      const distanceX = Math.abs(position[0] - playerX)
      const distanceZ = Math.abs(position[2] - 0)
      const distanceY = Math.abs(position[1] - 0.8)

      if (distanceX < tolerance && distanceZ < tolerance && distanceY < tolerance) {
        onHitPlayer()
        onRemove(id)
        return
      }
    }

    // Remove shoe if it hits the ground
    if (position[1] < 0) {
      onRemove(id)
    }
  })

  return (
    <group ref={meshRef} scale={0.3}>
      <primitive object={gltf.scene} />
    </group>
  )
}