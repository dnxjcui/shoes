// Node.js validation script for shoe renderer
import fs from 'fs';
import path from 'path';

console.log('=== Shoe Renderer Validation ===\n');

// Check if required files exist
const requiredFiles = [
    'shoe_renderer.html',
    'public/models/shoe.glb',
    'public/models/shoe_low.glb'
];

console.log('Checking required files:');
requiredFiles.forEach(file => {
    const exists = fs.existsSync(file);
    console.log(`  ${file}: ${exists ? '✅ EXISTS' : '❌ MISSING'}`);
    
    if (exists) {
        const stats = fs.statSync(file);
        console.log(`    Size: ${(stats.size / 1024).toFixed(1)} KB`);
        console.log(`    Modified: ${stats.mtime.toLocaleString()}`);
    }
});

// Analyze HTML file
console.log('\n=== HTML Analysis ===');
const htmlContent = fs.readFileSync('shoe_renderer.html', 'utf8');

const features = {
    'PS1 Material Conversion': htmlContent.includes('convertToPS1Material'),
    'Material Analysis': htmlContent.includes('analyzeMaterial'),
    'Multiple Model Loading': htmlContent.includes('shoeModels'),
    'Fallback Geometry': htmlContent.includes('createFallbackShoe'),
    'Proper Error Handling': htmlContent.includes('currentModelIndex++'),
    'GLTF Loader': htmlContent.includes('GLTFLoader'),
    'Orbit Controls': htmlContent.includes('OrbitControls')
};

console.log('Features implemented:');
Object.entries(features).forEach(([feature, implemented]) => {
    console.log(`  ${feature}: ${implemented ? '✅' : '❌'}`);
});

// Check model file details
console.log('\n=== Model Analysis ===');
if (fs.existsSync('public/models/shoe.glb')) {
    const shoeStats = fs.statSync('public/models/shoe.glb');
    console.log(`shoe.glb: ${(shoeStats.size / 1024 / 1024).toFixed(2)} MB`);
}

if (fs.existsSync('public/models/shoe_low.glb')) {
    const shoeLowStats = fs.statSync('public/models/shoe_low.glb');
    console.log(`shoe_low.glb: ${(shoeLowStats.size / 1024 / 1024).toFixed(2)} MB`);
}

console.log('\n=== Usage Instructions ===');
console.log('1. Start local server: python -m http.server 8080');
console.log('2. Open: http://localhost:8080/shoe_renderer.html');
console.log('3. Check browser console for material analysis');
console.log('4. Use mouse to rotate, scroll to zoom');
console.log('5. Look for proper shoe colors and PS1-style rendering');

console.log('\n=== Expected Results ===');
console.log('✅ Shoe model loads with proper scaling');
console.log('✅ Materials convert to PS1-style with brown/leather colors');
console.log('✅ Textures apply with nearest filtering');
console.log('✅ Detailed console logging shows material properties');
console.log('✅ Fallback geometry if GLB fails');

console.log('\nValidation complete! 🚀');