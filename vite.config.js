/**
 * Vite Configuration
 * 
 * Purpose: Configure Vite to work with Rapier's WebAssembly
 * Rapier uses WASM which requires special handling in Vite
 */

import { defineConfig } from 'vite';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';

export default defineConfig({
  plugins: [
    wasm(),
    topLevelAwait()
  ],
  
  // Optional: Configure server
  server: {
    port: 3000,
    open: true // Auto-open browser
  },
  
  // Optional: Optimize dependencies
  optimizeDeps: {
    exclude: ['@dimforge/rapier3d-compat']
  }
});