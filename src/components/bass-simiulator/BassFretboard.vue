<template>
  <div class="fretboard-wrapper">
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
      <rect width="100%" height="100%" fill="#d4a574" rx="8" />

      <!-- 品格线（含 0 = 弦枕） -->
      <g v-for="fret in fretCount + 1" :key="`fret-${fret - 1}`">
        <line
          x1="0"
          :y1="(fret - 1) * fretHeight"
          :x2="svgWidth"
          :y2="(fret - 1) * fretHeight"
          stroke="#888"
          :stroke-width="fret === 1 ? 4 : 2"
        />
      </g>

      <!-- 品格数字 -->
      <g v-for="fret in fretCount" :key="`label-${fret}`">
        <text
          :x="svgWidth - 10"
          :y="fret * fretHeight - 10"
          font-size="14"
          fill="#666"
          text-anchor="end"
        >
          {{ fret }}
        </text>
      </g>

      <!-- 圆点标志 -->
      <g v-for="fret in dotFrets" :key="`dot-${fret}`">
        <circle
          :cx="svgWidth / 2"
          :cy="(fret - 0.5) * fretHeight"
          r="6"
          fill="#999"
          opacity="0.5"
        />
      </g>

      <!-- 琴弦 -->
      <g v-for="(x, stringIndex) in stringPositions" :key="`string-${stringIndex}`">
        <line
          :x1="x"
          y1="0"
          :x2="x"
          :y2="svgHeight"
          :stroke="activeString === stringIndex ? '#333' : '#666'"
          :stroke-width="stringThickness[stringIndex]"
        />
      </g>

      <!-- 高亮圆圈（来自外层学习模块） -->
      <g v-for="(mark, i) in highlights" :key="`hl-${i}`">
        <circle
          :cx="stringPositions[mark.stringIndex]"
          :cy="fretCenterY(mark.fret)"
          r="14"
          :fill="mark.color ?? '#ffb74d'"
          :opacity="mark.opacity ?? 0.85"
          stroke="#fff"
          stroke-width="1.5"
        />
        <text
          v-if="mark.label"
          :x="stringPositions[mark.stringIndex]"
          :y="fretCenterY(mark.fret)"
          font-size="12"
          font-weight="bold"
          fill="#222"
          text-anchor="middle"
          dominant-baseline="middle"
        >
          {{ mark.label }}
        </text>
      </g>

      <!-- 点击区 + 音名（fret = 0 即空弦） -->
      <g v-for="(x, stringIndex) in stringPositions" :key="`zones-${stringIndex}`">
        <g v-for="fret in fretCount + 1" :key="fret">
          <rect
            :x="x - stringHitBoxWidth / 2"
            :y="(fret - 1) * fretHeight"
            :width="stringHitBoxWidth"
            :height="fretHeight"
            fill="transparent"
            @mousedown.stop="playNote(stringIndex, fret - 1)"
            @touchstart.stop="playNote(stringIndex, fret - 1)"
          />
          <text
            v-if="showNoteNames && !hasHighlight(stringIndex, fret - 1)"
            :x="x - 15"
            :y="fretCenterY(fret - 1)"
            font-size="15"
            fill="#333"
            text-anchor="middle"
            dominant-baseline="middle"
          >
            {{ stripOctave(calcNote(openNotes[stringIndex], fret - 1)) }}
          </text>
        </g>
      </g>
    </svg>

    <button v-if="showToggle" @click="showNoteNames = !showNoteNames" class="toggle-button">
      {{ showNoteNames ? '隐藏音名' : '显示音名' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import * as Tone from 'tone'
import { STANDARD_TUNING, calcNote, stripOctave } from './music-theory'

export interface FretMark {
  stringIndex: number
  fret: number
  color?: string
  opacity?: number
  label?: string
}

const props = withDefaults(
  defineProps<{
    /** 自定义调弦，默认 E1 A1 D2 G2 */
    tuning?: readonly string[]
    /** 品数（不含空弦） */
    fretCount?: number
    /** 默认是否显示所有音名 */
    initialShowNoteNames?: boolean
    /** 是否显示"显示/隐藏音名"按钮 */
    showToggle?: boolean
    /** 高亮标记（外层学习模块控制） */
    highlights?: FretMark[]
    /** 是否静音点击发声（学习模式可选） */
    muted?: boolean
  }>(),
  {
    tuning: () => STANDARD_TUNING,
    fretCount: 12,
    initialShowNoteNames: false,
    showToggle: true,
    highlights: () => [],
    muted: false,
  },
)

const emit = defineEmits<{
  (e: 'note-played', payload: { stringIndex: number; fret: number; note: string }): void
}>()

const stringCount = 4
const fretHeight = 50
const stringSpacing = 60
const stringHitBoxWidth = 40

const openNotes = computed(() => props.tuning)
const fretCount = computed(() => props.fretCount)

const svgWidth = stringCount * stringSpacing
const svgHeight = computed(() => (fretCount.value + 1) * fretHeight)

const stringPositions = computed(() =>
  Array.from({ length: stringCount }, (_, i) => (i + 1) * stringSpacing - stringSpacing / 2),
)

const stringThickness = [6, 5, 4, 3]
const dotFrets = [3, 5, 7, 9, 12]

const showNoteNames = ref(props.initialShowNoteNames)

const synth = new Tone.MonoSynth({
  oscillator: { type: 'square' },
  filter: { Q: 2, type: 'lowpass', rolloff: -24 },
  envelope: { attack: 0.005, decay: 0.3, sustain: 0.4, release: 1.2 },
  filterEnvelope: {
    attack: 0.005,
    decay: 0.1,
    sustain: 0.8,
    release: 1.5,
    baseFrequency: 200,
    octaves: 3,
  },
}).toDestination()

const activeString = ref<number | null>(null)

const fretCenterY = (fret: number) => fret * fretHeight + fretHeight / 2

const hasHighlight = (stringIndex: number, fret: number) =>
  props.highlights.some((m) => m.stringIndex === stringIndex && m.fret === fret)

const playNote = (stringIndex: number, fret: number) => {
  const note = calcNote(openNotes.value[stringIndex], fret)
  if (!props.muted) synth.triggerAttackRelease(note, '8n')
  activeString.value = stringIndex
  setTimeout(() => (activeString.value = null), 150)
  emit('note-played', { stringIndex, fret, note })
}

const isDragging = ref(false)
const lastPlayed = ref<{ s: number; f: number } | null>(null)

const onMouseDown = () => (isDragging.value = true)
const onMouseMove = (e: MouseEvent) => {
  if (isDragging.value) handlePlayFromEvent(e.offsetX, e.offsetY)
}
const onMouseUp = () => {
  isDragging.value = false
  lastPlayed.value = null
}

const onTouchStart = (e: TouchEvent) => {
  isDragging.value = true
  const touch = e.touches[0]
  const rect = (e.target as HTMLElement).getBoundingClientRect()
  handlePlayFromEvent(touch.clientX - rect.left, touch.clientY - rect.top)
}
const onTouchMove = (e: TouchEvent) => {
  if (isDragging.value) {
    const touch = e.touches[0]
    const rect = (e.target as HTMLElement).getBoundingClientRect()
    handlePlayFromEvent(touch.clientX - rect.left, touch.clientY - rect.top)
  }
}
const onTouchEnd = () => {
  isDragging.value = false
  lastPlayed.value = null
}

const handlePlayFromEvent = (x: number, y: number) => {
  const fret = Math.floor(y / fretHeight)
  const stringIndex = stringPositions.value.findIndex(
    (pos) => Math.abs(x - pos) < stringHitBoxWidth / 2,
  )
  if (fret >= 0 && fret <= fretCount.value && stringIndex >= 0) {
    // 拖动时同一格不重复触发
    if (
      lastPlayed.value &&
      lastPlayed.value.s === stringIndex &&
      lastPlayed.value.f === fret
    ) {
      return
    }
    lastPlayed.value = { s: stringIndex, f: fret }
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
.fretboard-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.bass-svg {
  background: #d4a574;
  border: 2px solid #bbb;
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
  background: #ff8a65;
  color: #fff;
  border: none;
  cursor: pointer;
  height: 30px;
}
</style>
