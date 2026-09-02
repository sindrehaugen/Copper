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
      setupFiles: ['./vitest.setup.ts'],
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
      setupFiles: ['./vitest.setup.ts'],
    },
  },
  {
    test: {
      name: 'acoustics',
      root: 'packages/acoustics',
      environment: 'node',
      include: ['src/**/*.{test,spec}.{ts,tsx}'],
    },
  }
  ,{
    test: {
      name: 'av-physics',
      root: 'packages/av-physics',
      environment: 'node',
      include: ['src/**/*.{test,spec}.{ts,tsx}'],
    },
  }
  ,{
    test: {
      name: "design",
      root: "packages/design",
      environment: "node",
      include: ["src/**/*.{test,spec}.{ts,tsx}"],
    },
  }
])
