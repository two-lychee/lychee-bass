import type { Exercise, ExerciseStep, NoteEvent } from './exercise-data'

export type TrainingCategory = 'right' | 'left' | 'together'
export type FoundationExercise = Exercise & {
  category: TrainingCategory
  bpm: number
  prerequisite: string
  checkpoints: string[]
  nextId?: string
}
export const trainingCategories = [
  {
    id: 'right' as const,
    number: '01',
    title: '右手节奏',
    subtitle: '先让每一下，都落在该落的位置。',
    detail: '空弦起步 / 交替拨弦 / 节奏与休止',
  },
  {
    id: 'left' as const,
    number: '02',
    title: '左手指法',
    subtitle: '找到位置，再让手指从容移动。',
    detail: '单弦顺序 / 固定把位 / 跨弦与换把',
  },
  {
    id: 'together' as const,
    number: '03',
    title: '双手结合',
    subtitle: '把动作连起来，让练习成为乐句。',
    detail: '同步发音 / 换弦配合 / 短句应用',
  },
]
function measure(notes: Array<NoteEvent | null>, subdivisions: 1 | 2): ExerciseStep[] {
  let attack = 0
  return notes.map((note, index) => ({
    beat: Math.floor(index / subdivisions),
    label: index % subdivisions === 0 ? String(Math.floor(index / subdivisions) + 1) : '&',
    subdivisionLabel: index % subdivisions === 0 ? '正拍' : '反拍',
    rightHand: note ? (attack++ % 2 === 0 ? 'i' : 'm') : '-',
    note: note ?? undefined,
    rest: !note,
  }))
}
const note = (string: number, fret: number, finger: NoteEvent['finger'] = 1): NoteEvent => ({
  string,
  fret,
  finger,
})
const fingers = [1, 2, 3, 4] as const
const walk = (string: number, start = 5) =>
  fingers.map((finger) => note(string, start + finger - 1, finger))
const open = () => note(0, 0)
type Draft = Omit<FoundationExercise, 'timeSignature' | 'level' | 'shortDescription'>
const drafts: Draft[] = [
  {
    id: 'right-quarter',
    category: 'right',
    title: '四分音符交替拨弦',
    bpm: 60,
    description: '在 E 空弦上每拍弹一次，交替使用食指与中指。',
    prerequisite: '认识 E 弦，会用手指拨响空弦。',
    tip: 'i = 食指，m = 中指。两指交替，保持音量一致；左手轻触其余弦，减少杂音。',
    checkpoints: [
      '连续 4 遍保持均匀，不抢拍、不拖拍。',
      '两根手指的音量接近，肩膀和手腕保持放松。',
    ],
    subdivisionsPerBeat: 1,
    measures: [measure(Array.from({ length: 4 }, open), 1)],
    nextId: 'right-eighth',
  },
  {
    id: 'right-eighth',
    category: 'right',
    title: '连续八分音符',
    bpm: 60,
    description: '每拍均分为两次拨弦，口中数「1 & 2 & 3 & 4 &」。',
    prerequisite: '能稳定完成四分音符交替拨弦。',
    tip: '节拍声落在数字上，& 位于两拍中间。先保证均匀，再逐步提高速度。',
    checkpoints: ['正拍和反拍间距一致。', '关闭示范后，仍能连续跟住 4 遍。'],
    subdivisionsPerBeat: 2,
    measures: [measure(Array.from({ length: 8 }, open), 2)],
    nextId: 'right-rest',
  },
  {
    id: 'right-rest',
    category: 'right',
    title: '在休止处停住声音',
    bpm: 60,
    description: '在八分音符中加入休止；弹得准，也要停得准。',
    prerequisite: '能均匀弹奏连续八分音符。',
    tip: '休止格要止音，不是让空弦继续响。用拨弦手指轻触 E 弦，下一次发音按提示交替。',
    checkpoints: ['每个休止都能听到清晰的空隙。', '休止后重新进入时，不多等一拍。'],
    subdivisionsPerBeat: 2,
    measures: [measure([open(), open(), null, open(), open(), null, open(), open()], 2)],
    nextId: 'left-walk',
  },
  {
    id: 'left-walk',
    category: 'left',
    title: '单弦 1–2–3–4',
    bpm: 50,
    description: '从 E 弦第 5 品开始，让四根手指依次完成按弦。',
    prerequisite: '知道品位位置；右手能慢速稳定拨弦。',
    tip: '1 食指、2 中指、3 无名指、4 小指，对应 5–8 品。按在品丝后方附近，不必把所有手指强行撑开。',
    checkpoints: ['每个音清晰，按弦后再拨弦。', '手腕放松，不靠加大按弦力度换取速度。'],
    subdivisionsPerBeat: 1,
    measures: [measure(walk(0), 1)],
    nextId: 'left-cross',
  },
  {
    id: 'left-cross',
    category: 'left',
    title: '固定把位跨弦',
    bpm: 50,
    description: '保持第 5 把位，在 E、A 弦上往返完成同一指型。',
    prerequisite: '能慢速完成单弦 1–2–3–4。',
    tip: '每小节换一根弦。左手保持相近的位置，右手配合换弦，并及时止住上一根弦。',
    checkpoints: ['换弦时节拍连续，没有额外停顿。', '前一根弦不会持续发出杂音。'],
    subdivisionsPerBeat: 1,
    measures: [measure(walk(0), 1), measure(walk(1), 1)],
    nextId: 'left-shift',
  },
  {
    id: 'left-shift',
    category: 'left',
    title: '从第 5 把位到第 7 把位',
    bpm: 50,
    description: '在同一根弦上移动手的位置，保持 1–2–3–4 的指型。',
    prerequisite: '熟悉 1–2–3–4 指法，能分清手指编号与品位。',
    tip: '第一小节弹 5–8 品，第二小节弹 7–10 品。小节交界处整手移动；循环时回到第 5 把位。',
    checkpoints: ['换把后的第一音能准确落在目标品位。', '不依靠扭转手腕勉强伸到下一个把位。'],
    subdivisionsPerBeat: 1,
    measures: [measure(walk(0), 1), measure(walk(0, 7), 1)],
    nextId: 'together-sync',
  },
  {
    id: 'together-sync',
    category: 'together',
    title: '按弦与拨弦同步',
    bpm: 60,
    description: '左手在两个位置之间交替，右手保持八分音符。',
    prerequisite: '能稳定弹八分音符，熟悉第 5 把位。',
    tip: '食指按第 5 品，无名指按第 7 品。注意按弦与发音的衔接，避免拨弦先于按弦。',
    checkpoints: ['每个音都完整，没有被提前拨弦截断。', '更换手指时，八分音符依然均匀。'],
    subdivisionsPerBeat: 2,
    measures: [
      measure(
        Array.from({ length: 8 }, (_, i) => note(0, i % 2 ? 7 : 5, i % 2 ? 3 : 1)),
        2,
      ),
    ],
    nextId: 'together-cross',
  },
  {
    id: 'together-cross',
    category: 'together',
    title: '两根弦之间的配合',
    bpm: 60,
    description: '将固定把位的两个音扩展到 E、A 两根弦。',
    prerequisite: '能完成双手同步与固定把位跨弦。',
    tip: '每两次发音换弦。提前看下一音的位置，左手移动和右手换弦一起准备。',
    checkpoints: ['跨弦前后音量一致，节奏没有变慢。', '两根弦之间切换时没有明显串音。'],
    subdivisionsPerBeat: 2,
    measures: [
      measure(
        [
          note(0, 5),
          note(0, 7, 3),
          note(1, 5),
          note(1, 7, 3),
          note(1, 5),
          note(1, 7, 3),
          note(0, 5),
          note(0, 7, 3),
        ],
        2,
      ),
    ],
    nextId: 'together-phrase',
  },
  {
    id: 'together-phrase',
    category: 'together',
    title: '把动作连成一个短句',
    bpm: 60,
    description: '用两小节原创乐句，综合练习换音、跨弦与休止。',
    prerequisite: '能完成跨弦配合，并在休止处止音。',
    tip: '先慢速分清发音与休止，再循环完整两小节。第二小节结束时止音，准备回到 E 弦第 5 品。',
    checkpoints: ['两小节连贯，循环衔接自然。', '关闭示范后能独立跟拍，并保留休止的空间。'],
    subdivisionsPerBeat: 2,
    measures: [
      measure(
        [note(0, 5), note(0, 5), null, note(0, 7, 3), note(1, 5), null, note(0, 7, 3), null],
        2,
      ),
      measure(
        [note(1, 5), note(1, 7, 3), null, note(1, 5), note(0, 7, 3), note(0, 5), null, null],
        2,
      ),
    ],
  },
]
export const foundationExercises: FoundationExercise[] = drafts.map((item, index) => {
  let attack = 0
  return {
    ...item,
    timeSignature: [4, 4],
    level: `基础 ${String(index + 1).padStart(2, '0')}`,
    shortDescription: item.description,
    // Alternation continues across bar lines; rests do not consume a finger.
    measures: item.measures.map((bar) =>
      bar.map((step) => ({
        ...step,
        rightHand: step.note
          ? attack++ % 2 === 0
            ? ('i' as const)
            : ('m' as const)
          : ('-' as const),
      })),
    ),
  }
})
