// 调弦配置系统

export interface Tuning {
  id: string
  name: string
  notes: readonly string[]
  description: string
}

export const TUNINGS: Record<string, Tuning> = {
  standard4: {
    id: 'standard4',
    name: '标准四弦',
    notes: ['E1', 'A1', 'D2', 'G2'],
    description: '最常用的四弦贝斯调弦',
  },
  standard5: {
    id: 'standard5',
    name: '标准五弦',
    notes: ['B0', 'E1', 'A1', 'D2', 'G2'],
    description: '五弦贝斯，增加低音 B 弦',
  },
  dropD: {
    id: 'dropD',
    name: 'Drop D',
    notes: ['D1', 'A1', 'D2', 'G2'],
    description: '最粗弦降全音至 D',
  },
  halfStepDown: {
    id: 'halfStepDown',
    name: '降半音',
    notes: ['D#1', 'G#1', 'C#2', 'F#2'],
    description: '所有弦降半音',
  },
  wholeToneDown: {
    id: 'wholeToneDown',
    name: '降全音',
    notes: ['D1', 'G1', 'C2', 'F2'],
    description: '所有弦降全音',
  },
}

export const DEFAULT_TUNING = TUNINGS.standard4
