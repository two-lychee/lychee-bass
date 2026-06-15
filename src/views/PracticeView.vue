<script setup lang="ts">
import { ref } from 'vue'
import BassFretboard from '@/components/bass-simiulator/BassFretboard.vue'
import Metronome from '@/components/bass-simiulator/Metronome.vue'
import { TUNINGS, type Tuning } from '@/components/bass-simiulator/tunings'

const selectedTuning = ref<Tuning>(TUNINGS.standard4)
const showNoteNames = ref(false)
</script>

<template>
  <div class="practice-page">
    <div class="sidebar">
      <section class="panel">
        <h3>指板配置</h3>

        <div class="control">
          <label>调弦</label>
          <select v-model="selectedTuning" class="select">
            <option v-for="t in TUNINGS" :key="t.id" :value="t">
              {{ t.name }}
            </option>
          </select>
          <p class="desc">{{ selectedTuning.description }}</p>
          <div class="tuning-notes">
            <span v-for="(note, i) in selectedTuning.notes" :key="i" class="note-badge">
              {{ note }}
            </span>
          </div>
        </div>

        <div class="control">
          <label class="checkbox">
            <input v-model="showNoteNames" type="checkbox" />
            显示音名
          </label>
        </div>
      </section>

      <Metronome />
    </div>

    <div class="main-area">
      <BassFretboard
        :tuning="selectedTuning.notes"
        :initial-show-note-names="showNoteNames"
        :show-toggle="false"
      />
    </div>
  </div>
</template>

<style scoped>
.practice-page {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  align-items: flex-start;
}

.sidebar {
  flex: 0 0 300px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.main-area {
  flex: 1;
  min-width: 300px;
  display: flex;
  justify-content: center;
}

.panel {
  background: #2c2424;
  border: 1px solid #3a3030;
  border-radius: 8px;
  padding: 20px;
  color: #eee;
}

.panel h3 {
  margin: 0 0 16px;
  font-size: 18px;
}

.control {
  margin-bottom: 16px;
}

.control:last-child {
  margin-bottom: 0;
}

.control label {
  display: block;
  font-size: 13px;
  color: #aaa;
  margin-bottom: 8px;
}

.select {
  width: 100%;
  padding: 8px 12px;
  background: #1a1515;
  border: 1px solid #3a3030;
  border-radius: 4px;
  color: #eee;
  font-size: 14px;
  cursor: pointer;
}

.desc {
  margin: 8px 0 0;
  font-size: 12px;
  color: #888;
}

.tuning-notes {
  display: flex;
  gap: 6px;
  margin-top: 8px;
}

.note-badge {
  padding: 4px 10px;
  background: #1a1515;
  border: 1px solid #3a3030;
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
  color: #ff8a65;
}

.checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}

.checkbox input[type='checkbox'] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

@media (max-width: 768px) {
  .practice-page {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
  }
}
</style>
