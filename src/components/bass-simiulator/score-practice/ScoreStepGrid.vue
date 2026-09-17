<script setup lang="ts">
import { computed } from 'vue'
import type { ExerciseStep } from '@/music/exercise-data'

const props = defineProps<{
  steps: ExerciseStep[]
  currentStep: number
  isPlaying: boolean
}>()

// 网格列数由当前小节的步数决定，通过 CSS 变量驱动
const gridStyle = computed(() => ({
  '--step-count': String(Math.max(1, props.steps.length)),
  gridTemplateColumns: `repeat(var(--step-count), minmax(32px, 1fr))`,
}))

const staffStyle = computed(() => ({
  '--step-count': String(Math.max(1, props.steps.length)),
  gridTemplateColumns: `repeat(var(--step-count), minmax(20px, 1fr))`,
}))

const stepClass = (index: number) => ({
  'bg-primary/10 !text-primary shadow-[inset_0_-3px_0] shadow-primary':
    props.currentStep === index && props.isPlaying,
  'text-dimmed': props.currentStep > index,
})

const tabLines = computed(() => {
  const strings = [
    { string: 3, name: 'G' },
    { string: 2, name: 'D' },
    { string: 1, name: 'A' },
    { string: 0, name: 'E' },
  ]
  return strings.map((line) => ({
    ...line,
    notes: props.steps.map((step) =>
      step.note?.string === line.string ? String(step.note.fret) : '-',
    ),
  }))
})
</script>

<template>
  <div class="min-w-[520px]">
    <!-- 拍号尺 -->
    <div class="ml-16 grid border-b border-default max-sm:ml-11" :style="gridStyle">
      <div
        v-for="(step, index) in steps"
        :key="`ruler-${index}`"
        class="flex min-h-7 items-center justify-center border-r border-default text-xs text-dimmed"
        :class="step.beat === 0 ? 'font-bold text-highlighted' : ''"
      >
        {{ step.label }}
      </div>
    </div>

    <!-- 右手拨弦 -->
    <div class="grid grid-cols-[64px_minmax(0,1fr)] max-sm:grid-cols-[44px_minmax(0,1fr)]">
      <div class="flex items-center text-xs font-bold text-muted">右手</div>
      <div class="grid" :style="gridStyle">
        <div
          v-for="(step, index) in steps"
          :key="`right-${index}`"
          class="flex min-h-10 items-center justify-center border-r border-default text-muted transition-colors duration-100"
          :class="stepClass(index)"
        >
          <span
            class="text-xl font-bold text-highlighted"
            :class="step.rest ? '!text-dimmed' : ''"
          >{{ step.rightHand ?? '-' }}</span>
        </div>
      </div>
    </div>

    <!-- Tab 指位 -->
    <div class="grid grid-cols-[64px_minmax(0,1fr)] max-sm:grid-cols-[44px_minmax(0,1fr)]">
      <div class="flex items-center text-xs font-bold text-muted">Tab</div>
      <div class="grid" :style="gridStyle">
        <div
          v-for="(step, index) in steps"
          :key="`tab-${index}`"
          class="flex min-h-10 items-center justify-center border-r border-default font-mono text-base font-bold text-muted transition-colors duration-100"
          :class="stepClass(index)"
        >
          <span v-if="step.note">{{ step.note.fret }}</span>
          <span v-else class="text-dimmed">-</span>
        </div>
      </div>
    </div>

    <!-- 拍内位置 -->
    <div class="grid grid-cols-[64px_minmax(0,1fr)] max-sm:grid-cols-[44px_minmax(0,1fr)]">
      <div class="flex items-center text-xs font-bold text-muted">拍内</div>
      <div class="grid" :style="gridStyle">
        <div
          v-for="(step, index) in steps"
          :key="`sub-${index}`"
          class="flex min-h-7 items-center justify-center border-r border-default text-[10px] text-dimmed"
          :class="stepClass(index)"
        >
          {{ step.subdivisionLabel }}
        </div>
      </div>
    </div>

    <div class="my-4 h-px bg-default" aria-hidden="true" />

    <!-- Bass Tab 总览 -->
    <div class="flex flex-col gap-1.5" aria-label="Bass Tab 总览">
      <div v-for="line in tabLines" :key="line.string" class="grid grid-cols-[28px_minmax(0,1fr)] items-center gap-2">
        <span class="text-xs font-bold text-primary">{{ line.name }}</span>
        <div class="grid border-t border-accented" :style="staffStyle">
          <span
            v-for="(note, index) in line.notes"
            :key="`${line.string}-${index}`"
            class="flex min-h-6 items-center justify-center font-mono text-xs text-muted"
            :class="[
              currentStep === index && isPlaying ? 'bg-primary/10 font-bold !text-primary' : '',
              note === '-' ? 'text-dimmed' : '',
            ]"
          >{{ note }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
