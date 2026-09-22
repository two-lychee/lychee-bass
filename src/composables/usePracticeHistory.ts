import { ref } from 'vue'
import { foundationExercises } from '@/music/foundation-exercises'

export type PracticeRating = '吃力' | '基本跟上' | '熟练'
export interface PracticeRecord {
  id: string
  exerciseId: string
  date: string
  bpm: number
  seconds: number
  rounds: number
  rating?: PracticeRating
}
const KEY = 'lychee-bass.practice.v1'
const records = ref<PracticeRecord[]>([])
const storageError = ref('')
let loaded = false
export function isPracticeRecord(value: unknown): value is PracticeRecord {
  if (!value || typeof value !== 'object') return false
  const r = value as PracticeRecord
  return (
    typeof r.id === 'string' &&
    foundationExercises.some((e) => e.id === r.exerciseId) &&
    typeof r.date === 'string' &&
    Number.isFinite(Date.parse(r.date)) &&
    Number.isFinite(r.bpm) &&
    r.bpm >= 40 &&
    r.bpm <= 160 &&
    Number.isFinite(r.seconds) &&
    r.seconds > 0 &&
    Number.isInteger(r.rounds) &&
    r.rounds >= 0 &&
    (r.rating === undefined || ['吃力', '基本跟上', '熟练'].includes(r.rating))
  )
}
export function usePracticeHistory() {
  if (!loaded) {
    try {
      const raw: unknown = JSON.parse(localStorage.getItem(KEY) ?? '[]')
      records.value = Array.isArray(raw) ? raw.filter(isPracticeRecord).slice(0, 200) : []
    } catch {
      storageError.value = '无法读取本地记录，本次仍可练习。'
    }
    loaded = true
  }
  function persist() {
    try {
      localStorage.setItem(KEY, JSON.stringify(records.value))
      storageError.value = ''
    } catch {
      storageError.value = '浏览器无法保存记录，当前记录仅在本次打开期间保留。'
    }
  }
  function add(record: Omit<PracticeRecord, 'id' | 'date'>) {
    const entry = { ...record, id: crypto.randomUUID(), date: new Date().toISOString() }
    records.value = [entry, ...records.value].slice(0, 200)
    persist()
    return entry.id
  }
  function rate(id: string, rating: PracticeRating) {
    records.value = records.value.map((r) => (r.id === id ? { ...r, rating } : r))
    persist()
  }
  return { records, storageError, add, rate }
}
