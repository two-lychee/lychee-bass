<script setup lang="ts">
import Metronome from '@/components/bass-simiulator/Metronome.vue'
</script>

<template>
  <section class="mx-auto flex w-full max-w-2xl flex-col gap-4">
    <UPageHeader
      headline="独立工具"
      title="节拍器"
      description="练习空弦、律动、扒谱或热身时，可以单独使用节拍器。"
    />

    <Metronome />
  </section>
</template>
