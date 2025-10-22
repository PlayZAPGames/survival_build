import react from "@vitejs/plugin-react";
import tailwind from "tailwindcss";
import { defineConfig, loadEnv } from "vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory
  const env = loadEnv(mode, process.cwd(), "");

  return {
    server: {
      port: env.VITE_PORT ? parseInt(env.VITE_PORT) : 5173, // Default to 5173 if not specified
      strictPort: true, // Optional: prevent falling back to another port if specified port is in use
    },
    preview: {
      port: 2025, // Optional: you can change it
      strictPort: true,
      allowedHosts: ['ludo.playzap.games']  // ✅ Add this line
    },
    plugins: [react()],
    base: "./",
    css: {
      postcss: {
        plugins: [tailwind()],
      },
    },
  };
});