import { useEffect, useState } from 'react'
import { getCars, getRun, getRuns, type Car, type Run, type RunSummary } from './api'
import { addToComparison, removeFromComparison, type ComparedRun } from './comparison'
import { Footer } from './components/Footer'
import { TopBar } from './components/TopBar'
import { CarsSection } from './sections/CarsSection'
import { Configurator } from './sections/Configurator'
import { GripSection } from './sections/GripSection'
import { Hero } from './sections/Hero'
import { Results } from './sections/Results'

function App() {
  // State lives here because several sections share it: the car list feeds the cards and the
  // configurator; a new run from the configurator appears in the results.
  const [cars, setCars] = useState<Car[]>([])
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<RunSummary[]>([])
  const [historyError, setHistoryError] = useState<string | null>(null)
  const [compared, setCompared] = useState<ComparedRun[]>([])

  function refreshHistory() {
    getRuns()
      .then((runs) => {
        setHistory(runs)
        setHistoryError(null)
      })
      .catch((e: Error) => setHistoryError(e.message))
  }

  useEffect(() => {
    getCars()
      .then(setCars)
      .catch((e: Error) => setError(e.message))
    refreshHistory()
  }, [])

  function handleRunCreated(run: Run) {
    setCompared((prev) => addToComparison(prev, run))
    refreshHistory()
  }

  function handleToggle(runId: string, checked: boolean) {
    if (!checked) {
      setCompared((prev) => removeFromComparison(prev, runId))
      return
    }
    // The history has no telemetry (it would be 20 × 330 points), so fetch the full run on demand.
    getRun(runId)
      .then((run) => setCompared((prev) => addToComparison(prev, run)))
      .catch((e: Error) => setHistoryError(e.message))
  }

  const carNames = Object.fromEntries(cars.map((car) => [car.id, car.name]))

  return (
    <>
      <a href="#continut" className="skip-link">
        Sari la conținut
      </a>
      <TopBar />
      <main id="continut">
        <Hero />
        <CarsSection cars={cars} error={error} />
        <GripSection />
        <div className="kerb" aria-hidden="true" />
        <Configurator cars={cars} onRunCreated={handleRunCreated} />
        <Results
          compared={compared}
          history={history}
          historyError={historyError}
          carNames={carNames}
          onToggle={handleToggle}
        />
      </main>
      <Footer />
    </>
  )
}

export default App
