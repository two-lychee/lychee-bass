<script setup lang="ts">
import { computed } from 'vue'
import BassFretboard, { type FretMark } from './BassFretboard.vue'
import {
  foundationExercises,
  trainingCategories,
  type FoundationExercise,
} from '@/music/foundation-exercises'
import { useFoundationPlayback } from '@/composables/useFoundationPlayback'
import { usePracticeHistory, type PracticeRating } from '@/composables/usePracticeHistory'

const props = defineProps<{ exercise: FoundationExercise }>()
const {
  bpm,
  isPlaying,
  isStarting,
  countIn,
  currentIndex,
  completedRounds,
  demo,
  metronome,
  repeat,
  error,
  lastRecordId,
  timeline,
  current,
  start,
  stop,
} = useFoundationPlayback(props.exercise)
const { records, rate, storageError } = usePracticeHistory()
const busy = computed(() => isPlaying.value || isStarting.value)
const category = trainingCategories.find((c) => c.id === props.exercise.category)!
const nextExercise = foundationExercises.find((e) => e.id === props.exercise.nextId)
const record = computed(() => records.value.find((r) => r.id === lastRecordId.value))
const ratings: PracticeRating[] = ['吃力', '基本跟上', '熟练']
const bar = computed(() => current.value?.bar ?? 0)
const steps = computed(() => props.exercise.measures[bar.value]!)
const active = computed(() => isPlaying.value && !countIn.value && currentIndex.value >= 0)
const currentNote = computed(() => current.value?.step.note)
const stringNames = ['E', 'A', 'D', 'G']
const fingers = ['', '食指', '中指', '无名指', '小指']
const location = (n: { string: number; fret: number }) =>
  `${stringNames[n.string]} 弦 · ${n.fret === 0 ? '空弦' : `${n.fret} 品`}`
const nextNote = computed(() => {
  const index = currentIndex.value < 0 ? 0 : currentIndex.value + 1
  const remaining = timeline.slice(index)
  if (repeat.value) remaining.push(...timeline.slice(0, index))
  return remaining.find((item) => item.step.note)?.step.note
})
const marks = computed<FretMark[]>(() =>
  currentNote.value && !countIn.value
    ? [
        {
          stringIndex: currentNote.value.string,
          fret: currentNote.value.fret,
          label: currentNote.value.fret === 0 ? '空' : String(currentNote.value.finger),
          color: '#ff8a65',
          isCurrent: active.value,
        },
      ]
    : [],
)
const ghost = computed<FretMark | null>(() =>
  nextNote.value
    ? {
        stringIndex: nextNote.value.string,
        fret: nextNote.value.fret,
        color: '#ff8a65',
      }
    : null,
)
</script>

<template>
  <article class="session">
    <RouterLink class="back-link" to="/">← 基础训练</RouterLink>
    <header class="session-heading">
      <div>
        <p class="eyebrow">{{ category.number }} / {{ category.title }}</p>
        <h1>{{ exercise.title }}</h1>
        <p>{{ exercise.description }}</p>
      </div>
      <span class="session-meter">4/4 <span>标准调弦</span></span>
    </header>

    <div class="session-controls">
      <button class="action-button primary" :disabled="isStarting" @click="busy ? stop() : start()">
        {{ isStarting ? '准备音频…' : isPlaying ? '结束练习' : '开始练习' }}
        <span aria-hidden="true">{{ isPlaying ? '■' : '▶' }}</span>
      </button>
      <label class="tempo-control"
        >速度
        <input
          v-model.number="bpm"
          aria-label="练习速度 BPM"
          type="number"
          min="40"
          max="160"
          :disabled="busy"
        />
        <span>BPM</span></label
      >
      <div class="audio-options">
        <label><input v-model="demo" type="checkbox" /> 示范音</label>
        <label><input v-model="metronome" type="checkbox" /> 节拍声</label>
        <label><input v-model="repeat" type="checkbox" /> 循环</label>
      </div>
    </div>
    <p v-if="error || storageError" role="alert" class="inline-message">
      {{ error || storageError }}
    </p>

    <div class="session-workspace">
      <div class="session-main">
        <div class="play-status" role="status">
          <span>{{ countIn ? '预备拍' : isPlaying ? '正在跟练' : '准备就绪' }}</span>
          <strong>{{
            countIn ? `${countIn} / 4` : `第 ${bar + 1} / ${exercise.measures.length} 小节`
          }}</strong>
          <span>{{ completedRounds }} 遍完成</span>
        </div>
        <div class="beat-indicators" aria-hidden="true">
          <span
            v-for="beat in 4"
            :key="beat"
            :class="{
              active: countIn ? beat === countIn : active && current.step.beat + 1 === beat,
            }"
            >{{ beat }}</span
          >
        </div>

        <div class="notation-scroll">
          <div class="drill-notation" :style="{ '--cells': steps.length }">
            <div class="notation-line">
              <span class="notation-label">数拍</span>
              <div class="notation-cells">
                <span
                  v-for="(step, index) in steps"
                  :key="index"
                  :class="{ playing: active && current.index === index }"
                  >{{ step.label }}</span
                >
              </div>
            </div>
            <div class="notation-line">
              <span class="notation-label">右手</span>
              <div class="notation-cells">
                <span
                  v-for="(step, index) in steps"
                  :key="index"
                  :class="{ playing: active && current.index === index }"
                  >{{ step.rest ? '休' : step.rightHand }}</span
                >
              </div>
            </div>
            <div class="notation-line">
              <span class="notation-label">左手</span>
              <div class="notation-cells">
                <span
                  v-for="(step, index) in steps"
                  :key="index"
                  :class="{ playing: active && current.index === index }"
                  >{{ step.note ? (step.note.fret === 0 ? '空' : step.note.finger) : '—' }}</span
                >
              </div>
            </div>
            <div class="tab-staff">
              <div v-for="s in [3, 2, 1, 0]" :key="s" class="notation-line">
                <span class="notation-label">{{ stringNames[s] }}</span>
                <div class="notation-cells">
                  <span
                    v-for="(step, index) in steps"
                    :key="index"
                    :class="{ playing: active && current.index === index }"
                    ><b v-if="step.note?.string === s">{{ step.note.fret }}</b></span
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
        <p class="notation-key">
          i 食指 / m 中指 · 左手 1–4 为手指编号 · 四线谱数字为品位 · 休 = 止音
        </p>

        <div class="action-readout">
          <div>
            <span>当前动作</span
            ><strong>{{
              countIn
                ? '听预备拍，准备进入'
                : currentNote
                  ? location(currentNote)
                  : '休止 · 止住声音'
            }}</strong>
            <p v-if="currentNote && !countIn">
              {{
                currentNote.fret
                  ? `左手 ${currentNote.finger} 指（${fingers[currentNote.finger]}）`
                  : '左手无需按弦'
              }}
              / 右手{{ current.step.rightHand === 'i' ? '食指' : '中指' }}
            </p>
          </div>
          <div>
            <span>下一音</span><strong>{{ nextNote ? location(nextNote) : '本遍结束' }}</strong>
            <p v-if="nextNote?.fret">左手 {{ nextNote.finger }} 指</p>
          </div>
        </div>
        <section class="practice-guidance">
          <h2>动作要点</h2>
          <p>{{ exercise.tip }}</p>
          <details>
            <summary>适合什么阶段？怎样算练稳？</summary>
            <p>{{ exercise.prerequisite }}</p>
            <ul>
              <li v-for="point in exercise.checkpoints" :key="point">{{ point }}</li>
            </ul>
            <p>先在舒适速度下稳定完成，再以 5 BPM 小幅加速。以放松、清晰为先。</p>
          </details>
        </section>
      </div>
      <aside class="session-fretboard">
        <div class="panel-caption"><span>指板 / 左手位置</span><span>数字 = 手指</span></div>
        <BassFretboard
          :highlights="marks"
          :ghost-mark="ghost"
          :pulse-key="`${bar}-${currentIndex}`"
          :fret-count="12"
          :fret-height="28"
          :max-width="240"
          :drag-enabled="false"
          :show-toggle="false"
          muted
        />
        <p>实心为当前音，虚线为下一音。</p>
      </aside>
    </div>

    <section v-if="record" class="session-review" aria-labelledby="review-title">
      <div>
        <p class="eyebrow">本次练习</p>
        <h2 id="review-title">这一遍，感觉如何？</h2>
        <p>{{ record.bpm }} BPM · {{ record.seconds }} 秒 · {{ record.rounds }} 遍完整循环</p>
        <p class="review-note">
          {{ storageError ? '记录暂存于本次打开期间。' : '练习记录已保存在此浏览器。' }}
          以下为自评，不是演奏检测。
        </p>
      </div>
      <div class="review-actions">
        <div class="rating-options">
          <button
            v-for="rating in ratings"
            :key="rating"
            class="action-button"
            :class="{ selected: record.rating === rating }"
            :aria-pressed="record.rating === rating"
            @click="rate(record.id, rating)"
          >
            {{ rating }}
          </button>
        </div>
        <RouterLink v-if="nextExercise" :to="`/practice/training/${nextExercise.id}`"
          >下一项：{{ nextExercise.title }} ↗</RouterLink
        ><RouterLink v-else to="/">返回目录，选择下一项 →</RouterLink>
      </div>
    </section>
    <p v-else class="session-footnote">
      开始前有 4 拍预备拍。结束、离开页面或切到后台时保存跟练时长，预备拍不计入。
    </p>
  </article>
</template>
