import { useEffect, useRef } from 'react'

interface InputSystemProps {
  onCameraToggle: () => void
  onPlayerMove: (axis: number) => void
  currentTurn: 'PLAYER_TURN' | 'NPC_TURN'
  cameraMode: 'FP' | 'TP' // Need to know camera mode for axis flipping
}

export function InputSystem({ 
  onCameraToggle, 
  onPlayerMove, 
  currentTurn,
  cameraMode
}: InputSystemProps) {
  const keysPressed = useRef<Set<string>>(new Set())
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()
      keysPressed.current.add(key)
      
      // Camera toggle (works in any turn)
      if (key === 'k') {
        onCameraToggle()
        return
      }
      
      // Player movement (only during player turn)
      if (currentTurn === 'PLAYER_TURN') {
        updateMovementAxis()
      }
    }
    
    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()
      keysPressed.current.delete(key)
      
      // Update movement when keys are released
      if (currentTurn === 'PLAYER_TURN') {
        updateMovementAxis()
      }
    }
    
    const updateMovementAxis = () => {
      let axis = 0
      
      if (keysPressed.current.has('arrowleft') || keysPressed.current.has('a')) {
        axis -= 1
      }
      if (keysPressed.current.has('arrowright') || keysPressed.current.has('d')) {
        axis += 1
      }
      
      // In FPV, flip the axis since player faces forward (+z direction)
      // Left/Right keys should move left/right in world space, not camera space
      if (cameraMode === 'FP') {
        axis = -axis // Flip the axis for FPV
      }
      
      onPlayerMove(axis)
    }
    
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [onCameraToggle, onPlayerMove, currentTurn, cameraMode])
  
  // This component doesn't render anything
  return null
}