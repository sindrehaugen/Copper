import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  {
    test: {
      name: 'scripts',
      environment: 'node',
      include: ['scripts/**/*.{test,spec}.{mjs,ts,js}'],
    },
  },
  {
    test: {
      name: 'app',
      root: 'app',
      environment: 'jsdom',
      include: ['src/**/*.{test,spec}.{ts,tsx}'],
      setupFiles: [],
    },
  },
  {
    test: {
      name: 'catalog',
      root: 'catalog',
      environment: 'node',
      include: ['src/**/*.{test,spec}.{ts,tsx}'],
    },
  },
  {
    test: {
      name: 'bff',
      root: 'bff',
      environment: 'node',
      include: ['src/**/*.{test,spec}.{ts,tsx}'],
    },
  }
])
