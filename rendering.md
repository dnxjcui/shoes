# Rendering a 3D model with

# Next.js 13, TypeScript, React-

# three-fiber, and React-three-drei

```
Valentina Garavaglia Follow 5 min read · Jun 24, 2023
```
##### 102 6

### React-three-fiber is a React renderer for three.js, the most widely used

### JavaScript framework for displaying 3D content on the web. It is often

### used with React-three-drei, a collection of useful helpers and

### abstractions for React-three-fiber. By combining the capabilities of

### these frameworks, you can render and interact with 3D models easily.

### In this beginner-friendly tutorial, you will learn how to render a GLTF

### model using these libraries.

## But what is GLTF?

```
Get unlimited access to the best of Medium for less than $ 1 /week. Become a member
```

### GLTF (GL Transmission Format) is a file format specifically created to

### transmit 3D scenes and models efficiently. These files are designed to

### be compact and optimized for real-time rendering on various platforms,

### including the web.

### When working with GLTF files, they are often accompanied by

### additional files such as textures (in formats like JPEG or PNG) and

### binary data (in the form of a binary glTF buffer). These accompanying

### files help in storing and loading the assets required for the 3D model,

### enabling efficient rendering and performance.

### There are other popular file formats for storing and transmitting 3D

### models and scenes, like OBJ (Wavefront OBJ), FBX (Filmbox), Collada

### (DAE), STL (STereoLithography), and USD (Universal Scene Description).

## Requirements:

### Node.js 16.8 or later.

### Some React.js and TypeScript knowledge

### Step 1: Choose and download your 3D model file

### You can use Sketchfab to get a GLTF model to use in this tutorial. Some

### of these models are free to download, but be sure to credit the author

### when you use them! In this tutorial, I chose this cute Shiba 3D model

### from the user zixisun02.

### Step 2: Create your Next.js project


### Run the following command to set up everything automatically for you:

```
npx create-next-app@latest
```
### You will be asked if you want to use TypeScript with this project, select

### yes. I will be using Tailwind in my project too, even though it's not

### required for this tutorial, I'm using it only for some utilities like center

### the div, etc., but it’s up to you to use it or not.

### After the prompts, create-next-app will create a folder with your project

### name and install the dependencies.

### Step 3: Install dependencies to render 3D models

### Run the following command:

```
npm install three @types/three @react-three/fiber @react-three/drei
```
### Step 4: Save your 3D file to the project

### Copy and paste your file (or your folder, if your model has textures) to

### the public directory.


### Step 5: Create your component file

### Create a components directory inside src/app. Inside this directory,

### create your file as <name>.tsx. In my case, I called it shiba.tsx.

### Step 6: Import the necessary dependencies

### Now it's time to import some components from three and react-three.

### Add the following code to the top of your file:

```
"use client";
```
```
import { useRef } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Mesh } from "three";
```
### The "use client" directive is necessary to "convert" a server-side

### component into a client-side one, since in this case, we are using React

### Hooks, and at the current state of Next.js, this is only possible on the

### client-side. Since this is not a Next.js tutorial, you can read more about

### this here.

### Step 7: Create your mesh component

### To make our scene visible, we will use a lowercase <mesh /> element,

### which is equivalent to creating a new THREE.Mesh() object. You don't


### need to import this element, as three.js objects will be treated as native

### JSX elements.

```
function MeshComponent() {
const fileUrl = "/shiba/scene.gltf";
const mesh = useRef<Mesh>(null!);
const gltf = useLoader(GLTFLoader, fileUrl);
```
```
return (
<mesh ref={mesh}>
<primitive object={gltf.scene} />
</mesh>
);
}
```
### Make sure your fileUrl points to your .gltf file.

### null!, containing a non-null assertion operator, is used to tell

### TypeScript that we are certain that mesh.current is not null or undefined

### when we access it in effects. You can read more about this here.

### Step 8: Add rotation

### Use the useFrame hook from React-three-fiber to update the rotation of

### the mesh on every frame by adding the following code to your mesh

### component:

```
useFrame(() => {
mesh.current.rotation.y += 0.01;
```

##### });

### There are a lot more properties you can change to play with the

### direction, scale, translation, and rotation of the object. For example, you

### can also add x rotation by adding a value to mesh.current.rotation.x.

### Step 9: Create your Canvas component

### The Canvas component from React-three-fiber creates a Scene and a

### Camera, the fundamental components for rendering. Here I'm adding

### some Tailwind styling too.

### Add your mesh component as a Canvas child.

```
export function Shiba() {
return (
<div className='flex justify-center items-center h-screen'>
<Canvas className='h-2xl w-2xl'>
<MeshComponent />
</Canvas>
</div>
);
}
```
### Step 10: Import your component on page.tsx file

### Your page.tsx file should look like this:


```
import { Shiba } from "./components/shiba";
```
```
export default function Home() {
return (
<main>
<Shiba /> // rename it to your component here
</main>
);
}
```
### At this point, depending on the 3D model you chose, you should be able

### to see your 3D model rendered on the browser. Cool, right?!

### If you don't see anything yet, it will be necessary to add some light.

### Step 10: Add lights

### You can add light as needed to your Canvas using ambientLight and

### pointLight components from React-three-fiber as children of your

### Canvas.

### ambientLight provides a type of light that is present everywhere in your

### scene. It doesn’t have a specific direction or target but provides overall

### illumination to your entire scene, like the natural light in a room.

### pointLight is a light that focuses on a specific point in your scene. You

### can think of it like a lamp that emits light in all directions from a single

### location. It illuminates objects around it and creates shadows based on

### their positions in relation to the light source.

```
Open in app
```
```
Search Write
```

```
<ambientLight />
<pointLight position={[10, 10 , 10 ]} />
```
### Step 11: Add OrbitControls

### The OrbitControls component from React-three-drei provides camera

### controls for interactive 3D scenes. It allows you to navigate and interact

### with the 3D scene by panning, rotating, and zooming using mouse

### movements or touch gestures.

### Add the OrbitControls component as a child of your Canvas.

```
<OrbitControls />
```
### And we are done!

### This is the final result:


### This is how your component should look like:

```
"use client";
```
```
import { useRef } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Mesh } from "three";
```
```
function MeshComponent() {
const fileUrl = "/shiba/scene.gltf";
const mesh = useRef<Mesh>(null!);
const gltf = useLoader(GLTFLoader, fileUrl);
```
```
useFrame(() => {
mesh.current.rotation.y += 0.01;
});
```
```
return (
<mesh ref={mesh}>
```

```
<primitive object={gltf.scene} />
</mesh>
);
}
```
```
export function Shiba() {
return (
<div className='flex justify-center items-center h-screen'>
<Canvas className='h-2xl w-2xl'>
<OrbitControls />
<ambientLight />
<pointLight position={[10, 10 , 10 ]} />
<MeshComponent />
</Canvas>
</div>
);
}
```
### The source code of this tutorial can be found here.

### As you continue your journey into the world of 3D rendering, try to

### experiment different 3D models, lighting techniques, and interactions

### to create unique and compelling experiences. I'll be sure I'll keep

### playing with them.

### Let me know what you think about this little tutorial, if you liked it,

### don't hesitate to reach out! I hope you could learn something from it :)

```
3d Model Files React Three Fiber React Three Drei
```

### Written by Valentina Garavaglia

```
49 followers · 37 following
```
```
Follow
```
## Responses ( 6 )

```
Lening N Cui
```
##### S TS

```
Nov 25, 2024
```
Hi! First of all, thanks a lot for this article! Im experiencing some issues though... I follow your steps but I

get this awful error: TypeError: Cannot read properties of undefined (reading 'ReactCurrentOwner'), and

after lots of tries I am about to surrender...

```
1 reply Reply
```
```
Lance Pollard
Dec 3, 2024
```
I get typescript errors like `Property 'ambientLight' does not exist on type 'JSX.IntrinsicElements'`, how

can I resolve this?

```
2 replies Reply
```
```
Oleh
Feb 18, 2024
```
```
What are your thoughts?
```
##### 1


Very usefull!

```
Reply
```
```
See all responses
```
## Recommended from Medium


### Why Japanese Developers Write

### Code Completely Differently...

#### I’ve been studying Japanese software

#### development practices for the past three...

```
Jul 17
```
```
In by
```
### I Stopped Writing UI Code. Now I

### Let MCP Servers Build My...

#### ShadCN looked great on paper, Cursor

#### seemed smart enough, and I thought I...

```
Jul 22
```
### 🔥 5 Unique VS Code Extensions

### Frontend Devs Shouldn’t Miss i...

#### There’s no shortage of blog posts

#### recommending Prettier or ESLint (and...

5d ago

```
In by
```
### The world’s longest React hooks

### migration

#### How we (finally) modernized a legacy

#### codebase at scale — without halting...

```
Jun 30
```
```
Sohail Saifi
```
##### 10K 268

```
JavaScript in Plain Engli... Hassan Trabel...
```
##### 1.4K 41

```
Meet
```
##### 2

```
The Craft Chris Krogh
```
##### 153 1


```
See more recommendations
```
```
In by
```
### This new IDE from Google is an

### absolute game changer

#### This new IDE from Google is seriously

#### revolutionary.

```
Mar 11
```
### Docker Is Dead — And It’s About

### Time

#### Docker changed the game when it

#### launched in 2013, making containers...

```
Jun 8
```
```
Coding Beauty Tari Ibaba
```
##### 6.1K 367

```
Abhinav
```
##### 3.8K 85


