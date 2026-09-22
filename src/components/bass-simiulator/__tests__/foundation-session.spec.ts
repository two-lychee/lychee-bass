import { mount } from '@vue/test-utils'
import { computed, ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { foundationExercises, type FoundationExercise } from '@/music/foundation-exercises'
import { usePracticeHistory } from '@/composables/usePracticeHistory'
import FoundationSession from '../FoundationSession.vue'

vi.mock('../BassFretboard.vue', () => ({ default: { template: '<div />' } }))
vi.mock('@/composables/useFoundationPlayback', () => ({
  useFoundationPlayback: (exercise: FoundationExercise) => {
    const isPlaying = ref(false)
    const lastRecordId = ref('')
    const timeline = exercise.measures.flatMap((bar, barIndex) =>
      bar.map((step, index) => ({ step, bar: barIndex, index })),
    )
    return {
      bpm: ref(exercise.bpm),
      isPlaying,
      isStarting: ref(false),
      countIn: ref(0),
      currentIndex: ref(-1),
      completedRounds: ref(0),
      demo: ref(true),
      metronome: ref(true),
      repeat: ref(true),
      error: ref(''),
      lastRecordId,
      timeline,
      current: computed(() => timeline[0]),
      start: () => {
        isPlaying.value = true
      },
      stop: () => {
        isPlaying.value = false
        lastRecordId.value = usePracticeHistory().add({
          exerciseId: exercise.id,
          bpm: exercise.bpm,
          seconds: 8,
          rounds: 1,
        })
      },
    }
  },
}))

describe('foundation session controls', () => {
  it('locks speed during playback and lets users rate the saved session', async () => {
    const wrapper = mount(FoundationSession, {
      props: { exercise: foundationExercises[0]! },
      global: { stubs: { RouterLink: { template: '<a><slot /></a>' } } },
    })
    expect(wrapper.text()).toContain('左手无需按弦')
    await wrapper.get('button.primary').trigger('click')
    expect(wrapper.get('input[type="number"]').attributes('disabled')).toBeDefined()
    expect(wrapper.get('button.primary').text()).toContain('结束练习')
    await wrapper.get('button.primary').trigger('click')
    expect(wrapper.get('input[type="number"]').attributes('disabled')).toBeUndefined()
    expect(wrapper.text()).toContain('这一遍，感觉如何？')
    await wrapper.findAll('.rating-options button')[1]!.trigger('click')
    expect(wrapper.findAll('.rating-options button')[1]!.attributes('aria-pressed')).toBe('true')
    expect(usePracticeHistory().records.value[0]!.rating).toBe('基本跟上')
    expect(wrapper.text()).toContain('下一项：连续八分音符')
    wrapper.unmount()
  })
  it('shows the prescribed left finger separately from its fret', () => {
    const wrapper = mount(FoundationSession, {
      props: { exercise: foundationExercises[3]! },
      global: { stubs: { RouterLink: { template: '<a><slot /></a>' } } },
    })
    expect(wrapper.text()).toContain('E 弦 · 5 品')
    expect(wrapper.text()).toContain('左手 1 指（食指）')
    expect(wrapper.findAll('.notation-line')).toHaveLength(7)
    wrapper.unmount()
  })
})
