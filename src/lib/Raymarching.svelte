<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { useThrelte } from '@threlte/core';
    import * as THREE from 'three';
    import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
  
    let renderer: THREE.WebGLRenderer;
    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let rayMarchPlane: THREE.Mesh;
    let controls: OrbitControls;
  
    const uniforms = {
      u_eps: { value: 0.001 },
      u_maxDis: { value: 1000 },
      u_maxSteps: { value: 100 },
  
      u_clearColor: { value: new THREE.Color(0x3399ee) },
  
      u_camPos: { value: new THREE.Vector3() },
      u_camToWorldMat: { value: new THREE.Matrix4() },
      u_camInvProjMat: { value: new THREE.Matrix4() },
  
      u_lightDir: { value: new THREE.Vector3(1, 1, 1).normalize() },
      u_lightColor: { value: new THREE.Color(0xffffff) },
  
      u_diffIntensity: { value: 0.5 },
      u_specIntensity: { value: 3 },
      u_ambientIntensity: { value: 0.15 },
      u_shininess: { value: 16 },
  
      u_time: { value: 0 }
    };
  
    const vertexShader = `
      out vec2 vUv; // to send to fragment shader
  
      void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;
  
    const fragmentShader = `
      precision mediump float;
      in vec2 vUv;
  
      uniform vec3 u_clearColor;
      uniform float u_time;
  
      void main() {
        vec2 uv = vUv.xy;
        float color = 0.5 + 0.5 * cos(u_time + uv.x * 10.0);
        gl_FragColor = vec4(vec3(color), 1.0);
      }
    `;
  
    onMount(() => {
      scene = new THREE.Scene();
  
      camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      camera.position.z = 5;
  
      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      document.body.appendChild(renderer.domElement);
  
      // OrbitControls
      controls = new OrbitControls(camera, renderer.domElement);
      controls.maxDistance = 10;
      controls.minDistance = 2;
      controls.enableDamping = true;
  
      // Raymarching Plane
      const geometry = new THREE.PlaneGeometry(2, 2);
      const material = new THREE.ShaderMaterial({
        uniforms,
        vertexShader,
        fragmentShader
      });
      rayMarchPlane = new THREE.Mesh(geometry, material);
      scene.add(rayMarchPlane);
  
      // Handle Resize
      const onResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };
      window.addEventListener('resize', onResize);
  
      onDestroy(() => {
        window.removeEventListener('resize', onResize);
        renderer.dispose();
      });
    });

     // Animation Loop with onFrame
  const onFrame = (time: number) => {
    uniforms.uTime.value = time / 1000;
    invalidate(); // Force re-rendering for animation
  };
  
    useFrame((time) => {
      uniforms.u_time.value = time / 1000;
  
      controls.update();
      renderer.render(scene, camera);
    });
  </script>
  
  <!-- Fullscreen Canvas Wrapper -->
  <style>
    canvas {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
    }
  </style>
  