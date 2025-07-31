import React, { useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'

interface GameLogicProps {
  gameState: 'PLAYER_TURN' | 'NPC_TURN' | 'TURN_ENDING'
  setGameState: (state: 'PLAYER_TURN' | 'NPC_TURN' | 'TURN_ENDING') => void
  playerHealth: number
  bushHealth: number
  setPlayerHealth: (health: number) => void
  setBushHealth: (health: number) => void
}

export function GameLogic({ 
  gameState, 
  setGameState, 
  playerHealth, 
  bushHealth, 
  setPlayerHealth, 
  setBushHealth 
}: GameLogicProps) {
  const [turnTimer, setTurnTimer] = useState(0)
  const [roundNumber, setRoundNumber] = useState(1)
  const [gameOver, setGameOver] = useState(false)

  // Check for game over conditions
  useEffect(() => {
    if (playerHealth <= 0) {
      console.log('💀 Game Over - Bush Wins!')
      setGameOver(true)
    } else if (bushHealth <= 0) {
      console.log('🎉 Victory - Player Wins!')
      setGameOver(true)
    }
  }, [playerHealth, bushHealth])

  // Handle turn switching
  useFrame((state, deltaTime) => {
    if (gameOver) return

    setTurnTimer(prev => prev + deltaTime)

    // Switch turns after a certain time
    if (gameState === 'PLAYER_TURN' && turnTimer > 5) {
      console.log('🔄 Switching to NPC turn')
      setGameState('NPC_TURN')
      setTurnTimer(0)
    } else if (gameState === 'NPC_TURN' && turnTimer > 3) {
      console.log('🔄 Switching to Player turn')
      setGameState('PLAYER_TURN')
      setTurnTimer(0)
      setRoundNumber(prev => prev + 1)
    }
  })

  // Handle game restart
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'r') {
        console.log('🔄 Restarting game...')
        setPlayerHealth(3)
        setBushHealth(3)
        setGameState('PLAYER_TURN')
        setRoundNumber(1)
        setTurnTimer(0)
        setGameOver(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [setPlayerHealth, setBushHealth, setGameState])

  // This component doesn't render anything visual
  return null
}