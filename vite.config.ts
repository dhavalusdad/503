import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import svgr from 'vite-plugin-svgr';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    svgr({ include: '**/*.svg?react' }),
    // viteCompression({
    //   algorithm: 'brotliCompress',
    //   deleteOriginFile: false,
    // }),
  ],

  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },

  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },

  build: {
    minify: 'terser',
    target: 'esnext',
    cssCodeSplit: true,
    reportCompressedSize: false,
    sourcemap: false,
    chunkSizeWarningLimit: 500,
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,

        unused: true, // aggressive tree-shaking
        pure_funcs: ['console.info', 'console.debug', 'console.warn'],
      },
      format: {
        comments: false,
      },
    },
  },
});
