<script>
  import { Canvas } from '@threlte/core';
  import Raymarching from '../../lib/Raymarching.svelte';
</script>

<section class="canvas-wrapper fixed inset-0">
  <Canvas camera={{ position: [0, 0, 2.5] }}>
    <Raymarching/>
  </Canvas>
</section>