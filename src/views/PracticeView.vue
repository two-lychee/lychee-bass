<script setup lang="ts">
import { ref } from 'vue'
import Metronome from '@/components/bass-simiulator/Metronome.vue'
import FingerExercise from '@/components/bass-simiulator/FingerExercise.vue'
import ExerciseSettings, { type ExerciseConfig } from '@/components/bass-simiulator/ExerciseSettings.vue'
import AppModal from '@/components/common/AppModal.vue'

const mode = ref<'metronome' | 'exercise'>('metronome')
const showMetronomeSettings = ref(false)
const showExerciseSettings = ref(false)
const isRunning = ref(false)

const fingerExerciseRef = ref<InstanceType<typeof FingerExercise>>()
const metronomeRef = ref<InstanceType<typeof Metronome>>()
const hiddenMetronomeRef = ref<InstanceType<typeof Metronome>>()

const exerciseConfig = ref<ExerciseConfig>({
  patternIndex: 0,
  startString: 0,
  startFret: 0,
  repeatAcrossStrings: false,
  fretIncrement: 1,
  showNoteName: true,
})

const onBeat = () => {
  if (mode.value === 'exercise' && isRunning.value && fingerExerciseRef.value) {
    fingerExerciseRef.value.nextStep()
  }
}

const startPractice = () => {
  if (mode.value === 'exercise' && fingerExerciseRef.value && hiddenMetronomeRef.value) {
    fingerExerciseRef.value.reset()
    hiddenMetronomeRef.value.start()
  }
  isRunning.value = true
}

const stopPractice = () => {
  if (hiddenMetronomeRef.value) {
    hiddenMetronomeRef.value.stop()
  }
  isRunning.value = false
  if (fingerExerciseRef.value) {
    fingerExerciseRef.value.reset()
  }
}

const updateExerciseConfig = (config: ExerciseConfig) => {
  exerciseConfig.value = config
}
</script>

<template>
  <div class="practice-page">
    <div class="toolbar">
      <div class="mode-switch">
        <button
          class="mode-btn"
          :class="{ active: mode === 'metronome' }"
          :disabled="isRunning"
          @click="mode = 'metronome'"
        >
          节拍器
        </button>
        <button
          class="mode-btn"
          :class="{ active: mode === 'exercise' }"
          :disabled="isRunning"
          @click="mode = 'exercise'"
        >
          爬格子训练
        </button>
      </div>

      <div v-if="mode === 'exercise'" class="controls">
        <button
          class="settings-btn"
          :disabled="isRunning"
          @click="showExerciseSettings = true"
        >
          ⚙️ 爬格子设置
        </button>
        <button
          class="settings-btn"
          :disabled="isRunning"
          @click="showMetronomeSettings = true"
        >
          🥁 节拍器设置
        </button>
        <button
          v-if="!isRunning"
          class="action-btn start"
          @click="startPractice"
        >
          ▶ 开始
        </button>
        <button
          v-else
          class="action-btn stop"
          @click="stopPractice"
        >
          ⏸ 停止
        </button>
      </div>
    </div>

    <div class="main-content">
      <Metronome v-if="mode === 'metronome'" ref="metronomeRef" />
      <FingerExercise v-else ref="fingerExerciseRef" :config="exerciseConfig" />
      <Metronome v-if="mode === 'exercise'" ref="hiddenMetronomeRef" hide-controls style="display: none" @beat="onBeat" />
    </div>

    <AppModal :show="showMetronomeSettings" title="节拍器设置" @close="showMetronomeSettings = false">
      <Metronome hide-controls />
    </AppModal>

    <AppModal :show="showExerciseSettings" title="爬格子设置" @close="showExerciseSettings = false">
      <ExerciseSettings :config="exerciseConfig" @update="updateExerciseConfig" />
    </AppModal>
  </div>
</template>

<style scoped>
.practice-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.mode-switch {
  display: flex;
  gap: 4px;
  background: #fff;
  padding: 4px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.mode-btn {
  padding: 8px 16px;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.mode-btn:hover {
  background: #f5f5f5;
}

.mode-btn.active {
  background: #ff8a65;
  color: #fff;
}

.mode-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.controls {
  display: flex;
  gap: 8px;
}

.settings-btn {
  padding: 8px 16px;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.settings-btn:hover:not(:disabled) {
  background: #f5f5f5;
  border-color: #ccc;
}

.settings-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn {
  padding: 8px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.action-btn.start {
  background: #66bb6a;
  color: #fff;
}

.action-btn.start:hover {
  background: #57a65a;
}

.action-btn.stop {
  background: #e57373;
  color: #fff;
}

.action-btn.stop:hover {
  background: #d95f5f;
}

.main-content {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .controls {
    width: 100%;
    flex-wrap: wrap;
  }

  .settings-btn,
  .action-btn {
    flex: 1;
    min-width: 120px;
  }
}
</style>
