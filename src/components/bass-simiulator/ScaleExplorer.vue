<template>
  <div class="scale-explorer">
    <div class="panel">
      <h2>音阶探索</h2>
      <p class="hint">选根音和调式，指板上自动标记。点击音格也能听。</p>

      <div class="control">
        <label>根音</label>
        <div class="chips">
          <button
            v-for="n in NOTE_NAMES"
            :key="n"
            class="chip"
            :class="{ active: root === n }"
            @click="root = n"
          >
            {{ n }}
          </button>
        </div>
      </div>

      <div class="control">
        <label>调式</label>
        <div class="chips">
          <button
            v-for="(label, key) in SCALE_LABELS"
            :key="key"
            class="chip"
            :class="{ active: scale === key }"
            @click="scale = key"
          >
            {{ label }}
          </button>
        </div>
      </div>

      <div class="legend">
        <span><i class="dot" style="background: #ef5350" /> 根音</span>
        <span><i class="dot" style="background: #42a5f5" /> 三度</span>
        <span><i class="dot" style="background: #ab47bc" /> 五度</span>
        <span><i class="dot" style="background: #ffb74d" /> 其它</span>
      </div>

      <div class="notes">
        <span class="muted">音阶包含：</span>
        <span class="note-list">{{ scaleNotes.join(' · ') }}</span>
      </div>
    </div>

    <BassFretboard
      :highlights="highlights"
      :initial-show-note-names="false"
      :show-toggle="true"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import BassFretboard, { type FretMark } from './BassFretboard.vue'
import {
  NOTE_NAMES,
  SCALE_INTERVALS,
  SCALE_LABELS,
  STANDARD_TUNING,
  buildScale,
  calcNote,
  noteRole,
  stripOctave,
  type NoteName,
} from './music-theory'

const root = ref<NoteName>('A')
const scale = ref<keyof typeof SCALE_INTERVALS>('pentatonicMinor')

const FRET_COUNT = 12

const scaleNotes = computed(() => buildScale(root.value, scale.value))

const roleColor: Record<'root' | 'third' | 'fifth' | 'other', string> = {
  root: '#ef5350',
  third: '#42a5f5',
  fifth: '#ab47bc',
  other: '#ffb74d',
}

const highlights = computed<FretMark[]>(() => {
  const marks: FretMark[] = []
  for (let s = 0; s < STANDARD_TUNING.length; s++) {
    for (let f = 0; f <= FRET_COUNT; f++) {
      const noteName = stripOctave(calcNote(STANDARD_TUNING[s], f))
      const role = noteRole(noteName, root.value, scale.value)
      if (role) {
        marks.push({
          stringIndex: s,
          fret: f,
          color: roleColor[role],
          label: noteName,
          opacity: role === 'other' ? 0.7 : 0.95,
        })
      }
    }
  }
  return marks
})
</script>

<style scoped>
.scale-explorer {
  display: flex;
  gap: 24px;
  align-items: flex-start;
  flex-wrap: wrap;
  justify-content: center;
  color: #eee;
}

.panel {
  flex: 0 0 300px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

h2 {
  margin: 0;
}

.hint {
  margin: 0;
  font-size: 13px;
  color: #ccc;
}

.control {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

label {
  font-size: 13px;
  color: #aaa;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.chip {
  padding: 4px 8px;
  font-size: 12px;
  border-radius: 4px;
  border: 1px solid #555;
  background: #3b2f2f;
  color: #ffecb3;
  cursor: pointer;
}

.chip.active {
  background: #ff8a65;
  border-color: #ff8a65;
  color: #fff;
}

.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 12px;
  color: #ccc;
}

.legend .dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 4px;
  vertical-align: middle;
}

.notes {
  font-size: 13px;
}

.note-list {
  color: #ffecb3;
  font-family: monospace;
}

.muted {
  color: #888;
}
</style>
