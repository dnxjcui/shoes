import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { gsap } from 'gsap'

interface CameraSystemProps {
  fpCamera: THREE.PerspectiveCamera | null
  tpCamera: THREE.PerspectiveCamera | null
  currentMode: 'FP' | 'TP'
  playerPosition: THREE.Vector3
  bushPosition: THREE.Vector3
}

// Camera positions - Updated for correct viewing angles
const CAMERA_CONFIG = {
  FP: {
    position: new THREE.Vector3(0, 1.6, 0),
    lookAt: new THREE.Vector3(0, 1.4, 10), // Look straight forward (+z)
    fov: 60
  },
  TP: {
    position: new THREE.Vector3(0, 2.4, 10), // Behind Bush (Bush at z=8)
    lookAt: new THREE.Vector3(0, 1.4, 0), // Look at player
    fov: 60
  }
}

export function CameraSystem({ 
  fpCamera, 
  tpCamera, 
  currentMode, 
  playerPosition, 
  bushPosition 
}: CameraSystemProps) {
  const previousMode = useRef<'FP' | 'TP'>(currentMode)
  const isTransitioning = useRef(false)
  
  // Handle camera mode transitions with GSAP
  useEffect(() => {
    if (!fpCamera || !tpCamera) return
    if (previousMode.current === currentMode) return
    
    console.log(`Camera transition: ${previousMode.current} → ${currentMode}`)
    
    isTransitioning.current = true
    
    const sourceCamera = previousMode.current === 'FP' ? fpCamera : tpCamera
    const targetCamera = currentMode === 'FP' ? fpCamera : tpCamera
    
    // GSAP camera transition (section 3.2): "0.9 s (power1.inOut)"
    const animData = {
      posX: sourceCamera.position.x,
      posY: sourceCamera.position.y,
      posZ: sourceCamera.position.z,
      t: 0
    }
    
    const startQuaternion = sourceCamera.quaternion.clone()
    const targetQuaternion = new THREE.Quaternion()
    
    // Calculate target look direction
    const targetConfig = CAMERA_CONFIG[currentMode]
    const lookDirection = targetConfig.lookAt.clone().sub(targetConfig.position).normalize()
    targetQuaternion.setFromUnitVectors(new THREE.Vector3(0, 0, -1), lookDirection)
    
    gsap.to(animData, {
      duration: 0.9,
      ease: "power1.inOut",
      posX: targetConfig.position.x,
      posY: targetConfig.position.y,
      posZ: targetConfig.position.z,
      t: 1,
      onUpdate: () => {
        // Update both cameras during transition for smooth handoff
        const newPos = new THREE.Vector3(animData.posX, animData.posY, animData.posZ)
        const newQuaternion = new THREE.Quaternion().slerpQuaternions(startQuaternion, targetQuaternion, animData.t)
        
        fpCamera.position.copy(newPos)
        fpCamera.quaternion.copy(newQuaternion)
        tpCamera.position.copy(newPos)
        tpCamera.quaternion.copy(newQuaternion)
      },
      onComplete: () => {
        isTransitioning.current = false
        console.log('Camera transition complete')
      }
    })
    
    previousMode.current = currentMode
  }, [currentMode, fpCamera, tpCamera])
  
  useFrame(() => {
    if (!fpCamera || !tpCamera || isTransitioning.current) return
    
    // Update camera positions based on game state
    if (currentMode === 'FP') {
      // First-person: From player eyes looking straight forward (+z direction)
      const fpPos = CAMERA_CONFIG.FP.position.clone()
      fpPos.x += playerPosition.x // Follow player X position
      fpCamera.position.copy(fpPos)
      
      // Look straight forward in +z direction (towards Bush)
      const lookTarget = CAMERA_CONFIG.FP.lookAt.clone()
      lookTarget.x += playerPosition.x // Maintain forward direction relative to player
      fpCamera.lookAt(lookTarget)
      
    } else if (currentMode === 'TP') {
      // Third-person: Behind Bush looking at player (DS Pokemon battle style)
      const tpPos = CAMERA_CONFIG.TP.position.clone()
      tpPos.x += bushPosition.x * 0.3 // Slightly follow bush X position
      tpCamera.position.copy(tpPos)
      
      // Look at player position
      const lookTarget = playerPosition.clone()
      lookTarget.y = CAMERA_CONFIG.TP.lookAt.y // Maintain consistent look height
      tpCamera.lookAt(lookTarget)
    }
  })
  
  // This component doesn't render anything, it just manages camera state
  return null
}