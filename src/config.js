// Configuration for Chrome Extension
// This file reads environment variables and makes them available to the extension
// Built by Vite and injected into the extension at build time

window.EXTENSION_CONFIG = {
  OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY || '',
  ENABLE_AI_ANALYSIS: import.meta.env.VITE_ENABLE_AI_ANALYSIS === 'true'
};
