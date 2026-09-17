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

const legend = [
  { color: '#ef5350', label: '根音' },
  { color: '#42a5f5', label: '三度' },
  { color: '#ab47bc', label: '五度' },
  { color: '#ffb74d', label: '其它' },
]
</script>

<template>
  <div class="flex flex-wrap items-start justify-center gap-6">
    <UCard class="w-full shrink-0 sm:w-75">
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-1">
          <h2 class="text-lg font-bold text-highlighted">音阶探索</h2>
          <p class="text-sm text-muted">选根音和调式，指板上自动标记。点击音格也能听。</p>
        </div>

        <div class="flex flex-col gap-2">
          <span class="text-sm text-muted">根音</span>
          <div class="flex flex-wrap gap-1">
            <UButton
              v-for="n in NOTE_NAMES"
              :key="n"
              :label="n"
              size="xs"
              :variant="root === n ? 'solid' : 'outline'"
              :color="root === n ? 'primary' : 'neutral'"
              @click="root = n"
            />
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <span class="text-sm text-muted">调式</span>
          <div class="flex flex-wrap gap-1">
            <UButton
              v-for="(label, key) in SCALE_LABELS"
              :key="key"
              :label="label"
              size="xs"
              :variant="scale === key ? 'solid' : 'outline'"
              :color="scale === key ? 'primary' : 'neutral'"
              @click="scale = key"
            />
          </div>
        </div>

        <div class="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted">
          <span v-for="item in legend" :key="item.label" class="inline-flex items-center gap-1.5">
            <i class="inline-block size-2.5 rounded-full" :style="{ background: item.color }" />
            {{ item.label }}
          </span>
        </div>

        <p class="text-sm">
          <span class="text-dimmed">音阶包含：</span>
          <span class="font-mono text-highlighted">{{ scaleNotes.join(' · ') }}</span>
        </p>
      </div>
    </UCard>

    <BassFretboard
      :tuning="customTuning"
      :highlights="highlights"
      :initial-show-note-names="false"
      :show-toggle="true"
    />
  </div>
</template>
