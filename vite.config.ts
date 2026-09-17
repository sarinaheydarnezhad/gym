import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/gym/',
  plugins: [react()],
  server: { host: true, port: 5173 },
  test: {
    environment: 'node',
    globals: true,
    pool: 'threads',
    maxWorkers: 1,
  },
})
