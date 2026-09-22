import { beforeEach, describe, expect, it, vi } from 'vitest'

beforeEach(() => {
  localStorage.clear()
  vi.resetModules()
})
describe('local practice history', () => {
  it('saves sessions and ratings and restores them on a fresh load', async () => {
    let history = (await import('../usePracticeHistory')).usePracticeHistory()
    const id = history.add({ exerciseId: 'left-walk', bpm: 55, seconds: 24, rounds: 2 })
    history.rate(id, '基本跟上')
    vi.resetModules()
    history = (await import('../usePracticeHistory')).usePracticeHistory()
    expect(history.records.value[0]).toMatchObject({ id, bpm: 55, rating: '基本跟上' })
  })
  it('rejects invalid stored sessions and handles corrupt JSON', async () => {
    localStorage.setItem('lychee-bass.practice.v1', '[{"seconds":-2}]')
    expect((await import('../usePracticeHistory')).usePracticeHistory().records.value).toEqual([])
    vi.resetModules()
    localStorage.setItem('lychee-bass.practice.v1', 'invalid')
    expect(
      (await import('../usePracticeHistory')).usePracticeHistory().storageError.value,
    ).not.toBe('')
  })
  it('retains the in-memory session and reports unavailable storage', async () => {
    const history = (await import('../usePracticeHistory')).usePracticeHistory()
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota')
    })
    history.add({ exerciseId: 'right-quarter', bpm: 60, seconds: 10, rounds: 1 })
    expect(history.records.value).toHaveLength(1)
    expect(history.storageError.value).not.toBe('')
    spy.mockRestore()
  })
})
