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
      :tuning="customTuning"
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

// 根据根音调整调弦，让指板播放的音更贴合当前音阶
const customTuning = computed(() => {
  const rootIndex = NOTE_NAMES.indexOf(root.value)
  const standardRootIndex = NOTE_NAMES.indexOf('E')
  const shift = rootIndex - standardRootIndex

  return STANDARD_TUNING.map(note => {
    const noteBase = stripOctave(note)
    const octave = note.slice(-1)
    const noteIndex = NOTE_NAMES.indexOf(noteBase)
    const newIndex = (noteIndex + shift + 12) % 12
    return NOTE_NAMES[newIndex] + octave
  }) as readonly string[]
})

const roleColor: Record<'root' | 'third' | 'fifth' | 'other', string> = {
  root: '#ef5350',
  third: '#42a5f5',
  fifth: '#ab47bc',
  other: '#ffb74d',
}

const highlights = computed<FretMark[]>(() => {
  const marks: FretMark[] = []
  for (let s = 0; s < customTuning.value.length; s++) {
    for (let f = 0; f <= FRET_COUNT; f++) {
      const noteName = stripOctave(calcNote(customTuning.value[s], f))
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
  color: #333;
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
  color: #666;
}

.control {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

label {
  font-size: 13px;
  color: #666;
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
  border: 1px solid #e0e0e0;
  background: #fff;
  color: #333;
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
  color: #666;
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
  color: #333;
  font-family: monospace;
}

.muted {
  color: #999;
}
</style>
