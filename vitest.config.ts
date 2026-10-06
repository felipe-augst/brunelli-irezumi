import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    exclude: ['node_modules', '.next', '.claude'],
    projects: [
      {
        // Componentes, hooks e lógica pura (ambiente de navegador)
        extends: true,
        test: {
          name: 'web',
          environment: 'jsdom',
          setupFiles: ['./vitest.setup.tsx'],
          include: ['src/**/*.{test,spec}.{ts,tsx}'],
          exclude: [
            'node_modules',
            '.next',
            '.claude',
            'src/app/api/**',
            'src/proxy.test.ts',
          ],
        },
      },
      {
        // Rotas de API e proxy: ambiente node, com stub de server-only e
        // JWT_SECRET de teste. Usado por testes de rota (#50, #51, #74).
        extends: true,
        test: {
          name: 'server',
          environment: 'node',
          setupFiles: ['./vitest.setup.server.ts'],
          include: ['src/app/api/**/*.test.ts', 'src/proxy.test.ts'],
          env: { JWT_SECRET: 'test-only-jwt-secret-not-for-production' },
        },
      },
    ],
  },
})
