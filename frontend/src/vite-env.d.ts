/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_BACKEND_URL: string;
    // Add any other environment variables you create here later!
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }