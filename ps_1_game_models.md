# Modified Implementation Plan: PS1-Style Shoe-Throwing Game (With Real Low-Poly Models)

## 1. Replacing Problematic GLTF Models with Low-Poly GLB Models

**Instructions:**

- Use **actual low-poly GLB models** instead of primitives.
- Replace problematic GLTF with optimized GLB (Draco compression recommended).
- Models must adhere to PS1 aesthetic (≤200 tris).

### Bush Model

**Asset Required:** `bush_lowpoly.glb`

**Implementation in TypeScript:**

```typescript
const gltfLoader = new THREE.GLTFLoader();
gltfLoader.load('models/bush_lowpoly.glb', (gltf) => {
  const bushMesh = gltf.scene;
  bushMesh.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh) {
      const mesh = obj as THREE.Mesh;
      const mat = mesh.material as THREE.MeshStandardMaterial;
      mat.map.magFilter = THREE.NearestFilter;
      mat.map.minFilter = THREE.NearestFilter;
      mat.flatShading = true;
      mat.needsUpdate = true;
    }
  });
  bushMesh.position.set(0, stageHeight + 1, 0);
  scene.add(bushMesh);
});
```

### Shoe Model

**Asset Required:** `shoe_lowpoly.glb`

**Implementation in TypeScript:**

```typescript
gltfLoader.load('models/shoe_lowpoly.glb', (gltf) => {
  const shoeMesh = gltf.scene;
  shoeMesh.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh) {
      const mesh = obj as THREE.Mesh;
      const mat = mesh.material as THREE.MeshStandardMaterial;
      mat.map.magFilter = THREE.NearestFilter;
      mat.map.minFilter = THREE.NearestFilter;
      mat.flatShading = true;
      mat.needsUpdate = true;
    }
  });
  shoeMesh.scale.set(0.5, 0.5, 0.5); // adjust as needed
  shoeMesh.visible = false; // clone and make visible when thrown
  scene.add(shoeMesh);
});
```

**Recommended Asset Sources:**

- Public domain low-poly models (Kenney.nl, OpenGameArt.org)
- Convert or simplify existing GLTF using Blender and export as GLB with Draco compression

## 2. PS1-Style Texture & Material Configuration

**Key Settings:**

- Use `MeshStandardMaterial` or `MeshLambertMaterial`
- Nearest filtering, no mipmaps
- sRGB color space

Example:

```typescript
const textureLoader = new THREE.TextureLoader();
const bushTexture = textureLoader.load('textures/bush.png');
bushTexture.minFilter = THREE.NearestFilter;
bushTexture.magFilter = THREE.NearestFilter;
bushTexture.generateMipmaps = false;
bushTexture.colorSpace = THREE.SRGBColorSpace;
```

## 3. Creating Custom Low-Res Textures

- `bush.png`: 64x64 pixels, pixel-art or heavily reduced photographic image
- `shoe.png`: 32x32 pixels, minimal details
- `floor_tile.png`: 64x64 pixels, checkerboard or simple pattern

Tools Recommended: Aseprite, Photoshop, GIMP

## 4. Baghdad Press Room Scene Redesign

- **Audience Billboards**: Create 32x32 or 64x64 pixel art sprites (`audience1.png`, `audience2.png`).
- Use `THREE.Sprite` for audience members facing camera.
- **Chairs**: Replace boxes with a simple, low-poly chair GLB (`chair_lowpoly.glb`).

### Stage Setup

```typescript
const stageMesh = new THREE.Mesh(
  new THREE.BoxGeometry(8, 0.3, 3),
  new THREE.MeshLambertMaterial({ color: 0x555555 })
);
stageMesh.position.set(0, 0.15, 0);
scene.add(stageMesh);
```

## 5. Directory Structure

```
assets/
  models/
    bush_lowpoly.glb
    shoe_lowpoly.glb
    chair_lowpoly.glb
  textures/
    bush.png
    shoe.png
    floor_tile.png
    audience1.png
    audience2.png
src/
  entities/
    Bush.ts
    Shoe.ts
    Chair.ts
  systems/
    ThrowSystem.ts
    AudienceSystem.ts
  scenes/
    PressRoomScene.ts
  main.ts
```

## 6. Low-Poly Model and Texture Sourcing

- Kenney.nl
- OpenGameArt.org
- AI tools: Stable Diffusion, DALL·E for pixel art style generation

## 7. Tiled Floor Texture Implementation

```typescript
const floorTex = textureLoader.load('textures/floor_tile.png');
floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;
floorTex.repeat.set(10, 10);
const floorMat = new THREE.MeshLambertMaterial({ map: floorTex });
const floorMesh = new THREE.Mesh(new THREE.PlaneGeometry(50, 50), floorMat);
floorMesh.rotation.x = -Math.PI / 2;
scene.add(floorMesh);
```

## 8. Scene Assembly (Pseudo-code)

- Load models (Bush, Shoe, Chair).
- Set stage, audience sprites, chairs, Bush on stage.

## 9. Shoe Throwing Enhancements (Realistic Model)

```typescript
function throwShoe(fromPos: THREE.Vector3, toPos: THREE.Vector3) {
  const shoe = shoeMesh.clone();
  shoe.visible = true;
  shoe.position.copy(fromPos);
  scene.add(shoe);
  // velocity and random spin as before
}

shoes.forEach(shoe => {
  shoe.rotation.x += shoe.userData.angularVel.x * delta;
  shoe.rotation.y += shoe.userData.angularVel.y * delta;
  shoe.rotation.z += shoe.userData.angularVel.z * delta;
});
```

This structure ensures realistic models while maintaining performance and aesthetics suitable for your PS1-style parody.

