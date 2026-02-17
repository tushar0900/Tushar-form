import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === "build" ? "/Tushar-form/" : "/",
  build: {
    outDir: "dist",
    emptyOutDir: true,
    minify: "terser",
  },
  server: {
    port: 5173,
    strictPort: false,
    open: true,
  },
}));
