/// <reference types="chrome" />

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.json'

export default defineConfig({
  plugins: [
    react(),
    crx({ manifest })
  ]
  // Remove the custom build config - let @crxjs/vite-plugin handle it
})