# Shoe GLB Renderer - PS1 Style

A standalone Three.js application for testing GLB model loading with PS1-style material conversion.

## Features ✨

- **Advanced GLB Loading**: Tries multiple shoe models (`shoe.glb`, `shoe_low.glb`)
- **PS1-Style Material Conversion**: Converts PBR materials to flat-shaded Lambert materials
- **Detailed Material Analysis**: Console logging of all material properties
- **Fallback Geometry**: Creates procedural shoe if GLB loading fails
- **Interactive Controls**: Mouse rotation and zoom
- **Proper Error Handling**: Graceful degradation with helpful status messages

## Usage 🚀

1. **Start Local Server**:
   ```bash
   python -m http.server 8080
   ```

2. **Open in Browser**:
   ```
   http://localhost:8080/shoe_renderer.html
   ```

3. **Check Console**: Open browser dev tools to see detailed material analysis

## Key Components 🔧

### PS1 Material Conversion
```javascript
function convertToPS1Material(material, meshName) {
  // Creates MeshLambertMaterial with:
  // - Flat shading
  // - Nearest neighbor filtering 
  // - sRGB color space
  // - Brown shoe base color
  // - Roughness/metalness conversion to color tinting
}
```

### Material Analysis
```javascript
function analyzeMaterial(material, name) {
  // Logs all material properties:
  // - Color, textures, roughness, metalness
  // - Maps (diffuse, normal, roughness, etc.)
  // - Transparency and opacity settings
}
```

### Multi-Model Loading
- First tries `shoe.glb` (3.33 MB)
- Falls back to `shoe_low.glb` (2.59 MB) 
- Creates procedural geometry if both fail

## Expected Results ✅

When working correctly, you should see:

1. **Shoe Model**: Properly scaled and positioned
2. **Brown Colors**: Shoe appears in brown/leather tones (not gray)
3. **PS1 Filtering**: Pixelated texture appearance with nearest filtering
4. **Console Logs**: Detailed material property analysis
5. **Smooth Rotation**: Model rotates slowly for inspection

## Troubleshooting 🔍

### Gray/No Color Issue
- Check console for material analysis output
- Verify original GLB has color/texture data
- Fallback brown color should apply if no material data

### Model Not Loading
- Verify GLB files exist in `public/models/`
- Check browser console for loading errors
- Server should serve files with correct MIME types

### Performance Issues
- Large GLB files (3+ MB) may load slowly
- Consider using `shoe_low.glb` for better performance
- Check draw calls and polygon count in browser dev tools

## Files 📁

- `shoe_renderer.html` - Main renderer (13.8 KB)
- `test_shoe_renderer.js` - Validation script
- `public/models/shoe.glb` - High-poly shoe (3.33 MB)
- `public/models/shoe_low.glb` - Lower-poly shoe (2.59 MB)

## Technical Details 🛠️

- **Renderer**: Three.js with WebGL
- **Lighting**: Ambient + directional for PS1 look
- **Shadows**: Enabled with PCF shadow mapping
- **Controls**: OrbitControls for camera manipulation
- **Materials**: MeshLambertMaterial with flat shading
- **Textures**: sRGB color space, nearest filtering, no mipmaps

This renderer validates that GLB loading and PS1-style material conversion works properly before integrating into the main game.