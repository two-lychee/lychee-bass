// 音乐理论工具：音名计算、音阶生成等
// 统一约定：fret = 0 表示空弦

import * as Tone from 'tone'

/** 标准四弦贝斯空弦（低音 E 在最左/最粗弦） */
export const STANDARD_TUNING = ['E1', 'A1', 'D2', 'G2'] as const

/** 12 个音名（升号体系） */
export const NOTE_NAMES = [
  'C', 'C#', 'D', 'D#', 'E', 'F',
  'F#', 'G', 'G#', 'A', 'A#', 'B',
] as const

export type NoteName = (typeof NOTE_NAMES)[number]

/** 常见调式：相对根音的半音数 */
export const SCALE_INTERVALS: Record<string, number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11], // 大调
  naturalMinor: [0, 2, 3, 5, 7, 8, 10], // 自然小调
  pentatonicMajor: [0, 2, 4, 7, 9], // 大调五声
  pentatonicMinor: [0, 3, 5, 7, 10], // 小调五声
  blues: [0, 3, 5, 6, 7, 10], // 布鲁斯
}

export const SCALE_LABELS: Record<string, string> = {
  major: '大调',
  naturalMinor: '自然小调',
  pentatonicMajor: '大调五声',
  pentatonicMinor: '小调五声',
  blues: '布鲁斯',
}

/** 计算指定弦上某品位的音（含八度），fret = 0 即空弦 */
export const calcNote = (openNote: string, fret: number): string => {
  return Tone.Frequency(openNote).transpose(fret).toNote()
}

/** 仅返回不含八度的音名，例如 "A#2" -> "A#" */
export const stripOctave = (note: string): NoteName => {
  return note.replace(/-?\d+$/, '') as NoteName
}

/** 从根音名生成音阶上所有音名（不含八度） */
export const buildScale = (
  rootName: NoteName,
  scaleKey: keyof typeof SCALE_INTERVALS,
): NoteName[] => {
  const rootIdx = NOTE_NAMES.indexOf(rootName)
  if (rootIdx < 0) return []
  const intervals = SCALE_INTERVALS[scaleKey] ?? []
  return intervals.map((semi) => NOTE_NAMES[(rootIdx + semi) % 12])
}

/** 给定音阶在某音上的"角色"：1（根音）、3（三度）、5（五度），其它返回 null */
export const noteRole = (
  note: NoteName,
  rootName: NoteName,
  scaleKey: keyof typeof SCALE_INTERVALS,
): 'root' | 'third' | 'fifth' | 'other' | null => {
  const intervals = SCALE_INTERVALS[scaleKey]
  if (!intervals) return null
  const rootIdx = NOTE_NAMES.indexOf(rootName)
  const noteIdx = NOTE_NAMES.indexOf(note)
  if (rootIdx < 0 || noteIdx < 0) return null
  const semi = (noteIdx - rootIdx + 12) % 12
  if (!intervals.includes(semi)) return null
  if (semi === 0) return 'root'
  // 大三度 4 半音、小三度 3 半音
  if (semi === 3 || semi === 4) return 'third'
  if (semi === 7) return 'fifth'
  return 'other'
}
