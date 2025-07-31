# Implementation Plan: PS1-Style Shoe-Throwing

# Game Enhancements

## 1. Replacing GLTF Models with Basic Geometry (Bush and Shoe)

```
Remove GLTF Assets: Eliminate the GLTF models for George Bush and the shoe. This avoids import
issues and reduces the build size (no heavy model data). We will recreate these using Three.js
primitive geometries, keeping polygon counts low (in line with PS1-era limits ). Low-poly shapes
with good texturing can still look great.
George Bush as a Cylinder: Use a vertical cylinder to represent Bush’s body. For example,
THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments). A
simple upright cylinder (same top/bottom radius) can serve as a “standee” of Bush:
Choose a small number of radial segments (e.g. 8 or 12) for a blocky look.
Map a low-res bush.png texture around the cylinder to give Bush’s appearance (face, suit, etc.).
The cylinder’s top and bottom can be left default (they won’t be seen much, but you can set
openEnded=true if you prefer no caps).
Shoe as Box + Sphere: Construct a shoe shape by combining a box and a sphere:
Use THREE.BoxGeometry for the shoe’s main body (sole). Use a small box (e.g. length along the Z
axis for the shoe’s length, width along X , thickness along Y ).
Use THREE.SphereGeometry for the shoe’s toe tip. Use a low segment sphere (e.g. 8 segments)
and scale it non-uniformly if needed (flatten a bit on Y-axis) to resemble a rounded toe.
Position the sphere at the front of the box (e.g. sphereMesh.position.set(0, 0, boxLength/
2) if the box is centered) so it forms a rounded front for the shoe. Attach both meshes to a
THREE.Group to move/throw as one unit.
No Complex Models: These simple shapes replace the need for complex imported meshes. This
avoids potential GLTF animation or collision issues and keeps performance high. (Physics engines
also handle primitive shapes more easily than arbitrary GLTF meshes .)
```
**Example – Defining Bush and Shoe geometries in TypeScript:**

```
// Create Bush as a low-poly cylinder
constbushRadius = 0.5, bushHeight= 2;
constbushSegments= 12; // low polygon count for a faceted look
constbushGeom = newTHREE.CylinderGeometry(bushRadius, bushRadius, bushHeight,
bushSegments);
// Load Bush texture (see texture setup in next section)
constbushTex= textureLoader.load('textures/bush.png');
constbushMat= new THREE.MeshLambertMaterial({ map:bushTex});
bushMat.flatShading= true; // flat shading for retro look (faceted)
// Bush mesh
constbushMesh = newTHREE.Mesh(bushGeom, bushMat);
```
### • 1 1 2 • • • • • • • • • 3


```
// Create Shoe from a box and a sphere
constshoeBodyGeom= new THREE.BoxGeometry(0.4, 0.2, 0.8); // width, height,
depth of shoe
constshoeToeGeom = new THREE.SphereGeometry(0.2, 8, 8); // radius and
segments for toe cap
constshoeTex= textureLoader.load('textures/shoe.png');
constshoeMat= new THREE.MeshLambertMaterial({ map:shoeTex});
shoeMat.flatShading= true;
constshoeBodyMesh= new THREE.Mesh(shoeBodyGeom, shoeMat);
constshoeToeMesh = new THREE.Mesh(shoeToeGeom, shoeMat);
// Position the toe sphere at the front of the shoe body
shoeToeMesh.position.set(0, 0, 0.4); // half the box depth (0.8/2) to place at
front
shoeToeMesh.scale.set(1, 0.6, 1); // flatten sphere a bit to match shoe
shape
// Group the parts
constshoeGroup= new THREE.Group();
shoeGroup.add(shoeBodyMesh);
shoeGroup.add(shoeToeMesh);
```
_Rationale:_ Using basic geometries drastically simplifies the models and ensures the entire game stays under
the 5 MB budget. The PS1 aesthetic is reinforced by low-poly shapes , and potential GLTF loading or
collision problems are resolved by using primitives.

## 2. PS1-Style Texture & Material Setup (Nearest Filtering and sRGB)

To achieve a PlayStation-1-style look, we need pixelated textures and simple lighting:

```
Use MeshLambertMaterial: Lambert shading provides old-school flat lighting (per-vertex light)
without glossy shine, matching the era’s look. We’ll apply this to all textured objects (Bush, shoe,
etc.).
Nearest-Neighbor Texture Filtering: Ensure all textures use nearest-neighbor sampling so they
appear pixelated (no smoothing). This preserves the blocky pixels when textures are magnified.
Set both minification and magnification filters to THREE.NearestFilter (and disable mipmaps).
sRGB Color Space for Textures: Mark color textures as sRGB so that colors appear correct under
lighting. In current Three.js (r152+), use texture.colorSpace = THREE.SRGBColorSpace.
(In older versions, you would use texture.encoding = THREE.sRGBEncoding.)
No Mipmaps: Turn off mipmaps (texture.generateMipmaps = false) to avoid blurry
downsizing of textures at a distance. This, combined with nearest filtering, keeps textures crispy
even far away (though they will alias, which is part of the retro feel).
Flat Shading: As shown above, enable material.flatShading = true on geometries if you
want faceted lighting (each triangle flat). This can enhance the retro look of low-poly models
(optional, but effective for things like the cylinder so it doesn’t look too smooth).
Disable Antialiasing: When initializing the renderer, consider turning off antialiasing
(antialias: false in WebGLRenderer), so edges remain jagged like older 3D games. You can
```
### 1 • • 4 • 5 • • •


```
even enforce pixelated rendering in CSS (e.g. canvas { image-rendering: pixelated; }) for
extra crisp pixels.
```
**Example – Loading a texture with nearest filtering and sRGB in TypeScript:**

```
consttextureLoader = newTHREE.TextureLoader();
```
```
// Load a low-res texture (e.g., bush.png)
constbushTexture = textureLoader.load('textures/bush.png');
bushTexture.minFilter = THREE.NearestFilter;
bushTexture.magFilter = THREE.NearestFilter;
bushTexture.generateMipmaps = false;
// Use sRGB color space for correct lighting (Three.js r152+)
bushTexture.colorSpace = THREE.SRGBColorSpace;
// If on older three.js, use: bushTexture.encoding = THREE.sRGBEncoding;
```
```
constbushMaterial= new THREE.MeshLambertMaterial({ map:bushTexture,
flatShading: true});
```
```
// Similarly for other textures, e.g. shoeTexture, floorTexture, etc.
```
By applying nearest-neighbor filtering, our textures will remain blocky and not get bilinearly filtered ,
perfectly emulating the pixelated look of PS1-era games. Also, setting the renderer’s output encoding to
sRGB (renderer.outputEncoding = THREE.sRGBEncoding) is recommended so that all colors are
gamma-correct.

## 3. Creating Custom Low-Res Textures (bush.png, shoe.png,

## floor.png)

We will need a few custom **2D assets**. The developer (or an artist) should create these outside the code and
save them in the project’s textures folder:

```
bush.png: A low-resolution image of George W. Bush (front view). This could be a tiny pixel-art
caricature or a downsampled photo. Aim for very low resolution (for example, 64×64 up to 128×
pixels). The image will be wrapped around the cylinder:
You might center Bush’s face in the image. The texture will stretch around the cylinder; since the
back of the cylinder will use the same texture, consider making the left/right edges of the image
blend into a generic suit texture or solid color to avoid a sharp seam.
How to create: You can draw a simple cartoon face using a pixel art tool, or take a real image and
heavily reduce the resolution (and color depth) to achieve a pixelated effect. Ensure the final file size
is small (a few KBs).
shoe.png: A small texture for the shoe. Since the shoe is composed of two parts, you can use one
texture applied to both the box and sphere:
This might be as simple as a 16×16 or 32×32 solid color with some detail (for example, a brown color
with black outline of a shoe or a few pixels indicating laces on top).
```
### 6 4 • 7 • • • •


```
Alternatively, create a tiny graphic of a shoe’s side or top and let it map onto the geometry (it will
appear stretched on the sphere somewhat, which is fine for a cartoon look).
Keep it simple – even a flat color or very minimal detail will work at the small size of the shoe model.
floor_tile.png: A tiling floor texture for the press room:
Create a 64×64 pixel image that will tile seamlessly. You could make a checkerboard pattern (e.g.
black and white tiles) or a simplistic “carpet” look. For example, a checker pattern of 8×8 squares
(each square 8px) will give a classic tiled floor when repeated.
Alternatively, use two shades of a color (like the blue carpet of a press room or a retro grid). The key
is that it should look repetitive and pixelated.
Ensure the texture edges tile cleanly (the right edge matches the left, top matches bottom).
Format: Use PNG for these textures (uncompressed or lightly compressed) to avoid artifacts. Given
the small resolutions, their file sizes will be extremely low.
Color Depth: You don’t need to manually reduce color depth (unless you want to mimic authentic
15-bit color + dithering). Simply working at low resolution and letting Three.js handle sRGB will
suffice. (If you want, you can use a tool to posterize colors or add dithering to really sell the PS
vibe, but this is optional.)
```
**Tips for asset creation:** If you are not an artist, consider using simple tools or public resources: - Draw pixel
art using free editors like **Piskel** or **Aseprite** (for pixel art, set canvas size small from the start). - You can
also use an image editor (GIMP/Photoshop) to scale down larger images of Bush or a shoe to the target
resolution with nearest-neighbor sampling (to preserve hard pixels). - If drawing from scratch, keep shapes
very basic. For example, Bush’s face could be just a few pixels for eyes and a simple mouth line – enough to
be recognizable when blown up on the cylinder.

Once created, place these files in your project (e.g. in assets/textures/) and load them with Three.js as
shown earlier. Using such low-res textures is true to the PS1 aesthetic and ensures each file is only a few
kilobytes, helping maintain the ≤5 MB build size.

## 4. Baghdad Press Room Scene Redesign (Environment

## Enhancements)

To make the game scene feel like the famous Baghdad press conference (where the shoe incident
occurred), we’ll create a simple parody of that room. This involves adding a stage, an audience, and chairs
to simulate a press room setting:

```
Fake Audience Billboards: Create a set of flat 2D billboards to represent the audience (reporters/
camera crew).
Use one or more audience texture images (e.g. audience1.png, audience2.png...) depicting
cartoon people or even just silhouettes of heads/upper bodies. These should also be low-res/
pixelated to match the style (perhaps 32×32 or 64×64 each). They can be front-facing or slight profile
as if sitting and watching the stage.
Implement each audience member as a sprite or camera-facing plane. Three.js provides
THREE.Sprite which always faces the camera automatically. This is perfect for billboards. You
can create a sprite with const sprite = new THREE.Sprite(new
THREE.SpriteMaterial({ map: audienceTexture }));.
```
### • • • • • • • • 7 • • • 8


```
Sprites do not respond to lighting (they use an unlit SpriteMaterial), which is actually fine for an
audience – they will appear fully bright, as if lit by the room’s ambient light. This makes them stand
out clearly. If you prefer them to be affected by lighting, you could use a PlaneGeometry with a
MeshBasicMaterial (also unlit) or MeshLambertMaterial (lit) and manually orient it toward
the camera each frame (plane.quaternion.copy(camera.quaternion) each update to
billboard it ).
Place multiple sprite people in the audience area. For example, arrange a few rows of sprites at
different positions so it looks like a small crowd. You can randomize their horizontal position and
maybe swap different textures to avoid uniformity.
Example: If the stage is at the front, place sprites at random (x,z) positions in an area
representing the seating, all with y ≈ 0.5 (so their feet/base are on the ground or on chairs).
Keep them facing the camera (sprites will do this by default).
Chairs from Cube Geometries: Simulate the press room chairs using simple boxes:
Each chair can be made from one or two cubes. For instance, use one cube for the seat and another
thin cube for the backrest.
Example dimensions: seat 0.5 (width) × 0.1 (height) × 0.5 (depth), and backrest 0.5 × 0.5 × 0.1.
Position the backrest cube upright at the rear of the seat cube. You can also add four tiny cubes as
legs if you want, but in a low-res game these might be unnecessary detail – it’s fine if chairs look like
benches with backs.
Use a simple material (could be MeshLambertMaterial with a solid color or even a small texture
like a wood pattern). Given the cartoon style, a flat color (gray or brown) is sufficient.
Place several chairs in rows facing the stage. Align their orientation toward the stage (e.g. rotate
each chair so its back is toward the stage). Space them out in a grid (like a few columns and rows to
mimic an audience seating area).
You can choose not to put an audience sprite in every chair (to simulate some empty chairs or just to
reduce sprites). Populate a handful of chairs with sprite people.
Stage and Podium: Create a simple stage for Bush:
Use a large flat box for the stage platform. For example, THREE.BoxGeometry(stageWidth,
stageHeight, stageDepth). The stage should be wide enough to hold Bush and perhaps a
podium (if you add one), but shallow in height. For instance, stageHeight might be ~0.2 or 0.3 (just a
small elevation).
Position the stage so its top surface is above the floor: stageMesh.position.y = stageHeight/
2 (since the box is centered). Place it at the front of the room. For instance, if the room extends in
the +Z direction for the audience, the stage could be at Z = 0 or a negative Z (depending on
coordinate setup). Ensure chairs/audience are in front of it.
Optionally, create a podium as another small box (maybe 0.2×1×0.2 size) placed on the stage in front
of Bush. This would mimic the lectern that Bush stood behind. Texture it or color it distinctly (e.g.
dark color). This adds to the press room vibe.
Bush’s placement: Put the Bush cylinder on the stage, centered or slightly to one side if you
imagine another person (like the Iraqi PM) on stage – but since it’s just Bush in this game, center is
fine. For example: bushMesh.position.set(0, stageHeight + bushHeight/2, stageZ) so
that Bush stands on the stage.
You might also add a back wall or curtain: a large plane or box behind the stage to represent the
backdrop (e.g. a navy blue curtain or flag). This can just be a big plane with a single color or a low-res
graphic (like a flag icon) to emulate the press conference background.
Scene Scale: Keep all these elements relatively small and close, so the action (shoe throwing)
happens within view. For instance, stage could be at Z = -10, chairs from Z = -5 to +5, and the player
```
### • 8 • • • • • • • • • • • • • • •


```
(cat) around Z = +10 (so about 20 units from Bush). These values depend on your camera FOV and
positioning, but the idea is to have an intimate room where the shoe toss distance is reasonable.
```
By designing the scene with these elements, you transform the game from an abstract green plane into a
recognizable parody of the **press room** incident. The audience sprites and chairs not only add visual humor
(paper-flat cartoon people reacting) but also give depth cues and context. Bush standing on a little stage
makes the target clearer and the scenario funnier (it recreates the infamous scene). All geometry for the
environment is simple (boxes, planes), so it keeps the polygon count minimal.

## 5. Project Structure and Directory Layout

Organize the project in a clear structure to manage assets and code. Here’s a recommended layout for a
Three.js TypeScript project with an ECS (Entity-Component-System) flavor:

```
Assets Directory: Store textures (and any sound or other media) in a dedicated folder.
assets/textures/ – contains bush.png, shoe.png, floor_tile.png, audience1.png,
audience2.png, etc. (all the image files we discussed).
(If you had any audio files or other media, they would go in assets/audio/, assets/models/, etc.
but in our case we removed models and only use code geometry.)
Source Code (src/ ) : Use subfolders to separate game logic:
src/entities/ – Define your game entities here. For example, you might have classes or factory
functions like Bush.ts (handles creating the Bush mesh entity), Shoe.ts (for the thrown shoe
object), Cat.ts (the player character if needed), Chair.ts, etc. Each entity module can
encapsulate the geometry and initialization of that object. This keeps creation logic organized.
src/systems/ – Implement game systems that handle behavior. For instance, a
ThrowSystem.ts could handle input and spawning shoes, an AudienceSystem.ts could
update any needed behavior for the audience (though sprites won’t need much update aside from
always facing camera, which sprites do automatically), a PhysicsSystem.ts or general
UpdateSystem.ts could move the thrown shoes and handle collisions (e.g., detect when a shoe
hits Bush or hits the ground).
src/scenes/ – You might create a module for assembling the scene, e.g. PressRoomScene.ts,
which creates the environment (stage, chairs, audience) and places entities. This can help separate
the configuration of the level from the main game loop.
src/main.ts – The entry point that initializes Three.js (renderer, camera, lights), loads assets,
creates the scene (by calling into the scene setup module), and starts the game loop. This is where
you’d also set up controls (keyboard/mouse input for the cat player) and tie systems together.
Build/Config Files: Keep configuration and build files at the root:
e.g. package.json, bundler config (webpack or Vite), and an index.html if this is a web project.
The HTML would reference the built JS bundle. Ensure the build process knows where static assets
are (you might need to copy assets/ to the dist folder or configure your bundler to serve them).
Dist/Public: After building, ensure the output (bundle and asset files) remains under the 5 MB limit.
Our minimal geometry and tiny textures approach will make that easy.
```
This structure supports a clean separation of concerns. For example, if later you swap out textures or adjust
geometry, you do so in the entities modules without tangling with game logic. If you need to adjust
game rules (like shoe speed or scorekeeping), that goes in systems. Keeping textures in a dedicated

### • • • • • • • • • • •


folder makes it easy to manage and replace them. This layout is friendly to command-line workflows and
version control, as each piece is in a predictable place.

## 6. Sourcing Low-Res Textures and Sprites (Public Domain & AI Tools)

Creating the visuals can be the trickiest part for a developer. Here are some tips to source or generate the
needed images in a legal and efficient way:

```
Public Domain/CC0 Resources: Search for public domain or freely licensed images that can be
adapted:
Websites like OpenGameArt.org and Kenney.nl have collections of game assets. You might find
cartoon characters or faces that could serve as your Bush or audience with some editing.
For the audience, even silhouettes or generic cartoon people sprites can work (since they’ll be low-
res and viewed from a distance). Search terms like "pixel art crowd CC0" or "cartoon silhouette
audience free" might yield something.
Kenney’s asset packs often include characters or people icons that could be downscaled to use as
audience members.
Image Editing: If you find a high-res image (say a photo of George W. Bush or a dress shoe), you can
convert it into a low-res texture:
Use an editor to crop the important part (e.g. Bush’s head/torso), resize it down to 64×64, and apply
a Posterize filter or manually reduce colors to get a cartoon effect.
Adjust contrast and colors so it reads well even at low resolution (sometimes exaggerating the
features helps when there are few pixels).
AI Generation: Utilize AI tools to create cartoon-style images:
Text-to-image models (like Stable Diffusion or DALL·E ) can generate caricatures or pixel art if
prompted correctly. For example, you could prompt "pixel art 32x32 portrait of George W. Bush" or
"cartoon catapult shoe at president press conference scene" for audience or context. You might need to
try a few times to get something usable, and then downscale it.
There are AI-based tools specifically for face caricatures or pixelation that might turn a real photo
into a retro game sprite. If using any Bush likeness, ensure it’s a parody use (which in this game
context it is) and be mindful of not using anything copyrighted unless it’s transformative enough or
licensed.
Hand-Drawn Pixel Art: If you or someone you know has basic art skills, drawing by hand can be
quickest for simple assets:
The audience sprites can be literally stick figures or blob shapes with suits – at 32px tall, a dot for a
head and a block for a body might suffice to imply “person”. These can actually be funny (e.g., one
could have a raised arm or a camera).
The floor texture can be drawn as a checkerboard: fill the image with two alternating colors. This can
even be done with a few lines of code or an Excel sheet then screenshot – it’s straightforward.
The shoe texture might just be a brown rectangle with a black outline or a few pixels of highlight.
Licensing: Make sure any image you use is either original, public domain, or properly licensed for
use. Given the satirical nature of this game, using a transformative caricature of Bush should fall
under parody/fair use, but if you want to be safe, an original cartoon drawing (yours or AI-
generated) is best. The audience should be generic enough not to resemble any real individuals
(stick to generic faces or silhouettes).
Testing the Look: After sourcing or creating an image, test it in the game quickly:
```
### • • • • • • • • • • • • • • • •


```
Apply it to the geometry and run the game to see how it looks from the gameplay camera. Extremely
low-res images may need touching up (for example, you might realize Bush’s facial features aren’t
recognizable and adjust the pixel placement or add contrast).
Check that the textures indeed appear pixelated in-game. If they look too smooth, double-check that
the nearest filter and no-mipmap settings are in effect (and that your source image wasn’t
inadvertently being resized by the browser – use the correct file path and case, etc.).
```
By using these methods, you can gather all necessary visual assets without exceeding the size budget. The
key is **consistency** – all textures should have the same retro style (blocky, limited detail). This will turn
technical limitations into an intentional art style, enhancing the comedy.

## 7. Adding a Tiled Floor Texture (Replacing the Flat Ground)

The current game likely uses a flat green plane as the ground. We will swap that out for our tiling
pressroom floor texture to add detail:

```
Floor Plane: Use a THREE.PlaneGeometry for the floor if not already. The plane should be large
enough to cover the play area (e.g., at least as wide as the room of chairs and stage). For example:
const floorGeom = new THREE.PlaneGeometry(roomWidth, roomDepth), maybe
roomWidth = roomDepth = 50 units or whatever covers your entire scene.
Texture Wrapping: Load the floor_tile.png and set it to repeat:
floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;
Decide how many times to tile the 64×64 texture across the floor. For instance, if your plane is 50
units and you want the tile to repeat every 1 unit, you’d repeat ~50 times. More realistically, you
might set floorTex.repeat.set(10, 10) to have a 10×10 grid of tiles across the floor (adjust to
what looks good and matches the pixel density you want).
As with other textures, use nearest filtering and no mipmaps for the floor texture so it stays
pixelated. (Mipmaps off is especially important for the floor because at shallow viewing angles,
mipmaps would normally blur it; we want the floor to shimmer with pixel goodness, as seen in retro
3D games).
Apply Material: Use a MeshLambertMaterial with the floor texture:
e.g., const floorMat = new THREE.MeshLambertMaterial({ map: floorTex, side:
THREE.DoubleSide });. Using double-sided ensures the floor is visible from below too, though in
this game the camera will likely never go under the floor – so single side is fine if you prefer.
The Lambert material will let the floor be affected by lights (if you have any). If your scene is mostly
ambient lit or you want the floor fully bright, you could use MeshBasicMaterial for an unlit look.
But Lambert with some ambient light is usually fine.
Orientation: Rotate the plane to lie flat. Three.js plane by default is two-sided and created in the XY
plane; to use it as ground, do floorMesh.rotation.x = -Math.PI/2 (90 degrees about X) so it
lies on the XZ plane.
Position: Position the plane so it aligns with your world. Typically, you’d center it at the origin
horizontally, and at Y = 0 for ground level. If your stage and other objects were built assuming Y=0 is
floor, then ensure the plane’s Y is at 0 or just a hair below (to avoid z-fighting with any other object
bottoms).
Remove Old Ground: If there was a previous ground mesh (e.g., a green plane), remove it from the
scene or replace it directly with this new textured floor.
```
### • • • • • • • 4 • • • • • •


**Example – Floor setup code:**

```
// Load and configure floor texture
constfloorTex = textureLoader.load('textures/floor_tile.png');
floorTex.wrapS = THREE.RepeatWrapping;
floorTex.wrapT = THREE.RepeatWrapping;
floorTex.repeat.set(10, 10); // tile 10x10 times across the plane
floorTex.minFilter= THREE.NearestFilter;
floorTex.magFilter= THREE.NearestFilter;
floorTex.generateMipmaps = false;
floorTex.colorSpace = THREE.SRGBColorSpace; // ensure correct color space if
needed
```
```
constfloorMat = newTHREE.MeshLambertMaterial({ map:floorTex });
constfloorGeom= new THREE.PlaneGeometry(50, 50);
constfloorMesh= new THREE.Mesh(floorGeom, floorMat);
floorMesh.rotation.x = -Math.PI / 2; // lay flat
floorMesh.position.y = 0; // at ground level
scene.add(floorMesh);
```
Now the boring flat ground will become a pixelated pressroom floor. For instance, if you used a simple blue
checkerboard, the entire ground will show that tiled pattern, giving a sense of scale and location (much
better than plain green). This also helps the player judge distances (the grid provides reference) and adds
comedic flair (a gaudy low-res carpet can be funny in itself).

_Note:_ If the floor texture is very contrasty (like black/white checker), you might want to dim it or choose
colors that don’t distract from the main action (shoes and characters). A muted color scheme (like gray tiles
or a subtle pattern) can keep the focus on the shoe-throwing chaos.

## 8. Assembling the Scene in Code (Placing Bush, Player, Audience,

## Platform)

With all entities and environment pieces defined, you can now construct the scene graph. Below is a
pseudo-code example in TypeScript demonstrating how to set up the press room scenario:

```
// Assume we have created bushMesh, shoeGroup (but shoes will be created
dynamically when thrown),
// audience sprite materials, chair meshes, etc., as described above.
```
```
// 1. Add the stage (platform) to the scene
conststageWidth = 8, stageHeight= 0.3, stageDepth = 3;
conststageGeom= new THREE.BoxGeometry(stageWidth, stageHeight, stageDepth);
conststageMat = newTHREE.MeshLambertMaterial({ color: 0x555555 }); // simple
grey stage
```

conststageMesh= new THREE.Mesh(stageGeom, stageMat);
stageMesh.position.set(0, stageHeight/2,
0); // stage centered at front (origin in this setup)
scene.add(stageMesh);

// 2. Place Bush on the stage
bushMesh.position.set(0, stageHeight+ bushHeight/2, 0); // on stage, centered
bushMesh.rotation.y = Math.PI; // rotate Bush to face the audience/camera, if
needed (depends on texture orientation)
scene.add(bushMesh);

// (Optional podium on stage)
constpodiumGeom =new THREE.BoxGeometry(0.5, 1.0, 0.3);
constpodiumMat= new THREE.MeshLambertMaterial({ color: 0x333333});
constpodiumMesh =new THREE.Mesh(podiumGeom, podiumMat);
podiumMesh.position.set(0, stageHeight+ 0.5, 0.8); // in front of Bush (toward
audience)
scene.add(podiumMesh);

// 3. Position the player (cat) in the audience area
// Assuming we have a catMesh or playerMesh from earlier (or just a camera if
FPS).
playerMesh.position.set(0, 0.1, 10); // put the cat roughly 10 units away from
stage, on floor
playerMesh.rotation.y = 0; // face forward (toward stage)
scene.add(playerMesh);

// 4. Add chairs and audience sprites
constrows= 3, cols= 5;
constspacingX = 1.2, spacingZ= 1.5;
conststartX = -((cols-1) * spacingX) / 2;
conststartZ = 5; // distance from stage
letpersonIndex = 0;
for(letr = 0; r < rows; r++) {
for(letc = 0; c < cols; c++) {
const x = startX+ c * spacingX;
const z = startZ+ r * spacingZ;
// Create a chair
const chair= createChairMesh(); // your function to build a chair from
cubes
chair.position.set(x, 0, z);
chair.rotation.y = Math.PI; // face the chair toward stage (stage is
at z=0, so rotate 180° if chair front is its local +Z)
scene.add(chair);
// Add an audience sprite on the chair (for maybe half the chairs to look
occupied)
if ((r + c) % 2 == 0) { // just populate some of them
const personSprite= new


```
THREE.Sprite(audienceSpriteMaterialArray[personIndex%
audienceSpriteMaterialArray.length]);
personSprite.position.set(x, 0.6, z);// position at chair, a bit above
seat
scene.add(personSprite);
personIndex++;
}
}
}
```
_In the above code:_ - We place the stage at the origin area and Bush on it. The Bush is rotated to face the
positive Z direction (assuming the audience and player are located at positive Z). - The player (cat) is
positioned out in the audience area (at Z = 10 here). Depending on your camera setup, you might not need
a visible cat model if the game is first-person from the cat’s view. But if third-person, you’d have a catMesh
to place. - Chairs are laid out in a grid (3 rows × 5 columns as an example) starting at some point (Z = 5 units
from stage). We rotate each chair 180 degrees (facing toward negative Z, where the stage is). - We add a
Sprite for some chairs to represent people. In this snippet, we alternate filling seats. We use
audienceSpriteMaterialArray to cycle through a few different sprite textures for variety. - Each
person sprite is positioned slightly above the chair seat (y = 0.6 here, since the seat height was ~0.1, so 0.
puts the sprite’s center roughly at head height of a seated person). - You would have defined
createChairMesh() elsewhere (it returns a Group or Mesh that includes seat and back).

Adjust coordinates to fit your exact scene sizing. The main idea is to have the stage at one end, chairs facing
it, and the player among or just in front of the audience. By assembling it this way, when you run the game
you should see Bush on his stage at the front, chairs in rows, and little sprite people on some chairs. This
creates a _sense of space_ and context that will make the shoe-throwing exchange more immersive and funny
(especially if you imagine the flat audience “watching” the duel).

Don’t forget to set up at least one light in the scene since we’re using Lambert materials. For example, an
ambient light plus a directional light from above/front can work:

```
scene.add(newTHREE.AmbientLight(0x888888));
constkeyLight = newTHREE.DirectionalLight(0xffffff, 0.5);
keyLight.position.set(0, 10, 10);
scene.add(keyLight);
```
This will softly illuminate the scene so the textures and objects are visible. You can tweak lighting to get a
slightly dramatic effect (e.g. the stage a bit brighter than the audience).


## 9. Enhancing the Shoe-Throwing Mechanics (Chaotic Spin & Arc)

To amp up the comedic effect, we’ll adjust how the shoes fly through the air. Currently, the shoes might be
moving in a straight line. We want them to spin wildly and follow a exaggerated arc:

```
Add Random 3D Spin: Each time a shoe is thrown (by the cat or Bush), assign it a random angular
velocity. This will cause the shoe to tumble end-over-end in flight, which looks far more chaotic and
funny than a static orientation.
When you spawn a shoe, generate small random rotation speeds for each axis (pitch, yaw, roll). For
example:
```
```
shoeGroup.userData.angularVel = newTHREE.Vector3(
(Math.random() * 2 - 1) * spinRate,
(Math.random() * 2 - 1) * spinRate,
(Math.random() * 2 - 1) * spinRate
);
```
```
where spinRate is some base value (in radians per second). You might start with, say, 5 or 10 rad/
s so the shoe makes a couple of flips during its flight. Randomize the direction of spin (the
Math.random()*2-1 gives a range of -spinRate to +spinRate).
In your game loop or physics update, apply this rotation:
```
```
shoeMesh.rotation.x += shoeMesh.userData.angularVel.x * delta;
shoeMesh.rotation.y += shoeMesh.userData.angularVel.y * delta;
shoeMesh.rotation.z += shoeMesh.userData.angularVel.z * delta;
```
```
(assuming delta is the time step). If you’re using a physics engine for motion, you might instead
use the physics API to set an angular velocity on the rigid body (e.g., Ammo.js
body.setAngularVelocity() with a random vector). But the visual result is the same – the shoe
model tumbles.
Increase Trajectory Height: We want the shoes to travel in a higher arc, so they dramatically lob
upward and then down, rather than a flat line drive. This mimics a cartoonish throw where the shoe
might even go off-screen for a moment before plummeting onto the target.
If you control the throw via a velocity vector, simply give it an extra upward component. For instance,
if originally the shoe’s initial velocity was computed toward the target, do something like:
velocity.y += arcBoost; where arcBoost is a positive value. This will send the shoe higher.
You might base arcBoost on the horizontal distance or just use a constant tweak.
Example (no physics): Suppose the cat throws towards Bush. You can calculate direction vector from
cat to Bush, then do:
```
```
constdirection= new THREE.Vector3();
direction.subVectors(bushMesh.position, catMesh.position).normalize();
direction.y = 0; // initially horizontal direction
constspeed = 20;
constshoeVelocity= direction.multiplyScalar(speed);
```
### • • • • • •


```
shoeVelocity.y = 8; // give a strong upward push
shoe.userData.velocity= shoeVelocity;
```
```
Here we force a Y velocity of 8 (tune this number). This will cause the shoe to go up as it travels
forward. Gravity will pull it down later.
If using a physics engine, you would apply an upward impulse or set a higher Y component in the
velocity vector passed to the physics body.
The result should be that the shoe goes up high, then comes down towards the target. You can
adjust the gravity or the magnitude of that Y boost to get a satisfying arc. Generally, a higher arc is
funnier (to a point) because it builds anticipation as the shoe hangs in the air before clobbering (or
missing) the target.
Slight Aim Randomness (optional): For extra humor, you might introduce a bit of inaccuracy to
each throw. For example, randomize the target position slightly or add a tiny random sideways
velocity. This can make some shoes narrowly miss or require the player to move to avoid return
throws. However, use this sparingly so the game is still playable.
Visual Feedback: The spinning shoes will be obvious, but consider also adding a smoke trail or
cartoon swoosh behind the shoe for comedic effect. This could be a particle or simply a line sprite.
Not required, but it can exaggerate the motion.
Sound (if any): A whistling sound effect as the shoe flies, or a “woosh” could complement the visual
chaos. And a satisfying thunk or "bonk!" when it hits Bush (or a meow if the cat gets hit) would be
hilarious. (Make sure to keep sound files small or use low-bitrate to stay within size limits.)
```
**Example – Throwing a shoe with arc and spin (pseudo-code):**

```
functionthrowShoe(fromPos: THREE.Vector3, toPos: THREE.Vector3) {
// Create a new shoe entity
constshoe= shoeGroup.clone(); // clone the prepared shoe Group (with
geometry)
scene.add(shoe);
shoe.position.copy(fromPos);
```
```
// Compute velocity towards target with an upward boost
constvel =new THREE.Vector3();
vel.subVectors(toPos, fromPos).normalize();
constspeed= 15;
vel.multiplyScalar(speed);
vel.y += 5; // add upward arc boost
shoe.userData.velocity= vel;
```
```
// Assign a random angular velocity for tumbling
constspin= 10;// rad/sec
shoe.userData.angularVel =new THREE.Vector3(
(Math.random()*2 - 1) * spin,
(Math.random()*2 - 1) * spin,
(Math.random()*2 - 1) * spin
);
}
```
### •

### •

### •

### •

### •


```
// In the animation loop (if not using physics):
shoes.forEach(shoe=> {
// Update rotation
shoe.rotation.x += shoe.userData.angularVel.x * delta;
shoe.rotation.y += shoe.userData.angularVel.y * delta;
shoe.rotation.z += shoe.userData.angularVel.z * delta;
// Update position
shoe.position.add(shoe.userData.velocity.clone().multiplyScalar(delta));
// Gravity effect
shoe.userData.velocity.y -= 9.8*
delta; // assuming Earth gravity for scale; adjust as needed
// (If using ammo.js, gravity is handled by physics engine)
});
```
With these changes, when the cat throws a shoe at Bush, the shoe will _spin end-over-end_ unpredictably and
_arc high_ before descending. Similarly, when Bush throws a shoe back, apply the same logic (perhaps Bush
aims at the cat’s position). The dramatic loft gives the player a moment to react (dodge or prepare to catch
another shoe), and the spinning makes the projectile motion visually amusing.

Test and tweak the values: - If the shoe overshoots Bush too often, reduce the forward speed or increase
gravity. - If it’s not arcing enough, add more to vel.y. - If the spin is not noticeable, increase the spin
value for angular velocity. A value that makes the shoe rotate several times before impact tends to look
funny (just be careful if using a low frame rate — extremely fast spin might alias, but generally it’s fine).

Finally, all these enhancements should be integrated without breaking the 5 MB limit. Primitive geometries
and tiny textures are very lightweight, and the code for physics/animation is negligible in size. The end
result will be a **tighter, funnier, and more immersive game** : low-poly Bush on a stage, a crowd of flat
spectators, and shoes flying chaotically across a retro 3D press room. Good luck, and have fun watching
those shoes fly!

PS1 style graphics in Three.js | Roman Liutikov, Software Engineer
https://romanliutikov.com/blog/ps1-style-graphics-in-threejs

Using physics engines with collision detection - Questions - three.js forum
https://discourse.threejs.org/t/using-physics-engines-with-collision-detection/

How to apply sRGBEncoding on texture? - Questions - three.js forum
https://discourse.threejs.org/t/how-to-apply-srgbencoding-on-texture/

javascript - Three.js - billboard effect, maintain orientation after camera pans - Stack Overflow
https://stackoverflow.com/questions/19731293/three-js-billboard-effect-maintain-orientation-after-camera-pans

```
4 8
```
```
1 2 4 6 7
```
```
3
```
```
5
```
```
8
```

