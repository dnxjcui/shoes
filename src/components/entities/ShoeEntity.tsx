import { useRef, useState, useEffect } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import * as THREE from 'three'

interface ShoeEntityProps {
  initialPosition: THREE.Vector3
  onHit?: (target: 'bush' | 'miss') => void
  onRemove?: () => void
}

// Shoe projectile physics constants
const SHOE_SPEED = 6.0 // Linear speed in z-direction (m/s)
const GRAVITY = 9.8 // Gravity for arc physics
const INITIAL_VELOCITY_Y = 4.0 // Initial upward velocity for arc
const MAX_DISTANCE = 12.0 // Max travel distance before removal

interface ProjectileState {
  position: THREE.Vector3
  velocity: THREE.Vector3
  launched: boolean
  timeAlive: number
}

export function ShoeEntity({ initialPosition, onHit, onRemove }: ShoeEntityProps) {
  const meshRef = useRef<THREE.Group>(null!)
  const gltf = useLoader(GLTFLoader, '/models/worn_rieker_leather_shoe/scene.gltf')
  const [isScaled, setIsScaled] = useState(false)
  
  // Projectile physics state
  const [projectile, setProjectile] = useState<ProjectileState>({
    position: initialPosition.clone(),
    velocity: new THREE.Vector3(0, INITIAL_VELOCITY_Y, SHOE_SPEED),
    launched: true,
    timeAlive: 0
  })
  
  // Physics simulation
  useFrame((state, delta) => {
    if (!meshRef.current || !projectile.launched) return
    
    setProjectile(prev => {
      const newProjectile = { ...prev }
      newProjectile.timeAlive += delta
      
      // Apply gravity to Y velocity
      newProjectile.velocity.y -= GRAVITY * delta
      
      // Update position based on velocity
      newProjectile.position.x += newProjectile.velocity.x * delta
      newProjectile.position.y += newProjectile.velocity.y * delta
      newProjectile.position.z += newProjectile.velocity.z * delta
      
      // Check if shoe hit ground or traveled too far
      if (newProjectile.position.y <= 0.1 || newProjectile.position.z >= MAX_DISTANCE) {
        // Check for hit detection (simplified - bush is around z=8, x range)
        const hitBush = newProjectile.position.z >= 7.5 && 
                       newProjectile.position.z <= 8.5 && 
                       Math.abs(newProjectile.position.x) <= 1.0
        
        if (hitBush && onHit) {
          onHit('bush')
        } else if (onHit) {
          onHit('miss')
        }
        
        // Remove shoe after brief delay
        setTimeout(() => {
          if (onRemove) onRemove()
        }, 500)
        
        newProjectile.launched = false
      }
      
      return newProjectile
    })
    
    // Update mesh position and rotation
    meshRef.current.position.copy(projectile.position)
    
    // Add spinning rotation for visual effect
    meshRef.current.rotation.x += 8.0 * delta
    meshRef.current.rotation.z += 6.0 * delta
  })
  
  // Apply PS1-style materials when GLTF loads
  useEffect(() => {
    if (gltf?.scene) {
      gltf.scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          if (child.material instanceof THREE.Material) {
            const originalMaterial = child.material as any
            
            // Convert to PS1-style material
            const newMaterial = new THREE.MeshLambertMaterial({
              flatShading: true,
              side: THREE.DoubleSide
            })
            
            // Apply color and textures
            if (originalMaterial.color) {
              (newMaterial as any).color = originalMaterial.color
            } else {
              (newMaterial as any).color = new THREE.Color(0x8B4513) // Brown leather
            }
            
            if (originalMaterial.map) {
              (newMaterial as any).map = originalMaterial.map
              originalMaterial.map.magFilter = THREE.NearestFilter
              originalMaterial.map.minFilter = THREE.NearestFilter
              originalMaterial.map.generateMipmaps = false
            }
            
            child.material = newMaterial
            child.castShadow = true
          }
        }
      })
      
      // Scale shoe to reasonable size
      const box = new THREE.Box3().setFromObject(gltf.scene)
      const size = box.getSize(new THREE.Vector3())
      const center = box.getCenter(new THREE.Vector3())
      
      // Reset transformations
      gltf.scene.position.set(0, 0, 0)
      gltf.scene.rotation.set(0, 0, 0)
      gltf.scene.scale.set(1, 1, 1)
      
      // Center the shoe
      gltf.scene.position.sub(center)
      
      // Scale to reasonable size relative to player (25% of player volume)
      // Player sprite is about 1.6 units tall, so shoe should be much smaller
      const maxDimension = Math.max(size.x, size.y, size.z)
      const targetSize = 0.15 // Much smaller - about 10% of player height
      const scale = targetSize / maxDimension
      gltf.scene.scale.setScalar(scale)
      
      // Ensure scaling is applied immediately to prevent size flash
      gltf.scene.updateMatrixWorld(true)
      setIsScaled(true)
    }
  }, [gltf])
  
  if (!projectile.launched || !isScaled) return null
  
  return (
    <group ref={meshRef} position={projectile.position.toArray()}>
      <primitive object={gltf.scene.clone()} />
      
      {/* Shoe trail effect */}
      <mesh position={[0, 0, -0.2]}>
        <sphereGeometry args={[0.05]} />
        <meshBasicMaterial 
          color={0x8B4513} 
          transparent 
          opacity={0.3}
        />
      </mesh>
    </group>
  )
}