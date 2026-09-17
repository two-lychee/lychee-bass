import { computed, onUnmounted, ref, toValue, type MaybeRefOrGetter } from 'vue'
import * as Tone from 'tone'
import { calcNote, STANDARD_TUNING } from '@/components/bass-simiulator/music-theory'
import type { Exercise } from '@/music/exercise-data'

// 谱面练习的播放引擎：采样音色 + 节拍计时 + 走带状态。
// 组件只负责把 exercise 传进来，播放/暂停/小节切换全部在这里完成。
export function useScorePlayback(exercise: MaybeRefOrGetter<Exercise>) {
  const bpm = ref(70)
  const currentMeasure = ref(0)
  const currentStep = ref(-1)
  const isPlaying = ref(false)
  let timer: number | null = null

  const steps = computed(() => toValue(exercise).measures[currentMeasure.value] ?? [])

  const sampler = new Tone.Sampler({
    urls: { E1: 'E1.mp3', G1: 'G1.mp3', 'A#1': 'As1.mp3', 'C#2': 'Cs2.mp3' },
    baseUrl: '/bass-samples/bass-electric/',
  }).toDestination()

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
      if (currentMeasure.value >= toValue(exercise).measures.length - 1) {
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
    const interval = Math.round(60000 / bpm.value / toValue(exercise).subdivisionsPerBeat)
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
    currentMeasure.value = Math.min(toValue(exercise).measures.length - 1, currentMeasure.value + 1)
    currentStep.value = -1
  }

  const togglePractice = () => {
    if (isPlaying.value) stopTimer()
    else void startPractice()
  }

  onUnmounted(() => {
    stopTimer()
    sampler.dispose()
  })

  return {
    bpm,
    currentMeasure,
    currentStep,
    isPlaying,
    steps,
    startPractice,
    resetPractice,
    previousMeasure,
    nextMeasure,
    togglePractice,
    stopTimer,
  }
}
