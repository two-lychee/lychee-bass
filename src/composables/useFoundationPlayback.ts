import { computed, onUnmounted, ref } from 'vue'
import * as Tone from 'tone'
import { calcNote, STANDARD_TUNING } from '@/components/bass-simiulator/music-theory'
import type { FoundationExercise } from '@/music/foundation-exercises'
import { usePracticeHistory } from './usePracticeHistory'

// A private audio clock keeps these drills independent of the global metronome transport.
export function useFoundationPlayback(exercise: FoundationExercise) {
  const history = usePracticeHistory()
  const previous = history.records.value.find((r) => r.exerciseId === exercise.id)
  const bpm = ref(previous?.bpm ?? exercise.bpm)
  const isPlaying = ref(false)
  const isStarting = ref(false)
  const countIn = ref(0)
  const currentIndex = ref(-1)
  const completedRounds = ref(0)
  const demo = ref(true)
  const metronome = ref(true)
  const repeat = ref(true)
  const error = ref('')
  const lastRecordId = ref('')
  const timeline = exercise.measures.flatMap((measure, bar) =>
    measure.map((step, index) => ({ step, bar, index })),
  )
  const current = computed(() => timeline[Math.max(0, currentIndex.value)])
  let clock: Tone.Clock | undefined
  let bass: Tone.Sampler | undefined
  let fallback: Tone.MonoSynth | undefined
  let click: Tone.Synth | undefined
  let generation = 0
  let beganAt: number | undefined
  let sessionBpm = bpm.value

  function disposeAudio() {
    clock?.dispose()
    clock = undefined
    // Disconnect immediately, including notes already scheduled by audio lookahead.
    bass?.disconnect()
    bass?.dispose()
    bass = undefined
    fallback?.disconnect()
    fallback?.dispose()
    fallback = undefined
    click?.disconnect()
    click?.dispose()
    click = undefined
  }
  function stop() {
    generation++
    if (beganAt !== undefined) {
      const seconds = Math.max(0, Tone.immediate() - beganAt)
      if (seconds >= 1)
        lastRecordId.value = history.add({
          exerciseId: exercise.id,
          bpm: sessionBpm,
          seconds: Math.round(seconds),
          rounds: completedRounds.value,
        })
    }
    beganAt = undefined
    isPlaying.value = false
    isStarting.value = false
    countIn.value = 0
    currentIndex.value = -1
    disposeAudio()
  }
  async function start() {
    if (isPlaying.value || isStarting.value) return
    const token = ++generation
    isStarting.value = true
    error.value = ''
    try {
      await Tone.start()
      if (token !== generation) return
      sessionBpm = Math.max(40, Math.min(160, Number(bpm.value) || exercise.bpm))
      bpm.value = sessionBpm
      fallback = new Tone.MonoSynth({
        volume: -15,
        envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 0.03 },
      }).toDestination()
      bass = new Tone.Sampler({
        urls: { E1: 'E1.mp3', G1: 'G1.mp3', 'C#2': 'Cs2.mp3', 'A#2': 'As2.mp3' },
        baseUrl: '/bass-samples/bass-electric/',
        release: 0.02,
        volume: -6,
        onerror: () => {
          /* The synth remains available when a sample cannot load. */
        },
      }).toDestination()
      click = new Tone.Synth({
        volume: -18,
        oscillator: { type: 'sine' },
        envelope: { attack: 0.001, decay: 0.025, sustain: 0, release: 0.01 },
      }).toDestination()
      const subdivision = exercise.subdivisionsPerBeat
      const duration = 60 / sessionBpm / subdivision
      const preparation = 4 * subdivision
      let tick = 0
      let ending = false
      completedRounds.value = 0
      lastRecordId.value = ''
      clock = new Tone.Clock((time) => {
        if (token !== generation || ending) return
        const localTick = tick++
        if (localTick < preparation) {
          if (localTick % subdivision === 0) {
            // Count-in stays audible even when the practice metronome is off.
            click?.triggerAttackRelease(localTick === 0 ? 'C6' : 'C5', 0.03, time)
            Tone.getDraw().schedule(() => {
              if (token === generation) countIn.value = localTick / subdivision + 1
            }, time)
          }
          return
        }
        const elapsed = localTick - preparation
        if (elapsed > 0 && elapsed % timeline.length === 0 && !repeat.value) {
          ending = true
          Tone.getDraw().schedule(() => {
            if (token !== generation) return
            completedRounds.value = elapsed / timeline.length
            stop()
          }, time)
          return
        }
        const index = elapsed % timeline.length
        const item = timeline[index]!
        if (beganAt === undefined) beganAt = time
        if (metronome.value && item.index % subdivision === 0) {
          click?.triggerAttackRelease(item.index === 0 ? 'C6' : 'C5', 0.03, time)
        }
        if (demo.value && item.step.note && !item.step.rest) {
          const n = item.step.note
          const instrument = bass?.loaded ? bass : fallback
          instrument?.triggerAttackRelease(
            calcNote(STANDARD_TUNING[n.string], n.fret),
            duration * 0.85,
            time,
          )
        }
        Tone.getDraw().schedule(() => {
          if (token !== generation) return
          countIn.value = 0
          currentIndex.value = index
          completedRounds.value = Math.floor(elapsed / timeline.length)
        }, time)
      }, 1 / duration)
      isStarting.value = false
      isPlaying.value = true
      countIn.value = 1
      clock.start(Tone.now() + 0.1)
    } catch {
      if (token !== generation) return
      stop()
      error.value = '音频未能启动，请检查浏览器音频权限后重试。'
    }
  }
  const onVisibilityChange = () => {
    if (document.hidden) stop()
  }
  document.addEventListener('visibilitychange', onVisibilityChange)
  window.addEventListener('pagehide', stop)
  onUnmounted(() => {
    stop()
    document.removeEventListener('visibilitychange', onVisibilityChange)
    window.removeEventListener('pagehide', stop)
  })
  return {
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
  }
}
