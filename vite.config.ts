import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Fix: Cast process to any to avoid TypeScript error regarding cwd()
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    define: {
      // Polyfill process.env for the Gemini SDK and other parts of the app
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      'process.env': {}
    },
    server: {
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:3000', // Use IP instead of localhost for better resolution
          changeOrigin: true,
          secure: false,
        }
      }
    },
    build: {
      outDir: 'dist',
    }
  };
});