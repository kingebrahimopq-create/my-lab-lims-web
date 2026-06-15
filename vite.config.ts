import path from "path"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "vite"

// GitHub Actions sets GITHUB_ACTIONS=true — use repo-relative base for Pages
// Vercel and local dev use root base
const base = process.env.GITHUB_ACTIONS === 'true' ? '/my-lab-lims-web/' : '/'

export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
