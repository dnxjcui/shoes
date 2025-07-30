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
    
    if (this.inputSystem.isKeyPressed('k') && currentTime - this.lastToggleTime > 300 && !this.isTransitioning) {
      this.toggleCamera()
      this.lastToggleTime = currentTime
    }
    
    if (this.inputSystem.isKeyPressed(' ') && currentTime - this.lastThrowTime > 500) {
      this.throwShoe()
      this.lastThrowTime = currentTime
    }
    
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
    }
    
    if (this.bushMesh) {
      const time = Date.now() * 0.001
      this.bushMesh.position.y = 1 + Math.sin(time * 2) * 0.05
    }
    
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
   * Creates and throws a shoe projectile toward the bush
   */
  private throwShoe(): void {
    const shoeGeometry = new THREE.BoxGeometry(0.2, 0.1, 0.4)
    const shoeMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x8B4513,
      flatShading: true 
    })
    
    const shoe = new THREE.Mesh(shoeGeometry, shoeMaterial)
    
    const startX = this.currentX
    const startY = 1.0
    const startZ = 0.2
    
    shoe.position.set(startX, startY, startZ)
    
    const vX = 0
    const vZ = 8
    const startTime = Date.now() / 1000
    
    ;(shoe as any).trajectory = {
      startX: startX,
      startY: startY,
      startZ: startZ,
      vX: vX,
      vZ: vZ,
      startTime: startTime,
      spinning: 0
    }
    
    this.shoes.push(shoe)
    this.scene.add(shoe)
    
    console.log(`👟 Shoe thrown from (${startX.toFixed(2)}, ${startY.toFixed(2)}, ${startZ.toFixed(2)})`)
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
      
      traj.spinning += deltaTime * Math.PI * 2
      shoe.rotation.x = traj.spinning
      shoe.rotation.z = traj.spinning * 0.7
    }
  }
  
  /**
   * Renders the 3D scene using the current active camera
   */
  public render(): void {
    this.renderer.render(this.scene, this.currentCamera)
  }
}