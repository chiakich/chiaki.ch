import { defineConfig, type ConfigEnv, type UserConfig } from 'vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig((env: ConfigEnv): UserConfig => ({
  root,
  base: '/assets/story/character/live2d/r5/',
  resolve: {
    extensions: ['.ts', '.js'],
    alias: { '@framework': path.join(root, 'vendor/framework/src') },
  },
  build: {
    target: 'baseline-widely-available',
    assetsDir: 'assets',
    outDir: path.join(root, 'dist'),
    sourcemap: env.mode === 'development',
  },
}))
