import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.js',
    // helpful for components that import CSS/MUI styles
    css: true,
    // pick up your test files
    include: ['src/**/*.{test,spec}.{js,jsx,ts,tsx}']
  }
})
