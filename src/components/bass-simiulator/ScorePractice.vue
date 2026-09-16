<template>
  <section class="score-practice">
    <header class="practice-header">
      <div>
        <p class="eyebrow">谱子驱动练习</p>
        <h1>{{ exercise.title }}</h1>
        <p class="description">{{ exercise.description }}</p>
        <a v-if="exercise.sourceFile" :href="exercise.sourceFile" class="source-score" download>
          保留并下载原始 GP4
        </a>
        <p v-if="importWarning" class="import-warning">{{ importWarning }}</p>
      </div>
      <div class="header-stats">
        <span>{{ currentTimeSignature[0] }}/{{ currentTimeSignature[1] }}</span>
        <span>{{ bpm }} BPM</span>
        <span>第 {{ currentMeasure + 1 }} / {{ exercise.measures.length }} 小节</span>
      </div>
    </header>

    <div class="practice-grid">
      <div class="lesson-column">
        <section class="score-panel">
          <div class="panel-heading">
            <div>
              <span class="panel-kicker">节奏与 Bass Tab</span>
              <h2>跟着当前格练习</h2>
            </div>
            <label class="tempo-control">
              <span>速度</span>
              <input v-model.number="bpm" type="range" min="40" max="140" step="1" />
              <strong>{{ bpm }}</strong>
            </label>
          </div>

          <div class="beat-ruler" :style="trackStyle">
            <div
              v-for="(step, index) in steps"
              :key="`ruler-${index}`"
              class="ruler-cell"
              :class="{ current: currentStep === index, downbeat: step.beat === 0 }"
            >
              {{ step.label }}
            </div>
          </div>

          <div class="rhythm-row">
            <div class="track-label">右手</div>
            <div class="step-track" :style="trackStyle">
              <div
                v-for="(step, index) in steps"
                :key="`right-${index}`"
                class="step-cell right-hand"
                :class="stepClass(index)"
              >
                <span :class="{ rest: step.rest }">{{ step.rightHand ?? '-' }}</span>
              </div>
            </div>
          </div>

          <div class="tab-row">
            <div class="track-label">Tab</div>
            <div class="step-track tab-track" :style="trackStyle">
              <div
                v-for="(step, index) in steps"
                :key="`tab-${index}`"
                class="step-cell tab-cell"
                :class="stepClass(index)"
              >
                <span v-if="step.note">{{ step.note.fret }}</span>
                <span v-else class="rest">-</span>
              </div>
            </div>
          </div>

          <div class="subdivision-row">
            <div class="track-label">拍内</div>
            <div class="step-track" :style="trackStyle">
              <div
                v-for="(step, index) in steps"
                :key="`sub-${index}`"
                class="step-cell subdivision"
                :class="stepClass(index)"
              >
                {{ step.subdivisionLabel }}
              </div>
            </div>
          </div>

          <div class="bar-separator" aria-hidden="true" />

          <div class="tab-staff" aria-label="Bass Tab 总览">
            <div v-for="line in tabLines" :key="line.string" class="tab-line">
              <span class="string-name">{{ line.name }}</span>
              <div class="staff-notes" :style="trackStyle">
                <span
                  v-for="(note, index) in line.notes"
                  :key="`${line.string}-${index}`"
                  class="staff-note"
                  :class="{ active: currentStep === index && isPlaying, empty: note === '-' }"
                >
                  {{ note }}
                </span>
              </div>
            </div>
          </div>
        </section>

        <AlphaTabScoreView
          v-if="exercise.sourceFile"
          :source-file="exercise.sourceFile"
          :track-index="sourceTrackIndex"
          :measure-index="currentMeasure"
          :total-measures="exercise.measures.length"
          :is-playing="isPlaying"
        />

        <section class="action-panel">
          <div class="action-copy">
            <span class="panel-kicker">当前动作</span>
            <strong>{{ currentInstruction.title }}</strong>
            <span>{{ currentInstruction.detail }}</span>
          </div>
          <div class="transport">
            <button class="secondary-action" :disabled="isPlaying || currentMeasure === 0" @click="previousMeasure">上一小节</button>
            <button class="secondary-action" :disabled="isPlaying || currentMeasure >= exercise.measures.length - 1" @click="nextMeasure">下一小节</button>
            <button class="secondary-action" :disabled="isPlaying" @click="resetPractice">重置</button>
            <button class="primary-action" :disabled="isImporting" @click="togglePractice">
              <span>{{ isPlaying ? '暂停练习' : '开始练习' }}</span>
              <span class="action-icon">{{ isPlaying ? 'Ⅱ' : '▶' }}</span>
            </button>
          </div>
        </section>

        <section class="correspondence-panel">
          <div class="panel-heading compact">
            <div><span class="panel-kicker">音符对应关系</span><h2>看到谱子后，手应该到哪里</h2></div>
            <span class="correspondence-step">{{ currentStep < 0 ? '准备' : `${currentStep + 1} / ${steps.length}` }}</span>
          </div>
          <div class="correspondence-grid">
            <div class="correspondence-item notation-item"><span>谱面音符</span><strong>{{ currentCorrespondence.noteName }}</strong><small>{{ currentCorrespondence.rhythm }}</small></div>
            <div class="correspondence-arrow" aria-hidden="true">→</div>
            <div class="correspondence-item"><span>Tab / 指板</span><strong>{{ currentCorrespondence.fretPosition }}</strong><small>{{ currentCorrespondence.noteName }} · {{ currentCorrespondence.finger }}</small></div>
            <div class="correspondence-arrow" aria-hidden="true">→</div>
            <div class="correspondence-item"><span>右手动作</span><strong>{{ currentCorrespondence.rightHand }}</strong><small>下一步：{{ currentCorrespondence.next }}</small></div>
          </div>
        </section>

        <section class="coach-panel">
          <div class="panel-heading compact">
            <div>
              <span class="panel-kicker">动作提示</span>
              <h2>这一拍怎么做</h2>
            </div>
            <span class="status-dot" :class="{ live: isPlaying }" />
          </div>
          <div class="action-card">
            <div class="hand-badge right">右手</div>
            <div>
              <strong>{{ currentInstruction.rightHand }}</strong>
              <span>{{ currentInstruction.rhythm }}</span>
            </div>
          </div>
          <div class="action-card">
            <div class="hand-badge left">左手</div>
            <div>
              <strong>{{ currentInstruction.leftHand }}</strong>
              <span>{{ currentInstruction.note }}</span>
            </div>
          </div>
          <div class="tip-box">
            <strong>练习重点</strong>
            <p>{{ exercise.tip }}</p>
          </div>
        </section>
      </div>

      <aside class="coach-column">
        <section class="fretboard-panel">
          <div class="panel-heading compact">
            <div>
              <span class="panel-kicker">左手路线</span>
              <h2>指板定位</h2>
            </div>
            <span class="position-label">{{ currentInstruction.position }}</span>
          </div>
          <BassFretboard
            :highlights="highlights"
            :fret-count="fretCount"
            :initial-show-note-names="false"
            :show-toggle="false"
            muted
          />
        </section>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import * as Tone from 'tone'
import BassFretboard, { type FretMark } from './BassFretboard.vue'
import AlphaTabScoreView from './AlphaTabScoreView.vue'
import { calcNote, stripOctave, STANDARD_TUNING } from './music-theory'
import {
  loadGuitarProScore,
  type ImportedScore,
  type ImportedScoreBar,
  type ImportedScoreNote,
  type ImportedScoreTrack,
} from '@/music/guitar-pro'

type RightHand = '↓' | '↑' | '×' | '-'
type NoteEvent = { string: number; fret: number; finger: 1 | 2 | 3 | 4 }
type ExerciseStep = {
  beat: number
  label: string
  subdivisionLabel: string
  rightHand: RightHand
  rest?: boolean
  note?: NoteEvent
}
type Exercise = {
  id: string
  title: string
  description: string
  shortDescription: string
  level: string
  tip: string
  timeSignature: [number, number]
  measureSignatures?: Array<[number, number]>
  measures: ExerciseStep[][]
  subdivisionsPerBeat: 2 | 4
  sourceFile?: string
}

const makeSteps = (pattern: Array<{ rightHand: RightHand; note?: NoteEvent; rest?: boolean }>) =>
  pattern.map((item, index) => ({
    ...item,
    beat: Math.floor(index / 2),
    label: index % 2 === 0 ? String(Math.floor(index / 2) + 1) : '&',
    subdivisionLabel: index % 2 === 0 ? '正拍' : '反拍',
  }))

const exercises: Exercise[] = [
  {
    id: 'eighth-alternating',
    title: '八分音符交替拨弦',
    description: '先建立稳定的正拍与反拍，再把注意力放到左右手同步。',
    shortDescription: '↓ ↑ 交替，固定两根弦',
    level: '入门 01',
    tip: '右手保持均匀摆动，即使某个反拍暂时不弹，也不要让手停下来。',
    timeSignature: [4, 4],
    subdivisionsPerBeat: 2,
    measures: [
      makeSteps([
        { rightHand: '↓', note: { string: 0, fret: 3, finger: 1 } },
        { rightHand: '↑', note: { string: 0, fret: 5, finger: 3 } },
        { rightHand: '↓', note: { string: 1, fret: 3, finger: 1 } },
        { rightHand: '↑', note: { string: 1, fret: 5, finger: 3 } },
        { rightHand: '↓', note: { string: 0, fret: 3, finger: 1 } },
        { rightHand: '↑', note: { string: 0, fret: 5, finger: 3 } },
        { rightHand: '↓', note: { string: 1, fret: 3, finger: 1 } },
        { rightHand: '↑', note: { string: 1, fret: 5, finger: 3 } },
      ]),
    ],
  },
  {
    id: 'offbeat-groove',
    title: '反拍律动',
    description: '正拍保持右手运动，声音只落在反拍，感受节奏中的留白。',
    shortDescription: '正拍休止，反拍发音',
    level: '入门 02',
    tip: '不要把休止当成停顿，右手继续做下上动作，只有发音时才接触琴弦。',
    timeSignature: [4, 4],
    subdivisionsPerBeat: 2,
    measures: [
      makeSteps([
        { rightHand: '-', rest: true },
        { rightHand: '↑', note: { string: 0, fret: 3, finger: 1 } },
        { rightHand: '-', rest: true },
        { rightHand: '↑', note: { string: 1, fret: 3, finger: 1 } },
        { rightHand: '-', rest: true },
        { rightHand: '↑', note: { string: 0, fret: 5, finger: 3 } },
        { rightHand: '-', rest: true },
        { rightHand: '↑', note: { string: 1, fret: 5, finger: 3 } },
      ]),
    ],
  },
  {
    id: 'syncopation',
    title: '切分与闷音',
    description: '把重音放在拍与拍之间，用闷音连接动作，让律动更有方向。',
    shortDescription: '切分重音 + 闷音',
    level: '入门 03',
    tip: '闷音也要和节拍器对齐，它是节奏的一部分，不是没有弹奏。',
    timeSignature: [4, 4],
    subdivisionsPerBeat: 2,
    measures: [
      makeSteps([
        { rightHand: '↓', note: { string: 0, fret: 3, finger: 1 } },
        { rightHand: '×', rest: true },
        { rightHand: '↓', note: { string: 0, fret: 3, finger: 1 } },
        { rightHand: '↑', note: { string: 0, fret: 5, finger: 3 } },
        { rightHand: '×', rest: true },
        { rightHand: '↑', note: { string: 1, fret: 3, finger: 1 } },
        { rightHand: '↓', note: { string: 1, fret: 5, finger: 3 } },
        { rightHand: '×', rest: true },
      ]),
    ],
  },
]

const route = useRoute()
const importedExercise = ref<Exercise | null>(null)
const isImporting = ref(false)
const importError = ref('')
const importWarning = ref('')
const importedScoreConfigs = {
  'shoot-the-moon-gp4': {
    sourceFile: '/file/Jones, Norah - Shoot The Moon.gp4',
    trackIndex: 0,
    startBar: 0,
    preserveBassPosition: false,
    level: 'GP4 导入',
  },
  'wickerman-bass-gp4': {
    sourceFile: '/file/Iron Maiden - Wickerman (Bass).gp4',
    trackIndex: 0,
    startBar: 0,
    preserveBassPosition: true,
    level: 'Bass GP4',
  },
} as const

type ImportedScoreId = keyof typeof importedScoreConfigs

const isImportedScoreId = (id: string): id is ImportedScoreId => id in importedScoreConfigs

const createImportedPlaceholder = (id: ImportedScoreId): Exercise => ({
  id,
  title: '正在读取 Guitar Pro 曲谱...',
  description: '正在保留原始轨道数据并生成练习。',
  shortDescription: 'GP4 导入',
  level: importedScoreConfigs[id].level,
  tip: '原始曲谱数据会完整保留，练习页面只生成当前乐器的派生视图。',
  timeSignature: [4, 4],
  subdivisionsPerBeat: 2,
  measures: [makeSteps(Array.from({ length: 8 }, () => ({ rightHand: '-', rest: true })))],
  sourceFile: importedScoreConfigs[id].sourceFile,
})

const requestedImportedId =
  typeof route.query.exercise === 'string' && isImportedScoreId(route.query.exercise)
    ? route.query.exercise
    : null
const importedPlaceholder = requestedImportedId
  ? createImportedPlaceholder(requestedImportedId)
  : {
      ...createImportedPlaceholder('shoot-the-moon-gp4'),
      id: 'uploaded-gp',
      title: '正在读取导入的 Guitar Pro 曲谱...',
      sourceFile: undefined,
    }
const serverScoreId = typeof route.query.serverScore === 'string' ? route.query.serverScore : null
const selectedId = ref(
  serverScoreId
    ? 'uploaded-gp'
    : typeof route.query.exercise === 'string' &&
    (exercises.some((item) => item.id === route.query.exercise) ||
      isImportedScoreId(route.query.exercise))
    ? route.query.exercise
    : exercises[0].id,
)
const exercise = computed(() => {
  if (isImportedScoreId(selectedId.value) || selectedId.value === 'uploaded-gp') {
    return importedExercise.value ?? importedPlaceholder
  }
  return exercises.find((item) => item.id === selectedId.value) ?? exercises[0]
})
const currentMeasure = ref(0)
const steps = computed(() => exercise.value.measures[currentMeasure.value] ?? [])
const currentTimeSignature = computed(
  () => exercise.value.measureSignatures?.[currentMeasure.value] ?? exercise.value.timeSignature,
)
const trackStyle = computed(() => ({ '--step-count': String(Math.max(1, steps.value.length)) }))
const bpm = ref(70)
const currentStep = ref(-1)
const sourceTrackIndex = ref(0)
const isPlaying = ref(false)
let timer: number | null = null

const sampler = new Tone.Sampler({
  urls: { E1: 'E1.mp3', G1: 'G1.mp3', 'A#1': 'As1.mp3', 'C#2': 'Cs2.mp3' },
  baseUrl: '/bass-samples/bass-electric/',
}).toDestination()

const BASS_OPEN_MIDI = [28, 33, 38, 43]

const mapGuitarNoteToBass = (note: ImportedScoreNote): NoteEvent | undefined => {
  let midi = note.midi
  while (midi > BASS_OPEN_MIDI[3]) midi -= 12

  for (let string = BASS_OPEN_MIDI.length - 1; string >= 0; string--) {
    const fret = midi - BASS_OPEN_MIDI[string]
    if (fret >= 0 && fret <= 12) {
      return {
        string,
        fret,
        finger: Math.max(1, Math.min(4, fret || 1)) as 1 | 2 | 3 | 4,
      }
    }
  }
  return undefined
}

const fingerForFret = (fret: number): 1 | 2 | 3 | 4 =>
  Math.max(1, Math.min(4, fret || 1)) as 1 | 2 | 3 | 4

const mapTrackNote = (
  note: ImportedScoreNote,
  preserveBassPosition: boolean,
): NoteEvent | undefined => {
  if (!preserveBassPosition) return mapGuitarNoteToBass(note)
  const string = note.string - 1
  if (string < 0 || string > 3) return mapGuitarNoteToBass(note)
  return { string, fret: note.fret, finger: fingerForFret(note.fret) }
}

const stepLabels = (index: number, denominator: number) => {
  const slotsPerBeat = Math.max(1, Math.round(16 / denominator))
  const subdivision = index % slotsPerBeat
  const beat = Math.floor(index / slotsPerBeat)
  const labels = slotsPerBeat === 4 ? ['1', 'e', '&', 'a'] : slotsPerBeat === 2 ? ['1', '&'] : ['1']
  const names = slotsPerBeat === 4 ? ['正拍', '十六分', '反拍', '十六分'] : ['正拍', '反拍']
  return {
    beat,
    label: subdivision === 0 ? String(beat + 1) : labels[subdivision] ?? '',
    subdivisionLabel: names[subdivision] ?? '拍内',
  }
}

const convertBar = (bar: ImportedScoreBar, preserveBassPosition: boolean): ExerciseStep[] => {
  const [, denominator] = bar.timeSignature
  const expectedSlots = Math.max(1, Math.round(bar.timeSignature[0] * (16 / denominator)))
  const steps: ExerciseStep[] = []

  for (const beat of bar.beats) {
    const durationSlots = Math.max(1, Math.round(16 / Math.max(1, beat.duration)))
    const sourceNote = [...beat.notes].sort((a, b) => a.midi - b.midi)[0]
    const note = sourceNote ? mapTrackNote(sourceNote, preserveBassPosition) : undefined
    const index = steps.length
    steps.push({
      ...stepLabels(index, denominator),
      rightHand: note ? (index % 2 === 0 ? '↓' : '↑') : '-',
      note,
      rest: beat.isRest || !note,
    })
    for (let held = 1; held < durationSlots; held++) {
      const heldIndex = steps.length
      steps.push({ ...stepLabels(heldIndex, denominator), rightHand: '-', rest: true })
    }
  }

  while (steps.length < expectedSlots) {
    const index = steps.length
    steps.push({ ...stepLabels(index, denominator), rightHand: '-', rest: true })
  }
  return steps
}

const scoreToExercise = (
  score: ImportedScore,
  track: ImportedScoreTrack,
  options: { id: string; level: string; sourceFile: string; preserveBassPosition: boolean },
): Exercise => {
  if (!track.bars.length) throw new Error('The imported score has no readable bars')
  const measures = track.bars.map((bar) => convertBar(bar, options.preserveBassPosition))
  return {
    id: options.id,
    title: score.title || 'Imported Guitar Pro score',
    description: `${score.artist || 'Unknown artist'} · ${track.name || 'Track 1'} · ${track.bars.length} 小节`,
    shortDescription: '完整 Guitar Pro 曲谱导入',
    level: options.level,
    tip: options.preserveBassPosition
      ? '弦号和品位来自原始 Bass 轨道；播放到小节末尾后会自动进入下一小节。'
      : '原轨道已映射到 Bass 音域；播放到小节末尾后会自动进入下一小节。',
    timeSignature: track.bars[0].timeSignature,
    measureSignatures: track.bars.map((bar) => bar.timeSignature),
    measures,
    subdivisionsPerBeat: 4,
    sourceFile: options.sourceFile,
  }
}

const loadImportedExercise = async () => {
  isImporting.value = true
  importError.value = ''
  try {
    if (serverScoreId) {
      const response = await fetch(`/api/scores/${encodeURIComponent(serverScoreId)}/practice`)
      if (!response.ok) throw new Error('无法从曲谱服务读取该文件')
      const result = (await response.json()) as {
        title: string
        artist: string
        album: string
        tempo: number
        track: ImportedScoreTrack
        warning?: string
        trackIndex?: number
      }
      importWarning.value = result.warning || ''
      sourceTrackIndex.value = result.trackIndex ?? 0
      const score: ImportedScore = {
        title: result.title,
        artist: result.artist,
        album: result.album,
        tempo: result.tempo,
        tracks: [result.track],
      }
      const preserveBassPosition =
        result.track.tuning.length === 4 ||
        (result.track.program >= 32 && result.track.program <= 39) ||
        /bass|harris/i.test(result.track.name)
      importedExercise.value = scoreToExercise(score, result.track, {
        id: 'uploaded-gp',
        level: '用户导入',
        sourceFile: `/api/scores/${encodeURIComponent(serverScoreId)}/file`,
        preserveBassPosition,
      })
      bpm.value = result.tempo || 80
      return
    }

    if (!isImportedScoreId(selectedId.value)) return
    const config = importedScoreConfigs[selectedId.value]
    const score = await loadGuitarProScore(config.sourceFile)
    const track = score.tracks[config.trackIndex]
    if (!track) throw new Error('The imported score has no readable track')
    importedExercise.value = scoreToExercise(score, track, {
      id: selectedId.value,
      level: config.level,
      sourceFile: config.sourceFile,
      preserveBassPosition: config.preserveBassPosition,
    })
    sourceTrackIndex.value = config.trackIndex
    bpm.value = score.tempo || 80
  } catch (error) {
    importError.value = error instanceof Error ? error.message : '无法读取 GP4 曲谱'
    importedPlaceholder.title = 'GP4 曲谱读取失败'
    importedPlaceholder.description = importError.value
  } finally {
    isImporting.value = false
  }
}

const stepClass = (index: number) => ({
  current: currentStep.value === index && isPlaying.value,
  played: currentStep.value > index,
})

const current = computed(() => steps.value[Math.max(0, currentStep.value)] ?? steps.value[0])
const currentInstruction = computed(() => {
  const step = current.value
  if (!step) {
    return { title: '空小节', detail: '这一小节没有可播放内容。', rightHand: '休止', rhythm: '等待', leftHand: '放松左手', note: '休止', position: '准备下一小节' }
  }
  const note = step.note
  if (!note) {
    return {
      title: step.rightHand === '×' ? '右手闷音' : '保持右手运动',
      detail: '这一格不发出音高，但动作不能停。',
      rightHand: step.rightHand === '×' ? '轻触琴弦' : '不发音',
      rhythm: step.subdivisionLabel,
      leftHand: '放松左手',
      note: '休止 / 闷音',
      position: '准备下一拍',
    }
  }
  const noteName = stripOctave(calcNote(STANDARD_TUNING[note.string], note.fret))
  return {
    title: `第 ${note.string + 1} 弦 · ${note.fret} 品`,
    detail: `左手建议使用 ${note.finger} 指，跟随当前拍完成动作。`,
    rightHand: step.rightHand === '↓' ? '下拨' : '上拨',
    rhythm: step.subdivisionLabel,
    leftHand: `${note.finger} 指`,
    note: `${noteName} · ${note.fret} 品`,
    position: `${note.string === 0 ? 'E' : 'A'} 弦 ${note.fret} 品`,
  }
})

const noteNameFor = (note?: NoteEvent) =>
  note ? stripOctave(calcNote(STANDARD_TUNING[note.string], note.fret)) : '休止'
const stringNameFor = (string: number) => ['E', 'A', 'D', 'G'][string] ?? '?'
const currentCorrespondence = computed(() => {
  const note = current.value?.note
  const nextNote = steps.value.slice(Math.max(0, currentStep.value + 1)).find((step) => step.note)?.note
  return {
    noteName: noteNameFor(note),
    rhythm: current.value?.subdivisionLabel ?? '准备开始',
    fretPosition: note ? `${stringNameFor(note.string)}弦 ${note.fret}品` : '休止 / 闷音',
    finger: note ? `左手 ${note.finger} 指` : '左手放松',
    rightHand: note ? (current.value?.rightHand === '↓' ? '下拨' : '上拨') : '不发音',
    next: nextNote ? `${stringNameFor(nextNote.string)}弦 ${nextNote.fret}品` : '下一小节',
  }
})

const highlights = computed<FretMark[]>(() => {
  const note = current.value?.note
  if (!note || !isPlaying.value) return []
  return [{ stringIndex: note.string, fret: note.fret, color: '#ff8a65', opacity: 0.95, label: String(note.finger) }]
})

const fretCount = computed(() => {
  const highestFret = exercise.value.measures.reduce(
    (highest, measure) => Math.max(highest, ...measure.map((step) => step.note?.fret ?? 0)),
    0,
  )
  return Math.max(12, Math.min(24, highestFret))
})

const tabLines = computed(() => {
  const strings = [
    { string: 3, name: 'G' },
    { string: 2, name: 'D' },
    { string: 1, name: 'A' },
    { string: 0, name: 'E' },
  ]
  return strings.map((line) => ({
    ...line,
    notes: steps.value.map((step) => (step.note?.string === line.string ? String(step.note.fret) : '-')),
  }))
})

const playCurrentStep = () => {
  const step = steps.value[currentStep.value]
  if (!step?.note) return
  const note = calcNote(STANDARD_TUNING[step.note.string], step.note.fret)
  sampler.triggerAttackRelease(note, '8n')
}

const stopTimer = () => {
  if (timer !== null) window.clearInterval(timer)
  timer = null
  isPlaying.value = false
}

const advance = () => {
  if (currentStep.value >= steps.value.length - 1) {
    if (currentMeasure.value >= exercise.value.measures.length - 1) {
      stopTimer()
      return
    }
    currentMeasure.value++
    currentStep.value = 0
    playCurrentStep()
    return
  }
  currentStep.value++
  playCurrentStep()
}

const startPractice = async () => {
  await Tone.start()
  stopTimer()
  currentStep.value = 0
  isPlaying.value = true
  playCurrentStep()
  const interval = Math.round(60000 / bpm.value / exercise.value.subdivisionsPerBeat)
  timer = window.setInterval(advance, interval)
}

const resetPractice = () => {
  stopTimer()
  currentMeasure.value = 0
  currentStep.value = -1
}

const previousMeasure = () => {
  currentMeasure.value = Math.max(0, currentMeasure.value - 1)
  currentStep.value = -1
}

const nextMeasure = () => {
  currentMeasure.value = Math.min(exercise.value.measures.length - 1, currentMeasure.value + 1)
  currentStep.value = -1
}

const togglePractice = () => {
  if (isPlaying.value) stopTimer()
  else void startPractice()
}

onMounted(() => {
  if (serverScoreId || isImportedScoreId(selectedId.value)) void loadImportedExercise()
})

onUnmounted(() => {
  stopTimer()
  sampler.dispose()
})
</script>

<style scoped>
.score-practice { color: #27313b; display: flex; flex-direction: column; gap: 20px; }
.practice-header, .list-heading { display: flex; justify-content: space-between; align-items: flex-end; gap: 20px; }
.eyebrow, .panel-kicker, .option-level { color: #e56f4d; font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
h1, h2, p { margin: 0; }
h1 { margin-top: 4px; font-size: 30px; line-height: 1.15; }
h2 { margin-top: 4px; font-size: 18px; }
.description { margin-top: 8px; color: #68727c; max-width: 620px; }
.source-score { display: inline-block; margin-top: 8px; color: #d75c3a; font-size: 12px; text-decoration: none; }
.source-score:hover { color: #a9452c; }
.import-warning { max-width: 760px; margin-top: 10px; padding: 10px 12px; border-left: 3px solid #e5b04d; background: #fffaf0; color: #725a2d; font-size: 13px; line-height: 1.5; }
.correspondence-panel { padding: 20px; border: 1px solid #dfe3e6; border-radius: 8px; background: #fff; }
.correspondence-step { color: #68727c; font-size: 12px; }
.correspondence-grid { display: grid; grid-template-columns: 1fr 24px 1.2fr 24px 1fr; gap: 8px; align-items: stretch; }
.correspondence-item { display: flex; flex-direction: column; justify-content: center; gap: 5px; min-height: 92px; padding: 12px; border: 1px solid #e4e8e9; border-radius: 6px; background: #fbfcfc; }
.correspondence-item span { color: #68727c; font-size: 11px; font-weight: 700; }
.correspondence-item strong { color: #27313b; font-size: 18px; }
.correspondence-item small { color: #68727c; font-size: 12px; }
.notation-item { border-color: #f2c8ba; background: #fff8f5; }
.correspondence-arrow { display: grid; place-items: center; color: #e56f4d; font-size: 20px; }
.header-stats { display: flex; gap: 8px; flex-wrap: wrap; justify-content: flex-end; }
.header-stats span, .position-label { padding: 7px 10px; border: 1px solid #dfe3e6; border-radius: 5px; color: #59636d; background: #fff; font-size: 12px; }
.practice-grid { display: grid; grid-template-columns: minmax(0, 1.55fr) minmax(300px, .85fr); gap: 20px; align-items: start; }
.lesson-column, .coach-column { display: flex; flex-direction: column; gap: 16px; }
.score-panel, .coach-panel, .fretboard-panel, .action-panel, .exercise-list { background: #fff; border: 1px solid #dfe3e6; border-radius: 8px; }
.score-panel, .coach-panel, .fretboard-panel, .exercise-list { padding: 20px; }
.panel-heading { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; margin-bottom: 22px; }
.panel-heading.compact { margin-bottom: 16px; }
.tempo-control { display: flex; align-items: center; gap: 8px; color: #68727c; font-size: 12px; }
.tempo-control input { width: 100px; accent-color: #e56f4d; }
.tempo-control strong { width: 28px; color: #27313b; }
.beat-ruler, .step-track { display: grid; grid-template-columns: repeat(var(--step-count), minmax(32px, 1fr)); }
.beat-ruler { margin-left: 64px; border-bottom: 1px solid #e5e8ea; }
.ruler-cell, .step-cell { min-height: 40px; display: flex; align-items: center; justify-content: center; border-right: 1px solid #eef0f1; font-size: 13px; }
.ruler-cell { min-height: 28px; color: #9aa2a9; font-size: 11px; }
.ruler-cell.downbeat { color: #27313b; font-weight: 700; }
.rhythm-row, .tab-row, .subdivision-row { display: grid; grid-template-columns: 64px minmax(0, 1fr); }
.track-label { display: flex; align-items: center; color: #68727c; font-size: 12px; font-weight: 700; }
.step-cell { color: #68727c; transition: background .12s, color .12s; }
.right-hand span { font-size: 22px; font-weight: 700; color: #27313b; }
.right-hand .rest, .step-cell .rest { color: #b5bcc1; }
.tab-cell { font-family: ui-monospace, SFMono-Regular, Consolas, monospace; font-size: 17px; font-weight: 700; }
.subdivision { min-height: 28px; color: #9aa2a9; font-size: 10px; }
.step-cell.current { background: #fff0ea; color: #d75c3a; box-shadow: inset 0 -3px 0 #e56f4d; }
.step-cell.played { color: #b5bcc1; }
.bar-separator { height: 1px; margin: 18px 0; background: #dfe3e6; }
.tab-staff { display: flex; flex-direction: column; gap: 5px; }
.tab-line { display: grid; grid-template-columns: 28px minmax(0, 1fr); align-items: center; gap: 8px; }
.string-name { color: #e56f4d; font-size: 12px; font-weight: 700; }
.staff-notes { display: grid; grid-template-columns: repeat(var(--step-count), minmax(20px, 1fr)); border-top: 1px solid #aeb6bb; }
.staff-note { min-height: 25px; display: flex; justify-content: center; align-items: center; color: #68727c; font-family: ui-monospace, SFMono-Regular, Consolas, monospace; font-size: 12px; }
.staff-note.active { color: #d75c3a; background: #fff0ea; font-weight: 700; }
.staff-note.empty { color: #c8ced2; }
.action-panel { display: flex; justify-content: space-between; align-items: center; gap: 20px; padding: 14px 18px; }
.action-copy { display: flex; flex-direction: column; gap: 3px; }
.action-copy strong { font-size: 16px; }
.action-copy span:last-child { color: #68727c; font-size: 12px; }
.transport { display: flex; gap: 8px; }
button { font: inherit; cursor: pointer; }
.primary-action, .secondary-action { min-height: 38px; padding: 0 14px; border-radius: 5px; border: 1px solid transparent; }
.primary-action { display: flex; gap: 12px; align-items: center; background: #e56f4d; color: #fff; font-weight: 700; }
.action-icon { font-size: 12px; }
.secondary-action { background: #fff; color: #68727c; border-color: #dfe3e6; }
button:disabled { cursor: not-allowed; opacity: .55; }
.action-card { display: flex; align-items: center; gap: 12px; padding: 12px; border: 1px solid #e8ebed; border-radius: 6px; margin-bottom: 8px; }
.action-card > div:last-child { display: flex; flex-direction: column; gap: 2px; }
.action-card strong { font-size: 14px; }
.action-card span { color: #68727c; font-size: 12px; }
.hand-badge { width: 44px; height: 28px; display: grid; place-items: center; border-radius: 4px; font-size: 11px; font-weight: 700; }
.hand-badge.right { background: #fff0ea; color: #d75c3a; }
.hand-badge.left { background: #edf4f5; color: #39727a; }
.status-dot { width: 8px; height: 8px; border-radius: 50%; background: #c8ced2; }
.status-dot.live { background: #4da889; box-shadow: 0 0 0 4px #e6f4ef; }
.tip-box { margin-top: 16px; padding: 12px; border-left: 3px solid #e5b04d; background: #fffaf0; }
.tip-box strong { font-size: 12px; }
.tip-box p { margin-top: 5px; color: #68727c; font-size: 12px; line-height: 1.5; }
.fretboard-panel :deep(.bass-svg) { max-width: 100%; height: auto; }
.exercise-list { display: flex; flex-direction: column; gap: 16px; }
.library-note { color: #8a949c; font-size: 12px; }
.exercise-options { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.exercise-option { display: flex; flex-direction: column; align-items: flex-start; gap: 5px; min-height: 92px; padding: 12px; text-align: left; border: 1px solid #dfe3e6; border-radius: 6px; background: #fff; color: #27313b; }
.exercise-option:hover:not(:disabled), .exercise-option.selected { border-color: #e56f4d; background: #fff8f5; }
.exercise-option strong { font-size: 14px; }
.exercise-option span:last-child { color: #68727c; font-size: 12px; }
@media (max-width: 900px) { .practice-grid { grid-template-columns: 1fr; } .coach-column { display: grid; grid-template-columns: 1fr 1fr; align-items: start; } }
@media (max-width: 640px) {
  .practice-header, .list-heading, .action-panel { align-items: flex-start; flex-direction: column; }
  .header-stats { justify-content: flex-start; }
  .score-panel, .coach-panel, .fretboard-panel, .exercise-list { padding: 14px; }
  .score-panel { overflow-x: auto; }
  .panel-heading { flex-direction: column; }
  .tempo-control { width: 100%; }
  .tempo-control input { flex: 1; }
  .coach-column { display: flex; }
  .exercise-options { grid-template-columns: 1fr; }
  .beat-ruler, .rhythm-row, .tab-row, .subdivision-row, .tab-staff { min-width: 520px; }
  .beat-ruler, .step-track { grid-template-columns: repeat(var(--step-count), minmax(48px, 1fr)); }
  .rhythm-row, .tab-row, .subdivision-row { grid-template-columns: 44px minmax(0, 1fr); }
  .beat-ruler { margin-left: 44px; }
  .right-hand span { font-size: 18px; }
  .action-panel { gap: 14px; }
  .correspondence-grid { grid-template-columns: 1fr; }
  .correspondence-arrow { transform: rotate(90deg); min-height: 18px; }
  .transport { width: 100%; }
  .transport button { flex: 1; }
}
</style>
