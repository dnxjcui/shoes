// React Game Setup Validation Script
import fs from 'fs';
import path from 'path';

console.log('=== React Game Environment Validation ===\n');

// Check all required files exist
const requiredFiles = [
  'src/App.tsx',
  'src/components/GameScene.tsx',
  'src/components/entities/BushEntity.tsx',
  'src/components/entities/PlayerEntity.tsx',
  'src/components/systems/CameraSystem.tsx',
  'src/components/systems/InputSystem.tsx',
  'public/models/bush/scene.gltf',
  'public/sprites/lowres_player.png'
];

console.log('Checking required files:');
let allFilesExist = true;

requiredFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`  ${file}: ${exists ? '✅' : '❌'}`);
  if (!exists) allFilesExist = false;
});

console.log(`\nAll files present: ${allFilesExist ? '✅' : '❌'}\n`);

// Analyze component implementations
console.log('=== Component Analysis ===');

// Check GameScene implementation
if (fs.existsSync('src/components/GameScene.tsx')) {
  const gameSceneContent = fs.readFileSync('src/components/GameScene.tsx', 'utf8');
  
  const gameSceneFeatures = {
    'Dual Camera Setup': gameSceneContent.includes('PerspectiveCamera') && gameSceneContent.includes('FP') && gameSceneContent.includes('TP'),
    'K Key Toggle': gameSceneContent.includes("key.toLowerCase() === 'k'"),
    'State Management': gameSceneContent.includes('useState<GameState>'),
    'Position Callbacks': gameSceneContent.includes('onPositionUpdate'),
    'GSAP Integration': gameSceneContent.includes('gsap'),
    'World Bounds': gameSceneContent.includes('WORLD_BOUNDS'),
    'Camera Transitions': gameSceneContent.includes('CameraSystem')
  };
  
  console.log('GameScene Features:');
  Object.entries(gameSceneFeatures).forEach(([feature, implemented]) => {
    console.log(`  ${feature}: ${implemented ? '✅' : '❌'}`);
  });
}

// Check BushEntity implementation
if (fs.existsSync('src/components/entities/BushEntity.tsx')) {
  const bushContent = fs.readFileSync('src/components/entities/BushEntity.tsx', 'utf8');
  
  const bushFeatures = {
    'GLTF Loading': bushContent.includes('GLTFLoader'),
    'Random Movement': bushContent.includes('nextDirectionChange') && bushContent.includes('Math.random()'),
    'World Bounds Clamping': bushContent.includes('Math.max') && bushContent.includes('Math.min'),
    'Movement Speed (1 m/s)': bushContent.includes('speed = 1.0'),
    'Idle Bob Animation': bushContent.includes('Math.sin') && bushContent.includes('bobAmount'),
    'Turn-based Behavior': bushContent.includes('PLAYER_TURN') && bushContent.includes('NPC_TURN'),
    'Player Tracking': bushContent.includes('lerp') && bushContent.includes('playerPosition'),
    'PS1 Material Conversion': bushContent.includes('KHR_materials_unlit')
  };
  
  console.log('\nBushEntity Features:');
  Object.entries(bushFeatures).forEach(([feature, implemented]) => {
    console.log(`  ${feature}: ${implemented ? '✅' : '❌'}`);
  });
}

// Check PlayerEntity implementation  
if (fs.existsSync('src/components/entities/PlayerEntity.tsx')) {
  const playerContent = fs.readFileSync('src/components/entities/PlayerEntity.tsx', 'utf8');
  
  const playerFeatures = {
    'Sprite Loading': playerContent.includes('TextureLoader') && playerContent.includes('lowres_player.png'),
    'Spring Physics': playerContent.includes('SPRING_CONSTANT') && playerContent.includes('DAMPING_RATIO'),
    'Critically Damped': playerContent.includes('τ ≈ 0.12'),
    'Input Handling': playerContent.includes('arrowleft') && playerContent.includes('arrowright'),
    'World Bounds Clamping': playerContent.includes('worldBounds'),
    'Turn-based Movement': playerContent.includes('currentTurn === \'PLAYER_TURN\''),
    'PS1 Texture Filtering': playerContent.includes('NearestFilter')
  };
  
  console.log('\nPlayerEntity Features:');
  Object.entries(playerFeatures).forEach(([feature, implemented]) => {
    console.log(`  ${feature}: ${implemented ? '✅' : '❌'}`);
  });
}

// Check CameraSystem implementation
if (fs.existsSync('src/components/systems/CameraSystem.tsx')) {
  const cameraContent = fs.readFileSync('src/components/systems/CameraSystem.tsx', 'utf8');
  
  const cameraFeatures = {
    'GSAP Transitions': cameraContent.includes('gsap.to') && cameraContent.includes('power1.inOut'),
    'Transition Duration (0.9s)': cameraContent.includes('duration: 0.9'),
    'Camera Positioning': cameraContent.includes('1.6') && cameraContent.includes('2.4'),
    'Look-at Logic': cameraContent.includes('lookAt'),
    'Player Following': cameraContent.includes('playerPosition'),
    'Bush Tracking': cameraContent.includes('bushPosition')
  };
  
  console.log('\nCameraSystem Features:');
  Object.entries(cameraFeatures).forEach(([feature, implemented]) => {
    console.log(`  ${feature}: ${implemented ? '✅' : '❌'}`);
  });
}

// Check package.json dependencies
console.log('\n=== Dependencies Check ===');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const requiredDeps = [
  '@react-three/fiber',
  '@react-three/drei', 
  'three',
  'gsap',
  'react'
];

console.log('Required dependencies:');
requiredDeps.forEach(dep => {
  const installed = packageJson.dependencies[dep] || packageJson.devDependencies[dep];
  console.log(`  ${dep}: ${installed ? `✅ ${installed}` : '❌'}`);
});

console.log('\n=== Implementation Guide Compliance ===');

const complianceChecks = {
  'World Bounds (-5 to +5m)': 'WORLD_BOUNDS = { min: -5, max: 5 }',
  'Bush Random Movement (2-4s)': 'Math.random() * 2 + 2',
  'Movement Speed (1 m/s)': 'speed = 1.0',
  'Camera Positions (FP: 0,1.6,0)': 'position: new THREE.Vector3(0, 1.6, 0)',
  'Camera Transitions (0.9s)': 'duration: 0.9',
  'Spring Physics (τ ≈ 0.12s)': 'τ ≈ 0.12',
  'PS1 Style Filtering': 'NearestFilter'
};

console.log('Implementation Guide Compliance:');
Object.entries(complianceChecks).forEach(([check, pattern]) => {
  // This is a simplified check - in practice you'd do more thorough validation
  console.log(`  ${check}: 🔍 (manual verification needed)`);
});

console.log('\n=== Usage Instructions ===');
console.log('1. Server should be running at: http://localhost:5173');
console.log('2. Expected controls:');
console.log('   - K: Toggle between First-Person and Third-Person camera');
console.log('   - ←/→ or A/D: Move player left/right (during player turn)');
console.log('3. Expected behavior:');
console.log('   - George Bush should move randomly every 2-4 seconds');
console.log('   - Player sprite should be visible and controllable');
console.log('   - Camera should smoothly transition when pressing K');
console.log('   - FP view: Looking from cat eyes at bush');
console.log('   - TP view: Over-shoulder Pokémon-style view');

console.log('\nReact game setup validation complete! 🎮');