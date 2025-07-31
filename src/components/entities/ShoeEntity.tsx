import { useRef, useState, useEffect } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import * as THREE from 'three'

interface ShoeEntityProps {
  initialPosition: THREE.Vector3
  targetPosition: THREE.Vector3
  onHit?: (target: 'bush' | 'miss') => void
  onRemove?: () => void
}

// Correct physics constants per game_fix_plan.md
const FLIGHT_TIME = 1.0 // Shoes land in exactly 1 second per specification

interface ProjectileState {
  position: THREE.Vector3
  launched: boolean
  timeAlive: number
}

export function ShoeEntity({ initialPosition, targetPosition, onHit, onRemove }: ShoeEntityProps) {
  const meshRef = useRef<THREE.Group>(null!)
  const gltf = useLoader(GLTFLoader, '/models/worn_rieker_leather_shoe/scene.gltf')
  const [isReady, setIsReady] = useState(false)
  
  // Correct projectile physics state per game_fix_plan.md
  const [projectile, setProjectile] = useState<ProjectileState>({
    position: initialPosition.clone(),
    launched: true,
    timeAlive: 0
  })
  
  // Correct physics simulation per game_fix_plan.md
  useFrame((state, delta) => {
    if (!meshRef.current || !projectile.launched || !isReady) return
    
    setProjectile(prev => {
      const newTimeAlive = prev.timeAlive + delta
      
      // Check if flight time exceeded (1 second)
      if (newTimeAlive >= FLIGHT_TIME) {
                  // Shoe lands - check for hit using YOUR improved logic
          const finalPosition = new THREE.Vector3(
            initialPosition.x, // X stays same as initial
            1.0, // Landing height
            targetPosition.z // Z reaches target (Bush position)
          )
          
          // Simple hit detection - if landed near target position
          const hitDistance = Math.abs(finalPosition.x - targetPosition.x) // Check X distance to Bush
          if (hitDistance < 1.0 && onHit) {
          onHit('bush')
        } else if (onHit) {
          onHit('miss')
        }
        
        // Remove shoe after brief delay
        setTimeout(() => {
          if (onRemove) onRemove()
        }, 500)
        
        return { ...prev, launched: false }
      }
      
              // Calculate position using YOUR CORRECTED physics formula
        const t = newTimeAlive / FLIGHT_TIME // Normalized time (0 to 1)
        const newPosition = new THREE.Vector3(
          initialPosition.x, // X-coordinate stays consistent (no sideways movement)
          1.0 + 1.2 * Math.sin(Math.PI * t), // Arc: y = 1.0 + 1.2 × sin(π t)
          THREE.MathUtils.lerp(initialPosition.z, targetPosition.z, t) // Linear Z movement (forward toward Bush)
        )
      
      return {
        ...prev,
        position: newPosition,
        timeAlive: newTimeAlive
      }
    })
    
    // Update mesh position and rotation
    meshRef.current.position.copy(projectile.position)
    
    // Add spinning rotation for visual effect (360° s⁻¹ per specification)
    meshRef.current.rotation.x += 2 * Math.PI * delta // 360° per second
    meshRef.current.rotation.z += 2 * Math.PI * delta
  })
  
  // Scale GLTF on load to prevent size flash
  useEffect(() => {
    gltf.scene.position.set(0, 0, 0)
    gltf.scene.rotation.set(0, 0, 0)
    gltf.scene.scale.set(0.02, 0.02, 0.02)
    gltf.scene.updateMatrixWorld(true)
    setIsReady(true)
  }, [gltf])
  
  if (!projectile.launched || !isReady) return null
  
  return (
    <group ref={meshRef} position={projectile.position.toArray()}>
      {/* GLTF Shoe with working trajectory physics */}
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