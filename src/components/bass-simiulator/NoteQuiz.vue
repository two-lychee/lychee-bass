<template>
  <div class="quiz">
    <div class="panel">
      <div class="header">
        <h2>音名识别</h2>
        <p class="hint">
          指板上高亮的位置是哪个音？
          <span class="muted">（不区分八度）</span>
        </p>
      </div>

      <div class="stats">
        <span>得分 {{ score }} / {{ total }}</span>
        <span>连击 {{ streak }}</span>
        <span>最高连击 {{ bestStreak }}</span>
        <span>正确率 {{ accuracy }}%</span>
      </div>

      <div class="options">
        <button
          v-for="opt in options"
          :key="opt"
          class="option"
          :class="optionClass(opt)"
          :disabled="answered"
          @click="answer(opt)"
        >
          {{ opt }}
        </button>
      </div>

      <div class="feedback" :class="{ correct: lastResult === 'correct', wrong: lastResult === 'wrong' }">
        <template v-if="lastResult === 'correct'">✓ 正确，就是 {{ currentAnswer }}</template>
        <template v-else-if="lastResult === 'wrong'">✗ 答案是 {{ currentAnswer }}</template>
        <template v-else>选一个音名</template>
      </div>

      <div class="actions">
        <button class="primary" @click="next" :disabled="!answered">下一题</button>
        <button class="ghost" @click="reset">重置统计</button>
      </div>
    </div>

    <BassFretboard
      :highlights="highlights"
      :initial-show-note-names="false"
      :show-toggle="false"
      muted
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import BassFretboard, { type FretMark } from './BassFretboard.vue'
import { NOTE_NAMES, STANDARD_TUNING, calcNote, stripOctave, type NoteName } from './music-theory'

const FRET_RANGE = 12 // 0..12
const STRING_COUNT = STANDARD_TUNING.length

const currentString = ref(0)
const currentFret = ref(0)
const options = ref<NoteName[]>([])
const selected = ref<NoteName | null>(null)
const lastResult = ref<'correct' | 'wrong' | null>(null)

const score = ref(0)
const total = ref(0)
const streak = ref(0)
const bestStreak = ref(0)

const currentAnswer = computed<NoteName>(() =>
  stripOctave(calcNote(STANDARD_TUNING[currentString.value], currentFret.value)),
)

const accuracy = computed(() =>
  total.value === 0 ? 0 : Math.round((score.value / total.value) * 100),
)

const answered = computed(() => lastResult.value !== null)

const highlights = computed<FretMark[]>(() => [
  {
    stringIndex: currentString.value,
    fret: currentFret.value,
    color: answered.value
      ? lastResult.value === 'correct'
        ? '#81c784'
        : '#e57373'
      : '#ffb74d',
    label: answered.value ? currentAnswer.value : '?',
  },
])

const randInt = (max: number) => Math.floor(Math.random() * max)

const next = () => {
  currentString.value = randInt(STRING_COUNT)
  currentFret.value = randInt(FRET_RANGE + 1)
  selected.value = null
  lastResult.value = null

  // 4 个选项：1 个正确 + 3 个干扰
  const answer = stripOctave(calcNote(STANDARD_TUNING[currentString.value], currentFret.value))
  const pool = NOTE_NAMES.filter((n) => n !== answer)
  const distractors: NoteName[] = []
  while (distractors.length < 3) {
    const pick = pool[randInt(pool.length)]
    if (!distractors.includes(pick)) distractors.push(pick)
  }
  const all = [answer, ...distractors]
  // 洗牌
  for (let i = all.length - 1; i > 0; i--) {
    const j = randInt(i + 1)
    ;[all[i], all[j]] = [all[j], all[i]]
  }
  options.value = all
}

const answer = (opt: NoteName) => {
  if (answered.value) return
  selected.value = opt
  total.value++
  if (opt === currentAnswer.value) {
    score.value++
    streak.value++
    if (streak.value > bestStreak.value) bestStreak.value = streak.value
    lastResult.value = 'correct'
  } else {
    streak.value = 0
    lastResult.value = 'wrong'
  }
}

const optionClass = (opt: NoteName) => {
  if (!answered.value) return ''
  if (opt === currentAnswer.value) return 'correct'
  if (opt === selected.value) return 'wrong'
  return 'dim'
}

const reset = () => {
  score.value = 0
  total.value = 0
  streak.value = 0
  bestStreak.value = 0
  next()
}

onMounted(next)
</script>

<style scoped>
.quiz {
  display: flex;
  gap: 24px;
  align-items: flex-start;
  flex-wrap: wrap;
  justify-content: center;
}

.panel {
  flex: 0 0 320px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  color: #333;
}

.header h2 {
  margin: 0 0 4px;
}

.hint {
  margin: 0;
  font-size: 13px;
  color: #666;
}

.muted {
  color: #999;
}

.stats {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 13px;
  color: #666;
  padding: 8px 12px;
  background: #fff;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
}

.options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.option {
  padding: 12px;
  font-size: 16px;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
  background: #fff;
  color: #333;
  cursor: pointer;
  transition: all 0.15s;
}

.option:hover:not(:disabled) {
  background: #f5f5f5;
  border-color: #ccc;
}

.option.correct {
  background: #81c784;
  color: #fff;
  border-color: #81c784;
}

.option.wrong {
  background: #e57373;
  color: #fff;
  border-color: #e57373;
}

.option.dim {
  opacity: 0.4;
}

.option:disabled {
  cursor: default;
}

.feedback {
  min-height: 22px;
  font-size: 14px;
  color: #999;
}

.feedback.correct {
  color: #66bb6a;
}

.feedback.wrong {
  color: #e57373;
}

.actions {
  display: flex;
  gap: 8px;
}


.ghost {
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 14px;
}

.primary {
  background: #ff8a65;
  color: #fff;
}

.primary:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.ghost {
  background: transparent;
  color: #666;
  border: 1px solid #e0e0e0;
}
</style>
