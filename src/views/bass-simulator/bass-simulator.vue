<script setup lang="ts">
import { ref } from 'vue'
import BassFretboard from '@/components/bass-simiulator/BassFretboard.vue'
import NoteQuiz from '@/components/bass-simiulator/NoteQuiz.vue'
import ScaleExplorer from '@/components/bass-simiulator/ScaleExplorer.vue'

type Mode = 'free' | 'quiz' | 'scale'

const mode = ref<Mode>('free')

const tabs: { key: Mode; label: string; desc: string }[] = [
  { key: 'free', label: '自由演奏', desc: '点击或拖动指板触发音' },
  { key: 'quiz', label: '音名训练', desc: '识别高亮位置的音名' },
  { key: 'scale', label: '音阶探索', desc: '调式高亮，了解音的角色' },
]
</script>

<template>
  <div class="page">
    <nav class="tabs">
      <button
        v-for="t in tabs"
        :key="t.key"
        class="tab"
        :class="{ active: mode === t.key }"
        @click="mode = t.key"
      >
        <span class="tab-label">{{ t.label }}</span>
        <span class="tab-desc">{{ t.desc }}</span>
      </button>
    </nav>

    <main class="content">
      <BassFretboard v-if="mode === 'free'" :initial-show-note-names="false" />
      <NoteQuiz v-else-if="mode === 'quiz'" />
      <ScaleExplorer v-else-if="mode === 'scale'" />
    </main>
  </div>
</template>

<style scoped>
.page {
  color: #eee;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
}

.tab {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  padding: 10px 16px;
  border: 1px solid #555;
  background: #2c2424;
  color: #ddd;
  border-radius: 6px;
  cursor: pointer;
  min-width: 160px;
}

.tab:hover {
  background: #3a2f2f;
}

.tab.active {
  background: #ff8a65;
  border-color: #ff8a65;
  color: #fff;
}

.tab-label {
  font-size: 14px;
  font-weight: 600;
}

.tab-desc {
  font-size: 11px;
  opacity: 0.8;
}

.content {
  width: 100%;
  display: flex;
  justify-content: center;
}
</style>
