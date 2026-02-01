import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
// 支援 API_URL / ADMIN_URL（不用 VITE_ 前綴），或 VITE_API_URL / VITE_ADMIN_URL
export default defineConfig(({ mode }) => ({
  define: {
    "import.meta.env.API_URL": JSON.stringify(
      process.env.API_URL || process.env.VITE_API_URL || ""
    ),
    "import.meta.env.ADMIN_URL": JSON.stringify(
      process.env.ADMIN_URL || process.env.VITE_ADMIN_URL || ""
    ),
  },
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
      "/uploads": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
