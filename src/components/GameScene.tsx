import { useRef, useState, useEffect, useCallback } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'
import { BushEntity } from './entities/BushEntity'
import { PlayerEntity } from './entities/PlayerEntity'
import { CameraSystem } from './systems/CameraSystem'
import { InputSystem } from './systems/InputSystem'

// Game configuration - Updated for better separation
const WORLD_BOUNDS = { min: -1.5, max: 1.5 } // x ∈ [−5, +5] m
const WORLD_DEPTH = 8 // Bush depth at z=8 for better separation

// Camera positions - Fixed for proper viewing angles
const CAMERA_POSITIONS = {
  // First-person (cat eyes) - looking straight forward (+z direction)
  FP: {
    position: new THREE.Vector3(0, 1.6, 0),
    lookAt: new THREE.Vector3(0, 1.4, 10) // Look straight forward in +z direction
  },
  // Third-person - Behind Bush looking at player (DS Pokemon battle style)
  TP: {
    position: new THREE.Vector3(0, 2.4, 10), // Behind Bush (Bush is at z=8)
    lookAt: new THREE.Vector3(0, 1.4, 0) // Look at player position
  }
}

interface GameState {
  currentTurn: 'PLAYER_TURN' | 'NPC_TURN'
  cameraMode: 'FP' | 'TP'
  playerPosition: THREE.Vector3
  bushPosition: THREE.Vector3
}


function DebugInfo({ gameState }: { gameState: GameState }) {
  return (
    <mesh position={[0, 3, 0]}>
      <boxGeometry args={[0.1, 0.1, 0.1]} />
      <meshBasicMaterial color={gameState.cameraMode === 'FP' ? 0x00ff00 : 0xff0000} />
    </mesh>
  )
}

export function GameScene() {
  const [overlayState, setOverlayState] = useState<GameState>({
    currentTurn: 'PLAYER_TURN',
    cameraMode: 'FP',
    playerPosition: new THREE.Vector3(0, 0, 0),
    bushPosition: new THREE.Vector3(0, 0, 8)
  })
  
  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh',
      background: '#2a2a2a',
      position: 'relative'
    }}>
      {/* Instructions overlay */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        color: 'white',
        fontFamily: 'monospace',
        fontSize: '14px',
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: '15px',
        borderRadius: '5px',
        zIndex: 100,
        maxWidth: '300px'
      }}>
        <h3 style={{ margin: '0 0 10px 0' }}>Cat vs Bush Game</h3>
        <p style={{ margin: '5px 0' }}>
          <strong>K</strong> - Toggle Camera (FP ↔ TP)
        </p>
        <p style={{ margin: '5px 0' }}>
          <strong>←/→</strong> - Move Player (during Player Turn)
        </p>
        <p style={{ margin: '5px 0' }}>
          Current: <span style={{ 
            color: overlayState.cameraMode === 'FP' ? '#4CAF50' : '#ff9800' 
          }}>
            {overlayState.cameraMode === 'FP' ? 'First-Person' : 'Third-Person'}
          </span>
        </p>
      </div>
      
      <Canvas
        shadows
        gl={{ 
          antialias: false,
          alpha: false 
        }}
        camera={false} // We'll handle cameras manually
      >
        <GameEnvironmentWrapper onStateChange={setOverlayState} />
      </Canvas>
    </div>
  )
}

function GameEnvironmentWrapper({ onStateChange }: { onStateChange: (state: GameState) => void }) {
  const [gameState, setGameState] = useState<GameState>({
    currentTurn: 'PLAYER_TURN',
    cameraMode: 'FP', 
    playerPosition: new THREE.Vector3(0, 0, 0),
    bushPosition: new THREE.Vector3(0, 0, 8)
  })
  
  // Sync state with overlay
  useEffect(() => {
    onStateChange(gameState)
  }, [gameState, onStateChange])
  
  const fpCameraRef = useRef<THREE.PerspectiveCamera>(null!)
  const tpCameraRef = useRef<THREE.PerspectiveCamera>(null!)
  const { size } = useThree()
  
  // Camera switching logic
  const toggleCamera = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      cameraMode: prev.cameraMode === 'FP' ? 'TP' : 'FP'
    }))
  }, [])
  
  // Input handling
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'k') {
        toggleCamera()
      }
    }
    
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [toggleCamera])
  
  // Update player position callback
  const updatePlayerPosition = useCallback((position: THREE.Vector3) => {
    setGameState(prev => ({
      ...prev,
      playerPosition: position.clone()
    }))
  }, [])
  
  // Update bush position callback  
  const updateBushPosition = useCallback((position: THREE.Vector3) => {
    setGameState(prev => ({
      ...prev,
      bushPosition: position.clone()
    }))
  }, [])
  
  return (
    <>
      {/* First-Person Camera */}
      <PerspectiveCamera
        ref={fpCameraRef}
        makeDefault={gameState.cameraMode === 'FP'}
        fov={60}
        aspect={size.width / size.height}
        near={0.1}
        far={25}
        position={CAMERA_POSITIONS.FP.position}
      />
      
      {/* Third-Person Camera */}
      <PerspectiveCamera  
        ref={tpCameraRef}
        makeDefault={gameState.cameraMode === 'TP'}
        fov={60}
        aspect={size.width / size.height}
        near={0.1}
        far={25}
        position={CAMERA_POSITIONS.TP.position}
      />
      
      {/* Camera System for smooth transitions */}
      <CameraSystem
        fpCamera={fpCameraRef.current}
        tpCamera={tpCameraRef.current}
        currentMode={gameState.cameraMode}
        playerPosition={gameState.playerPosition}
        bushPosition={gameState.bushPosition}
      />
      
      {/* Lighting setup - Bright and visible */}
      <ambientLight intensity={1.5} color={0xffffff} />
      <directionalLight
        position={[5, 10, 3]}
        intensity={2.5}
        color={0xffffff}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={0.1}
        shadow-camera-far={50}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
      />
      
      {/* Additional fill lights for maximum visibility */}
      <directionalLight
        position={[-5, 8, -3]}
        intensity={1.5}
        color={0xffffff}
      />
      
      <directionalLight
        position={[0, 5, 8]}
        intensity={1.0}
        color={0xffffff}
      />
      
      {/* Point light for additional illumination */}
      <pointLight
        position={[0, 5, 4]}
        intensity={2.0}
        color={0xffffff}
        distance={20}
      />
      
      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[12, 12]} />
        <meshLambertMaterial color={0x2a5a2a} />
      </mesh>
      
      {/* World boundaries (visual guides) */}
      <gridHelper args={[10, 20, 0x555555, 0x333333]} />
      
      {/* Game Entities */}
      <PlayerEntity 
        worldBounds={WORLD_BOUNDS}
        onPositionUpdate={updatePlayerPosition}
        currentTurn={gameState.currentTurn}
        cameraMode={gameState.cameraMode}
      />
      
      <BushEntity
        worldBounds={WORLD_BOUNDS}
        worldDepth={WORLD_DEPTH}
        onPositionUpdate={updateBushPosition}
        currentTurn={gameState.currentTurn}
        playerPosition={gameState.playerPosition}
      />
      
      {/* Debug info */}
      <DebugInfo gameState={gameState} />
    </>
  )
}