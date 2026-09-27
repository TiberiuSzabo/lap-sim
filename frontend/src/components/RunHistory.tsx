import type { RunSummary } from '../api'
import { MAX_COMPARED } from '../comparison'
import { formatLapTime } from '../format'
import { CONDITION_LABELS, TIRE_LABELS, runLabel } from '../labels'
import './RunHistory.css'

type Props = {
  runs: RunSummary[]
  error: string | null
  carNames: Record<string, string>
  comparedIds: string[]
  onToggle: (runId: string, checked: boolean) => void
}

function formatWhen(isoDate: string): string {
  return new Date(isoDate).toLocaleString('ro-RO', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function RunHistory({ runs, error, carNames, comparedIds, onToggle }: Props) {
  if (error) {
    return (
      <p role="alert" className="run-history__message">
        Nu pot încărca istoricul: {error}
      </p>
    )
  }
  if (runs.length === 0) {
    return <p className="run-history__message">Încă nu ai simulat niciun tur.</p>
  }

  const isFull = comparedIds.length >= MAX_COMPARED

  return (
    <>
      <div className="run-history__scroll" tabIndex={0} role="region" aria-label="Istoricul tururilor">
        <table className="run-history">
          <thead>
            <tr>
              <th scope="col">Când</th>
              <th scope="col">Mașina</th>
              <th scope="col">Cauciuc</th>
              <th scope="col">Pistă</th>
              <th scope="col" className="run-history__number">
                Timp
              </th>
              <th scope="col">Pe grafic</th>
            </tr>
          </thead>
          <tbody>
            {runs.map((run) => {
              const isCompared = comparedIds.includes(run.id)
              return (
                <tr key={run.id}>
                  <td>{formatWhen(run.created_at)}</td>
                  <td>{carNames[run.car_id] ?? run.car_id}</td>
                  <td>{TIRE_LABELS[run.tire]}</td>
                  <td>{CONDITION_LABELS[run.condition]}</td>
                  <td className="run-history__number">{formatLapTime(run.lap_time_s)}</td>
                  <td>
                    <input
                      type="checkbox"
                      className="run-history__check"
                      checked={isCompared}
                      // Adding a 4th would silently drop one; disabling makes the limit visible.
                      disabled={!isCompared && isFull}
                      onChange={(e) => onToggle(run.id, e.target.checked)}
                      aria-label={`Pe grafic: ${runLabel(run, carNames)}, ${formatLapTime(run.lap_time_s)}`}
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className="run-history__hint">
        Maximum {MAX_COMPARED} tururi pe grafic. Se afișează ultimele {runs.length} simulări.
      </p>
    </>
  )
}
