import { resolve } from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import { builtinModules } from 'node:module'

const external = [...builtinModules, ...builtinModules.map((m) => `node:${m}`)]

export default defineConfig({
  server: {
    port: 3000
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'walletconnect-koinos-sdk-js',
      fileName: 'walletconnect-koinos-sdk-js',
      formats: ['cjs', 'es']
    },
    rollupOptions: {
      external,
      output: {
        globals: {}
      }
    }
  },
  plugins: [dts()]
})
