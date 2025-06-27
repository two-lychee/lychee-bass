<template>
  <svg
    :width="svgWidth"
    :height="svgHeight"
    class="bass-svg"
    @mousedown="onMouseDown"
    @mousemove="onMouseMove"
    @mouseup="onMouseUp"
    @mouseleave="onMouseUp"
    @touchstart.prevent="onTouchStart"
    @touchmove.prevent="onTouchMove"
    @touchend.prevent="onTouchEnd"
    @click="unlockAudio"
  >
    <!-- 指板背景 -->
    <rect width="100%" height="100%" fill="#3b2f2f" rx="8" />

    <!-- 品格线 -->
    <g v-for="fret in fretCount" :key="`fret-${fret}`">
      <line
        x1="0" :y1="fret * fretHeight"
        :x2="svgWidth" :y2="fret * fretHeight"
        stroke="#bbb" stroke-width="2"
      />
    </g>

    <!-- 品格数字 -->
    <g v-for="fret in displayFrets" :key="`label-${fret}`">
      <text
        :x="svgWidth - 10"
        :y="fret * fretHeight - 10"
        font-size="14" fill="#eee" text-anchor="end"
      >{{ fret }}</text>
    </g>

    <!-- 圆点标志 -->
    <g v-for="fret in dotFrets" :key="`dot-${fret}`">
      <circle
        :cx="svgWidth / 2"
        :cy="(fret - 0.5) * fretHeight"
        r="6"
        fill="#eee"
        opacity="0.5"
      />
    </g>

    <!-- 琴弦 -->
    <g v-for="(x, stringIndex) in stringPositions" :key="`string-${stringIndex}`">
      <line
        :x1="x" y1="0"
        :x2="x" :y2="svgHeight"
        :stroke="activeString === stringIndex ? '#fff' : '#ccc'"
        :stroke-width="stringThickness[stringIndex]"
      />
    </g>

    <!-- 点击区 + 音名 -->
    <g v-for="(x, stringIndex) in stringPositions" :key="`zones-${stringIndex}`">
      <g v-for="fret in fretCount" :key="fret">
        <rect
          :x="x - stringHitBoxWidth / 2"
          :y="(fret - 1) * fretHeight"
          :width="stringHitBoxWidth"
          :height="fretHeight"
          fill="transparent"
          @mousedown.stop="playNote(stringIndex, fret)"
          @touchstart.stop="playNote(stringIndex, fret)"
        />
        <text
          v-if="showNoteNames"
          :x="x - 15"
          :y="(fret - 0.5) * fretHeight"
          font-size="15"
          fill="#ffecb3"
          text-anchor="middle"
          dominant-baseline="middle"
        >
          {{ calcNote(stringIndex, fret) }}
        </text>
      </g>
    </g>
  </svg>
  <button @click="showNoteNames = !showNoteNames" class="toggle-button">
    {{ showNoteNames ? '隐藏音名' : '显示音名' }}
  </button>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import * as Tone from 'tone'

const stringCount = 4
const fretCount = 12
const fretHeight = 50
const stringSpacing = 60
const stringHitBoxWidth = 40

const svgWidth = stringCount * stringSpacing
const svgHeight = fretCount * fretHeight

const stringPositions = computed(() =>
  Array.from({ length: stringCount }, (_, i) => (i + 1) * stringSpacing - stringSpacing / 2)
)
const displayFrets = computed(() =>
  Array.from({ length: fretCount }, (_, i) => i + 1) // 1 到 fretCount
)
// 弦由粗到细，左到右对应音高 E0, A0, D1, G1
const openNotes = ['E3', 'A3', 'D4', 'G4']

const stringThickness = [6, 5, 4, 3] // 粗到细弦线宽
const dotFrets = [3, 5, 7, 9, 12]

const showNoteNames = ref(false)

const synth = new Tone.MonoSynth({
  oscillator: {
    type: 'square'
  },
  filter: {
    Q: 2,
    type: 'lowpass',
    rolloff: -24
  },
  envelope: {
    attack: 0.005,
    decay: 0.3,
    sustain: 0.4,
    release: 1.2
  },
  filterEnvelope: {
    attack: 0.005,
    decay: 0.1,
    sustain: 0.8,
    release: 1.5,
    baseFrequency: 200,
    octaves: 3
  }
}).toDestination()

const activeString = ref<number | null>(null)

const calcNote = (stringIndex: number, fret: number) => {
  const openNote = openNotes[stringIndex]
  return Tone.Frequency(openNote).transpose(fret).toNote()
}

const playNote = (stringIndex: number, fret: number) => {
  const note = calcNote(stringIndex, fret)
  synth.triggerAttackRelease(note, '8n')
  activeString.value = stringIndex
  setTimeout(() => (activeString.value = null), 150)
}

const isDragging = ref(false)

const onMouseDown = () => (isDragging.value = true)
const onMouseMove = (e: MouseEvent) => {
  if (isDragging.value) handlePlayFromEvent(e.offsetX, e.offsetY)
}
const onMouseUp = () => (isDragging.value = false)

const onTouchStart = (e: TouchEvent) => {
  isDragging.value = true
  const touch = e.touches[0]
  handlePlayFromEvent(
    touch.clientX - (e.target as HTMLElement).getBoundingClientRect().left,
    touch.clientY - (e.target as HTMLElement).getBoundingClientRect().top
  )
}
const onTouchMove = (e: TouchEvent) => {
  if (isDragging.value) {
    const touch = e.touches[0]
    handlePlayFromEvent(
      touch.clientX - (e.target as HTMLElement).getBoundingClientRect().left,
      touch.clientY - (e.target as HTMLElement).getBoundingClientRect().top
    )
  }
}
const onTouchEnd = () => (isDragging.value = false)

const handlePlayFromEvent = (x: number, y: number) => {
  const fret = Math.floor(y / fretHeight)
  const stringIndex = stringPositions.value.findIndex((pos) => Math.abs(x - pos) < stringHitBoxWidth / 2)
  if (fret >= 0 && fret <= fretCount && stringIndex >= 0) {
    playNote(stringIndex, fret)
  }
}

const audioUnlocked = ref(false)
const unlockAudio = async () => {
  if (!audioUnlocked.value) {
    await Tone.start()
    audioUnlocked.value = true
  }
}
</script>

<style scoped>
.bass-svg {
  background: #3b2f2f;
  border: 2px solid #555;
  display: block;
  margin: 0 auto;
  touch-action: none;
  border-radius: 8px;
}

.toggle-button {
  margin: 10px auto;
  display: block;
  padding: 6px 12px;
  font-size: 14px;
  border-radius: 4px;
  background: #555;
  color: #fff;
  border: none;
  cursor: pointer;
}
</style>
