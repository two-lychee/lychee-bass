<script setup lang="ts">
import Metronome from '@/components/bass-simiulator/Metronome.vue'
</script>

<template>
  <section class="tool-page">
    <header class="tool-header">
      <div>
        <p class="eyebrow">独立工具</p>
        <h2>节拍器</h2>
        <p>练习空弦、律动、扒谱或热身时，可以单独使用节拍器。</p>
      </div>
    </header>
    <Metronome />
  </section>
</template>

<style scoped>
.tool-page { display: flex; flex-direction: column; gap: 18px; max-width: 620px; margin: 0 auto; }
.tool-header { padding: 20px; border: 1px solid #dfe3e6; border-radius: 8px; background: #fff; }
.eyebrow { margin: 0 0 4px; color: #e56f4d; font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
h2 { margin: 0; font-size: 24px; }
.tool-header p:last-child { margin: 8px 0 0; color: #68727c; font-size: 13px; }
:deep(.metronome) { max-width: none; margin: 0; }
</style>
