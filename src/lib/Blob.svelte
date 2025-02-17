<script lang="ts">
    import * as THREE from 'three';
   // import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
    //import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
    //import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
    import { onMount } from 'svelte';
  
    let container;
  
    onMount(() => {
      // Scene, Camera, Renderer
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xf0f0f0); // Light gray background
  
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
      camera.position.set(0, 0, 5);
  
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      container.appendChild(renderer.domElement);
  
      // Orbit Controls
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
  
      // Lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
      scene.add(ambientLight);
  
      const pointLight = new THREE.PointLight(0xffffff, 1);
      pointLight.position.set(5, 5, 5);
      scene.add(pointLight);
  
      // Shader Material for Blobs
      const fragmentShader = `
        precision highp float;
        uniform float u_time;
        uniform vec3 u_color;
  
        varying vec3 vNormal;
        varying vec3 vPosition;
  
        void main() {
          vec3 light = normalize(vec3(1.0, 1.0, 1.0));
          float diff = max(dot(vNormal, light), 0.0);
          
          vec3 reflection = reflect(-light, vNormal);
          float spec = pow(max(dot(reflection, normalize(-vPosition)), 0.0), 32.0);
  
          vec3 color = u_color * diff + vec3(0.8) * spec;
          gl_FragColor = vec4(color, 0.8);
        }
      `;
  
      const vertexShader = `
        precision highp float;
        uniform float u_time;
        varying vec3 vNormal;
        varying vec3 vPosition;
  
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
  
          vec3 pos = position;
          pos.x += 0.1 * sin(u_time + position.y * 5.0);
          pos.y += 0.1 * cos(u_time + position.x * 5.0);
  
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `;
  
      const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          u_time: { value: 0.0 },
          u_color: { value: new THREE.Color(0x6699ff) }
        },
        transparent: true,
        opacity: 0.9
      });
  
      // Blobs (Spheres)
      const spheres = [];
      for (let i = 0; i < 5; i++) {
        const geometry = new THREE.SphereGeometry(0.5, 64, 64);
        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.set(
          Math.random() * 3 - 1.5,
          Math.random() * 3 - 1.5,
          Math.random() * 3 - 1.5
        );
        spheres.push(sphere);
        scene.add(sphere);
      }
  
      // Load Text: "REPRESENT"
      const fontLoader = new FontLoader();
      fontLoader.load('https://threejs.org/examples/fonts/helvetiker_bold.typeface.json', (font) => {
        const textGeometry = new TextGeometry('REPRESENT', {
          font: font,
          size: 0.3,
          height: 0.1,
          curveSegments: 12,
          bevelEnabled: true,
          bevelThickness: 0.02,
          bevelSize: 0.02,
          bevelSegments: 5
        });
  
        const textMaterial = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.5, roughness: 0.3 });
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        textMesh.position.set(-1.5, 0, 0);
        scene.add(textMesh);
      });
  
      // Animate Blobs
      function animate() {
        material.uniforms.u_time.value += 0.02;
  
        // Floating and Smooth Blending
        spheres.forEach((sphere, index) => {
          sphere.position.x += 0.01 * Math.sin(material.uniforms.u_time.value + index);
          sphere.position.y += 0.01 * Math.cos(material.uniforms.u_time.value + index);
          sphere.position.z += 0.01 * Math.sin(material.uniforms.u_time.value + index * 0.5);
        });
  
        controls.update();
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
      }
  
      animate();
  
      // Resize Handling
      window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      });
    });
  </script>
  
  <style>
    :global(body) {
      margin: 0;
      overflow: hidden;
      background: #f0f0f0;
    }
  
    .shader-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      overflow: hidden;
      z-index: -1;
    }
  </style>
  
  <div class="shader-container" bind:this={container}></div>
  