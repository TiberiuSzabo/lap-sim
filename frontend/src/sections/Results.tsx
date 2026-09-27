import { lazy, Suspense } from 'react'
import type { RunSummary } from '../api'
import type { ComparedRun } from '../comparison'
import { RunHistory } from '../components/RunHistory'
import { SectionHeader } from '../components/SectionHeader'
import './Results.css'

// Recharts is most of the JavaScript; loading it in its own file keeps the first paint fast.
// lazy() expects a default export, so the named export is mapped to one.
const SpeedChart = lazy(() =>
  import('../components/SpeedChart').then((module) => ({ default: module.SpeedChart })),
)

type Props = {
  compared: ComparedRun[]
  history: RunSummary[]
  historyError: string | null
  carNames: Record<string, string>
  onToggle: (runId: string, checked: boolean) => void
}

export function Results({ compared, history, historyError, carNames, onToggle }: Props) {
  return (
    <section id="rezultate" className="section" aria-labelledby="rezultate-title">
      <div className="container">
        <SectionHeader id="rezultate-title" eyebrow="Rezultate" title="Viteza," accent="metru cu metru.">
          Suprapune până la trei tururi și vezi unde se câștigă timpul: la frânare, în viraje sau pe
          drepte.
        </SectionHeader>

        <Suspense fallback={<p className="results__loading">Se încarcă graficul…</p>}>
          <SpeedChart
            compared={compared}
            carNames={carNames}
            onRemove={(runId) => onToggle(runId, false)}
          />
        </Suspense>

        <h3 className="results__subtitle">Istoric</h3>
        <RunHistory
          runs={history}
          error={historyError}
          carNames={carNames}
          comparedIds={compared.map((c) => c.run.id)}
          onToggle={onToggle}
        />
      </div>
    </section>
  )
}
