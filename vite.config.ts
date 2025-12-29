import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Vite Configuration for Storyverse
 * 
 * - React 19 with Fast Refresh
 * - Path aliases (@/* → src/*)
 * - Optimized bundle splitting
 * - Mobile-first responsive design
 */
export default defineConfig({
  base: '/storyverse/',
  plugins: [react()],
  
  define: {
    'import.meta.env.VITE_FIGMA_API_TOKEN': JSON.stringify(process.env.FIGMA_API_TOKEN),
  },
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@styles': path.resolve(__dirname, './src/styles'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@services': path.resolve(__dirname, './src/services'),
      '@types': path.resolve(__dirname, './src/types'),
      '@context': path.resolve(__dirname, './src/context'),
    },
  },

  build: {
    target: 'ES2020',
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
        },
      },
    },
  },

  server: {
    port: 5173,
    open: true,
    cors: true,
  },

  preview: {
    port: 4173,
    open: true,
  },

  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
});
