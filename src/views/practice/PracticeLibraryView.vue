<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import ScoreReadingHelp from '@/components/bass-simiulator/ScoreReadingHelp.vue'

type MessageColor = 'success' | 'warning' | 'error'

const router = useRouter()
const fileInput = ref<HTMLInputElement>()
const isImporting = ref(false)
const importMessage = ref('')
const importColor = ref<MessageColor>('success')
const libraryMessage = ref('')
const libraryColor = ref<MessageColor>('success')
const isLoadingScores = ref(true)

type ScoreTrack = {
  index: number
  name: string
  program: number
  isBass: boolean
  isPercussion: boolean
  noteCount: number
  firstNoteBar: number
  barCount: number
}
type StoredScore = {
  id: string
  title: string
  artist: string
  barCount: number
  trackIndex: number
  trackName: string
  importedAt: string
  tracks: ScoreTrack[]
  isUpdatingTrack?: boolean
}

const storedScores = ref<StoredScore[]>([])

const loadStoredScores = async () => {
  isLoadingScores.value = true
  libraryMessage.value = ''
  try {
    const response = await fetch('/api/scores')
    if (!response.ok) throw new Error('无法读取已导入曲谱')
    const scores = (await response.json()) as Omit<StoredScore, 'tracks'>[]
    storedScores.value = await Promise.all(
      scores.map(async (score) => {
        const tracksResponse = await fetch(`/api/scores/${encodeURIComponent(score.id)}/tracks`)
        if (!tracksResponse.ok) return { ...score, tracks: [] }
        const details = (await tracksResponse.json()) as {
          selectedTrackIndex: number
          tracks: ScoreTrack[]
        }
        return { ...score, trackIndex: details.selectedTrackIndex, tracks: details.tracks }
      }),
    )
  } catch (error) {
    libraryMessage.value = error instanceof Error ? error.message : '无法读取已导入曲谱'
    libraryColor.value = 'error'
  } finally {
    isLoadingScores.value = false
  }
}

const changeTrack = async (score: StoredScore, trackIndex: number) => {
  if (trackIndex === score.trackIndex) return
  score.isUpdatingTrack = true
  libraryMessage.value = ''
  try {
    const response = await fetch(`/api/scores/${encodeURIComponent(score.id)}/track`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trackIndex }),
    })
    const result = (await response.json()) as {
      trackName?: string
      warning?: string
      message?: string
    }
    if (!response.ok) throw new Error(result.message || '轨道切换失败')
    score.trackIndex = trackIndex
    score.trackName =
      result.trackName || score.tracks.find((track) => track.index === trackIndex)?.name || 'Track'
    libraryMessage.value = result.warning || `已切换到轨道：${score.trackName}`
    libraryColor.value = result.warning ? 'warning' : 'success'
  } catch (error) {
    libraryMessage.value = error instanceof Error ? error.message : '轨道切换失败'
    libraryColor.value = 'error'
  } finally {
    score.isUpdatingTrack = false
  }
}

const importScore = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  isImporting.value = true
  importMessage.value = ''
  try {
    const form = new FormData()
    form.append('score', file)
    const response = await fetch('/api/scores', { method: 'POST', body: form })
    const result = (await response.json()) as {
      id?: string
      trackName?: string
      warning?: string
      message?: string
    }
    if (!response.ok || !result.id) throw new Error(result.message || '曲谱上传失败')
    importMessage.value = result.warning || `已识别轨道：${result.trackName || 'Track 1'}`
    importColor.value = result.warning ? 'warning' : 'success'
    await loadStoredScores()
    await router.push({ name: 'practice-lesson', query: { serverScore: result.id } })
  } catch (error) {
    importMessage.value = error instanceof Error ? error.message : '无法读取这个 Guitar Pro 文件'
    importColor.value = 'error'
  } finally {
    isImporting.value = false
    input.value = ''
  }
}

const trackItems = (score: StoredScore) =>
  score.tracks.map((track) => ({
    label: `${track.name}${track.isBass ? ' · Bass' : ''} · ${track.noteCount} 音符 · 第 ${track.firstNoteBar || '-'} 小节起`,
    value: track.index,
    disabled: track.isPercussion || track.noteCount === 0,
  }))

const exercises = [
  {
    id: 'shoot-the-moon-gp4',
    level: 'GP4 导入',
    title: 'Shoot the Moon',
    artist: 'Norah Jones',
    description: '原曲吉他轨道映射到贝斯音域，可分小节练习。',
    focus: '曲目应用',
    sourceFile: '/file/Jones, Norah - Shoot The Moon.gp4',
  },
  {
    id: 'wickerman-bass-gp4',
    level: 'Bass GP4',
    title: 'Wickerman',
    artist: 'Iron Maiden',
    description: 'Steve Harris 贝斯轨道，四弦标准调弦。',
    focus: '八分音符推进',
    sourceFile: '/file/Iron Maiden - Wickerman (Bass).gp4',
  },
]

const exerciseCount = computed(() => exercises.length + storedScores.value.length)

onMounted(() => void loadStoredScores())
</script>

<template>
  <section class="score-library flex flex-col gap-5">
    <header class="training-intro">
      <div>
        <p class="eyebrow">曲谱练习 / REPERTOIRE</p>
        <h1>把基础，放进音乐里。</h1>
        <p class="intro-copy">选择示例曲目，或导入自己的 Guitar Pro 曲谱。</p>
      </div>
    </header>
    <ScoreReadingHelp />
    <UCard>
      <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div class="flex flex-col gap-2">
          <p class="text-xs font-bold uppercase tracking-wider text-primary">本地曲谱</p>
          <h2 class="text-xl font-bold text-highlighted">导入 Guitar Pro</h2>
          <p class="text-sm text-muted">
            支持 GP3、GP4、GP5、GPX 和 GP。原始文件由曲谱服务保存，曲谱会完整按小节读取。
          </p>
          <UAlert
            v-if="importMessage"
            :color="importColor"
            variant="subtle"
            :title="importMessage"
            class="mt-1"
          />
        </div>
        <input
          ref="fileInput"
          class="hidden"
          type="file"
          accept=".gp,.gp3,.gp4,.gp5,.gpx"
          @change="importScore"
        />
        <UButton
          label="选择 GP 文件"
          icon="i-lucide-upload"
          :loading="isImporting"
          class="md:shrink-0"
          @click="fileInput?.click()"
        />
      </div>
    </UCard>

    <UCard v-if="isLoadingScores || storedScores.length || libraryMessage">
      <template #header>
        <div class="flex items-end justify-between gap-4">
          <div class="flex flex-col gap-1">
            <p class="text-xs font-bold uppercase tracking-wider text-primary">我的曲谱</p>
            <h2 class="text-xl font-bold text-highlighted">已导入曲谱</h2>
          </div>
          <span v-if="isLoadingScores" class="flex items-center gap-2 text-sm text-muted">
            <UIcon name="i-lucide-loader-circle" class="size-4 animate-spin" />
            正在读取...
          </span>
        </div>
      </template>

      <UAlert
        v-if="libraryMessage"
        :color="libraryColor"
        variant="subtle"
        :title="libraryMessage"
        class="mb-4"
      />

      <div class="grid gap-3 lg:grid-cols-2">
        <UCard
          v-for="score in storedScores"
          :key="score.id"
          variant="subtle"
          :ui="{ body: 'flex flex-col gap-4' }"
        >
          <div class="flex flex-col gap-1">
            <span class="text-xs font-bold uppercase tracking-wider text-primary">
              用户导入 · {{ score.barCount }} 小节
            </span>
            <h3 class="text-lg font-bold text-highlighted">{{ score.title }}</h3>
            <span class="text-sm text-dimmed">{{ score.artist }}</span>
          </div>

          <div class="flex flex-col gap-1.5">
            <span class="text-xs font-bold text-muted">练习轨道</span>
            <USelect
              :model-value="score.trackIndex"
              :items="trackItems(score)"
              :disabled="score.isUpdatingTrack"
              value-key="value"
              class="w-full"
              @update:model-value="changeTrack(score, $event)"
            />
          </div>

          <div class="flex flex-col gap-2 border-t border-default pt-3 sm:flex-row sm:items-center">
            <UButton
              :to="{ name: 'practice-lesson', query: { serverScore: score.id } }"
              label="开始练习"
              trailing-icon="i-lucide-arrow-right"
              class="flex-1"
            />
            <UButton
              :to="`/api/scores/${score.id}/file`"
              external
              download
              label="下载原始 GP"
              variant="ghost"
              color="neutral"
              icon="i-lucide-download"
            />
          </div>
        </UCard>
      </div>
    </UCard>

    <UCard>
      <template #header>
        <div class="flex items-end justify-between gap-4">
          <div class="flex flex-col gap-1">
            <p class="text-xs font-bold uppercase tracking-wider text-primary">示例曲目</p>
            <h2 class="text-xl font-bold text-highlighted">从完整曲目中练习</h2>
            <p class="text-sm text-muted">需要节奏或指法训练？从首页的基础训练开始。</p>
          </div>
          <UBadge
            :label="`${exerciseCount} 个练习`"
            color="primary"
            variant="subtle"
            class="shrink-0"
          />
        </div>
      </template>

      <div class="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        <UCard v-for="exercise in exercises" :key="exercise.id" variant="subtle">
          <div class="flex h-full flex-col">
            <span class="text-xs font-bold uppercase tracking-wider text-primary">
              {{ exercise.level }}
            </span>
            <div class="flex flex-1 flex-col gap-1 pt-3">
              <h3 class="text-lg font-bold text-highlighted">{{ exercise.title }}</h3>
              <span v-if="exercise.artist" class="text-sm text-dimmed">{{ exercise.artist }}</span>
              <p class="mt-1 text-sm text-muted">{{ exercise.description }}</p>
              <UBadge
                :label="`重点：${exercise.focus}`"
                color="primary"
                variant="soft"
                class="mt-3 w-fit"
              />
            </div>
            <div class="mt-4 flex flex-col gap-2 border-t border-default pt-3">
              <UButton
                :to="{ name: 'practice-lesson', query: { exercise: exercise.id } }"
                label="开始练习"
                trailing-icon="i-lucide-arrow-right"
              />
              <UButton
                v-if="exercise.sourceFile"
                :to="exercise.sourceFile"
                external
                download
                label="下载原始 GP4"
                variant="ghost"
                color="neutral"
                icon="i-lucide-download"
                size="sm"
              />
            </div>
          </div>
        </UCard>
      </div>
    </UCard>
  </section>
</template>
