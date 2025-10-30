import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

const isGitHubPages = process.env.GITHUB_PAGES === 'true'

export default defineConfig({
  base: isGitHubPages ? '/rainbow_community/' : '/',
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: [
      '.devinapps.com',
    ],
  },
})

