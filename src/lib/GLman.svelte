<script>
  import { T } from '@threlte/core'
  import { useGltf, Edges }  from '@threlte/extras'

  let { fallback, error, children, ref = $bindable(), ...props } = $props()

  const gltf = useGltf('/GLman.glb')

</script>

{#await gltf}
  {@render fallback?.()}
{:then gltf}
  <T.Mesh
    geometry={gltf.nodes.GLman_level2.geometry}
    material={gltf.materials.GLman}
  >
   <Edges thresholdAngle={1} color="grey" />
  </T.Mesh>
{:catch err}
  {@render error?.({ error: err })}
{/await}
