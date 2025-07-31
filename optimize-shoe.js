import { NodeIO } from '@gltf-transform/core';
import { simplify } from '@gltf-transform/functions';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);

async function optimizeShoe() {
  try {
    console.log('Loading shoe.glb...');
    const doc = await io.read('public/models/shoe.glb');
    
    console.log('Applying simplification...');
    await doc.transform(
      simplify({
        ratio: 0.05, // 95% reduction in vertices for ultra low-poly
        error: 0.1, // Allow significant error for aggressive simplification
      })
    );
    
    console.log('Saving optimized shoe_low.glb...');
    await io.write('public/models/shoe_low.glb', doc);
    console.log('✅ Shoe optimization complete!');
  } catch (error) {
    console.error('❌ Error optimizing shoe:', error);
  }
}

optimizeShoe();