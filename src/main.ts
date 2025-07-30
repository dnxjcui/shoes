import { Game } from './core/Game'
import './style.css'

console.log('Game Starting...')

const game = new Game()

/**
 * Main animation loop that updates and renders the game
 * @param currentTime - Current timestamp in milliseconds
 */
function animate(currentTime: number = 0) {
  requestAnimationFrame(animate)
  game.update(currentTime)
  game.render()
}

animate()

console.log('🐱 Cat vs Bush Shoe Thrower - Ready to Play!')
console.log('Controls: A/D to move, K to switch camera, Space to throw shoe')