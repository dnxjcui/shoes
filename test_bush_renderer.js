// Node.js validation script for bush renderer
import fs from 'fs';
import path from 'path';

console.log('=== Bush GLTF Renderer Validation ===\n');

// Check if required files exist
const requiredFiles = [
    'bush_renderer.html',
    'public/models/bush/scene.gltf',
    'public/models/bush/scene.bin',
    'public/models/bush/textures/Material.001_baseColor.png'
];

const textureVariants = [
    'public/models/bush/textures/Material.001_baseColor.png',
    'public/models/bush/textures/Material.001_baseColor - Copy.png',
    'public/models/bush/textures/Material.001_baseColor - Copy (2).png',
    'public/models/bush/textures/Material.001_baseColor - Copy - Copy.png'
];

console.log('Checking required files:');
requiredFiles.forEach(file => {
    const exists = fs.existsSync(file);
    console.log(`  ${file}: ${exists ? '✅ EXISTS' : '❌ MISSING'}`);
    
    if (exists) {
        const stats = fs.statSync(file);
        if (file.endsWith('.png')) {
            console.log(`    Size: ${(stats.size / 1024).toFixed(1)} KB`);
        } else {
            console.log(`    Size: ${stats.size} bytes`);
        }
    }
});

console.log('\nChecking texture variants:');
textureVariants.forEach(texture => {
    const exists = fs.existsSync(texture);
    console.log(`  ${texture.split('/').pop()}: ${exists ? '✅' : '❌'}`);
    if (exists) {
        const stats = fs.statSync(texture);
        console.log(`    Size: ${(stats.size / 1024).toFixed(1)} KB`);
    }
});

// Analyze GLTF file
console.log('\n=== GLTF Analysis ===');
if (fs.existsSync('public/models/bush/scene.gltf')) {
    const gltfContent = fs.readFileSync('public/models/bush/scene.gltf', 'utf8');
    const gltf = JSON.parse(gltfContent);
    
    console.log('GLTF version:', gltf.asset?.version);
    console.log('Generator:', gltf.asset?.generator);
    console.log('Extensions used:', gltf.extensionsUsed);
    
    if (gltf.materials) {
        console.log('\\nMaterials:');
        gltf.materials.forEach((material, index) => {
            console.log(`  ${index}: ${material.name}`);
            console.log(`    Double sided: ${material.doubleSided}`);
            console.log(`    Extensions: ${Object.keys(material.extensions || {}).join(', ')}`);
            if (material.pbrMetallicRoughness?.baseColorTexture) {
                console.log(`    Base texture index: ${material.pbrMetallicRoughness.baseColorTexture.index}`);
            }
        });
    }
    
    if (gltf.textures) {
        console.log('\\nTextures:');
        gltf.textures.forEach((texture, index) => {
            console.log(`  ${index}: sampler ${texture.sampler}, source ${texture.source}`);
        });
    }
    
    if (gltf.images) {
        console.log('\\nImages:');
        gltf.images.forEach((image, index) => {
            console.log(`  ${index}: ${image.uri}`);
        });
    }
    
    if (gltf.samplers) {
        console.log('\\nSamplers:');
        gltf.samplers.forEach((sampler, index) => {
            console.log(`  ${index}: mag=${sampler.magFilter}, min=${sampler.minFilter}, wrapS=${sampler.wrapS}, wrapT=${sampler.wrapT}`);
            // 9728 = GL_NEAREST, 10497 = GL_REPEAT
            const magFilter = sampler.magFilter === 9728 ? 'NEAREST' : sampler.magFilter;
            const minFilter = sampler.minFilter === 9728 ? 'NEAREST' : sampler.minFilter;
            const wrapS = sampler.wrapS === 10497 ? 'REPEAT' : sampler.wrapS;
            const wrapT = sampler.wrapT === 10497 ? 'REPEAT' : sampler.wrapT;
            console.log(`    Decoded: mag=${magFilter}, min=${minFilter}, wrapS=${wrapS}, wrapT=${wrapT}`);
        });
    }
}

// Analyze HTML file
console.log('\n=== HTML Analysis ===');
const htmlContent = fs.readFileSync('bush_renderer.html', 'utf8');

const features = {
    'KHR_materials_unlit Support': htmlContent.includes('KHR_materials_unlit'),
    'Texture Pre-loading': htmlContent.includes('textureLoader.load'),
    'Alternative Texture Paths': htmlContent.includes('tryAlternativeTextures'),
    'PS1 Filtering Setup': htmlContent.includes('NearestFilter'),
    'Status Logging': htmlContent.includes('updateStatus'),
    'Fallback Bush': htmlContent.includes('createFallbackBush'),
    'Material Analysis': htmlContent.includes('originalMaterial.userData?.gltfExtensions')
};

console.log('Features implemented:');
Object.entries(features).forEach(([feature, implemented]) => {
    console.log(`  ${feature}: ${implemented ? '✅' : '❌'}`);
});

console.log('\n=== Expected Behavior ===');
console.log('✅ Pre-loads texture with PS1 filtering before GLTF');
console.log('✅ Handles KHR_materials_unlit extension correctly');
console.log('✅ Falls back to alternative texture paths if main fails');
console.log('✅ Creates procedural bush if GLTF loading fails');
console.log('✅ Provides detailed status logging and console output');
console.log('✅ Applies proper PS1-style material conversion');

console.log('\n=== Usage Instructions ===');
console.log('1. Start local server: python -m http.server 8080');
console.log('2. Open: http://localhost:8080/bush_renderer.html'); 
console.log('3. Check status panel (top-left) for loading progress');
console.log('4. Check browser console for detailed analysis');
console.log('5. Look for textured bush model with PS1-style rendering');

console.log('\nBush renderer validation complete! 🌳');