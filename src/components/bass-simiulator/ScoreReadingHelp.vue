<script setup lang="ts">
import { defineAsyncComponent, ref } from 'vue'

const ScoreReadingGuide = defineAsyncComponent(() => import('./ScoreReadingGuide.vue'))
const isOpen = ref(false)
</script>

<template>
  <details
    class="rounded-lg border border-default bg-default p-4 sm:p-5"
    @toggle="isOpen = ($event.target as HTMLDetailsElement).open"
  >
    <summary class="cursor-pointer text-sm font-semibold text-highlighted">
      如何读谱？展开查看音符、TAB、节奏与常见符号
    </summary>
    <p class="mt-2 text-sm leading-6 text-muted">
      数字看品位，弦线看位置，音符看时值。用逐拍示例分清拨弦、延音和休止。
    </p>
    <ScoreReadingGuide v-if="isOpen" class="mt-6" />
  </details>
</template>
