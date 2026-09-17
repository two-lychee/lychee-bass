<script setup lang="ts">
import { computed } from 'vue'
import { calcNote, stripOctave, STANDARD_TUNING } from '@/components/bass-simiulator/music-theory'
import type { ExerciseStep, NoteEvent } from '@/music/exercise-data'

const props = defineProps<{
  steps: ExerciseStep[]
  currentStep: number
}>()

const noteNameFor = (note?: NoteEvent) =>
  note ? stripOctave(calcNote(STANDARD_TUNING[note.string], note.fret)) : '休止'

const stringNameFor = (string: number) => ['E', 'A', 'D', 'G'][string] ?? '?'

const correspondence = computed(() => {
  const current = props.steps[Math.max(0, props.currentStep)]
  const note = current?.note
  const nextNote = props.steps
    .slice(Math.max(0, props.currentStep + 1))
    .find((step) => step.note)?.note
  return {
    noteName: noteNameFor(note),
    rhythm: current?.subdivisionLabel ?? '准备开始',
    fretPosition: note ? `${stringNameFor(note.string)}弦 ${note.fret}品` : '休止 / 闷音',
    finger: note ? `左手 ${note.finger} 指` : '左手放松',
    rightHand: note ? (current?.rightHand === '↓' ? '下拨' : '上拨') : '不发音',
    next: nextNote ? `${stringNameFor(nextNote.string)}弦 ${nextNote.fret}品` : '下一小节',
  }
})
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-end justify-between gap-4">
        <div class="flex flex-col gap-1">
          <span class="text-xs font-bold uppercase tracking-wider text-primary">音符对应关系</span>
          <h2 class="text-lg font-bold text-highlighted">看到谱子后，手应该到哪里</h2>
        </div>
        <span class="text-xs text-muted">
          {{ currentStep < 0 ? '准备' : `${currentStep + 1} / ${steps.length}` }}
        </span>
      </div>
    </template>

    <div class="grid grid-cols-1 gap-2 md:grid-cols-[1fr_24px_1.2fr_24px_1fr] md:items-stretch">
      <div class="flex flex-col justify-center gap-1.5 rounded-md bg-primary/5 p-3 ring-1 ring-primary/20">
        <span class="text-xs font-bold text-muted">谱面音符</span>
        <strong class="text-lg text-highlighted">{{ correspondence.noteName }}</strong>
        <small class="text-xs text-muted">{{ correspondence.rhythm }}</small>
      </div>
      <div class="hidden place-items-center text-xl text-primary md:grid" aria-hidden="true">→</div>
      <div class="flex flex-col justify-center gap-1.5 rounded-md bg-muted p-3 ring-1 ring-default">
        <span class="text-xs font-bold text-muted">Tab / 指板</span>
        <strong class="text-lg text-highlighted">{{ correspondence.fretPosition }}</strong>
        <small class="text-xs text-muted">{{ correspondence.noteName }} · {{ correspondence.finger }}</small>
      </div>
      <div class="hidden place-items-center text-xl text-primary md:grid" aria-hidden="true">→</div>
      <div class="flex flex-col justify-center gap-1.5 rounded-md bg-muted p-3 ring-1 ring-default">
        <span class="text-xs font-bold text-muted">右手动作</span>
        <strong class="text-lg text-highlighted">{{ correspondence.rightHand }}</strong>
        <small class="text-xs text-muted">下一步：{{ correspondence.next }}</small>
      </div>
    </div>
  </UCard>
</template>
