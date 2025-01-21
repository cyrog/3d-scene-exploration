<script lang="ts">
    import * as THREE from 'three';
    import { onMount } from 'svelte';
    import { T } from '@threlte/core';
  
    const size = 20;  // Size of the floor (width and depth)
    const gridCount = 50; // Number of particles in the grid (sqrt of the number of particles)
  
    let mesh;
    const positions = new Float32Array(gridCount * gridCount * 3); // Create a 2D grid of particles
    
    // Create a grid of particles
    for (let i = 0; i < gridCount; i++) {
      for (let j = 0; j < gridCount; j++) {
        const index = (i * gridCount + j) * 3;
        positions[index] = (i / (gridCount - 1)) * size - size / 2;  // X position
        positions[index + 1] = 0;  // Y position (static)
        positions[index + 2] = (j / (gridCount - 1)) * size - size / 2;  // Z position
      }
    }
  
    onMount(() => {
      // No animation here, just ensure the particles are rendered
    });
  </script>
  
  <T.Group position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
    <T.Points on:create={({ ref }) => (mesh = ref)}>
      <T.BufferGeometry>
        <T.BufferAttribute attach="attributes-position" array={positions} itemSize={3} />
      </T.BufferGeometry>
      <T.PointsMaterial color="white" size={0.1} />
    </T.Points>
  </T.Group>
  