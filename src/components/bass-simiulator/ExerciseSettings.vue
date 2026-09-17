<script setup lang="ts">
import { computed, reactive, watch } from 'vue'

export interface ExerciseConfig {
  patternIndex: number
  startString: number
  startFret: number
  repeatAcrossStrings: boolean
  fretIncrement: number
  showNoteName: boolean
}

const patterns = [
  { name: '顺序', sequence: [1, 2, 3, 4] },
  { name: '逆序', sequence: [4, 3, 2, 1] },
  { name: '1243', sequence: [1, 2, 4, 3] },
  { name: '1324', sequence: [1, 3, 2, 4] },
  { name: '1342', sequence: [1, 3, 4, 2] },
  { name: '1423', sequence: [1, 4, 2, 3] },
]

const props = defineProps<{
  config: ExerciseConfig
}>()

const emit = defineEmits<{
  update: [ExerciseConfig]
}>()

const localSettings = reactive({ ...props.config })

watch(localSettings, () => {
  emit('update', { ...localSettings })
})

defineExpose({ patterns })

const patternItems = computed(() =>
  patterns.map((p, i) => ({
    label: `${p.name} (${p.sequence.join('-')})`,
    value: i,
  })),
)
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-col gap-1.5">
      <span class="text-sm font-medium text-muted">练习模式</span>
      <USelect v-model="localSettings.patternIndex" :items="patternItems" value-key="value" />
    </div>

    <div class="flex gap-3">
      <div class="flex flex-1 flex-col gap-1.5">
        <span class="text-sm font-medium text-muted">起始弦</span>
        <UInputNumber v-model="localSettings.startString" :min="0" :max="3" />
      </div>
      <div class="flex flex-1 flex-col gap-1.5">
        <span class="text-sm font-medium text-muted">起始品</span>
        <UInputNumber v-model="localSettings.startFret" :min="0" :max="20" />
      </div>
    </div>

    <UCheckbox v-model="localSettings.repeatAcrossStrings" label="跨弦重复" />

    <div class="flex flex-col gap-1.5">
      <span class="text-sm font-medium text-muted">跨品递增（每轮增加品数）</span>
      <UInputNumber v-model="localSettings.fretIncrement" :min="0" :max="5" />
      <p class="text-xs text-dimmed">设为 0 则不递增，设为 1 则每轮增加 1 品</p>
    </div>

    <UCheckbox v-model="localSettings.showNoteName" label="显示音名提示" />
  </div>
</template>
