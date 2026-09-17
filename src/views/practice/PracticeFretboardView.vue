<script setup lang="ts">
import BassFretboard from '@/components/bass-simiulator/BassFretboard.vue'
</script>

<template>
  <section class="flex flex-col gap-4">
    <UPageHeader
      headline="独立工具"
      title="指板工具"
      description="自由点击指板，熟悉弦、品位和采样音色；需要时可以打开音名提示。"
    />

    <UCard class="overflow-x-auto">
      <BassFretboard :fret-count="12" :initial-show-note-names="true" :show-toggle="true" />
    </UCard>
  </section>
</template>
