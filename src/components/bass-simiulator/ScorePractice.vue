<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import BassFretboard, { type FretMark } from './BassFretboard.vue'
import AlphaTabScoreView from './AlphaTabScoreView.vue'
import ScoreStepGrid from './score-practice/ScoreStepGrid.vue'
import { calcNote, stripOctave, STANDARD_TUNING } from './music-theory'
import { useScorePlayback } from '@/composables/useScorePlayback'
import {
  createImportedPlaceholder,
  exercises,
  importedScoreConfigs,
  isImportedScoreId,
  type Exercise,
  type ImportedScoreId,
} from '@/music/exercise-data'
import { scoreToExercise } from '@/music/gp-conversion'
import { loadGuitarProScore, type ImportedScore, type ImportedScoreTrack } from '@/music/guitar-pro'

const route = useRoute()
const importedExercise = ref<Exercise | null>(null)
const isImporting = ref(false)
const importError = ref('')
const importWarning = ref('')

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

const {
  bpm,
  currentMeasure,
  currentStep,
  isPlaying,
  steps,
  resetPractice,
  previousMeasure,
  nextMeasure,
  togglePractice,
} = useScorePlayback(exercise)

const sourceTrackIndex = ref(0)
const currentTimeSignature = computed(
  () => exercise.value.measureSignatures?.[currentMeasure.value] ?? exercise.value.timeSignature,
)

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
    const config = importedScoreConfigs[selectedId.value as ImportedScoreId]
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

const current = computed(() => steps.value[Math.max(0, currentStep.value)] ?? steps.value[0])
const currentInstruction = computed(() => {
  const step = current.value
  if (!step) {
    return {
      rightHand: '休止',
      rhythm: '等待',
      leftHand: '放松左手',
      note: '休止',
      position: '准备下一小节',
    }
  }
  const note = step.note
  if (!note) {
    return {
      rightHand: step.rightHand === '×' ? '轻触琴弦' : '不发音',
      rhythm: step.subdivisionLabel,
      leftHand: '放松左手',
      note: '休止 / 闷音',
      position: '准备下一拍',
    }
  }
  const noteName = stripOctave(calcNote(STANDARD_TUNING[note.string], note.fret))
  return {
    rightHand: step.rightHand === '↓' ? '下拨' : '上拨',
    rhythm: step.subdivisionLabel,
    leftHand: `${note.finger} 指`,
    note: `${noteName} · ${note.fret} 品`,
    position: `${['E', 'A', 'D', 'G'][note.string] ?? 'E'} 弦 ${note.fret} 品`,
  }
})

// 音游式提示：小节内同弦同品的音合并成一个标记。
// 贝斯一小节常只有两三个位置、各被击打多次，按次数画圈会完全叠在一起，
// 改成"一个位置 + ×N 角标 + 命中脉冲"，重复音也一眼可读
const measureNotes = computed(() =>
  steps.value.map((step, index) => ({ step, index })).filter((item) => item.step.note),
)

const positionGroups = computed(() => {
  const groups: { key: string; string: number; fret: number; stepIndices: number[] }[] = []
  for (const item of measureNotes.value) {
    const note = item.step.note!
    const key = `${note.string}:${note.fret}`
    let group = groups.find((item) => item.key === key)
    if (!group) {
      group = { key, string: note.string, fret: note.fret, stepIndices: [] }
      groups.push(group)
    }
    group.stepIndices.push(item.index)
  }
  return groups
})

const highlights = computed<FretMark[]>(() => {
  const groups = positionGroups.value
  if (!groups.length) return []
  const marks = groups.map((group) => {
    const occurrence = group.stepIndices.indexOf(currentStep.value) + 1
    const isCurrent = occurrence > 0
    return {
      stringIndex: group.string,
      fret: group.fret,
      color: isCurrent ? '#ff8a65' : '#ffb74d',
      opacity: isCurrent ? 0.95 : 0.5,
      label: String(group.fret),
      isCurrent,
      hits: group.stepIndices.length,
      occurrence,
    }
  })
  // 当前音画在最后，避免和同位置的提示圈叠在一起时被盖住
  const currentIndex = marks.findIndex((mark) => mark.isCurrent)
  if (currentIndex < 0) return marks
  return [...marks.filter((_, i) => i !== currentIndex), marks[currentIndex]]
})

const stringNameFor = (string: number) => ['E', 'A', 'D', 'G'][string] ?? '?'

const nextNote = computed(
  () => steps.value.slice(Math.max(0, currentStep.value + 1)).find((step) => step.note)?.note,
)
// 下一音幽灵圈：下一个音和当前同位时手不用动，就不画，避免圈叠圈
const ghostMark = computed<FretMark | null>(() => {
  const note = nextNote.value
  if (!note) return null
  const current = steps.value[Math.max(0, currentStep.value)]?.note
  if (current && current.string === note.string && current.fret === note.fret) return null
  return { stringIndex: note.string, fret: note.fret, color: '#ff8a65', label: '下一音' }
})
const nextLabel = computed(() => {
  const note = nextNote.value
  return note ? `${stringNameFor(note.string)}弦 ${note.fret}品` : '本小节内无更多音'
})

const fretCount = computed(() => {
  const highestFret = exercise.value.measures.reduce(
    (highest, measure) => Math.max(highest, ...measure.map((step) => step.note?.fret ?? 0)),
    0,
  )
  return Math.max(12, Math.min(24, highestFret))
})

onMounted(() => {
  if (serverScoreId || isImportedScoreId(selectedId.value)) void loadImportedExercise()
})
</script>

<template>
  <section class="flex flex-col gap-5">
    <UPageHeader
      :headline="exercise.level"
      :title="exercise.title"
      :description="exercise.description"
    >
      <template #links>
        <div class="flex flex-col items-end gap-3">
          <div class="flex flex-wrap justify-end gap-2">
            <UBadge
              :label="`${currentTimeSignature[0]}/${currentTimeSignature[1]}`"
              color="neutral"
              variant="subtle"
            />
            <UBadge :label="`${bpm} BPM`" color="neutral" variant="subtle" />
            <UBadge
              :label="`第 ${currentMeasure + 1} / ${exercise.measures.length} 小节`"
              color="neutral"
              variant="subtle"
            />
          </div>
          <div class="flex flex-wrap items-center justify-end gap-2">
            <UButton
              label="上一小节"
              variant="outline"
              color="neutral"
              :disabled="isPlaying || currentMeasure === 0"
              @click="previousMeasure"
            />
            <UButton
              :label="isPlaying ? '暂停练习' : '开始练习'"
              :icon="isPlaying ? 'i-lucide-pause' : 'i-lucide-play'"
              :disabled="isImporting"
              :loading="isImporting"
              @click="togglePractice"
            />
            <UButton
              label="下一小节"
              variant="outline"
              color="neutral"
              :disabled="isPlaying || currentMeasure >= exercise.measures.length - 1"
              @click="nextMeasure"
            />
            <UButton
              label="重置"
              variant="outline"
              color="neutral"
              :disabled="isPlaying"
              @click="resetPractice"
            />
            <div class="flex items-center gap-2 text-xs text-muted">
              <span class="shrink-0">速度</span>
              <USlider v-model="bpm" :min="40" :max="200" :step="1" class="w-24 sm:w-32" />
              <strong class="w-8 shrink-0 text-highlighted">{{ bpm }}</strong>
            </div>
          </div>
        </div>
      </template>
    </UPageHeader>

    <div class="flex flex-col gap-3">
      <UButton
        v-if="exercise.sourceFile"
        :to="exercise.sourceFile"
        external
        download
        label="保留并下载原始 GP4"
        icon="i-lucide-download"
        variant="ghost"
        color="neutral"
        size="sm"
        class="w-fit"
      />
      <UAlert
        v-if="importWarning"
        icon="i-lucide-triangle-alert"
        color="warning"
        variant="subtle"
        :title="importWarning"
      />
    </div>

    <div
      class="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,1fr)]"
      :class="{ 'lg:items-stretch': !!exercise.sourceFile }"
    >
      <div class="flex flex-col gap-4">
        <!-- 节奏与 Tab 面板 -->
        <UCard>
          <template #header>
            <div class="flex flex-col gap-1">
              <span class="text-xs font-bold uppercase tracking-wider text-primary"
                >节奏与 Bass Tab</span
              >
              <h2 class="text-lg font-bold text-highlighted">跟着当前格练习</h2>
            </div>
          </template>

          <div class="overflow-x-auto">
            <ScoreStepGrid :steps="steps" :current-step="currentStep" :is-playing="isPlaying" />
          </div>
        </UCard>

        <AlphaTabScoreView
          v-if="exercise.sourceFile"
          :source-file="exercise.sourceFile"
          :track-index="sourceTrackIndex"
          :measure-index="currentMeasure"
          :total-measures="exercise.measures.length"
          :is-playing="isPlaying"
        />
      </div>

      <aside class="flex flex-col lg:min-h-0" :class="exercise.sourceFile ? 'min-h-[420px]' : ''">
        <div
          class="flex min-h-0 flex-1 flex-col rounded-lg border border-default bg-default p-4"
          :class="{ 'lg:flex-none': !exercise.sourceFile }"
        >
          <div class="mb-3 flex items-end justify-between gap-4">
            <div class="flex flex-col gap-1">
              <span class="text-xs font-bold uppercase tracking-wider text-primary">指板</span>
              <h2 class="text-lg font-bold text-highlighted">当前位置与下一音</h2>
            </div>
            <span class="rounded-md bg-muted px-2.5 py-1.5 text-xs text-muted ring-1 ring-default">
              {{ currentInstruction.position }}
            </span>
          </div>

          <BassFretboard
            class="min-h-0 flex-1"
            :highlights="highlights"
            :ghost-mark="ghostMark"
            :pulse-key="currentStep"
            :fret-count="fretCount"
            :fret-height="44"
            :max-height="exercise.sourceFile ? 0 : 560"
            :max-width="380"
            auto-scroll
            :drag-enabled="false"
            :initial-show-note-names="false"
            :show-toggle="false"
            muted
          >
            <template #status>
              <div class="flex flex-wrap items-center gap-1.5">
                <span class="rounded bg-primary/10 px-2 py-1 text-xs font-bold text-primary">
                  右手 {{ currentInstruction.rightHand }}
                </span>
                <span class="rounded bg-muted px-2 py-1 text-xs font-bold text-highlighted">
                  左手 {{ currentInstruction.leftHand }}
                </span>
                <span class="rounded bg-muted px-2 py-1 text-xs font-bold text-highlighted">
                  {{ currentInstruction.note }}
                </span>
                <span class="rounded bg-muted px-2 py-1 text-xs text-muted">
                  {{ currentInstruction.rhythm }}
                </span>
              </div>
            </template>
          </BassFretboard>

          <div class="mt-3 flex flex-col gap-2">
            <div class="flex flex-wrap items-center gap-2 text-xs text-muted">
              <span class="shrink-0 font-bold text-highlighted">下一音</span>
              <strong class="text-highlighted">{{ nextLabel }}</strong>
              <span class="text-dimmed"
                >数字为按压品位，×N 为该位在小节内击打次数，高亮圈为当前音</span
              >
            </div>
            <UAlert
              v-if="exercise.tip"
              icon="i-lucide-lightbulb"
              color="warning"
              variant="subtle"
              title="练习重点"
              :description="exercise.tip"
            />
          </div>
        </div>
      </aside>
    </div>
  </section>
</template>
