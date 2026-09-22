// 内置练习曲目的数据与类型定义，与渲染/播放逻辑解耦

export type RightHand = '↓' | '↑' | '×' | '-' | 'i' | 'm'
export type NoteEvent = { string: number; fret: number; finger: 1 | 2 | 3 | 4 }
export type ExerciseStep = {
  beat: number
  label: string
  subdivisionLabel: string
  rightHand: RightHand
  rest?: boolean
  note?: NoteEvent
}
export type Exercise = {
  id: string
  title: string
  description: string
  shortDescription: string
  level: string
  tip: string
  timeSignature: [number, number]
  measureSignatures?: Array<[number, number]>
  measures: ExerciseStep[][]
  subdivisionsPerBeat: 1 | 2 | 4
  sourceFile?: string
}

export const makeSteps = (
  pattern: Array<{ rightHand: RightHand; note?: NoteEvent; rest?: boolean }>,
) =>
  pattern.map((item, index) => ({
    ...item,
    beat: Math.floor(index / 2),
    label: index % 2 === 0 ? String(Math.floor(index / 2) + 1) : '&',
    subdivisionLabel: index % 2 === 0 ? '正拍' : '反拍',
  }))

export const exercises: Exercise[] = [
  {
    id: 'eighth-alternating',
    title: '八分音符交替拨弦',
    description: '先建立稳定的正拍与反拍，再把注意力放到左右手同步。',
    shortDescription: '↓ ↑ 交替，固定两根弦',
    level: '入门 01',
    tip: '右手保持均匀摆动，即使某个反拍暂时不弹，也不要让手停下来。',
    timeSignature: [4, 4],
    subdivisionsPerBeat: 2,
    measures: [
      makeSteps([
        { rightHand: '↓', note: { string: 0, fret: 3, finger: 1 } },
        { rightHand: '↑', note: { string: 0, fret: 5, finger: 3 } },
        { rightHand: '↓', note: { string: 1, fret: 3, finger: 1 } },
        { rightHand: '↑', note: { string: 1, fret: 5, finger: 3 } },
        { rightHand: '↓', note: { string: 0, fret: 3, finger: 1 } },
        { rightHand: '↑', note: { string: 0, fret: 5, finger: 3 } },
        { rightHand: '↓', note: { string: 1, fret: 3, finger: 1 } },
        { rightHand: '↑', note: { string: 1, fret: 5, finger: 3 } },
      ]),
    ],
  },
  {
    id: 'offbeat-groove',
    title: '反拍律动',
    description: '正拍保持右手运动，声音只落在反拍，感受节奏中的留白。',
    shortDescription: '正拍休止，反拍发音',
    level: '入门 02',
    tip: '不要把休止当成停顿，右手继续做下上动作，只有发音时才接触琴弦。',
    timeSignature: [4, 4],
    subdivisionsPerBeat: 2,
    measures: [
      makeSteps([
        { rightHand: '-', rest: true },
        { rightHand: '↑', note: { string: 0, fret: 3, finger: 1 } },
        { rightHand: '-', rest: true },
        { rightHand: '↑', note: { string: 1, fret: 3, finger: 1 } },
        { rightHand: '-', rest: true },
        { rightHand: '↑', note: { string: 0, fret: 5, finger: 3 } },
        { rightHand: '-', rest: true },
        { rightHand: '↑', note: { string: 1, fret: 5, finger: 3 } },
      ]),
    ],
  },
  {
    id: 'syncopation',
    title: '切分与闷音',
    description: '把重音放在拍与拍之间，用闷音连接动作，让律动更有方向。',
    shortDescription: '切分重音 + 闷音',
    level: '入门 03',
    tip: '闷音也要和节拍器对齐，它是节奏的一部分，不是没有弹奏。',
    timeSignature: [4, 4],
    subdivisionsPerBeat: 2,
    measures: [
      makeSteps([
        { rightHand: '↓', note: { string: 0, fret: 3, finger: 1 } },
        { rightHand: '×', rest: true },
        { rightHand: '↓', note: { string: 0, fret: 3, finger: 1 } },
        { rightHand: '↑', note: { string: 0, fret: 5, finger: 3 } },
        { rightHand: '×', rest: true },
        { rightHand: '↑', note: { string: 1, fret: 3, finger: 1 } },
        { rightHand: '↓', note: { string: 1, fret: 5, finger: 3 } },
        { rightHand: '×', rest: true },
      ]),
    ],
  },
]

export const importedScoreConfigs = {
  'shoot-the-moon-gp4': {
    sourceFile: '/file/Jones, Norah - Shoot The Moon.gp4',
    trackIndex: 0,
    startBar: 0,
    preserveBassPosition: false,
    level: 'GP4 导入',
  },
  'wickerman-bass-gp4': {
    sourceFile: '/file/Iron Maiden - Wickerman (Bass).gp4',
    trackIndex: 0,
    startBar: 0,
    preserveBassPosition: true,
    level: 'Bass GP4',
  },
} as const

export type ImportedScoreId = keyof typeof importedScoreConfigs

export const isImportedScoreId = (id: string): id is ImportedScoreId => id in importedScoreConfigs

export const createImportedPlaceholder = (id: ImportedScoreId): Exercise => ({
  id,
  title: '正在读取 Guitar Pro 曲谱...',
  description: '正在保留原始轨道数据并生成练习。',
  shortDescription: 'GP4 导入',
  level: importedScoreConfigs[id].level,
  tip: '原始曲谱数据会完整保留，练习页面只生成当前乐器的派生视图。',
  timeSignature: [4, 4],
  subdivisionsPerBeat: 2,
  measures: [makeSteps(Array.from({ length: 8 }, () => ({ rightHand: '-', rest: true })))],
  sourceFile: importedScoreConfigs[id].sourceFile,
})
