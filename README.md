# 🐱 Cat vs Bush Shoe Thrower

> **"Practice throwing shoes at bad people."**

A turn-based 3D shoe throwing game built with TypeScript and Three.js, inspired by retro PS1-era gaming aesthetics.

![Game Status](https://img.shields.io/badge/Status-Playable-brightgreen)
![Version](https://img.shields.io/badge/Version-v0.1-blue)
![Tech Stack](https://img.shields.io/badge/Tech-TypeScript%20%7C%20Three.js%20%7C%20GSAP-orange)

## 🎮 Game Overview

Cat vs Bush Shoe Thrower is a physics-based turn-based combat game where players throw shoes at a bush enemy across 3 rounds. Each player has 3 hearts and gets 2 shoes per turn. The game features smooth camera transitions, realistic projectile physics, and retro-inspired visuals.

### Key Features

- **Turn-based Combat**: Strategic 2-shoes-per-turn gameplay
- **Physics-based Projectiles**: Realistic arcing trajectories with `y = 2 * sin(tπ)` formula
- **Dynamic Camera System**: Automatic POV switching + manual camera controls
- **Health System**: 3 hearts each, visual feedback on hits
- **Round Progression**: 3 rounds with target repositioning
- **Responsive UI**: Real-time health bars, round counters, and game state

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20 LTS or higher
- **npm** or **yarn**
- Modern web browser with WebGL2 support

### Installation & Setup

```bash
# Clone or create the project
npm create vite@latest shoe-thrower -- --template vanilla-ts
cd shoe-thrower

# Install dependencies
npm install
npm install three @types/three gsap spritesheet-js

# Create directory structure
mkdir -p src/systems public/sprites public/models

# Start development server
npm run dev
```

### Running the Game

1. **Development Mode**:
   ```bash
   npm run dev
   ```
   Game will be available at `http://localhost:5173`

2. **Production Build**:
   ```bash
   npm run build
   npm run preview
   ```

3. **Deploy to GitHub Pages**:
   ```bash
   npm run build
   npx gh-pages -d dist
   ```

## 🕹️ How to Play

### Controls

| Input | Action |
|-------|--------|
| **Arrow Keys** / **A/D** | Move camera left/right (clamped -5 to +5) |
| **Spacebar** | Throw shoe (2 per turn) |
| **1** | Switch to Player camera view |
| **2** | Switch to NPC camera view |
| **3** | Switch to Overhead camera view |

### Gameplay Loop

1. **Player Turn**: Move camera to aim, throw 2 shoes with spacebar
2. **Enemy Turn**: Camera auto-switches to enemy POV, enemy attacks (60% hit chance)
3. **Round End**: Target repositions randomly, new round begins
4. **Victory**: Reduce enemy health to 0 or survive 3 rounds
5. **Defeat**: Player health reaches 0

### Game Mechanics

- **Health**: Both players start with 3 hearts (❤️❤️❤️)
- **Damage**: Each successful shoe hit deals 1 damage
- **Accuracy**: Player aims manually, enemy has 60% hit chance
- **Rounds**: 3 rounds maximum, target moves each round
- **Turn Limit**: 2 shoes per player turn

## 🏗️ Project Structure

```
shoe-thrower/
├── src/
│   ├── main.ts              # Game bootstrap & main loop
│   ├── states.ts            # Game state management
│   ├── style.css            # Fullscreen game styles
│   └── systems/
│       ├── input.ts         # Keyboard input handling
│       ├── camera.ts        # Smooth POV transitions
│       ├── target.ts        # Enemy NPC behavior
│       └── projectile.ts    # Shoe physics & animation
├── public/
│   ├── sprites/             # Sprite sheets (future)
│   └── models/              # 3D models (future)
├── package.json
└── README.md
```

## 🛠️ Technical Implementation

### Architecture

- **Modular Systems**: Clean separation of input, camera, projectiles, and game state
- **Entity Management**: Object-oriented approach with proper lifecycle management
- **Animation Pipeline**: GSAP for camera transitions, custom physics for projectiles
- **State Machine**: Robust turn management with phase transitions

### Key Technologies

| Technology | Purpose | Version |
|------------|---------|---------|
| **TypeScript** | Type-safe development | Latest |
| **Three.js** | 3D rendering & WebGL | Latest |
| **GSAP** | Camera animations | Latest |
| **Vite** | Build tool & dev server | Latest |

### Performance Features

- **Efficient Rendering**: Single scene graph with minimal draw calls
- **Memory Management**: Proper cleanup of projectiles and temporary objects
- **Responsive Design**: Fullscreen canvas with window resize handling
- **Optimized Physics**: Lightweight arc calculations without heavy physics engine

## 🎯 Development Milestones

- [x] **M1**: Blank world with scene, camera, gray ground
- [x] **M2**: Left/right camera movement (clamped -5...5m)  
- [x] **M3**: Dummy target NPC with random positioning
- [x] **M4**: Smooth POV swap with GSAP camera transitions
- [x] **M5**: Shoe projectile with realistic arc physics
- [x] **M6**: Full turn logic with health, rounds, UI overlay
- [ ] **M7**: Art pass (sprites, models, sound effects)

## 🎨 Art & Assets Pipeline

### Planned Assets

| Asset Type | Tool | Format | Resolution | Notes |
|------------|------|--------|------------|-------|
| Cat Sprites | Aseprite/Piskel | PNG | 64×64/128×128 | Multiple meme variants |
| Bush Sprite | Aseprite | PNG | 64×64 | Idle/hit animations |
| Shoe Sprite | Aseprite | PNG | 32×32 | Spinning animation |
| Podium Model | Blender | glTF | ≤200 tris | PS1-style low-poly |
| Sound FX | Bfxr | WAV | 8-bit | "pew"/"thud" sounds |

### Asset Generation

```bash
# Generate sprite sheets (when assets ready)
npm run generate-sprites

# Copy models to public
cp assets/models/*.gltf public/models/
```

## 🧪 Testing

### Manual Testing Checklist

- [ ] Camera movement works within bounds
- [ ] Shoes fire and follow arc trajectory  
- [ ] Target hit detection works correctly
- [ ] Health decreases on successful hits
- [ ] Turn progression follows 2-shoes-per-turn rule
- [ ] Camera auto-switches during enemy turn
- [ ] Game ends correctly on win/lose conditions
- [ ] UI updates reflect accurate game state
- [ ] All manual camera switches (1/2/3) work
- [ ] Window resize maintains aspect ratio

### Performance Testing

```bash
# Check bundle size
npm run build
ls -lh dist/

# Profile in browser
# Open DevTools > Performance > Record gameplay session
```

## 🚀 Deployment

### GitHub Pages (Recommended)

```bash
# Build and deploy
npm run build
npx gh-pages -d dist

# Or set up automated deployment
npm install --save-dev gh-pages
# Add to package.json scripts: "deploy": "npm run build && gh-pages -d dist"
```

### Other Platforms

- **Netlify**: Drag & drop `dist/` folder
- **Vercel**: Connect GitHub repo, auto-deploy
- **itch.io**: Upload as HTML5 game

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Development Setup

```bash
git clone <your-fork>
cd shoe-thrower
npm install
npm run dev
# Make changes, test, commit
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎉 Acknowledgments

- **Three.js** community for excellent documentation
- **GSAP** for smooth animation capabilities  
- **Vite** for lightning-fast development experience
- **Retro gaming** for aesthetic inspiration

## 🐛 Known Issues

- Target hit detection could be more precise
- Enemy AI is currently random (60% hit chance)
- No sound effects yet (M7 milestone)
- Basic placeholder graphics (M7 milestone)

## 🔮 Future Enhancements

- **M7 Art Pass**: Replace boxes with actual sprites and models
- **Sound System**: Add retro-style sound effects and music
- **Particle Effects**: Shoe trails, hit sparks, dust clouds
- **Difficulty Levels**: Adjustable enemy accuracy and health
- **Power-ups**: Special shoes with different effects
- **Multiplayer**: Local or online player vs player

---

**Built with ❤️ using TypeScript & Three.js**

*Ready to throw some shoes? Fire up the dev server and start playing!* 🥿✨