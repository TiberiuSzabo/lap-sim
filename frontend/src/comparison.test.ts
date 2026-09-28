import { describe, expect, it } from 'vitest'
import type { Run } from './api'
import { MAX_COMPARED, addToComparison, removeFromComparison, type ComparedRun } from './comparison'

function makeRun(id: string): Run {
  return {
    id,
    created_at: '2026-09-28T10:00:00Z',
    car_id: '911-gt3',
    track_id: 'test-ring',
    tire: 'slick',
    condition: 'dry',
    lap_time_s: 68.409,
    top_speed_kmh: 275.6,
    min_speed_kmh: 64.1,
    telemetry: [],
  }
}

function addAll(ids: string[]): ComparedRun[] {
  return ids.reduce((list, id) => addToComparison(list, makeRun(id)), [] as ComparedRun[])
}

const slotsById = (list: ComparedRun[]) => Object.fromEntries(list.map((c) => [c.run.id, c.slot]))

describe('addToComparison', () => {
  it('gives each new run the next free colour slot', () => {
    expect(slotsById(addAll(['a', 'b', 'c']))).toEqual({ a: 0, b: 1, c: 2 })
  })

  it('ignores a run that is already compared', () => {
    const list = addAll(['a'])
    expect(addToComparison(list, makeRun('a'))).toBe(list)
  })

  it('drops the oldest run when full and reuses its slot', () => {
    const list = addAll(['a', 'b', 'c', 'd'])
    expect(list).toHaveLength(MAX_COMPARED)
    expect(slotsById(list)).toEqual({ b: 1, c: 2, d: 0 })
  })

  it('does not change the list it was given', () => {
    const list = addAll(['a'])
    addToComparison(list, makeRun('b'))
    expect(list).toHaveLength(1)
  })
})

describe('removeFromComparison', () => {
  it('keeps the colour of the runs that stay', () => {
    const list = removeFromComparison(addAll(['a', 'b', 'c']), 'a')
    expect(slotsById(list)).toEqual({ b: 1, c: 2 })
  })

  it('frees the slot for the next run', () => {
    const list = addToComparison(removeFromComparison(addAll(['a', 'b', 'c']), 'b'), makeRun('d'))
    expect(slotsById(list)).toEqual({ a: 0, c: 2, d: 1 })
  })
})
