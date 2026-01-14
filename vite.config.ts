import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Custom plugin to generate config.js for Chrome extension
// Note: API keys are configured by users in the extension settings, not here
function generateExtensionConfig() {
  return {
    name: 'generate-extension-config',
    buildStart() {
      // Generate config.js with empty/default values
      // Users configure their own API key via the extension's options page
      const configContent = `// Auto-generated configuration file
// Note: Users configure their own API key in the extension settings

window.EXTENSION_CONFIG = {
  OPENAI_API_KEY: '',
  ENABLE_AI_ANALYSIS: true
};
`;

      // Write to public folder
      const publicDir = path.resolve(__dirname, 'public');
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }
      fs.writeFileSync(path.resolve(publicDir, 'config.js'), configContent);
      console.log('✓ Generated public/config.js');
      console.log('  - Users configure API key in extension settings');
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig(() => {
  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
      generateExtensionConfig(),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
