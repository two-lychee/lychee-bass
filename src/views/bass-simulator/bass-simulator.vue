<script setup lang="ts">
import { ref } from 'vue'
import BassFretboard from '@/components/bass-simiulator/BassFretboard.vue'
import NoteQuiz from '@/components/bass-simiulator/NoteQuiz.vue'
import ScaleExplorer from '@/components/bass-simiulator/ScaleExplorer.vue'
import AppModal from '@/components/common/AppModal.vue'
import { TUNINGS, type Tuning } from '@/components/bass-simiulator/tunings'

type Mode = 'free' | 'quiz' | 'scale'

const mode = ref<Mode>('free')
const showSettings = ref(false)
const selectedTuning = ref<Tuning>(TUNINGS.standard4)
const showNoteNames = ref(false)

const allItems = [
  { key: 'free' as Mode, label: '自由演奏', icon: '🎸' },
  { key: 'quiz' as Mode, label: '音名训练', icon: '🎯' },
  { key: 'scale' as Mode, label: '音阶探索', icon: '🎼' },
]
</script>

<template>
  <div class="page">
    <div class="header-bar">
      <nav class="tool-nav">
        <button
          v-for="item in allItems"
          :key="item.key"
          class="tool-btn"
          :class="{ active: mode === item.key }"
          @click="mode = item.key"
        >
          <span class="icon">{{ item.icon }}</span>
          <span class="label">{{ item.label }}</span>
        </button>
      </nav>
      <button v-if="mode === 'free'" class="settings-btn" @click="showSettings = true">
        ⚙️ 配置
      </button>
    </div>

    <main class="content">
      <BassFretboard
        v-if="mode === 'free'"
        :tuning="selectedTuning.notes"
        :initial-show-note-names="showNoteNames"
        :show-toggle="true"
      />
      <NoteQuiz v-else-if="mode === 'quiz'" />
      <ScaleExplorer v-else-if="mode === 'scale'" />
    </main>

    <AppModal :show="showSettings" title="指板配置" @close="showSettings = false">
      <div class="settings-content">
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
            默认显示音名
          </label>
        </div>
      </div>
    </AppModal>
  </div>
</template>

<style scoped>
.page {
  color: #333;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.header-bar {
  display: flex;
  gap: 12px;
  align-items: center;
}

.tool-nav {
  flex: 1;
  display: flex;
  gap: 8px;
  padding: 12px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
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
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.settings-btn:hover {
  background: #f5f5f5;
  border-color: #ccc;
}

.tool-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 8px;
  border: 1px solid #e0e0e0;
  background: #fafafa;
  color: #666;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 0;
}

.tool-btn:hover {
  background: #f0f0f0;
  border-color: #ccc;
}

.tool-btn.active {
  background: #ff8a65;
  border-color: #ff8a65;
  color: #fff;
}

.tool-btn .icon {
  font-size: 24px;
}

.tool-btn .label {
  font-size: 12px;
  text-align: center;
  white-space: nowrap;
}

.content {
  width: 100%;
  display: flex;
  justify-content: center;
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
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

.select {
  width: 100%;
  padding: 8px 12px;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  color: #333;
  font-size: 14px;
  cursor: pointer;
}

.desc {
  margin: 0;
  font-size: 12px;
  color: #999;
}

.tuning-notes {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.note-badge {
  padding: 4px 10px;
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
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
  font-weight: normal;
}

.checkbox input[type='checkbox'] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

@media (max-width: 640px) {
  .header-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .tool-nav {
    padding: 8px;
    gap: 6px;
  }

  .tool-btn {
    padding: 10px 6px;
  }

  .tool-btn .icon {
    font-size: 20px;
  }

  .tool-btn .label {
    font-size: 11px;
  }

  .settings-btn {
    width: 100%;
  }
}
</style>
