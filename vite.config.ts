import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // CRITICAL: This base path './' ensures assets load correctly on GitHub Pages
  // instead of looking for them at the root domain.
  base: './/voter-slip-ai',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  define: {
    // Prevent "process is not defined" crashes in production browser build
    'process.env': {}
  }
});
