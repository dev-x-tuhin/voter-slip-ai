import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Fix: Cast process to any to avoid TypeScript error 'Property cwd does not exist on type Process'
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    // CRITICAL: This base path './' ensures assets load correctly on GitHub Pages
    base: './',
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: true,
    },
    define: {
      // Safely inject the API KEY
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      // Define a fallback for process.env to prevent "process is not defined" errors,
      // but do NOT overwrite the specific API_KEY replacement above.
      'process.env.NODE_ENV': JSON.stringify(mode),
    }
  };
});