<script>
    import { Canvas } from '@threlte/core';
    import SceneOne from '../lib/SceneOne.svelte';
	import { AsciiRenderer } from '@threlte/extras';
    //import ParticleFloor from '../lib/ParticleFloor.svelte';
 </script>
 
 <section class="canvas-wrapper fixed inset-0">
    <Canvas>
      <SceneOne />
     <!-- <AsciiRenderer/> -->
    </Canvas>
  </section>