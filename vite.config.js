import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';

// Export Vite configuration
export default defineConfig({
  plugins: [sveltekit()],
  resolve: {
    alias: {
      // Resolve path issues for Three.js and OrbitControls
      'three/examples/jsm': 'three/examples/jsm'
    }
  },
  optimizeDeps: {
    include: ['three', 'dat.gui']
  },
  ssr: {
    noExternal: ['three', 'dat.gui', '@splinetool/viewer', '@splinetool/loader'] // Exclude Three.js from SSR to avoid issues
  }
});