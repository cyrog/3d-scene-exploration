<script lang="ts">
  import { T, useFrame } from '@threlte/core';
  import { Sky } from '@threlte/extras';
  import ModelPath from './GLman.svelte';

  let scrollY = 0;
  
  const handleScroll = (event: WheelEvent) => {
    scrollY += event.deltaY * 0.01;
  };

  window.addEventListener('wheel', handleScroll);

 // const [gltf] = useLoader(GLTFLoader, '/static/GLman.glb'); // Load your GLB model here

  /*useFrame(() => {
    // Smooth the scroll effect
    scrollY *= 0.95;
  });
  */
</script>

<T.Group rotation.y={scrollY}>
  <T.PerspectiveCamera
    makeDefault
    position={[20 * Math.sin(scrollY / 360), scrollY * 0.05, 2 * Math.cos(scrollY / 360)]}
    fov={60}
    near={0.1}
    far={1000}
    on:create={({ ref }) => ref.lookAt(0, 0, 0)}
  />
</T.Group>

<T.DirectionalLight position={[5, 5, 5]} intensity={1} />
<T.AmbientLight intensity={0.2} />

<T.Mesh>
  <T.BoxGeometry args={[1, 3, 1]} />
  <T.MeshStandardMaterial color={0x00ff00} />
</T.Mesh>

<Sky />
<T.GridHelper />
<ModelPath />