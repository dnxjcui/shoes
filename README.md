# 🐱 Cat vs Bush - React Three Fiber Game

> **"A turn-based shoe-throwing game with George Bush"**

A humorous 3D shoe throwing game built with React, TypeScript, and Three.js, featuring smooth camera transitions, physics-based movement, and PS1-inspired aesthetics.

![Game Status](https://img.shields.io/badge/Status-Environment_Ready-brightgreen)
![Version](https://img.shields.io/badge/Version-v0.2-blue)
![Tech Stack](https://img.shields.io/badge/Tech-React%20%7C%20TypeScript%20%7C%20Three.js%20%7C%20GSAP-orange)

## 🎮 Game Overview

Cat vs Bush is a turn-based shoe-throwing game where a cat player faces off against George Bush. The game features dual camera perspectives, realistic physics, and a bright, clean aesthetic inspired by retro gaming.

### Current Features ✅

- **Dual Camera System**: First-person cat view + third-person behind-Bush view
- **Smooth Transitions**: GSAP-powered camera switching (K key)
- **Physics-based Movement**: Critically-damped spring physics for responsive control
- **GLTF Model Loading**: George Bush renders with proper textures and materials
- **Intelligent AI**: Bush moves randomly every 2-4 seconds during player turns
- **Bright Environment**: Fully lit scene with white walls and black floor (coming soon)
- **Camera-aware Controls**: Intuitive left/right movement in both camera modes

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20 LTS or higher
- **npm** or **yarn**
- Modern web browser with WebGL2 support

### Installation & Setup

```bash
# Clone the repository
git clone <repository-url>
cd shoes

# Install dependencies
npm install

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

## 🕹️ How to Play (Current State)

### Controls

| Input | Action | Status |
|-------|--------|--------|
| **K** | Toggle Camera (FP ↔ TP) | ✅ Working |
| **←/→** or **A/D** | Move Player Left/Right | ✅ Working |

### Camera Modes

- **First-Person (FP)**: View from cat's eyes looking forward at Bush
- **Third-Person (TP)**: Behind Bush looking back at player (DS Pokemon style)

### Current Gameplay

1. **Movement**: Use arrow keys or A/D to move the cat horizontally
2. **Camera**: Press K to switch between first-person and third-person views
3. **Bush AI**: Watch George Bush move around randomly every few seconds
4. **Physics**: Experience smooth spring-based movement with realistic damping

## 🏗️ Project Architecture

```
src/
├── App.tsx                   # Entry point
├── components/
│   ├── GameScene.tsx         # Main game container & state management
│   ├── entities/
│   │   ├── BushEntity.tsx    # George Bush with AI movement & GLTF loading
│   │   └── PlayerEntity.tsx  # Cat with spring physics & sprite rendering
│   └── systems/
│       ├── CameraSystem.tsx  # Dual camera with GSAP transitions
│       └── InputSystem.tsx   # Input handling system
├── main.tsx                  # React bootstrap
└── style.css                 # Global styles
public/
├── models/
│   └── bush/
│       ├── scene.gltf        # Bush GLTF model
│       └── textures/         # Bush texture files
└── sprites/
    └── lowres_player.png     # Player sprite
```

## 🛠️ Technical Implementation

### Core Technologies

| Technology | Purpose | Status |
|------------|---------|--------|
| **React** | Component architecture | ✅ Implemented |
| **React Three Fiber** | 3D rendering framework | ✅ Implemented |
| **TypeScript** | Type-safe development | ✅ Implemented |
| **Three.js** | WebGL 3D engine | ✅ Implemented |
| **GSAP** | Camera animations | ✅ Implemented |
| **Vite** | Build tool & dev server | ✅ Implemented |

### Key Features Implementation

#### 🎥 **Camera System**
```typescript
// First-person (cat eyes)
FP: {
  position: new THREE.Vector3(0, 1.6, 0),
  lookAt: new THREE.Vector3(0, 1.4, 10)
}

// Third-person (behind Bush)
TP: {
  position: new THREE.Vector3(0, 2.4, 10),
  lookAt: new THREE.Vector3(0, 1.4, 0)
}
```

#### 🏃 **Spring Physics**
```typescript
// Critically-damped movement (τ ≈ 0.12s)
const SPRING_CONSTANT = 1 / (0.12 * 0.12)
const DAMPING_RATIO = 1.0
```

#### 🤖 **Bush AI**
```typescript
// Random movement every 2-4 seconds at 1 m/s
if (timer >= nextDirectionChange) {
  direction = [-1, 0, 1][Math.floor(Math.random() * 3)]
  nextDirectionChange = Math.random() * 2 + 2
}
```

## 🎯 Development Progress

### ✅ **Completed (Environment Phase)**
- [x] React Three Fiber setup and architecture
- [x] Dual camera system with smooth GSAP transitions
- [x] Player entity with spring physics movement
- [x] Bush entity with GLTF loading and AI movement
- [x] Bright lighting system for full visibility
- [x] Camera-aware input mapping
- [x] State management and component architecture

### 🚧 **In Progress**
- [ ] White walls and black floor environment
- [ ] Shoe throwing mechanics
- [ ] Hit detection system
- [ ] Health system (3 hearts each)
- [ ] Turn-based gameplay loop

### 📋 **Planned Features**
- [ ] Projectile physics with realistic arcs
- [ ] Visual feedback for hits and damage
- [ ] Round progression system
- [ ] Sound effects and particle effects
- [ ] Victory/defeat conditions

## 🎨 Current Visual Setup

### Environment
- **Player Position**: (0, 0, 0) - Cat sprite at origin
- **Bush Position**: (0, 0, 8) - George Bush 8 units away
- **Separation**: 8 units for proper shoe throwing distance
- **Bounds**: Player movement clamped to [-1.5, +1.5] meters

### Lighting
- **Ambient Light**: 1.5 intensity for bright environment
- **Directional Lights**: Multiple angles for even illumination
- **Point Light**: Centered illumination for depth
- **Shadow Mapping**: 1024x1024 resolution with proper bounds

## 🧪 Testing & Validation

### Manual Testing Checklist
- [x] Camera switching works smoothly (K key)
- [x] Player movement responds correctly in both camera modes
- [x] Bush AI moves randomly every 2-4 seconds
- [x] Spring physics feels responsive (τ ≈ 0.12s)
- [x] GLTF models load with proper materials
- [x] Scene is bright and fully visible
- [x] No console errors or warnings

### Performance Validation
- [x] 60 FPS on modern hardware
- [x] Smooth camera transitions without jank
- [x] Efficient React component updates
- [x] Proper memory management

## 🚀 Next Steps

### Immediate Priorities
1. **Environment Design**: Add white walls and black floor
2. **Shoe Mechanics**: Implement physics-based projectile system
3. **Hit Detection**: Lane-based collision detection
4. **Health System**: 3 hearts per player with visual feedback

### Implementation Roadmap
1. **Phase 1**: Environment polish (white walls, black floor)
2. **Phase 2**: Shoe throwing mechanics
3. **Phase 3**: Turn-based gameplay loop
4. **Phase 4**: Visual polish and sound effects

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎉 Acknowledgments

- **React Three Fiber** community for excellent React integration
- **Three.js** for powerful 3D capabilities
- **GSAP** for smooth animation support
- **George Bush** for being a good sport

## 🐛 Current Known Issues

- Environment needs white walls and black floor styling
- Shoe throwing mechanics not yet implemented
- No health system or game loop yet
- Placeholder visual assets

## 🔮 Future Enhancements

- **Particle Effects**: Shoe trails and impact effects
- **Sound System**: Retro-style sound effects
- **Multiple Levels**: Different environments and challenges
- **Multiplayer**: Local or network multiplayer support
- **Power-ups**: Special shoes with unique properties

---

**Built with ❤️ using React, TypeScript & Three.js**

*Ready to throw some shoes? The environment is set up and waiting!* 🥿✨

## 🎯 **Current Status: Environment Complete - Ready for Shoe Implementation**