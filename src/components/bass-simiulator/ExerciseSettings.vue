<template>
  <div class="exercise-settings">
    <div class="control">
      <label>练习模式</label>
      <select v-model="localSettings.patternIndex" class="select">
        <option v-for="(p, i) in patterns" :key="i" :value="i">
          {{ p.name }} ({{ p.sequence.join('-') }})
        </option>
      </select>
    </div>

    <div class="control-row">
      <div class="control">
        <label>起始弦</label>
        <input v-model.number="localSettings.startString" type="number" min="0" max="3" class="input" />
      </div>
      <div class="control">
        <label>起始品</label>
        <input v-model.number="localSettings.startFret" type="number" min="0" max="20" class="input" />
      </div>
    </div>

    <div class="control">
      <label class="checkbox">
        <input v-model="localSettings.repeatAcrossStrings" type="checkbox" />
        跨弦重复
      </label>
    </div>

    <div class="control">
      <label>跨品递增（每轮增加品数）</label>
      <input v-model.number="localSettings.fretIncrement" type="number" min="0" max="5" class="input" />
      <p class="hint">设为0则不递增，设为1则每轮增加1品</p>
    </div>

    <div class="control">
      <label class="checkbox">
        <input v-model="localSettings.showNoteName" type="checkbox" />
        显示音名提示
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'

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
</script>

<style scoped>
.exercise-settings {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 4px;
}

.control {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.control label {
  font-size: 13px;
  color: #666;
  font-weight: 500;
}

.select,
.input {
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  background: #fff;
  color: #333;
}

.control-row {
  display: flex;
  gap: 12px;
}

.control-row .control {
  flex: 1;
}

.checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
  font-weight: normal;
}

.checkbox input {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.hint {
  margin: 4px 0 0;
  font-size: 12px;
  color: #999;
}
</style>
