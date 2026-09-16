<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

const router = useRouter()
const fileInput = ref<HTMLInputElement>()
const isImporting = ref(false)
const importMessage = ref('')
const libraryMessage = ref('')
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
        const details = (await tracksResponse.json()) as { selectedTrackIndex: number; tracks: ScoreTrack[] }
        return { ...score, trackIndex: details.selectedTrackIndex, tracks: details.tracks }
      }),
    )
  } catch (error) {
    libraryMessage.value = error instanceof Error ? error.message : '无法读取已导入曲谱'
  } finally {
    isLoadingScores.value = false
  }
}

const changeTrack = async (score: StoredScore, event: Event) => {
  const trackIndex = Number((event.target as HTMLSelectElement).value)
  score.isUpdatingTrack = true
  libraryMessage.value = ''
  try {
    const response = await fetch(`/api/scores/${encodeURIComponent(score.id)}/track`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trackIndex }),
    })
    const result = (await response.json()) as { trackName?: string; warning?: string; message?: string }
    if (!response.ok) throw new Error(result.message || '轨道切换失败')
    score.trackIndex = trackIndex
    score.trackName = result.trackName || score.tracks.find((track) => track.index === trackIndex)?.name || 'Track'
    libraryMessage.value = result.warning || `已切换到轨道：${score.trackName}`
  } catch (error) {
    libraryMessage.value = error instanceof Error ? error.message : '轨道切换失败'
    ;(event.target as HTMLSelectElement).value = String(score.trackIndex)
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
    await loadStoredScores()
    await router.push({ name: 'practice-lesson', query: { serverScore: result.id } })
  } catch (error) {
    importMessage.value = error instanceof Error ? error.message : '无法读取这个 Guitar Pro 文件'
  } finally {
    isImporting.value = false
    input.value = ''
  }
}

const exercises = [
  {
    id: 'eighth-alternating',
    level: '入门 01',
    title: '八分音符交替拨弦',
    description: '建立稳定的正拍与反拍，练习左右手同步。',
    focus: '↓ ↑ 交替拨弦',
  },
  {
    id: 'offbeat-groove',
    level: '入门 02',
    title: '反拍律动',
    description: '正拍保持动作，反拍发音，感受节奏留白。',
    focus: '反拍 + 休止',
  },
  {
    id: 'syncopation',
    level: '入门 03',
    title: '切分与闷音',
    description: '练习切分重音和闷音连接，让律动更有方向。',
    focus: '切分 + 闷音',
  },
  {
    id: 'shoot-the-moon-gp4',
    level: 'GP4 导入',
    title: 'Shoot the Moon',
    artist: 'Norah Jones',
    description: '从 Guitar Pro 4 原谱读取，当前以第一小节演示 Bass 低八度适配。',
    focus: '真实谱曲 + 原始吉他数据保留',
    sourceFile: '/file/Jones, Norah - Shoot The Moon.gp4',
  },
  {
    id: 'wickerman-bass-gp4',
    level: 'Bass GP4',
    title: 'Wickerman',
    artist: 'Iron Maiden',
    description: 'Steve Harris Bass 轨道，四弦标准调弦，当前从第 3 小节开始练习。',
    focus: '真实 Bass 弦位 + 八分音符推进',
    sourceFile: '/file/Iron Maiden - Wickerman (Bass).gp4',
  },
]

const exerciseCount = computed(() => exercises.length + storedScores.value.length)

onMounted(() => void loadStoredScores())
</script>

<template>
  <section class="library-page">
    <section class="import-panel">
      <div>
        <p class="eyebrow">本地曲谱</p>
        <h2>导入 Guitar Pro</h2>
        <p>支持 GP3、GP4、GP5、GPX 和 GP。原始文件由曲谱服务保存，曲谱会完整按小节读取。</p>
        <span v-if="importMessage" class="import-message">{{ importMessage }}</span>
      </div>
      <input
        ref="fileInput"
        class="file-input"
        type="file"
        accept=".gp,.gp3,.gp4,.gp5,.gpx"
        @change="importScore"
      />
      <button class="import-button" :disabled="isImporting" @click="fileInput?.click()">
        {{ isImporting ? '正在解析...' : '选择 GP 文件' }}
      </button>
    </section>

    <section v-if="isLoadingScores || storedScores.length || libraryMessage" class="stored-section">
      <header class="stored-heading">
        <div>
          <p class="eyebrow">我的曲谱</p>
          <h2>已导入曲谱</h2>
        </div>
        <span v-if="isLoadingScores" class="loading-label">正在读取...</span>
      </header>
      <p v-if="libraryMessage" class="library-message">{{ libraryMessage }}</p>
      <div class="stored-list">
        <article v-for="score in storedScores" :key="score.id" class="stored-score">
          <div class="stored-copy">
            <span class="card-index">用户导入 · {{ score.barCount }} 小节</span>
            <h3>{{ score.title }}</h3>
            <span class="artist">{{ score.artist }}</span>
          </div>
          <label class="track-select">
            <span>练习轨道</span>
            <select :value="score.trackIndex" :disabled="score.isUpdatingTrack" @change="changeTrack(score, $event)">
              <option
                v-for="track in score.tracks"
                :key="track.index"
                :value="track.index"
                :disabled="track.isPercussion || track.noteCount === 0"
              >
                {{ track.name }}{{ track.isBass ? ' · Bass' : '' }} · {{ track.noteCount }} 音符 · 第 {{ track.firstNoteBar || '-' }} 小节起
              </option>
            </select>
          </label>
          <div class="stored-actions">
            <RouterLink :to="{ name: 'practice-lesson', query: { serverScore: score.id } }" class="start-link">
              开始练习 <span aria-hidden="true">→</span>
            </RouterLink>
            <a :href="`/api/scores/${score.id}/file`" class="source-link" download>下载原始 GP</a>
          </div>
        </article>
      </div>
    </section>

    <header class="library-header">
      <div>
        <p class="eyebrow">练习库</p>
        <h2>选择今天的练习</h2>
        <p>先选择一个目标，进入练习后只关注当前拍和当前动作。</p>
      </div>
      <span class="library-count">{{ exerciseCount }} 个练习</span>
    </header>

    <div class="exercise-list">
      <article v-for="exercise in exercises" :key="exercise.id" class="exercise-card">
        <div class="card-index">{{ exercise.level }}</div>
        <div class="card-body">
          <h3>{{ exercise.title }}</h3>
          <span v-if="exercise.artist" class="artist">{{ exercise.artist }}</span>
          <p>{{ exercise.description }}</p>
          <span class="focus">重点：{{ exercise.focus }}</span>
        </div>
        <RouterLink
          :to="{ name: 'practice-lesson', query: { exercise: exercise.id } }"
          class="start-link"
        >
          开始练习 <span aria-hidden="true">→</span>
        </RouterLink>
        <a v-if="exercise.sourceFile" :href="exercise.sourceFile" class="source-link" download>
          下载原始 GP4
        </a>
      </article>
    </div>
  </section>
</template>

<style scoped>
.library-page { display: flex; flex-direction: column; gap: 20px; color: #27313b; }
.import-panel { display: flex; justify-content: space-between; align-items: center; gap: 24px; padding: 20px 22px; border: 1px solid #cadfe2; border-radius: 8px; background: #f5fbfb; }
.import-panel h2 { font-size: 20px; }
.import-panel p { margin-top: 5px; color: #68727c; font-size: 13px; }
.file-input { display: none; }
.import-button { flex: 0 0 auto; min-height: 40px; padding: 0 16px; border: 0; border-radius: 5px; background: #39727a; color: #fff; font: inherit; font-size: 13px; font-weight: 700; cursor: pointer; }
.import-button:disabled { cursor: wait; opacity: .65; }
.import-message { display: block; margin-top: 8px; color: #39727a; font-size: 12px; }
.stored-section { display: flex; flex-direction: column; gap: 14px; padding: 20px 22px; border: 1px solid #dfe3e6; border-radius: 8px; background: #fff; }
.stored-heading { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; }
.stored-heading h2 { font-size: 20px; }
.loading-label, .library-message { color: #68727c; font-size: 12px; }
.library-message { padding: 9px 11px; border-left: 3px solid #e5b04d; background: #fffaf0; }
.stored-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.stored-score { display: grid; grid-template-columns: minmax(180px, 1fr) minmax(240px, 1.2fr); gap: 16px; align-items: center; padding: 16px; border: 1px solid #e2e6e8; border-radius: 7px; }
.stored-copy h3 { margin-top: 5px; }
.track-select { display: flex; flex-direction: column; gap: 5px; color: #68727c; font-size: 11px; font-weight: 700; }
.track-select select { width: 100%; min-height: 38px; padding: 0 9px; border: 1px solid #cfd6da; border-radius: 5px; background: #fff; color: #27313b; font: inherit; font-size: 12px; }
.stored-actions { grid-column: 1 / -1; display: flex; align-items: center; gap: 18px; border-top: 1px solid #eef0f1; }
.stored-actions .start-link { flex: 1; border-top: 0; }
.library-header { display: flex; justify-content: space-between; align-items: flex-end; gap: 20px; padding: 22px; border: 1px solid #dfe3e6; border-radius: 8px; background: #fff; }
.eyebrow { margin: 0 0 4px; color: #e56f4d; font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
h2, h3, p { margin: 0; }
h2 { font-size: 26px; }
.library-header p:last-child { margin-top: 8px; color: #68727c; font-size: 13px; }
.library-count { padding: 7px 10px; border: 1px solid #dfe3e6; border-radius: 5px; color: #68727c; font-size: 12px; white-space: nowrap; }
.exercise-list { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
.exercise-card { display: flex; flex-direction: column; min-height: 220px; padding: 18px; border: 1px solid #dfe3e6; border-radius: 8px; background: #fff; }
.card-index { color: #e56f4d; font-size: 11px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; }
.card-body { flex: 1; padding-top: 18px; }
h3 { font-size: 18px; }
.card-body p { margin-top: 8px; color: #68727c; font-size: 13px; line-height: 1.55; }
.artist { display: block; margin-top: 3px; color: #8a949c; font-size: 12px; }
.focus { display: inline-block; margin-top: 16px; padding: 5px 8px; background: #fff0ea; color: #d75c3a; border-radius: 4px; font-size: 12px; }
.start-link { display: flex; justify-content: space-between; align-items: center; margin-top: 20px; padding-top: 13px; border-top: 1px solid #eef0f1; color: #d75c3a; font-size: 13px; font-weight: 700; text-decoration: none; }
.start-link:hover { color: #b94d31; }
.source-link { margin-top: 8px; color: #68727c; font-size: 12px; text-decoration: none; }
.source-link:hover { color: #27313b; }
@media (max-width: 1100px) { .stored-list, .exercise-list { grid-template-columns: 1fr; } .exercise-card { min-height: 0; } }
@media (max-width: 640px) { .import-panel, .library-header { align-items: flex-start; flex-direction: column; padding: 16px; } .stored-section { padding: 16px; } .stored-score { grid-template-columns: 1fr; } .stored-actions { grid-column: auto; } .import-button { width: 100%; } h2 { font-size: 22px; } }
</style>
