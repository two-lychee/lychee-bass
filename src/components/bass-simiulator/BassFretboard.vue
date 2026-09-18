<template>
  <div class="fretboard-wrapper">
    <!-- 状态条插槽：紧贴指板上方，由外层学习模块填充当前动作信息 -->
    <div v-if="$slots.status" class="fretboard-status">
      <slot name="status" />
    </div>

    <div
      ref="scrollEl"
      class="fretboard-scroll"
      :style="[
        maxWidth ? { maxWidth: `${maxWidth}px` } : undefined,
        maxHeight ? { maxHeight: `${maxHeight}px` } : undefined,
      ]"
    >
      <svg
        ref="svgEl"
        :viewBox="`0 0 ${svgWidth} ${svgHeight}`"
        class="bass-svg"
        v-on="dragEnabled ? dragHandlers : {}"
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
            :y="fret * fretHeight - 8"
            font-size="13"
            fill="#666"
            text-anchor="end"
          >
            {{ fret }}
          </text>
        </g>

        <!-- 单点品记 -->
        <g v-for="fret in visibleSingleDots" :key="`dot-${fret}`">
          <circle
            :cx="svgWidth / 2"
            :cy="(fret - 0.5) * fretHeight"
            r="6"
            fill="#999"
            opacity="0.5"
          />
        </g>

        <!-- 双点品记（12 品 / 24 品） -->
        <g v-for="fret in visibleDoubleDots" :key="`dots-${fret}`">
          <circle
            :cx="svgWidth / 2 - 14"
            :cy="(fret - 0.5) * fretHeight"
            r="6"
            fill="#999"
            opacity="0.5"
          />
          <circle
            :cx="svgWidth / 2 + 14"
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
            :stroke="
              activeString === stringIndex || currentMark?.stringIndex === stringIndex
                ? '#333'
                : '#666'
            "
            :stroke-width="stringThickness[stringIndex]"
          />
        </g>

        <!-- 下一音幽灵标记（空心虚线圈，提示手往哪走） -->
        <g v-if="ghostMark && stringPositions[ghostMark.stringIndex] !== undefined">
          <circle
            :cx="stringPositions[ghostMark.stringIndex]"
            :cy="fretCenterY(ghostMark.fret)"
            r="15"
            fill="none"
            :stroke="ghostMark.color ?? '#ff8a65'"
            stroke-width="2.5"
            stroke-dasharray="5 4"
            opacity="0.85"
          />
          <text
            v-if="ghostMark.label"
            :x="stringPositions[ghostMark.stringIndex]"
            :y="fretCenterY(ghostMark.fret) - 20"
            font-size="11"
            font-weight="bold"
            :fill="ghostMark.color ?? '#ff8a65'"
            text-anchor="middle"
            dominant-baseline="middle"
          >
            {{ ghostMark.label }}
          </text>
        </g>

        <!-- 高亮圆圈（来自外层学习模块；同位重复音合并成一个标记 + ×N 角标） -->
        <g v-for="(mark, i) in highlights" :key="`hl-${i}-${pulseKey}`">
          <!-- 命中扩散波纹：pulseKey 一变就重建节点，动画随之重放 -->
          <circle
            v-if="mark.isCurrent"
            class="hit-ripple"
            :cx="stringPositions[mark.stringIndex]"
            :cy="fretCenterY(mark.fret)"
            r="14"
            fill="none"
            :stroke="mark.color ?? '#ff8a65'"
            stroke-width="2.5"
          />
          <circle
            class="hit-dot"
            :class="{ 'hit-dot--current': mark.isCurrent }"
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
          <!-- 重复音角标：路径提示显示 ×N，当前音显示第几次 / 共几次 -->
          <text
            v-if="mark.hits && mark.hits > 1"
            :x="stringPositions[mark.stringIndex]"
            :y="fretCenterY(mark.fret) - 20"
            font-size="11"
            font-weight="bold"
            fill="#fff"
            stroke="#5d4037"
            stroke-width="3"
            paint-order="stroke"
            text-anchor="middle"
            dominant-baseline="middle"
          >
            {{ mark.isCurrent ? `${mark.occurrence}/${mark.hits}` : `×${mark.hits}` }}
          </text>
        </g>

        <!-- 点击区 + 音名（fret = 0 即空弦） -->
        <g v-for="(x, stringIndex) in stringPositions" :key="`zones-${stringIndex}`">
          <g v-for="fret in fretCount + 1" :key="fret">
            <rect
              v-if="dragEnabled"
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
    </div>

    <button v-if="showToggle" @click="showNoteNames = !showNoteNames" class="toggle-button">
      {{ showNoteNames ? '隐藏音名' : '显示音名' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, watch, withModifiers } from 'vue'
import * as Tone from 'tone'
import { STANDARD_TUNING, calcNote, stripOctave } from './music-theory'

export interface FretMark {
  stringIndex: number
  fret: number
  color?: string
  opacity?: number
  label?: string
  /** 对齐当前正在演奏的音：命中脉冲只在这种标记上播放 */
  isCurrent?: boolean
  /** 该位置在本小节内的击打总次数，>1 时角标显示 ×N */
  hits?: number
  /** 当前是第几次击打（1-based），与 hits 组成 2/4 式进度角标 */
  occurrence?: number
}

const props = withDefaults(
  defineProps<{
    /** 自定义调弦，默认 E1 A1 D2 G2 */
    tuning?: readonly string[]
    /** 品数（不含空弦） */
    fretCount?: number
    /** 每品高度（px，SVG 坐标系），练习页可用较小值做紧凑指板 */
    fretHeight?: number
    /** 默认是否显示所有音名 */
    initialShowNoteNames?: boolean
    /** 是否显示"显示/隐藏音名"按钮 */
    showToggle?: boolean
    /** 高亮标记（外层学习模块控制） */
    highlights?: FretMark[]
    /** 下一音标记：空心虚线圈，不发声、不响应点击 */
    ghostMark?: FretMark | null
    /** 是否允许拖动/点击发声（练习页跟随时应关闭，避免与滚动冲突） */
    dragEnabled?: boolean
    /** 指板容器最大高度（px），超出时纵向滚动 */
    maxHeight?: number
    /** 指板最大渲染宽度（px）：宽容器里不让 viewBox 被无限拉大，否则单格过高、一屏看不到几品 */
    maxWidth?: number
    /** 是否在当前音变化时自动滚动指板，把当前把位带到视野中央 */
    autoScroll?: boolean
    /** 是否静音点击发声（学习模式可选） */
    muted?: boolean
    /** 命中脉冲触发键（练习页传 currentStep），变化时在当前音上重放扩散动画 */
    pulseKey?: number | string
  }>(),
  {
    tuning: () => STANDARD_TUNING,
    fretCount: 12,
    fretHeight: 50,
    initialShowNoteNames: false,
    showToggle: true,
    highlights: () => [],
    ghostMark: null,
    dragEnabled: true,
    maxHeight: 0,
    maxWidth: 0,
    autoScroll: false,
    muted: false,
    pulseKey: '',
  },
)

const emit = defineEmits<{
  (e: 'note-played', payload: { stringIndex: number; fret: number; note: string }): void
}>()

const stringCount = 4
const stringSpacing = 60
const stringHitBoxWidth = 40

const openNotes = computed(() => props.tuning)
const fretCount = computed(() => props.fretCount)
const fretHeight = computed(() => props.fretHeight)

const svgWidth = stringCount * stringSpacing
const svgHeight = computed(() => (fretCount.value + 1) * fretHeight.value)

const stringPositions = computed(() =>
  Array.from({ length: stringCount }, (_, i) => (i + 1) * stringSpacing - stringSpacing / 2),
)

const stringThickness = [6, 5, 4, 3]

// 单点品记；12 / 24 品为双点
const singleDotFrets = [3, 5, 7, 9, 15, 17, 19, 21]
const doubleDotFrets = [12, 24]
const visibleSingleDots = computed(() => singleDotFrets.filter((fret) => fret <= fretCount.value))
const visibleDoubleDots = computed(() => doubleDotFrets.filter((fret) => fret <= fretCount.value))

const showNoteNames = ref(props.initialShowNoteNames)

const fallbackSynth = new Tone.MonoSynth({
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

const samplerLoaded = ref(false)
const samplerFailed = ref(false)

// These samples come from tonejs-instruments' electric bass set.
const sampler = new Tone.Sampler({
  urls: {
    E1: 'E1.mp3',
    G1: 'G1.mp3',
    'A#1': 'As1.mp3',
    'C#1': 'Cs1.mp3',
    E2: 'E2.mp3',
    G2: 'G2.mp3',
    'A#2': 'As2.mp3',
    'C#2': 'Cs2.mp3',
    E3: 'E3.mp3',
    G3: 'G3.mp3',
    'A#3': 'As3.mp3',
    'C#3': 'Cs3.mp3',
    E4: 'E4.mp3',
    G4: 'G4.mp3',
    'A#4': 'As4.mp3',
    'C#4': 'Cs4.mp3',
    'C#5': 'Cs5.mp3',
  },
  baseUrl: '/bass-samples/bass-electric/',
  onload: () => {
    samplerLoaded.value = true
  },
  onerror: () => {
    samplerFailed.value = true
  },
}).toDestination()

const activeString = ref<number | null>(null)

// 当前演奏音所在的弦：走带时让对应琴弦加深，视线能一下落到正确的"轨道"上
const currentMark = computed(() => props.highlights.find((mark) => mark.isCurrent))

const fretCenterY = (fret: number) => fret * fretHeight.value + fretHeight.value / 2

const hasHighlight = (stringIndex: number, fret: number) =>
  props.highlights.some((m) => m.stringIndex === stringIndex && m.fret === fret)

const playNote = (stringIndex: number, fret: number) => {
  const note = calcNote(openNotes.value[stringIndex], fret)
  if (!props.muted) {
    if (samplerLoaded.value) {
      sampler.triggerAttackRelease(note, '8n')
    } else if (samplerFailed.value) {
      fallbackSynth.triggerAttackRelease(note, '8n')
    }
  }
  activeString.value = stringIndex
  setTimeout(() => (activeString.value = null), 150)
  emit('note-played', { stringIndex, fret, note })
}

const svgEl = ref<SVGSVGElement | null>(null)
const scrollEl = ref<HTMLDivElement | null>(null)

// SVG 用 viewBox 自适应容器宽度后，事件坐标需要换算回 SVG 坐标系
const toSvgPoint = (clientX: number, clientY: number) => {
  const svg = svgEl.value
  if (!svg) return null
  const rect = svg.getBoundingClientRect()
  const viewBox = svg.viewBox.baseVal
  if (!rect.width || !rect.height || !viewBox.width || !viewBox.height) return null
  return {
    x: (clientX - rect.left) * (viewBox.width / rect.width),
    y: (clientY - rect.top) * (viewBox.height / rect.height),
  }
}

const isDragging = ref(false)
const lastPlayed = ref<{ s: number; f: number } | null>(null)

const onMouseDown = () => (isDragging.value = true)
const onMouseMove = (e: MouseEvent) => {
  if (isDragging.value) handlePlayFromPoint(toSvgPoint(e.clientX, e.clientY))
}
const onMouseUp = () => {
  isDragging.value = false
  lastPlayed.value = null
}

const onTouchStart = (e: TouchEvent) => {
  isDragging.value = true
  const touch = e.touches[0]
  handlePlayFromPoint(toSvgPoint(touch.clientX, touch.clientY))
}
const onTouchMove = (e: TouchEvent) => {
  if (!isDragging.value) return
  const touch = e.touches[0]
  handlePlayFromPoint(toSvgPoint(touch.clientX, touch.clientY))
}
const onTouchEnd = () => {
  isDragging.value = false
  lastPlayed.value = null
}

// 触摸事件必须 preventDefault 才能阻止页面滚动，用 withModifiers 在开启拖动时才绑定
const dragHandlers = {
  mousedown: onMouseDown,
  mousemove: onMouseMove,
  mouseup: onMouseUp,
  mouseleave: onMouseUp,
  touchstart: withModifiers((e: Event) => onTouchStart(e as TouchEvent), ['prevent']),
  touchmove: withModifiers((e: Event) => onTouchMove(e as TouchEvent), ['prevent']),
  touchend: withModifiers(() => onTouchEnd(), ['prevent']),
}

const handlePlayFromPoint = (point: { x: number; y: number } | null) => {
  if (!point) return
  const fret = Math.floor(point.y / fretHeight.value)
  const stringIndex = stringPositions.value.findIndex(
    (pos) => Math.abs(point.x - pos) < stringHitBoxWidth / 2,
  )
  if (fret >= 0 && fret <= fretCount.value && stringIndex >= 0) {
    // 拖动时同一格不重复触发
    if (lastPlayed.value && lastPlayed.value.s === stringIndex && lastPlayed.value.f === fret) {
      return
    }
    lastPlayed.value = { s: stringIndex, f: fret }
    playNote(stringIndex, fret)
  }
}

// 当前音变化时把指板滚到把位中央，长曲子也能始终看到当前格子
watch(
  () => [props.highlights, props.ghostMark],
  () => {
    if (!props.autoScroll) return
    const mark = props.highlights[0] ?? props.ghostMark
    if (!mark) return
    void nextTick(() => {
      const svg = svgEl.value
      const container = scrollEl.value
      if (!svg || !container) return
      const viewBox = svg.viewBox.baseVal
      const rect = svg.getBoundingClientRect()
      if (!viewBox.height || !rect.height) return
      const yInSvg = mark.fret * fretHeight.value + fretHeight.value / 2
      const yInPx = (yInSvg / viewBox.height) * rect.height
      container.scrollTo({
        top: Math.max(0, yInPx - container.clientHeight / 2),
        behavior: 'smooth',
      })
    })
  },
  { flush: 'post' },
)

const audioUnlocked = ref(false)
const unlockAudio = async () => {
  if (!audioUnlocked.value) {
    await Tone.start()
    audioUnlocked.value = true
  }
}

onUnmounted(() => {
  sampler.dispose()
  fallbackSynth.dispose()
})
</script>

<style scoped>
.fretboard-wrapper {
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.fretboard-status {
  margin-bottom: 8px;
}

.fretboard-scroll {
  width: 100%;
  margin: 0 auto;
  /* 父容器高度不定时等同内容高度；父容器被约束时（如练习页侧栏）填充剩余高度 */
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  background: #d4a574;
  border: 2px solid #bbb;
  border-radius: 8px;
}

.bass-svg {
  display: block;
  width: 100%;
  height: auto;
  margin: 0 auto;
  touch-action: none;
}

.toggle-button {
  margin: 10px auto 0;
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

/* 命中反馈：当前音每走一格重放一次，重复同位的连打也能一下下地"踢"出来 */
.hit-ripple {
  animation: hit-ripple 0.45s ease-out forwards;
  transform-box: fill-box;
  transform-origin: center;
}
@keyframes hit-ripple {
  from {
    r: 14px;
    opacity: 0.7;
  }
  to {
    r: 32px;
    opacity: 0;
  }
}
.hit-dot--current {
  animation: hit-pop 0.32s cubic-bezier(0.34, 1.56, 0.64, 1);
  transform-box: fill-box;
  transform-origin: center;
}
@keyframes hit-pop {
  0% {
    transform: scale(0.7);
  }
  60% {
    transform: scale(1.12);
  }
  100% {
    transform: scale(1);
  }
}
</style>
