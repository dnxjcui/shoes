import { useRef, useState, useEffect } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { TextureLoader } from 'three'
import * as THREE from 'three'

interface PlayerEntityProps {
  worldBounds: { min: number; max: number }
  onPositionUpdate: (position: THREE.Vector3) => void
  currentTurn: 'PLAYER_TURN' | 'NPC_TURN'
  cameraMode: 'FP' | 'TP' // Need for axis flipping in FPV
}

// Spring physics constants from implementation guide (section 3.1)
// "critically-damped spring to position.x (τ ≈ 0.12 s)"
const SPRING_CONSTANT = 1 / (0.12 * 0.12) // τ ≈ 0.12s
const DAMPING_RATIO = 1.0 // Critically damped
const MOVEMENT_SPEED = 3.0 // Speed multiplier for input

interface SpringState {
  currentX: number
  targetX: number
  velocity: number
}

interface InputState {
  leftPressed: boolean
  rightPressed: boolean
  axis: number // -1 to 1
}

export function PlayerEntity({ 
  worldBounds, 
  onPositionUpdate, 
  currentTurn,
  cameraMode
}: PlayerEntityProps) {
  const meshRef = useRef<THREE.Group>(null!)
  
  // Load player sprite
  const playerTexture = useLoader(TextureLoader, '/sprites/lowres_player.png')
  
  // Spring physics state
  const [spring, setSpring] = useState<SpringState>({
    currentX: 0,
    targetX: 0,
    velocity: 0
  })
  
  // Input state  
  const [input, setInput] = useState<InputState>({
    leftPressed: false,
    rightPressed: false,
    axis: 0
  })
  
  // Input handling
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (currentTurn !== 'PLAYER_TURN') return
      
      switch (event.key.toLowerCase()) {
        case 'arrowleft':
        case 'a':
          setInput(prev => ({ ...prev, leftPressed: true }))
          break
        case 'arrowright':
        case 'd':
          setInput(prev => ({ ...prev, rightPressed: true }))
          break
      }
    }
    
    const handleKeyUp = (event: KeyboardEvent) => {
      switch (event.key.toLowerCase()) {
        case 'arrowleft':
        case 'a':
          setInput(prev => ({ ...prev, leftPressed: false }))
          break
        case 'arrowright':
        case 'd':
          setInput(prev => ({ ...prev, rightPressed: false }))
          break
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [currentTurn])
  
  // Update input axis
  useEffect(() => {
    let axis = 0
    
    if (cameraMode === 'FP') {
      // FPV: Normal mapping (right = +1, left = -1)
      if (input.leftPressed) axis -= 1
      if (input.rightPressed) axis += 1
    } else {
      // TPV: Reversed mapping since we're behind bush looking at player
      if (input.leftPressed) axis += 1  // Left key moves player right from TPV perspective
      if (input.rightPressed) axis -= 1 // Right key moves player left from TPV perspective
    }
    
    setInput(prev => ({ ...prev, axis }))
  }, [input.leftPressed, input.rightPressed, cameraMode])
  
  // Configure sprite texture
  useEffect(() => {
    if (playerTexture) {
      playerTexture.magFilter = THREE.NearestFilter
      playerTexture.minFilter = THREE.NearestFilter
      playerTexture.generateMipmaps = false
      playerTexture.colorSpace = THREE.SRGBColorSpace
    }
  }, [playerTexture])
  
  useFrame((state, delta) => {
    if (!meshRef.current) return
    
    // Update spring physics
    setSpring(prevSpring => {
      const newSpring = { ...prevSpring }
      
      // Update target position based on input (only during player turn)
      if (currentTurn === 'PLAYER_TURN') {
        // "targetX += axis*speed*dt"
        newSpring.targetX += input.axis * MOVEMENT_SPEED * delta
        
        // "Clamp [−5,+5]"
        newSpring.targetX = Math.max(worldBounds.min, Math.min(worldBounds.max, newSpring.targetX))
      }
      
      // Apply critically-damped spring physics
      // "critically‑damped spring to position.x (τ ≈ 0.12 s)"
      const displacement = newSpring.targetX - newSpring.currentX
      const springForce = SPRING_CONSTANT * displacement
      const dampingForce = 2 * DAMPING_RATIO * Math.sqrt(SPRING_CONSTANT) * newSpring.velocity
      const acceleration = springForce - dampingForce
      
      newSpring.velocity += acceleration * delta
      newSpring.currentX += newSpring.velocity * delta
      
      return newSpring
    })
    
    // Update mesh position  
    meshRef.current.position.set(spring.currentX, 0.8, 0) // Slightly elevated
    
    // Face direction of movement
    if (Math.abs(input.axis) > 0.1) {
      meshRef.current.rotation.y = input.axis > 0 ? -0.2 : 0.2
    } else {
      meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, 0, 5.0 * delta)
    }
    
    // Notify parent of position change
    onPositionUpdate(meshRef.current.position)
  })
  
  return (
    <group ref={meshRef} position={[0, 0.8, 0]}>
      {/* Player sprite billboard */}
      <sprite>
        <spriteMaterial 
          map={playerTexture}
          transparent={true}
          alphaTest={0.1}
        />
      </sprite>
      
      {/* Collision bounds (invisible) */}
      <mesh visible={false}>
        <boxGeometry args={[0.5, 1.6, 0.5]} />
        <meshBasicMaterial color={0xff0000} wireframe />
      </mesh>
      
      {/* Ground shadow */}
      <mesh position={[0, -0.79, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.3]} />
        <meshBasicMaterial 
          color={0x000000} 
          transparent 
          opacity={0.3}
        />
      </mesh>
      
      {/* Movement indicator (visible during player turn) */}
      {currentTurn === 'PLAYER_TURN' && Math.abs(input.axis) > 0.1 && (
        <mesh position={[input.axis * 0.5, 0.5, 0]}>
          <coneGeometry args={[0.1, 0.2]} />
          <meshBasicMaterial color={0x00ff00} />
        </mesh>
      )}
    </group>
  )
}