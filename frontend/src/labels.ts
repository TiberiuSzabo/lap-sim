import type { Condition, RunSummary, Tire } from './api'

export const TIRE_LABELS: Record<Tire, string> = {
  soft: 'Soft',
  slick: 'Slick',
  intermediate: 'Intermediar',
  wet: 'Ploaie',
}

export const CONDITION_LABELS: Record<Condition, string> = {
  dry: 'Uscat',
  damp: 'Umed',
  wet: 'Ud',
}

export function runLabel(run: RunSummary, carNames: Record<string, string>): string {
  return `${carNames[run.car_id] ?? run.car_id} · ${TIRE_LABELS[run.tire]} · ${CONDITION_LABELS[run.condition]}`
}
