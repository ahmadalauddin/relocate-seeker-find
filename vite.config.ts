import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { fileURLToPath } from "url";
import { componentTagger } from "lovable-tagger";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        config: path.resolve(__dirname, 'src/config.js'),
      },
      output: {
        entryFileNames: (chunkInfo: { name: string }) => {
          // Output config.js directly to public folder for extension use
          if (chunkInfo.name === 'config') {
            return '../public/config.js';
          }
          return 'assets/[name]-[hash].js';
        },
      },
    },
  },
}));
