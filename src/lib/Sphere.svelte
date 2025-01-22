<script>
    import { T } from '@threlte/core'
    import { Float, MeshLineGeometry, MeshLineMaterial } from '@threlte/extras'
    import { onMount } from 'svelte'

    let rotationX = 0;
    let rotationY = 0;
    let rotationZ = 0;

    onMount(() => {
        const animate = () => {
            rotationY -= 0.0025;
            requestAnimationFrame(animate);
        };
        animate();
    });

    const radius = 3.6;
    const numSpheres = 6;
  
    const positions = Array.from({ length: numSpheres }, (_, i) => {
    const angle = (i / numSpheres) * Math.PI * 2;
    const x = radius * Math.cos(angle);
    const y = -0.88 * Math.sin(angle);  // Adding slight vertical displacement
    const z = radius * Math.sin(angle);
    return [x, y, z];
  });

</script>

    <T.Group position={[0, 0.25, 0]} scale={0.1}> 
        {#each positions as pos}
        <Float speed={2} rotationIntensity={1} rotationSpeed={1} floatIntensity={1}>
            <T.Mesh position={pos} rotation={[0, rotationY, 0]}>
                <T.SphereGeometry args={[0.5, 20, 20]} />
                <T.MeshStandardMaterial wireframe={true} color="white"/>
            </T.Mesh>
        </Float>
        {/each}
</T.Group>