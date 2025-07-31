import { useRef, useState, useEffect } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import * as THREE from 'three'

interface BushEntityProps {
  worldBounds: { min: number; max: number }
  worldDepth: number
  onPositionUpdate: (position: THREE.Vector3) => void
  currentTurn: 'PLAYER_TURN' | 'NPC_TURN'
  playerPosition: THREE.Vector3
}

// Bush movement behavior from implementation guide (section 3.1)
interface MovementState {
  targetX: number
  currentX: number
  velocity: number
  timer: number
  nextDirectionChange: number
  direction: number // -1, 0, or 1
}

export function BushEntity({ 
  worldBounds, 
  worldDepth, 
  onPositionUpdate, 
  currentTurn,
  playerPosition 
}: BushEntityProps) {
  const meshRef = useRef<THREE.Group>(null!)
  const gltf = useLoader(GLTFLoader, '/models/bush/scene.gltf')
  
  // Movement state following implementation guide
  const [movement, setMovement] = useState<MovementState>({
    targetX: 0,
    currentX: 0,
    velocity: 0,
    timer: 0,
    nextDirectionChange: Math.random() * 2 + 2, // 2-4 seconds
    direction: 0
  })
  
  // Position bush at z=8 for better separation  
  const bushZ = 8 // Increased separation from player at z=0
  
  useFrame((state, delta) => {
    if (!meshRef.current) return
    
    setMovement(prevMovement => {
      const newMovement = { ...prevMovement }
      newMovement.timer += delta
      
      if (currentTurn === 'PLAYER_TURN') {
        // Bush random drift during player turn
        // "pick new direction every 2–4 s → move at 1 m s⁻¹"
        
        if (newMovement.timer >= newMovement.nextDirectionChange) {
          // Pick new random direction
          const directions = [-1, 0, 1] // left, stop, right
          newMovement.direction = directions[Math.floor(Math.random() * directions.length)]
          newMovement.nextDirectionChange = Math.random() * 2 + 2 // 2-4 seconds
          newMovement.timer = 0
          
          console.log(`Bush: New direction ${newMovement.direction}, next change in ${newMovement.nextDirectionChange.toFixed(1)}s`)
        }
        
        // Move at 1 m/s in chosen direction
        const speed = 1.0 // 1 m/s as specified
        newMovement.targetX += newMovement.direction * speed * delta
        
        // Clamp to lane bounds
        newMovement.targetX = Math.max(worldBounds.min, Math.min(worldBounds.max, newMovement.targetX))
        
      } else if (currentTurn === 'NPC_TURN') {
        // Bush tracks toward player during NPC turn
        // "targetX = lerp(targetX, player.x, 0.6*dt)"
        const lerpFactor = 0.6 * delta
        newMovement.targetX = THREE.MathUtils.lerp(
          newMovement.targetX,
          playerPosition.x,
          lerpFactor
        )
      }
      
      // Smooth movement to target position
      newMovement.currentX = THREE.MathUtils.lerp(
        newMovement.currentX,
        newMovement.targetX,
        5.0 * delta // Fast convergence for responsive feel
      )
      
      return newMovement
    })
    
    // Update mesh position
    meshRef.current.position.set(movement.currentX, 0, bushZ)
    
    // Idle bob animation (section 4.1)
    const bobAmount = 0.05
    const bobSpeed = 2.0
    meshRef.current.position.y = Math.sin(state.clock.elapsedTime * bobSpeed) * bobAmount
    
    // Notify parent of position change
    onPositionUpdate(meshRef.current.position)
  })
  
  // Apply PS1-style materials when GLTF loads
  useEffect(() => {
    if (gltf?.scene) {
      gltf.scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          // Apply PS1-style material conversion
          if (child.material instanceof THREE.Material) {
            const originalMaterial = child.material as any
            
            // Check for unlit extension
            const hasUnlitExtension = originalMaterial.userData?.gltfExtensions?.KHR_materials_unlit
            
            let newMaterial: THREE.Material
            if (hasUnlitExtension) {
              newMaterial = new THREE.MeshBasicMaterial({
                side: THREE.DoubleSide
              })
            } else {
              newMaterial = new THREE.MeshLambertMaterial({
                flatShading: true,
                side: THREE.DoubleSide
              })
            }
            
            // Apply color
            if (originalMaterial.color) {
              (newMaterial as any).color = originalMaterial.color
            } else {
              (newMaterial as any).color = new THREE.Color(0x4a7c59) // Bush green
            }
            
            // Handle textures
            if (originalMaterial.map) {
              (newMaterial as any).map = originalMaterial.map
              originalMaterial.map.magFilter = THREE.NearestFilter
              originalMaterial.map.minFilter = THREE.NearestFilter
              originalMaterial.map.generateMipmaps = false
            }
            
            child.material = newMaterial
            child.castShadow = true
            child.receiveShadow = true
          }
        }
      })
      
      // Scale and position the bush properly
      const box = new THREE.Box3().setFromObject(gltf.scene)
      const size = box.getSize(new THREE.Vector3())
      const center = box.getCenter(new THREE.Vector3())
      
      // Reset any GLTF transformations first
      gltf.scene.position.set(0, 0, 0)
      gltf.scene.rotation.set(0, 0, 0)
      gltf.scene.scale.set(1, 1, 1)
      
      // Center the bush
      gltf.scene.position.sub(center)
      
      // Scale to reasonable size (about 1.5 units tall)
      const maxDimension = Math.max(size.x, size.y, size.z)
      const targetSize = 1.5
      const scale = targetSize / maxDimension
      gltf.scene.scale.setScalar(scale)
      
      // Rotate Bush to face exactly -z direction (towards player) - no angle
      gltf.scene.rotation.set(0, Math.PI - Math.PI/4, 0) // Exactly 180 degrees on Y axis only
    }
  }, [gltf])
  
  return (
    <group ref={meshRef} position={[0, 0, bushZ]}>
      <primitive object={gltf.scene.clone()} />
      
      {/* Debug visualization */}
      <mesh position={[0, 2, 0]} visible={false}>
        <sphereGeometry args={[0.1]} />
        <meshBasicMaterial color={currentTurn === 'PLAYER_TURN' ? 0x00ff00 : 0xff0000} />
      </mesh>
    </group>
  )
}