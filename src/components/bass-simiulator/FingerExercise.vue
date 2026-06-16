<template>
  <div class="finger-exercise">
    <div class="status-display">
      <span class="current-pos">{{ currentStepInfo }}</span>
    </div>
    <BassFretboard :highlights="highlights" :show-toggle="false" :fret-count="24" :initial-show-note-names="true" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import BassFretboard, { type FretMark } from './BassFretboard.vue'
import { STANDARD_TUNING, calcNote, stripOctave } from './music-theory'

interface Pattern {
  name: string
  sequence: number[]
}

export interface ExerciseConfig {
  patternIndex: number
  startString: number
  startFret: number
  repeatAcrossStrings: boolean
  fretIncrement: number
  showNoteName: boolean
}

const patterns: Pattern[] = [
  { name: '顺序', sequence: [1, 2, 3, 4] },
  { name: '逆序', sequence: [4, 3, 2, 1] },
  { name: '1243', sequence: [1, 2, 4, 3] },
  { name: '1324', sequence: [1, 3, 2, 4] },
  { name: '1342', sequence: [1, 3, 4, 2] },
  { name: '1423', sequence: [1, 4, 2, 3] },
]

const props = defineProps<{
  config: ExerciseConfig
}>()

const currentStep = ref(0)

defineExpose({
  currentStep,
  nextStep: () => {
    currentStep.value++
  },
  reset: () => {
    currentStep.value = 0
  },
})

const currentStepInfo = computed(() => {
  const pattern = patterns[props.config.patternIndex].sequence
  const patternLength = pattern.length

  let string = props.config.startString
  let fret = props.config.startFret
  let stepInPattern = currentStep.value % patternLength

  if (props.config.repeatAcrossStrings) {
    // 跨弦模式：先完成所有弦（同一品），再递增品位
    const stepsPerString = patternLength
    const totalStrings = 4
    const stepsPerRound = stepsPerString * totalStrings

    const roundsCompleted = Math.floor(currentStep.value / stepsPerRound)
    const stepInRound = currentStep.value % stepsPerRound
    const currentStringOffset = Math.floor(stepInRound / stepsPerString)
    stepInPattern = stepInRound % stepsPerString

    string = props.config.startString + currentStringOffset
    fret = props.config.startFret + pattern[stepInPattern] - 1 + (roundsCompleted * props.config.fretIncrement)
  } else {
    // 单弦模式：在当前弦上递增品位
    fret = props.config.startFret + pattern[stepInPattern] - 1
  }

  if (string > 3 || fret > 24) return '已完成'

  const noteName = props.config.showNoteName
    ? ` - ${stripOctave(calcNote(STANDARD_TUNING[string], fret))}`
    : ''

  return `第${4 - string}弦 第${fret}品 (手指${pattern[stepInPattern]})${noteName}`
})

const highlights = computed<FretMark[]>(() => {
  const pattern = patterns[props.config.patternIndex].sequence
  const patternLength = pattern.length

  let string = props.config.startString
  let fret = props.config.startFret
  let stepInPattern = currentStep.value % patternLength

  if (props.config.repeatAcrossStrings) {
    // 跨弦模式：先完成所有弦（同一品），再递增品位
    const stepsPerString = patternLength
    const totalStrings = 4
    const stepsPerRound = stepsPerString * totalStrings

    const roundsCompleted = Math.floor(currentStep.value / stepsPerRound)
    const stepInRound = currentStep.value % stepsPerRound
    const currentStringOffset = Math.floor(stepInRound / stepsPerString)
    stepInPattern = stepInRound % stepsPerString

    string = props.config.startString + currentStringOffset
    fret = props.config.startFret + pattern[stepInPattern] - 1 + (roundsCompleted * props.config.fretIncrement)
  } else {
    // 单弦模式：在当前弦上递增品位
    fret = props.config.startFret + pattern[stepInPattern] - 1
  }

  if (string > 3 || fret > 24) return []

  return [
    {
      stringIndex: string,
      fret: fret,
      color: '#ff8a65',
      opacity: 0.95,
      label: pattern[stepInPattern].toString(),
    },
  ]
})
</script>

<style scoped>
.finger-exercise {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

.status-display {
  padding: 12px 16px;
  background: #fff8f0;
  border: 1px solid #ffe0cc;
  border-radius: 8px;
  text-align: center;
}

.current-pos {
  font-size: 16px;
  color: #ff8a65;
  font-weight: 600;
}
</style>
