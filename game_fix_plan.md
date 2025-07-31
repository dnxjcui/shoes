# Implementation Plan for Resolving Critical Issues

## Overview

This implementation plan addresses critical issues identified in the current Cat vs Bush game implementation, specifically around:

1. Wall rendering
2. Shoe entity scaling and physics
3. Missing key systems (State machine, Hit detection, Health & UI)

The following plan provides actionable solutions with specific code examples and adheres to existing code as closely as possible.

---

## 🚨 Priority 1: Fix Wall Rendering Issue

### Issue

Walls render as black instead of white.

### Solution

The issue is likely due to incorrect wall normals or lighting directions. Ensure correct wall normals by enabling double-sided materials.

**Modified Wall Implementation:**

```tsx
<mesh position={[0, 3, 10]}>
  <planeGeometry args={[12, 6]} />
  <meshLambertMaterial color={0xffffff} side={THREE.DoubleSide} />
</mesh>

<mesh position={[0, 3, -2]} rotation={[0, Math.PI, 0]}>
  <planeGeometry args={[12, 6]} />
  <meshLambertMaterial color={0xffffff} side={THREE.DoubleSide} />
</mesh>
```

---

## 🚨 Priority 2: Shoe Entity Scaling Issue

### Issue

Shoes spawn large then suddenly shrink.

### Solution

Preload and scale the shoe model before rendering. Introduce a loading state to manage visibility.

**Improved Scaling Implementation:**

```tsx
const gltf = useLoader(GLTFLoader, '/models/shoe_lowpoly.glb');
const meshRef = useRef<THREE.Group>(null!);

useEffect(() => {
  if (gltf?.scene) {
    const box = new THREE.Box3().setFromObject(gltf.scene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    gltf.scene.position.set(0, 0, 0);
    gltf.scene.position.sub(center);

    const targetSize = 0.15;
    const scale = targetSize / Math.max(size.x, size.y, size.z);
    gltf.scene.scale.setScalar(scale);

    gltf.scene.updateMatrixWorld(true);
    setIsScaled(true);
  }
}, [gltf]);

if (!isScaled) return null;
```

---

## 🚨 Priority 3: Shoe Physics Correction

### Issue

Current implementation does not match specification.

### Solution

Implement proper projectile physics matching the implementation guide:

```tsx
const [projectile, setProjectile] = useState({
  position: initialPosition.clone(),
  velocity: new THREE.Vector3(
    (targetPosition.x - initialPosition.x),
    INITIAL_VELOCITY_Y,
    0
  ),
  timeAlive: 0
});

useFrame((_, delta) => {
  setProjectile(prev => {
    const newTimeAlive = prev.timeAlive + delta;
    return {
      ...prev,
      position: new THREE.Vector3(
        THREE.MathUtils.lerp(initialPosition.x, targetPosition.x, newTimeAlive),
        initialPosition.y + 1.2 * Math.sin(Math.PI * newTimeAlive),
        initialPosition.z
      ),
      timeAlive: newTimeAlive
    };
  });
});
```

---

## ✅ Priority 4: Implement Missing Systems

### 4.1 State Machine

Implement full state machine as per provided diagram:

```tsx
const [gameState, setGameState] = useState<'Intro' | 'Player_Turn' | 'NPC_Turn' | 'Victory' | 'Defeat'>('Intro');

useEffect(() => {
  switch (gameState) {
    case 'Intro':
      setTimeout(() => setGameState('Player_Turn'), 2000);
      break;
    case 'Player_Turn':
      // Manage player turn logic
      break;
    case 'NPC_Turn':
      // Manage NPC turn logic
      break;
    case 'Victory':
    case 'Defeat':
      // End game logic
      break;
  }
}, [gameState]);
```

### 4.2 Hit Detection System

Implement lane-based collision detection:

```tsx
const getRailIndex = (x: number) => Math.floor((x + 5) / (10 / 11));

const checkHit = (projectile: THREE.Vector3, target: THREE.Vector3) => {
  return getRailIndex(projectile.x) === getRailIndex(target.x) && projectile.y < 0.15;
};
```

### 4.3 Health & UI System

Implement hearts as UI sprites:

```tsx
const [playerHealth, setPlayerHealth] = useState(3);
const hearts = new Array(3).fill(0).map((_, i) => (
  <img
    key={i}
    src={i < playerHealth ? '/sprites/full_heart.png' : '/sprites/empty_heart.png'}
    style={{ width: '32px', height: '32px' }}
  />
));

return (
  <div style={{ position: 'absolute', top: '10px', left: '10px' }}>{hearts}</div>
);
```

---

## 📝 Recommended Project Structure

```
src/
├── components/
│   ├── entities/
│   │   ├── BushEntity.tsx
│   │   ├── PlayerEntity.tsx
│   │   └── ShoeEntity.tsx
│   ├── systems/
│   │   ├── CameraSystem.tsx
│   │   ├── HitDetectionSystem.tsx
│   │   └── InputSystem.tsx
│   └── GameScene.tsx
├── assets/
│   ├── models/
│   │   ├── bush_lowpoly.glb
│   │   ├── shoe_lowpoly.glb
│   │   └── chair_lowpoly.glb
│   └── textures/
│       ├── bush.png
│       ├── shoe.png
│       └── hearts.png
```

---

## 🎯 Next Steps

- Implement the provided solutions incrementally.
- Verify visually and functionally after each step.
- Update documentation as necessary to reflect changes.

This plan addresses the current critical problems clearly and directly, ensuring smooth integration into your existing codebase.

