import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: process.env.GITHUB_REPOSITORY ? `/${process.env.GITHUB_REPOSITORY.split('/')[1]}/` : '/',
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    // Bind on all interfaces and accept the dev-tunnel host so Teams can load
    // the tab over HTTPS during local development.
    host: true,
    allowedHosts: true,
    // When serving through an HTTPS tunnel, set TUNNEL_HOST=<your-tunnel-host>
    // so Vite's HMR websocket connects back over wss:443 (live reload inside
    // the Teams tab). Without it, local HMR behaves normally.
    ...(process.env.TUNNEL_HOST
      ? { hmr: { host: process.env.TUNNEL_HOST, protocol: 'wss', clientPort: 443 } }
      : {}),
  },
})
