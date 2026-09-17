<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import BassFretboard, { type FretMark } from './BassFretboard.vue'
import AlphaTabScoreView from './AlphaTabScoreView.vue'
import ScoreStepGrid from './score-practice/ScoreStepGrid.vue'
import ScoreCorrespondence from './score-practice/ScoreCorrespondence.vue'
import ScoreCoach from './score-practice/ScoreCoach.vue'
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
        <div class="flex flex-wrap gap-2">
          <UBadge :label="`${currentTimeSignature[0]}/${currentTimeSignature[1]}`" color="neutral" variant="subtle" />
          <UBadge :label="`${bpm} BPM`" color="neutral" variant="subtle" />
          <UBadge
            :label="`第 ${currentMeasure + 1} / ${exercise.measures.length} 小节`"
            color="neutral"
            variant="subtle"
          />
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

    <div class="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.85fr)]">
      <div class="flex flex-col gap-4">
        <!-- 节奏与 Tab 面板 -->
        <UCard>
          <template #header>
            <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div class="flex flex-col gap-1">
                <span class="text-xs font-bold uppercase tracking-wider text-primary">节奏与 Bass Tab</span>
                <h2 class="text-lg font-bold text-highlighted">跟着当前格练习</h2>
              </div>
              <div class="flex items-center gap-2 text-xs text-muted">
                <span class="shrink-0">速度</span>
                <USlider v-model="bpm" :min="40" :max="140" :step="1" class="w-24 sm:w-32" />
                <strong class="w-7 shrink-0 text-highlighted">{{ bpm }}</strong>
              </div>
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

        <!-- 走带控制 -->
        <UCard>
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div class="flex flex-col gap-0.5">
              <span class="text-xs font-bold uppercase tracking-wider text-primary">当前动作</span>
              <strong class="text-base text-highlighted">{{ currentInstruction.title }}</strong>
              <span class="text-xs text-muted">{{ currentInstruction.detail }}</span>
            </div>
            <div class="flex flex-wrap gap-2">
              <UButton
                label="上一小节"
                variant="outline"
                color="neutral"
                :disabled="isPlaying || currentMeasure === 0"
                @click="previousMeasure"
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
              <UButton
                :label="isPlaying ? '暂停练习' : '开始练习'"
                :icon="isPlaying ? 'i-lucide-pause' : 'i-lucide-play'"
                :disabled="isImporting"
                :loading="isImporting"
                @click="togglePractice"
              />
            </div>
          </div>
        </UCard>

        <ScoreCorrespondence :steps="steps" :current-step="currentStep" />

        <ScoreCoach :instruction="currentInstruction" :tip="exercise.tip" :is-playing="isPlaying" />
      </div>

      <aside class="flex flex-col gap-4">
        <UCard>
          <template #header>
            <div class="flex items-end justify-between gap-4">
              <div class="flex flex-col gap-1">
                <span class="text-xs font-bold uppercase tracking-wider text-primary">左手路线</span>
                <h2 class="text-lg font-bold text-highlighted">指板定位</h2>
              </div>
              <span class="rounded-md bg-muted px-2.5 py-1.5 text-xs text-muted ring-1 ring-default">
                {{ currentInstruction.position }}
              </span>
            </div>
          </template>

          <div class="[&_.bass-svg]:h-auto [&_.bass-svg]:max-w-full">
            <BassFretboard
              :highlights="highlights"
              :fret-count="fretCount"
              :initial-show-note-names="false"
              :show-toggle="false"
              muted
            />
          </div>
        </UCard>
      </aside>
    </div>
  </section>
</template>
