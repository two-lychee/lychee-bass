import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import ui from '@nuxt/ui/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
    ui({
      ui: {
        colors: {
          primary: 'lychee',
          neutral: 'stone',
        },
      },
    }),
  ],
  // alphaTab 用 `new URL('./alphaTab.worker.mjs', import.meta.url)` 定位渲染 worker，
  // 一旦被预构建打进 .vite/deps，worker 就会解析到不存在的 .vite/deps/alphaTab.worker.mjs，
  // 渲染管线静默挂起（.at-surface 空壳、无报错）。必须保持原始 ESM 结构。
  optimizeDeps: {
    exclude: ['@coderline/alphatab'],
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
