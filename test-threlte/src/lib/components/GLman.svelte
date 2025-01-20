<script lang="ts">
  import { T } from '@threlte/core';
  import { useGltf } from '@threlte/extras';

  // Use the correct path to the .glb file
  const { gltf, error } = useGltf('/GLman.glb');

  useGltf('/GLman.glb').then(gltf => {
  console.log(gltf); // Log the contents to see the structure of your model
});
</script>

{#await gltf}
  <p>Loading...</p>
{:then gltf}
  <T.Mesh geometry={gltf.nodes.GLman_level2.geometry} material={gltf.materials.GLman} />
{:catch error}
  <p>Error loading model: {error.message}</p>
{/await}
