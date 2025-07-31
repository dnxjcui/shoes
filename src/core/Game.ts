import * as THREE from 'three'
import { gsap } from 'gsap'
import { InputSystem } from './Input'

export class Game {
  private scene: THREE.Scene
  private renderer: THREE.WebGLRenderer
  private fpCamera: THREE.PerspectiveCamera
  private tpCamera: THREE.PerspectiveCamera
  private currentCamera: THREE.PerspectiveCamera
  private inputSystem: InputSystem
  private isFirstPerson: boolean = true
  
  private targetX: number = 0
  private currentX: number = 0
  private velocity: number = 0
  
  private readonly springConstant: number = 1 / (0.12 * 0.12)
  private readonly dampingRatio: number = 1.0
  
  private catSprite?: THREE.Sprite
  private bushMesh?: THREE.Mesh
  
  // Bush movement system
  private bushTargetX: number = 0
  private bushCurrentX: number = 0
  private bushVelocity: number = 0
  private bushMoveTimer: number = 0
  private bushNextMoveTime: number = 2
  private bushDirection: number = 1
  
  // Game state system
  private gameState: 'PLAYER_TURN' | 'NPC_TURN' | 'TURN_ENDING' = 'PLAYER_TURN'
  private shoesThrown: number = 0
  private roundNumber: number = 1
  private turnEndTimer: number = 0
  private pendingTurnSwitch: 'TO_NPC' | 'TO_PLAYER' | null = null
  
  // Health systems
  private bushHealth: number = 3
  private playerHealth: number = 3 
  private bushHitTimer: number = 0
  private playerHitTimer: number = 0
  private bushFlashing: boolean = false
  private playerFlashing: boolean = false
  
  // NPC AI system
  private npcTimer: number = 0
  private npcThrowDelay: number = 0
  private npcShoesThrown: number = 0
  
  private lastTime: number = 0
  private lastToggleTime: number = 0
  private lastThrowTime: number = 0
  private isTransitioning: boolean = false
  
  private shoes: THREE.Mesh[] = []
  
  constructor() {
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x87CEEB)
    
    this.renderer = new THREE.WebGLRenderer({ antialias: false })
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    
    const app = document.querySelector<HTMLDivElement>('#app')!
    app.innerHTML = ''
    app.appendChild(this.renderer.domElement)
    
    const aspect = window.innerWidth / window.innerHeight
    
    this.fpCamera = new THREE.PerspectiveCamera(60, aspect, 0.1, 25)
    this.fpCamera.position.set(0, 1.6, 0)
    this.fpCamera.lookAt(0, 1.4, 8)
    
    this.tpCamera = new THREE.PerspectiveCamera(60, aspect, 0.1, 25)
    this.tpCamera.position.set(0, 2.4, 10)
    this.tpCamera.lookAt(0, 1.4, 0)
    
    this.currentCamera = this.fpCamera
    this.inputSystem = new InputSystem()
    
    this.setupScene()
    this.setupEventListeners()
    
    console.log('🐱 Cat vs Bush - Game Initialized!')
  }
  
  /**
   * Sets up the 3D scene with ground, lighting, and game entities
   */
  private setupScene(): void {
    const groundGeometry = new THREE.PlaneGeometry(20, 10)
    const groundMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x4a7c59
    })
    const ground = new THREE.Mesh(groundGeometry, groundMaterial)
    ground.rotation.x = -Math.PI / 2
    this.scene.add(ground)
    
    this.addReferenceBlocks()
    
    const ambientLight = new THREE.AmbientLight(0x404040, 0.8)
    this.scene.add(ambientLight)
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6)
    directionalLight.position.set(5, 10, 5)
    this.scene.add(directionalLight)
    
    this.createCat()
    this.createBush()
  }
  
  /**
   * Adds static reference blocks and lane markers to help identify movement
   */
  private addReferenceBlocks(): void {
    for (let i = -4; i <= 4; i += 2) {
      const geometry = new THREE.BoxGeometry(0.2, 0.5, 0.2)
      const material = new THREE.MeshBasicMaterial({ 
        color: i === 0 ? 0xff0000 : 0x888888
      })
      const block = new THREE.Mesh(geometry, material)
      block.position.set(i, 0.25, 2)
      this.scene.add(block)
    }
    
    const laneGeometry = new THREE.BoxGeometry(10, 0.05, 0.1)
    const laneMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff })
    const lane1 = new THREE.Mesh(laneGeometry, laneMaterial)
    lane1.position.set(0, 0.01, -1)
    const lane2 = new THREE.Mesh(laneGeometry, laneMaterial) 
    lane2.position.set(0, 0.01, 1)
    const lane3 = new THREE.Mesh(laneGeometry, laneMaterial)
    lane3.position.set(0, 0.01, 3)
    this.scene.add(lane1)
    this.scene.add(lane2) 
    this.scene.add(lane3)
    
    console.log('📍 Reference blocks added - red is center')
  }
  
  /**
   * Creates the player cat as a 2D sprite
   */
  private createCat(): void {
    const loader = new THREE.TextureLoader()
    const texture = loader.load('/sprites/player.jpg', () => {
      console.log('🐱 Player sprite loaded!')
    })
    
    const spriteMaterial = new THREE.SpriteMaterial({ 
      map: texture,
      transparent: true
    })
    
    this.catSprite = new THREE.Sprite(spriteMaterial)
    this.catSprite.scale.set(1.2, 1.6, 1)
    this.catSprite.position.set(0, 0.8, 0)
    this.scene.add(this.catSprite)
  }
  
  /**
   * Creates the enemy bush as a low-poly 3D mesh
   */
  private createBush(): void {
    const geometry = new THREE.BoxGeometry(1.2, 2.0, 0.8)
    const material = new THREE.MeshLambertMaterial({ 
      color: 0x2d5a27,
      flatShading: true
    })
    
    this.bushMesh = new THREE.Mesh(geometry, material)
    this.bushMesh.position.set(0, 1, 8)
    this.scene.add(this.bushMesh)
    
    console.log('🌳 Bush created at z=8')
  }
  
  /**
   * Sets up window resize event listeners
   */
  private setupEventListeners(): void {
    window.addEventListener('resize', () => {
      this.fpCamera.aspect = window.innerWidth / window.innerHeight
      this.fpCamera.updateProjectionMatrix()
      this.tpCamera.aspect = window.innerWidth / window.innerHeight
      this.tpCamera.updateProjectionMatrix()
      this.renderer.setSize(window.innerWidth, window.innerHeight)
    })
  }
  
  /**
   * Main game update loop called every frame
   * @param currentTime - Current timestamp in milliseconds
   */
  public update(currentTime: number): void {
    const deltaTime = (currentTime - this.lastTime) / 1000
    this.lastTime = currentTime
    
    // Handle input based on game state
    if (this.gameState === 'PLAYER_TURN') {
      // Only allow player throwing during player turn
      if (this.inputSystem.isKeyPressed(' ') && currentTime - this.lastThrowTime > 500) {
        this.throwPlayerShoe()
        this.lastThrowTime = currentTime
      }
    }
    
    // Update game state and NPC AI
    this.updateGameState(deltaTime)
    
    const inputAxis = this.inputSystem.getHorizontalAxis(this.isFirstPerson)
    
    const speed = 4.0
    this.targetX += inputAxis * speed * deltaTime
    this.targetX = Math.max(-1.5, Math.min(1.5, this.targetX))
    
    const displacement = this.targetX - this.currentX
    const springForce = this.springConstant * displacement
    const dampingForce = 2 * this.dampingRatio * Math.sqrt(this.springConstant) * this.velocity
    
    const acceleration = springForce - dampingForce
    this.velocity += acceleration * deltaTime
    this.currentX += this.velocity * deltaTime
    
    if (!this.isTransitioning) {
      if (this.isFirstPerson) {
        this.fpCamera.position.x = this.currentX
      } else {
        this.tpCamera.position.x = this.currentX * 0.3
        this.tpCamera.lookAt(this.currentX, 1.4, 0)
      }
    }
    
    if (this.catSprite) {
      this.catSprite.position.x = this.currentX
      
      // Handle player hit flash effect
      if (this.playerFlashing) {
        this.playerHitTimer -= deltaTime
        const flashSpeed = 10
        const flashAlpha = 0.5 + 0.5 * Math.sin(this.playerHitTimer * flashSpeed)
        ;(this.catSprite.material as THREE.SpriteMaterial).color.setRGB(1, flashAlpha, flashAlpha)
        
        if (this.playerHitTimer <= 0) {
          this.playerFlashing = false
          ;(this.catSprite.material as THREE.SpriteMaterial).color.setRGB(1, 1, 1) // Reset to white
        }
      }
    }
    
    // Update bush movement and animation
    this.updateBush(deltaTime)
    
    this.updateShoes(deltaTime)
  }
  
  /**
   * Smoothly transitions between first-person and third-person camera views
   */
  private toggleCamera(): void {
    if (this.isTransitioning) return
    
    this.isTransitioning = true
    const targetFirstPerson = !this.isFirstPerson
    const startCamera = this.currentCamera
    
    console.log(`📹 Transitioning to ${targetFirstPerson ? 'First-Person' : 'Third-Person'} view`)
    
    const startPos = startCamera.position.clone()
    const startQuaternion = startCamera.quaternion.clone()
    
    let targetPos: THREE.Vector3
    let targetQuaternion: THREE.Quaternion
    
    if (targetFirstPerson) {
      targetPos = new THREE.Vector3(this.currentX, 1.6, 0)
      this.fpCamera.position.copy(targetPos)
      this.fpCamera.lookAt(this.fpCamera.position.x, 1.4, 8)
      targetQuaternion = this.fpCamera.quaternion.clone()
    } else {
      targetPos = new THREE.Vector3(this.currentX * 0.3, 2.4, 10)
      this.tpCamera.position.copy(targetPos)
      this.tpCamera.lookAt(this.currentX, 1.4, 0)
      targetQuaternion = this.tpCamera.quaternion.clone()
    }
    
    const animData = {
      posX: startPos.x,
      posY: startPos.y,
      posZ: startPos.z,
      t: 0
    }
    
    gsap.to(animData, {
      posX: targetPos.x,
      posY: targetPos.y,
      posZ: targetPos.z,
      t: 1,
      duration: 0.9,
      ease: "power1.inOut",
      onUpdate: () => {
        startCamera.position.set(animData.posX, animData.posY, animData.posZ)
        startCamera.quaternion.slerpQuaternions(startQuaternion, targetQuaternion, animData.t)
      },
      onComplete: () => {
        this.isFirstPerson = targetFirstPerson
        this.currentCamera = targetFirstPerson ? this.fpCamera : this.tpCamera
        this.currentCamera.position.copy(targetPos)
        this.currentCamera.quaternion.copy(targetQuaternion)
        this.isTransitioning = false
        console.log(`📹 Transition complete`)
      }
    })
  }
  
  /**
   * Updates game state, handles turn switching and NPC AI
   * @param deltaTime - Time elapsed since last frame in seconds
   */
  private updateGameState(deltaTime: number): void {
    if (this.gameState === 'NPC_TURN') {
      this.npcTimer += deltaTime
      
      // NPC throwing logic
      if (this.npcShoesThrown < 2) {
        const maxDelay = this.npcShoesThrown === 0 ? 6 : 10 // 6s for first, 10s for second
        
        if (this.npcTimer >= this.npcThrowDelay) {
          this.throwNPCShoe()
          this.npcShoesThrown++
          this.npcTimer = 0
          
          if (this.npcShoesThrown < 2) {
            // Set delay for next throw
            this.npcThrowDelay = Math.random() * maxDelay
          } else {
            // NPC turn complete, start 2-second delay before switching
            this.startTurnEndDelay('TO_PLAYER')
          }
        }
      }
    } else if (this.gameState === 'TURN_ENDING') {
      // Handle 2-second delay before turn switch
      this.turnEndTimer += deltaTime
      
      if (this.turnEndTimer >= 2.0) {
        // Execute the pending turn switch
        if (this.pendingTurnSwitch === 'TO_PLAYER') {
          this.switchToPlayerTurn()
        } else if (this.pendingTurnSwitch === 'TO_NPC') {
          this.switchToNPCTurn()
        }
        this.turnEndTimer = 0
        this.pendingTurnSwitch = null
      }
    }
  }
  
  /**
   * Starts the 2-second delay before switching turns
   */
  private startTurnEndDelay(nextTurn: 'TO_NPC' | 'TO_PLAYER'): void {
    this.gameState = 'TURN_ENDING'
    this.pendingTurnSwitch = nextTurn
    this.turnEndTimer = 0
    console.log(`⏳ Turn ending, switching in 2 seconds...`)
  }
  
  /**
   * Creates and throws a shoe projectile from the player toward the bush
   */
  private throwPlayerShoe(): void {
    const shoe = this.createShoe(this.currentX, 1.0, 0.2, 0, 8, 'player')
    
    this.shoesThrown++
    console.log(`👟 Player shoe ${this.shoesThrown}/2 thrown`)
    
    // Check if player turn is complete
    if (this.shoesThrown >= 2) {
      // Player turn complete, start 2-second delay before switching
      this.startTurnEndDelay('TO_NPC')
    }
  }
  
  /**
   * Creates and throws a shoe projectile from the bush toward the player
   */
  private throwNPCShoe(): void {
    const targetX = this.currentX // Aim at current player position
    const vX = (targetX - this.bushCurrentX) / 1.0 // Reach target in 1 second
    
    const shoe = this.createShoe(this.bushCurrentX, 1.0, 8, vX, -8, 'npc')
    
    console.log(`💥 NPC shoe ${this.npcShoesThrown + 1}/2 thrown at player`)
  }
  
  /**
   * Creates a shoe mesh with trajectory data
   */
  private createShoe(startX: number, startY: number, startZ: number, vX: number, vZ: number, thrower: 'player' | 'npc'): THREE.Mesh {
    const shoeGeometry = new THREE.BoxGeometry(0.2, 0.1, 0.4)
    const shoeMaterial = new THREE.MeshLambertMaterial({ 
      color: thrower === 'player' ? 0x8B4513 : 0x654321, // Slightly different colors
      flatShading: true 
    })
    
    const shoe = new THREE.Mesh(shoeGeometry, shoeMaterial)
    shoe.position.set(startX, startY, startZ)
    
    ;(shoe as any).trajectory = {
      startX: startX,
      startY: startY,
      startZ: startZ,
      vX: vX,
      vZ: vZ,
      startTime: Date.now() / 1000,
      spinning: 0,
      hasHit: false,
      thrower: thrower
    }
    
    this.shoes.push(shoe)
    this.scene.add(shoe)
    
    return shoe
  }
  
  /**
   * Switches to NPC turn and transitions camera
   */
  private switchToNPCTurn(): void {
    this.gameState = 'NPC_TURN'
    this.npcTimer = 0
    this.npcShoesThrown = 0
    this.npcThrowDelay = Math.random() * 6 // 0-6 seconds for first throw
    
    // Switch to third-person camera
    if (this.isFirstPerson) {
      this.toggleCamera()
    }
    
    console.log('🌳 NPC Turn Started')
  }
  
  /**
   * Switches to player turn and transitions camera
   */
  private switchToPlayerTurn(): void {
    this.gameState = 'PLAYER_TURN'
    this.shoesThrown = 0
    this.roundNumber++
    
    // Switch to first-person camera
    if (!this.isFirstPerson) {
      this.toggleCamera()
    }
    
    console.log(`🐱 Player Turn Started - Round ${this.roundNumber}`)
  }
  
  /**
   * Updates bush position, movement, and visual effects
   * @param deltaTime - Time elapsed since last frame in seconds
   */
  private updateBush(deltaTime: number): void {
    if (!this.bushMesh) return
    
    // Random movement system
    this.bushMoveTimer += deltaTime
    
    // Pick new direction every 0-4s (skewed towards longer times)
    if (this.bushMoveTimer >= this.bushNextMoveTime) {
      this.bushMoveTimer = 0
      // Skewed distribution: 0-4s with bias towards higher numbers
      const random = Math.random()
      this.bushNextMoveTime = random * random * 4 // Quadratic distribution skews towards higher values
      this.bushDirection = (Math.random() - 0.5) * 2 // -1 to 1
    }
    
    // Move bush with same speed as player
    const speed = 4.0
    this.bushTargetX += this.bushDirection * speed * deltaTime
    this.bushTargetX = Math.max(-1.5, Math.min(1.5, this.bushTargetX)) // Same bounds as player
    
    // Smooth movement using same spring physics as player
    const displacement = this.bushTargetX - this.bushCurrentX
    const springForce = this.springConstant * displacement
    const dampingForce = 2 * this.dampingRatio * Math.sqrt(this.springConstant) * this.bushVelocity
    
    const acceleration = springForce - dampingForce
    this.bushVelocity += acceleration * deltaTime
    this.bushCurrentX += this.bushVelocity * deltaTime
    
    // Update bush position
    this.bushMesh.position.x = this.bushCurrentX
    
    // Idle bob animation
    const time = Date.now() * 0.001
    this.bushMesh.position.y = 1 + Math.sin(time * 2) * 0.05
    
    // Handle hit flash effect
    if (this.bushFlashing) {
      this.bushHitTimer -= deltaTime
      const flashSpeed = 10
      const flashAlpha = 0.5 + 0.5 * Math.sin(this.bushHitTimer * flashSpeed)
      ;(this.bushMesh.material as THREE.MeshLambertMaterial).color.setRGB(1, flashAlpha * 0.2, flashAlpha * 0.2)
      
      if (this.bushHitTimer <= 0) {
        this.bushFlashing = false
        ;(this.bushMesh.material as THREE.MeshLambertMaterial).color.setHex(0x2d5a27) // Reset to green
      }
    }
  }

  /**
   * Updates all active shoe projectiles with physics and animation
   * @param deltaTime - Time elapsed since last frame in seconds
   */
  private updateShoes(deltaTime: number): void {
    const currentTime = Date.now() / 1000
    
    for (let i = this.shoes.length - 1; i >= 0; i--) {
      const shoe = this.shoes[i]
      const traj = (shoe as any).trajectory
      
      if (!traj) continue
      
      const t = currentTime - traj.startTime
      
      if (t > 2.0) {
        this.scene.remove(shoe)
        this.shoes.splice(i, 1)
        continue
      }
      
      const flightProgress = Math.min(t, 1.0)
      
      shoe.position.x = traj.startX + traj.vX * t
      shoe.position.y = traj.startY + 1.2 * Math.sin(Math.PI * flightProgress)
      shoe.position.z = traj.startZ + traj.vZ * flightProgress
      
      // Check for hits based on who threw the shoe
      if (!traj.hasHit) {
        if (traj.thrower === 'player' && this.bushMesh) {
          // Player shoe hitting bush
          const distanceX = Math.abs(shoe.position.x - this.bushCurrentX)
          const distanceZ = Math.abs(shoe.position.z - this.bushMesh.position.z)
          const distanceY = Math.abs(shoe.position.y - this.bushMesh.position.y)
          
          if (distanceX < 0.8 && distanceZ < 0.5 && distanceY < 1.2) {
            this.hitBush()
            traj.hasHit = true
          }
        } else if (traj.thrower === 'npc') {
          // NPC shoe hitting player
          const distanceX = Math.abs(shoe.position.x - this.currentX)
          const distanceZ = Math.abs(shoe.position.z - 0) // Player at z=0
          const distanceY = Math.abs(shoe.position.y - 0.8) // Player sprite at y=0.8
          
          if (distanceX < 0.6 && distanceZ < 0.5 && distanceY < 1.0) {
            this.hitPlayer()
            traj.hasHit = true
          }
        }
      }
      
      traj.spinning += deltaTime * Math.PI * 2
      shoe.rotation.x = traj.spinning
      shoe.rotation.z = traj.spinning * 0.7
    }
  }
  
  /**
   * Handles when a shoe hits the bush
   */
  private hitBush(): void {
    this.bushHealth--
    this.bushFlashing = true
    this.bushHitTimer = 0.5
    
    console.log(`🎯 Bush hit! Health: ${this.bushHealth}`)
    
    if (this.bushHealth <= 0) {
      this.restartGame()
    }
  }
  
  /**
   * Handles when a shoe hits the player
   */
  private hitPlayer(): void {
    this.playerHealth--
    this.playerFlashing = true
    this.playerHitTimer = 0.5
    
    console.log(`💥 Player hit! Health: ${this.playerHealth}`)
    
    if (this.playerHealth <= 0) {
      this.restartGame()
    }
  }
  
  /**
   * Restarts the game by resetting all state
   */
  private restartGame(): void {
    console.log('🔄 Game Over - Restarting!')
    
    // Reset game state
    this.gameState = 'PLAYER_TURN'
    this.shoesThrown = 0
    this.roundNumber = 1
    this.turnEndTimer = 0
    this.pendingTurnSwitch = null
    
    // Reset health
    this.bushHealth = 3
    this.playerHealth = 3
    
    // Reset bush
    this.bushTargetX = 0
    this.bushCurrentX = 0
    this.bushVelocity = 0
    this.bushMoveTimer = 0
    this.bushNextMoveTime = 2
    this.bushFlashing = false
    
    // Reset player
    this.targetX = 0
    this.currentX = 0
    this.velocity = 0
    this.playerFlashing = false
    
    // Reset NPC AI
    this.npcTimer = 0
    this.npcThrowDelay = 0
    this.npcShoesThrown = 0
    
    // Clear all shoes
    for (const shoe of this.shoes) {
      this.scene.remove(shoe)
    }
    this.shoes = []
    
    // Reset bush position and color
    if (this.bushMesh) {
      this.bushMesh.position.x = 0
      ;(this.bushMesh.material as THREE.MeshLambertMaterial).color.setHex(0x2d5a27)
    }
    
    // Reset cat position and color
    if (this.catSprite) {
      this.catSprite.position.x = 0
      ;(this.catSprite.material as THREE.SpriteMaterial).color.setRGB(1, 1, 1)
    }
    
    // Reset cameras and ensure first-person
    this.fpCamera.position.x = 0
    this.tpCamera.position.x = 0
    if (!this.isFirstPerson) {
      this.isFirstPerson = true
      this.currentCamera = this.fpCamera
    }
  }

  /**
   * Renders the 3D scene and UI using the current active camera
   */
  public render(): void {
    this.renderer.render(this.scene, this.currentCamera)
    this.renderUI()
  }
  
  /**
   * Renders the UI overlay with hearts and round counter
   */
  private renderUI(): void {
    const canvas = this.renderer.domElement
    const ctx = canvas.getContext('2d')
    
    if (!ctx) return
    
    const heartSize = 30
    const margin = 20
    
    // Draw both sets of hearts in top-left corner
    
    // Draw player hearts (top-left, first row)
    ctx.font = `${heartSize}px Arial`
    for (let i = 0; i < 3; i++) {
      const x = margin + i * (heartSize + 5)
      const y = margin
      
      ctx.fillStyle = i < this.playerHealth ? '#ff0000' : '#333333'
      ctx.fillText('♥', x, y + heartSize)
    }
    
    // Draw player label
    ctx.fillStyle = '#ffffff'
    ctx.font = '16px Arial'
    ctx.fillText('🐱 PLAYER', margin, margin + 45)
    
    // Draw bush hearts (top-left, second row)
    ctx.font = `${heartSize}px Arial`
    for (let i = 0; i < 3; i++) {
      const x = margin + i * (heartSize + 5)
      const y = margin + 60 // Offset below player hearts
      
      ctx.fillStyle = i < this.bushHealth ? '#ff0000' : '#333333'
      ctx.fillText('♥', x, y + heartSize)
    }
    
    // Draw bush label
    ctx.fillStyle = '#ffffff'
    ctx.font = '16px Arial'
    ctx.fillText('🌳 BUSH', margin, margin + 105)
    
    // Draw round counter (center top)
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 24px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(`ROUND ${this.roundNumber}`, canvas.width / 2, margin + 30)
    
    // Draw turn indicator
    ctx.font = '18px Arial'
    let turnText: string
    let turnColor: string
    
    if (this.gameState === 'PLAYER_TURN') {
      turnText = 'YOUR TURN'
      turnColor = '#00ff00'
    } else if (this.gameState === 'NPC_TURN') {
      turnText = 'NPC TURN'
      turnColor = '#ff6600'
    } else {
      turnText = 'SWITCHING...'
      turnColor = '#ffff00'
    }
    ctx.fillStyle = turnColor
    ctx.fillText(turnText, canvas.width / 2, margin + 55)
    
    // Draw shoe counter during player turn
    if (this.gameState === 'PLAYER_TURN') {
      ctx.font = '16px Arial'
      ctx.fillStyle = '#ffffff'
      ctx.fillText(`SHOES: ${this.shoesThrown}/2`, canvas.width / 2, margin + 75)
    }
    
    // Reset text alignment
    ctx.textAlign = 'left'
  }
}