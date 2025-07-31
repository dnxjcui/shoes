import React, { useRef, useState, useCallback, useEffect } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { TextureLoader } from 'three/src/loaders/TextureLoader'
import * as THREE from 'three'

interface CatComponentProps {
  gameState: 'PLAYER_TURN' | 'NPC_TURN' | 'TURN_ENDING'
  onThrowShoe: (x: number, y: number, z: number, vx: number, vy: number, vz: number, thrower: 'player' | 'npc') => void
}

export function CatComponent({ gameState, onThrowShoe }: CatComponentProps) {
  const spriteRef = useRef<THREE.Sprite>(null!)
  const [position, setPosition] = useState({ x: 0, targetX: 0 })
  const [velocity, setVelocity] = useState(0)
  const [keys, setKeys] = useState<Set<string>>(new Set())

  // Load player sprite texture
  const texture = useLoader(TextureLoader, '/sprites/lowres_player.png')

  // Spring physics constants
  const springConstant = 1 / (0.12 * 0.12)
  const dampingRatio = 1.0

  // Setup keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setKeys(prev => new Set(prev).add(e.key.toLowerCase()))
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      setKeys(prev => {
        const newKeys = new Set(prev)
        newKeys.delete(e.key.toLowerCase())
        return newKeys
      })
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  // Handle throwing shoes
  const handleThrowShoe = useCallback(() => {
    if (gameState !== 'PLAYER_TURN') return
    
    const vX = (Math.random() - 0.5) * 4 // Some randomness in X direction
    const vY = 0
    const vZ = 16 // Throw toward bush (positive Z)
    
    onThrowShoe(position.x, 0.5, 0, vX, vY, vZ, 'player')
    console.log('👟 Player threw shoe!')
  }, [gameState, position.x, onThrowShoe])

  // Animation loop
  useFrame((state, deltaTime) => {
    if (!spriteRef.current) return

    // Handle input only during player turn
    if (gameState === 'PLAYER_TURN') {
      let inputAxis = 0
      
      if (keys.has('a') || keys.has('arrowleft')) {
        inputAxis -= 1
      }
      if (keys.has('d') || keys.has('arrowright')) {
        inputAxis += 1
      }
      
      // Update target position based on input
      if (inputAxis !== 0) {
        const moveSpeed = 1.5
        setPosition(prev => ({
          ...prev,
          targetX: Math.max(-1.5, Math.min(1.5, prev.targetX + inputAxis * moveSpeed * deltaTime))
        }))
      }

      // Handle shoe throwing
      if (keys.has(' ') || keys.has('space')) {
        handleThrowShoe()
        // Remove space key to prevent continuous throwing
        setKeys(prev => {
          const newKeys = new Set(prev)
          newKeys.delete(' ')
          newKeys.delete('space')
          return newKeys
        })
      }
    }

    // Apply spring physics for smooth movement
    const displacement = position.targetX - position.x
    const springForce = springConstant * displacement
    const dampingForce = 2 * dampingRatio * Math.sqrt(springConstant) * velocity
    const acceleration = springForce - dampingForce
    
    setVelocity(prev => prev + acceleration * deltaTime)
    setPosition(prev => ({
      ...prev,
      x: prev.x + velocity * deltaTime
    }))

    // Update sprite position
    spriteRef.current.position.x = position.x
    spriteRef.current.position.y = 0.8
    spriteRef.current.position.z = 0

    // Make sprite always face camera
    spriteRef.current.lookAt(state.camera.position)
  })

  return (
    <sprite ref={spriteRef} scale={[1.2, 1.6, 1]}>
      <spriteMaterial map={texture} transparent />
    </sprite>
  )
}