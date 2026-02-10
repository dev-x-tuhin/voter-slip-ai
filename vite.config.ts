import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');

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
      // Prevent "process is not defined" error in libraries by defining an empty object
      'process.env': JSON.stringify({}), 
    }
  };
});