import type { Run } from './api'

export const MAX_COMPARED = 3

// Validated as a set (colour-blind safe, all pairs). Order matters: slot 0 is always blue.
export const SERIES_COLORS = ['#2a78d6', '#eb6834', '#1baf7a']

export type ComparedRun = {
  run: Run
  // Fixed when the run is added, so removing another run never repaints this one.
  slot: number
}

export function addToComparison(list: ComparedRun[], run: Run): ComparedRun[] {
  if (list.some((c) => c.run.id === run.id)) return list
  const kept = list.length >= MAX_COMPARED ? list.slice(1) : list
  const usedSlots = kept.map((c) => c.slot)
  const slot = SERIES_COLORS.findIndex((_, i) => !usedSlots.includes(i))
  return [...kept, { run, slot }]
}

export function removeFromComparison(list: ComparedRun[], runId: string): ComparedRun[] {
  return list.filter((c) => c.run.id !== runId)
}
