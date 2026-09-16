<script setup lang="ts">
import BassFretboard from '@/components/bass-simiulator/BassFretboard.vue'
</script>

<template>
  <section class="tool-page">
    <header class="tool-header">
      <div>
        <p class="eyebrow">独立工具</p>
        <h2>指板工具</h2>
        <p>自由点击指板，熟悉弦、品位和采样音色；需要时可以打开音名提示。</p>
      </div>
    </header>
    <div class="board-panel">
      <BassFretboard :fret-count="12" :initial-show-note-names="true" :show-toggle="true" />
    </div>
  </section>
</template>

<style scoped>
.tool-page { display: flex; flex-direction: column; gap: 18px; }
.tool-header, .board-panel { padding: 20px; border: 1px solid #dfe3e6; border-radius: 8px; background: #fff; }
.eyebrow { margin: 0 0 4px; color: #e56f4d; font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
h2 { margin: 0; font-size: 24px; }
.tool-header p:last-child { margin: 8px 0 0; color: #68727c; font-size: 13px; }
.board-panel { overflow-x: auto; }
</style>
