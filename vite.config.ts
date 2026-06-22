import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const buildVersion = (process.env.VITE_BUILD_VERSION || String(Date.now())).replace(/[^\w-]/g, "");

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name]-[hash]-${buildVersion}.js`,
        chunkFileNames: `assets/[name]-[hash]-${buildVersion}.js`,
        assetFileNames: `assets/[name]-[hash]-${buildVersion}[extname]`
      }
    }
  },
  server: {
    port: 10106
  },
  preview: {
    port: 10116
  }
});
