import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // COOP + COEP headers enable SharedArrayBuffer which MediaPipe's WASM
  // runtime requires. 'credentialless' (not 'require-corp') is used for
  // COEP so Google Fonts and other third-party resources still load normally.
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'credentialless',
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
  },
})