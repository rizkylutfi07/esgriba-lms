import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
  	outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks untuk libraries besar
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-ui": [
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-select",
            "@radix-ui/react-tabs",
            "@radix-ui/react-toast",
            "@radix-ui/react-scroll-area",
            "@radix-ui/react-popover",
            "@radix-ui/react-tooltip",
          ],
          "vendor-table": ["@tanstack/react-table"],
          "vendor-charts": ["recharts"],
          "vendor-utils": ["axios", "zustand", "zod", "date-fns"],
          "vendor-dnd": [
            "@dnd-kit/core",
            "@dnd-kit/sortable",
            "@dnd-kit/utilities",
            "@dnd-kit/modifiers",
          ],
          "vendor-math": ["katex", "dompurify"],
        },
      },
    },
    chunkSizeWarningLimit: 600,
    minify: "esbuild",
    target: "es2015",
  },
  server: {
    host: "0.0.0.0",
    port: 80,
    strictPort: true,
    proxy: {
      "/api": {
        target: "http://202.10.41.193:8000",
        changeOrigin: true,
      },
    },
  },
});
