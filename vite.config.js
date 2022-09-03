// filename: vite.config.ts
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: './src/packages/index.ts',
      name: 'scroller',
      formats: ['es', 'umd', 'iife']
    }
  }
})