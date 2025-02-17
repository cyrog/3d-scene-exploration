<script context="module">
    export const ssr = false; // Disable SSR for this page
  </script>
  
  <script>
    import { onMount } from 'svelte';
    import * as THREE from 'three';
    import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
  
    let canvas;
  
    onMount(async () => {
      // Ensure this code runs only in the browser
      if (typeof window === 'undefined') return;
  
      // Scene setup
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setClearColor(0xf0f0f0); // Light background color
      canvas.appendChild(renderer.domElement);
  
      camera.position.z = 10;
  
      // Add OrbitControls
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.1;
  
      // Blob positions
      const blobPositions = [
        new THREE.Vector3(-1, 0, 0),
        new THREE.Vector3(1, 0, 0),
        new THREE.Vector3(0, -1, 0),
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(-1, -1, 0),
        new THREE.Vector3(1, 1, 0),
        new THREE.Vector3(0, 0, 0), // This one will follow the cursor
      ];
  
      // Shader material
      const shaderMaterial = new THREE.ShaderMaterial({
        uniforms: {
          blobPositions: { value: blobPositions },
          cursorPosition: { value: new THREE.Vector3() },
          time: { value: 0.0 },
        },
        vertexShader: `
          varying vec3 vPos;
          void main() {
            vPos = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 blobPositions[7];
          uniform vec3 cursorPosition;
          uniform float time;
  
          varying vec3 vPos;
  
          // Smooth-min function
          float smin(float a, float b, float k) {
            float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
            return mix(b, a, h) - k * h * (1.0 - h);
          }
  
          // Sphere SDF
          float sdSphere(vec3 p, float radius) {
            return length(p) - radius;
          }
  
          // Scene SDF
          float sceneSDF(vec3 p) {
            float dist = 1000.0;
  
            for (int i = 0; i < 7; i++) {
              vec3 blobPos = blobPositions[i];
              if (i == 0) {
                blobPos = cursorPosition; // First blob follows the cursor
              }
              float blobDist = sdSphere(p - blobPos, 0.5);
              dist = smin(dist, blobDist, 0.5);
            }
  
            return dist;
          }
  
          // Calculate normal
          vec3 calculateNormal(vec3 p) {
            float d = sceneSDF(p);
            vec2 e = vec2(0.001, 0.0);
            vec3 n = d - vec3(
              sceneSDF(p - e.xyy),
              sceneSDF(p - e.yxy),
              sceneSDF(p - e.yyx)
            );
            return normalize(n);
          }
  
          void main() {
            vec3 rayOrigin = vec3(0, 0, 10);
            vec3 rayDirection = normalize(vPos - rayOrigin);
  
            vec3 p = rayOrigin;
            for (int i = 0; i < 100; i++) {
              float dist = sceneSDF(p);
              if (dist < 0.001) {
                vec3 normal = calculateNormal(p);
                vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
                float diffuse = max(dot(normal, lightDir), 0.0);
                vec3 color = vec3(0.8, 0.5, 0.2) * diffuse + vec3(0.1);
                gl_FragColor = vec4(color, 1.0);
                return;
              }
              p += dist * rayDirection;
            }
  
            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); // Background color
          }
        `,
      });
  
      // Create a full-screen plane for rendering
      const plane = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), shaderMaterial);
      scene.add(plane);
  
      // Handle mouse movement
      document.addEventListener('mousemove', (event) => {
        const x = (event.clientX / window.innerWidth) * 2 - 1;
        const y = -(event.clientY / window.innerHeight) * 2 + 1;
        shaderMaterial.uniforms.cursorPosition.value.set(x * 5, y * 5, 0); // Scale to follow cursor everywhere
      });
  
      // Animation loop
      function animate() {
        requestAnimationFrame(animate);
        shaderMaterial.uniforms.time.value += 0.01;
        shaderMaterial.uniforms.blobPositions.value = blobPositions; // Update blob positions
        controls.update();
        renderer.render(scene, camera);
      }
      animate();
  
      // Cleanup on component destroy
      return () => {
        renderer.dispose();
        controls.dispose();
        document.removeEventListener('mousemove');
      };
    });
  </script>
  
  <div bind:this={canvas} style="width: 100%; height: 100vh;"></div>