// Guitar Pro 原始数据 -> 练习步骤的纯函数转换

import type {
  ImportedScore,
  ImportedScoreBar,
  ImportedScoreNote,
  ImportedScoreTrack,
} from '@/music/guitar-pro'
import type { Exercise, ExerciseStep, NoteEvent } from './exercise-data'

const BASS_OPEN_MIDI = [28, 33, 38, 43]

const mapGuitarNoteToBass = (note: ImportedScoreNote): NoteEvent | undefined => {
  let midi = note.midi
  while (midi > BASS_OPEN_MIDI[3]) midi -= 12

  for (let string = BASS_OPEN_MIDI.length - 1; string >= 0; string--) {
    const fret = midi - BASS_OPEN_MIDI[string]
    if (fret >= 0 && fret <= 12) {
      return {
        string,
        fret,
        finger: Math.max(1, Math.min(4, fret || 1)) as 1 | 2 | 3 | 4,
      }
    }
  }
  return undefined
}

const fingerForFret = (fret: number): 1 | 2 | 3 | 4 =>
  Math.max(1, Math.min(4, fret || 1)) as 1 | 2 | 3 | 4

const mapTrackNote = (
  note: ImportedScoreNote,
  preserveBassPosition: boolean,
): NoteEvent | undefined => {
  if (!preserveBassPosition) return mapGuitarNoteToBass(note)
  const string = note.string - 1
  if (string < 0 || string > 3) return mapGuitarNoteToBass(note)
  return { string, fret: note.fret, finger: fingerForFret(note.fret) }
}

const stepLabels = (index: number, denominator: number) => {
  const slotsPerBeat = Math.max(1, Math.round(16 / denominator))
  const subdivision = index % slotsPerBeat
  const beat = Math.floor(index / slotsPerBeat)
  const labels = slotsPerBeat === 4 ? ['1', 'e', '&', 'a'] : slotsPerBeat === 2 ? ['1', '&'] : ['1']
  const names = slotsPerBeat === 4 ? ['正拍', '十六分', '反拍', '十六分'] : ['正拍', '反拍']
  return {
    beat,
    label: subdivision === 0 ? String(beat + 1) : labels[subdivision] ?? '',
    subdivisionLabel: names[subdivision] ?? '拍内',
  }
}

export const convertBar = (bar: ImportedScoreBar, preserveBassPosition: boolean): ExerciseStep[] => {
  const [, denominator] = bar.timeSignature
  const expectedSlots = Math.max(1, Math.round(bar.timeSignature[0] * (16 / denominator)))
  const steps: ExerciseStep[] = []

  for (const beat of bar.beats) {
    const durationSlots = Math.max(1, Math.round(16 / Math.max(1, beat.duration)))
    const sourceNote = [...beat.notes].sort((a, b) => a.midi - b.midi)[0]
    const note = sourceNote ? mapTrackNote(sourceNote, preserveBassPosition) : undefined
    const index = steps.length
    steps.push({
      ...stepLabels(index, denominator),
      rightHand: note ? (index % 2 === 0 ? '↓' : '↑') : '-',
      note,
      rest: beat.isRest || !note,
    })
    for (let held = 1; held < durationSlots; held++) {
      const heldIndex = steps.length
      steps.push({ ...stepLabels(heldIndex, denominator), rightHand: '-', rest: true })
    }
  }

  while (steps.length < expectedSlots) {
    const index = steps.length
    steps.push({ ...stepLabels(index, denominator), rightHand: '-', rest: true })
  }
  return steps
}

export const scoreToExercise = (
  score: ImportedScore,
  track: ImportedScoreTrack,
  options: { id: string; level: string; sourceFile: string; preserveBassPosition: boolean },
): Exercise => {
  if (!track.bars.length) throw new Error('The imported score has no readable bars')
  const measures = track.bars.map((bar) => convertBar(bar, options.preserveBassPosition))
  return {
    id: options.id,
    title: score.title || 'Imported Guitar Pro score',
    description: `${score.artist || 'Unknown artist'} · ${track.name || 'Track 1'} · ${track.bars.length} 小节`,
    shortDescription: '完整 Guitar Pro 曲谱导入',
    level: options.level,
    tip: options.preserveBassPosition
      ? '弦号和品位来自原始 Bass 轨道；播放到小节末尾后会自动进入下一小节。'
      : '原轨道已映射到 Bass 音域；播放到小节末尾后会自动进入下一小节。',
    timeSignature: track.bars[0].timeSignature,
    measureSignatures: track.bars.map((bar) => bar.timeSignature),
    measures,
    subdivisionsPerBeat: 4,
    sourceFile: options.sourceFile,
  }
}
