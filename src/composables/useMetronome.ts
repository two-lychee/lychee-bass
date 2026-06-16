// 节拍器逻辑 composable

import { ref, watch, onUnmounted } from 'vue'
import * as Tone from 'tone'

export interface MetronomeOptions {
  bpm?: number
  beatsPerBar?: number
  subdivision?: number
  volume?: number
  accentPattern?: number[]
  rhythmPattern?: 'straight' | 'offbeat' | 'syncopated'
}

export const useMetronome = (options: MetronomeOptions = {}) => {
  const bpm = ref(options.bpm ?? 120)
  const beatsPerBar = ref(options.beatsPerBar ?? 4)
  const subdivision = ref(options.subdivision ?? 1)
  const volume = ref(options.volume ?? -10)
  const accentPattern = ref(options.accentPattern ?? [1])
  const rhythmPattern = ref<'straight' | 'offbeat' | 'syncopated'>(options.rhythmPattern ?? 'straight')
  const isPlaying = ref(false)
  const currentBeat = ref(0)

  let synth: Tone.MembraneSynth | null = null
  let loop: Tone.Loop | null = null

  const initSynth = () => {
    if (synth) return
    synth = new Tone.MembraneSynth({
      pitchDecay: 0.008,
      octaves: 2,
      envelope: { attack: 0.0006, decay: 0.5, sustain: 0 },
    }).toDestination()
  }

  const start = async () => {
    await Tone.start()
    initSynth()

    if (loop) loop.dispose()

    Tone.getTransport().bpm.value = bpm.value

    const interval = `${beatsPerBar.value * subdivision.value}n`
    let beatCounter = 0

    loop = new Tone.Loop((time) => {
      const beat = Math.floor(beatCounter / subdivision.value) % beatsPerBar.value
      const subBeat = beatCounter % subdivision.value
      currentBeat.value = beat

      let shouldPlay = false
      let isAccent = false

      // 根据节奏型决定是否播放
      if (rhythmPattern.value === 'straight') {
        shouldPlay = subBeat === 0
      } else if (rhythmPattern.value === 'offbeat') {
        shouldPlay = subBeat === Math.floor(subdivision.value / 2)
      } else if (rhythmPattern.value === 'syncopated') {
        shouldPlay = subBeat === 0 || (beat % 2 === 1 && subBeat === Math.floor(subdivision.value / 2))
      }

      if (shouldPlay && synth) {
        isAccent = accentPattern.value.includes(beat + 1)
        synth.volume.value = volume.value + (isAccent ? 6 : 0)
        synth.triggerAttackRelease(isAccent ? 'C5' : 'C4', '16n', time)
      }

      beatCounter++
    }, interval)

    loop.start(0)
    Tone.getTransport().start()
    isPlaying.value = true
  }

  const stop = () => {
    Tone.getTransport().stop()
    if (loop) {
      loop.stop()
      loop.dispose()
      loop = null
    }
    isPlaying.value = false
    currentBeat.value = 0
  }

  const toggle = () => {
    isPlaying.value ? stop() : start()
  }

  watch(bpm, (newBpm) => {
    if (isPlaying.value) Tone.getTransport().bpm.value = newBpm
  })

  watch(volume, (newVol) => {
    if (synth) synth.volume.value = newVol
  })

  watch([beatsPerBar, subdivision, rhythmPattern, accentPattern], () => {
    if (isPlaying.value) {
      stop()
      start()
    }
  })

  onUnmounted(() => {
    stop()
    if (synth) {
      synth.dispose()
      synth = null
    }
  })

  return {
    bpm,
    beatsPerBar,
    subdivision,
    volume,
    accentPattern,
    rhythmPattern,
    isPlaying,
    currentBeat,
    start,
    stop,
    toggle,
  }
}
