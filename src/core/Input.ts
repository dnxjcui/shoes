export class InputSystem {
  private keys: Set<string> = new Set()
  private horizontalAxis: number = 0
  
  constructor() {
    this.setupEventListeners()
    console.log('🎮 Input System initialized - A/D move, Space throw, R restart')
  }
  
  /**
   * Sets up keyboard event listeners for keydown and keyup events
   */
  private setupEventListeners(): void {
    window.addEventListener('keydown', (e) => {
      this.keys.add(e.key.toLowerCase())
    })
    
    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.key.toLowerCase())
    })
  }
  
  /**
   * Updates the horizontal axis based on currently held keys
   * @param isFirstPerson - Whether camera is in first-person view (affects input direction)
   */
  public update(isFirstPerson: boolean): void {
    let axis = 0
    
    if (this.keys.has('a') || this.keys.has('arrowleft')) {
      if (isFirstPerson) {
        axis += 1
      } else {
        axis -= 1
      }
    }
    if (this.keys.has('d') || this.keys.has('arrowright')) {
      if (isFirstPerson) {
        axis -= 1
      } else {
        axis += 1
      }
    }
    
    this.horizontalAxis = Math.max(-1, Math.min(1, axis))
  }
  
  /**
   * Gets the current horizontal input axis value
   * @param isFirstPerson - Whether camera is in first-person view
   * @returns Normalized axis value between -1 and 1
   */
  public getHorizontalAxis(isFirstPerson: boolean): number {
    this.update(isFirstPerson)
    return this.horizontalAxis
  }
  
  /**
   * Checks if a specific key is currently pressed
   * @param key - The key to check
   * @returns True if the key is currently pressed
   */
  public isKeyPressed(key: string): boolean {
    return this.keys.has(key.toLowerCase())
  }
}