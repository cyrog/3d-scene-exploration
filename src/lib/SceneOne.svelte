<script lang="ts">
    import * as THREE from 'three'
    import { T } from '@threlte/core';
    import { Sky } from '@threlte/extras';
    import ModelPath from './GLman.svelte';
    import SomeSphere from './Sphere.svelte';
    import { Plane, PlaneGeometry } from 'three';
  
    let scrollY = 15;
    let maxScroll = 30.575;
    let minScroll = scrollY;

    let dirVel = 0.00015;

    const handleScroll = (event: WheelEvent) => {
      scrollY += event.deltaY * dirVel;
      if (scrollY <= minScroll) {
        //scrollY = minScroll;
        dirVel *= -1;
      }
      if (scrollY >= maxScroll) {
        //scrollY = maxScroll;
        dirVel *= -1;
      }
      //console.log(scrollY);
    };
  
    window.addEventListener('wheel', handleScroll);

    const night = {
    turbidity: 20,
    rayleigh: 0.57,
    azimuth: 180,
    elevation: 182.5,
    mieCoefficient: 0.038,
    mieDirectionalG: 0,
    exposure: 0.00
  };

  const sunset = {
    turbidity: 10,
    rayleigh: 3,
    azimuth: 180,
    elevation: 180.5,
    mieCoefficient: 0.005,
    mieDirectionalG: 0.7,
    exposure: 0.37
  };

  // Function to smoothly transition between sunset and night settings
  const interpolate = (start: number, end: number, progress: number) => {
    return start + (end - start) * progress;
  };

  const getSkySettings = () => {
    const startY = 18;
    const endY = 32;
    const progress = Math.max(0, Math.min(1, (scrollY - startY) / (endY - startY)));

    return {
      turbidity: interpolate(sunset.turbidity, night.turbidity, progress),
      rayleigh: interpolate(sunset.rayleigh, night.rayleigh, progress),
      azimuth: interpolate(sunset.azimuth, night.azimuth, progress),
      elevation: interpolate(sunset.elevation, night.elevation, progress),
      mieCoefficient: interpolate(sunset.mieCoefficient, night.mieCoefficient, progress),
      mieDirectionalG: interpolate(sunset.mieDirectionalG, night.mieDirectionalG, progress),
      exposure: interpolate(sunset.exposure, night.exposure, progress)
    };
  };

  </script>
  
  <T.Group rotation.y={scrollY}>
    <T.PerspectiveCamera
      makeDefault
      position={[2 * Math.sin(scrollY / 360),
      scrollY * 0.05,
      1 * Math.cos(scrollY / 360)]}
      fov={60}
      near={0.1}
      far={1000}
    />
  </T.Group>

  
  <!-- T.DirectionalLight position={[5, 5, 5]} intensity={1} /> -->
  <!-- T.AmbientLight intensity={0.2} /> -->

  
  <!--
  <T.Mesh>
    <T.BoxGeometry args={[1, 3, 1]} />
    <T.MeshStandardMaterial color={0x00ff00} />
  </T.Mesh>
-->
  
  <!-- Sky with dynamic elevation based on scrollY -->

  <Sky 
    scale={5}
    turbidity={getSkySettings().turbidity}
    rayleigh={getSkySettings().rayleigh}
    azimuth={getSkySettings().azimuth}
    elevation={getSkySettings().elevation}
    mieCoefficient={getSkySettings().mieCoefficient}
    mieDirectionalG={getSkySettings().mieDirectionalG}
    exposure={getSkySettings().exposure}
  />

  <!-- <Stars/> -->
  <T.Group position={[0, -0.07, 0]} scale={8}> 
    <ModelPath/>
    <SomeSphere/>
  </T.Group>

