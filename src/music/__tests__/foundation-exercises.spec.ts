import { describe, expect, it } from 'vitest'
import { foundationExercises, trainingCategories } from '../foundation-exercises'

describe('foundation exercise curriculum', () => {
  it('has three complete paths with valid next exercises', () => {
    expect(new Set(foundationExercises.map((e) => e.id)).size).toBe(9)
    for (const category of trainingCategories)
      expect(foundationExercises.filter((e) => e.category === category.id)).toHaveLength(3)
    for (const e of foundationExercises) {
      expect(e.checkpoints.length).toBeGreaterThan(0)
    }
    for (const e of foundationExercises.filter((item) => item.nextId)) {
      expect(foundationExercises.some((next) => next.id === e.nextId)).toBe(true)
    }
  })
  it('fills each 4/4 bar and alternates fingers across bars and loops', () => {
    for (const e of foundationExercises) {
      for (const bar of e.measures) expect(bar).toHaveLength(4 * e.subdivisionsPerBeat)
      const attacks = [...e.measures.flat(), ...e.measures.flat()].filter((step) => step.note)
      attacks.forEach((step, index) => {
        expect(step.rightHand).toBe(index % 2 ? 'm' : 'i')
        expect(step.note!.string).toBeGreaterThanOrEqual(0)
        expect(step.note!.string).toBeLessThan(4)
        expect(step.note!.fret).toBeGreaterThanOrEqual(0)
        expect(step.note!.fret).toBeLessThanOrEqual(12)
      })
    }
  })
  it('isolates right hand drills and provides meaningful left hand positions', () => {
    for (const e of foundationExercises.filter((e) => e.category === 'right')) {
      expect(
        e.measures
          .flat()
          .filter((s) => s.note)
          .every((s) => s.note!.fret === 0),
      ).toBe(true)
    }
    const shift = foundationExercises.find((e) => e.id === 'left-shift')!
    expect(shift.measures[0]!.map((s) => s.note!.fret)).toEqual([5, 6, 7, 8])
    expect(shift.measures[1]!.map((s) => s.note!.fret)).toEqual([7, 8, 9, 10])
    const phrase = foundationExercises.find((e) => e.id === 'together-phrase')!
    expect(phrase.measures.flat().some((s) => s.rest)).toBe(true)
    expect(
      new Set(
        phrase.measures
          .flat()
          .filter((s) => s.note)
          .map((s) => s.note!.string),
      ).size,
    ).toBe(2)
  })
})
