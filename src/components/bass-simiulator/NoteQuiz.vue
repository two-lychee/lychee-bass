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

const stats = computed(() => [
  { label: `得分 ${score.value} / ${total.value}` },
  { label: `连击 ${streak.value}` },
  { label: `最高连击 ${bestStreak.value}` },
  { label: `正确率 ${accuracy.value}%` },
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

const optionProps = (opt: NoteName) => {
  if (!answered.value) return { color: 'neutral' as const, variant: 'outline' as const }
  if (opt === currentAnswer.value) return { color: 'success' as const, variant: 'solid' as const }
  if (opt === selected.value) return { color: 'error' as const, variant: 'solid' as const }
  return { color: 'neutral' as const, variant: 'outline' as const }
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

<template>
  <div class="flex flex-wrap items-start justify-center gap-6">
    <UCard class="w-full shrink-0 sm:w-80">
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-1">
          <h2 class="text-lg font-bold text-highlighted">音名识别</h2>
          <p class="text-sm text-muted">
            指板上高亮的位置是哪个音？
            <span class="text-dimmed">（不区分八度）</span>
          </p>
        </div>

        <div class="flex flex-wrap gap-2">
          <UBadge
            v-for="(stat, i) in stats"
            :key="i"
            :label="stat.label"
            color="neutral"
            variant="subtle"
          />
        </div>

        <div class="grid grid-cols-2 gap-2">
          <UButton
            v-for="opt in options"
            :key="opt"
            :label="opt"
            size="xl"
            v-bind="optionProps(opt)"
            :disabled="answered"
            :class="answered && opt !== currentAnswer && opt !== selected ? 'opacity-40' : ''"
            @click="answer(opt)"
          />
        </div>

        <p
          class="min-h-6 text-sm font-medium"
          :class="[
            lastResult === 'correct' ? 'text-success' : '',
            lastResult === 'wrong' ? 'text-error' : 'text-dimmed',
          ]"
        >
          <template v-if="lastResult === 'correct'">✓ 正确，就是 {{ currentAnswer }}</template>
          <template v-else-if="lastResult === 'wrong'">✗ 答案是 {{ currentAnswer }}</template>
          <template v-else>选一个音名</template>
        </p>

        <div class="flex gap-2">
          <UButton label="下一题" :disabled="!answered" @click="next" />
          <UButton label="重置统计" variant="outline" color="neutral" @click="reset" />
        </div>
      </div>
    </UCard>

    <BassFretboard
      :highlights="highlights"
      :initial-show-note-names="false"
      :show-toggle="false"
      muted
    />
  </div>
</template>
