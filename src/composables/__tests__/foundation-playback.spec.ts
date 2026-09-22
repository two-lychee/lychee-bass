import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { foundationExercises } from '@/music/foundation-exercises'

const audio = vi.hoisted(() => ({
  tick: undefined as undefined | ((time: number) => void),
  time: 0,
  draws: [] as Array<() => void>,
  instruments: [] as Array<{ calls: unknown[][] }>,
  start: vi.fn(async () => {}),
  add: vi.fn(() => 'record-id'),
  unmount: vi.fn(),
}))
vi.mock('../usePracticeHistory', () => ({
  usePracticeHistory: () => ({ records: { value: [] }, add: audio.add }),
}))
vi.mock('tone', () => {
  class Instrument {
    calls: unknown[][] = []
    loaded = true
    constructor() {
      audio.instruments.push(this)
    }
    toDestination() {
      return this
    }
    triggerAttackRelease(...args: unknown[]) {
      this.calls.push(args)
    }
    disconnect() {}
    dispose() {}
  }
  return {
    start: audio.start,
    now: () => audio.time,
    immediate: () => audio.time,
    getDraw: () => ({ schedule: (callback: () => void) => audio.draws.push(callback) }),
    Clock: class {
      constructor(callback: (time: number) => void) {
        audio.tick = callback
      }
      start() {}
      dispose() {
        audio.tick = undefined
      }
    },
    Sampler: Instrument,
    MonoSynth: Instrument,
    Synth: Instrument,
    Frequency: (note: string) => ({ transpose: () => ({ toNote: () => note }) }),
  }
})
import { useFoundationPlayback } from '../useFoundationPlayback'

function tick(time: number) {
  audio.time = time
  audio.tick?.(time)
  audio.draws.splice(0).forEach((draw) => draw())
}
const wrappers: Array<ReturnType<typeof mount>> = []
function session() {
  let player!: ReturnType<typeof useFoundationPlayback>
  wrappers.push(
    mount(
      defineComponent({
        setup() {
          player = useFoundationPlayback(foundationExercises[0]!)
          return () => null
        },
      }),
    ),
  )
  return player
}
beforeEach(() => {
  audio.time = 0
  audio.draws = []
  audio.instruments = []
  audio.tick = undefined
  audio.add.mockClear()
  audio.start.mockReset()
  audio.start.mockResolvedValue(undefined)
})
afterEach(() => wrappers.splice(0).forEach((w) => w.unmount()))

describe('audio scheduled practice', () => {
  it('plays four preparation beats before the first note and saves practice time only', async () => {
    const p = session()
    p.repeat.value = false
    await p.start()
    for (let i = 0; i < 4; i++) {
      tick(i)
      expect(p.countIn.value).toBe(i + 1)
      expect(p.currentIndex.value).toBe(-1)
    }
    expect(audio.instruments[1]!.calls).toHaveLength(0)
    for (let i = 4; i < 8; i++) tick(i)
    expect(audio.instruments[1]!.calls).toHaveLength(4)
    tick(8)
    expect(p.isPlaying.value).toBe(false)
    expect(audio.add).toHaveBeenCalledExactlyOnceWith({
      exerciseId: 'right-quarter',
      bpm: 60,
      seconds: 4,
      rounds: 1,
    })
  })
  it('loops without repeating count-in and independently disables both sound layers', async () => {
    const p = session()
    p.demo.value = false
    p.metronome.value = false
    await p.start()
    for (let i = 0; i <= 8; i++) tick(i)
    expect(p.currentIndex.value).toBe(0)
    expect(p.completedRounds.value).toBe(1)
    expect(audio.instruments[1]!.calls).toHaveLength(0)
    expect(audio.instruments[2]!.calls).toHaveLength(4)
    p.stop()
    p.stop()
    expect(audio.add).toHaveBeenCalledTimes(1)
  })
  it('cancels pending audio startup and does not log a cancelled count-in', async () => {
    let resolve!: () => void
    audio.start.mockImplementationOnce(
      () =>
        new Promise<void>((r) => {
          resolve = r
        }),
    )
    const p = session()
    const starting = p.start()
    p.stop()
    resolve()
    await starting
    expect(audio.instruments).toHaveLength(0)
    expect(p.isPlaying.value).toBe(false)
    await p.start()
    tick(0)
    tick(1)
    p.stop()
    expect(audio.add).not.toHaveBeenCalled()
  })
  it('ignores queued visual callbacks after stopping and releases on route unmount', async () => {
    const p = session()
    await p.start()
    audio.tick?.(0)
    p.stop()
    audio.draws.splice(0).forEach((draw) => draw())
    expect(p.countIn.value).toBe(0)
    await p.start()
    for (let i = 0; i <= 6; i++) tick(i)
    wrappers[0]!.unmount()
    expect(audio.tick).toBeUndefined()
    expect(audio.add).toHaveBeenCalledTimes(1)
  })
})
