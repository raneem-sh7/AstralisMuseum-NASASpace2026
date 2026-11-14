import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: process.env.GITHUB_ACTIONS === "true" ? "/AstralisMuseum-NASASpace2026/" : "/",
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5000,
    allowedHosts: [".replit.dev"],
  },
  preview: { host: "0.0.0.0" },
});
