import { useState, type FormEvent } from 'react'
import { simulate, type Car, type Condition, type Run, type Tire } from '../api'
import { PillGroup } from '../components/PillGroup'
import { SectionHeader } from '../components/SectionHeader'
import { TireBadge } from '../components/TireBadge'
import { WeatherPreview } from '../components/WeatherPreview'
import { formatLapTime } from '../format'
import { CONDITION_LABELS, TIRE_LABELS } from '../labels'
import './Configurator.css'

// Only one track exists, so a track picker would be noise.
const TRACK_ID = 'test-ring'

const TIRE_ORDER: Tire[] = ['soft', 'slick', 'intermediate', 'wet']
const CONDITION_ORDER: Condition[] = ['dry', 'damp', 'wet']
const TIRES = TIRE_ORDER.map((value) => ({ value, label: TIRE_LABELS[value] }))
const CONDITIONS = CONDITION_ORDER.map((value) => ({ value, label: CONDITION_LABELS[value] }))

type Props = {
  cars: Car[]
  onRunCreated: (run: Run) => void
}

export function Configurator({ cars, onRunCreated }: Props) {
  const [selectedCarId, setSelectedCarId] = useState<string | null>(null)
  const [tire, setTire] = useState<Tire>('slick')
  const [condition, setCondition] = useState<Condition>('dry')
  const [result, setResult] = useState<Run | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Derived, not stored: until the user picks a car, the first one from the API is selected.
  const carId = selectedCarId ?? cars[0]?.id
  const car = cars.find((c) => c.id === carId)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!carId) return
    setIsLoading(true)
    setError(null)
    try {
      const run = await simulate({ car_id: carId, track_id: TRACK_ID, tire, condition })
      setResult(run)
      onRunCreated(run)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section id="configurator" className="section dark" aria-labelledby="configurator-title">
      <div className="container">
        <SectionHeader id="configurator-title" eyebrow="Configurator" title="Alege." accent="Apoi simulează.">
          Mașina, cauciucurile și vremea. Fizica face restul.
        </SectionHeader>

        <div className="configurator">
          <div>
            {car && <WeatherPreview car={car} condition={condition} />}
            <TireBadge tire={tire} />
          </div>

          <form className="configurator__controls" onSubmit={handleSubmit}>
            <PillGroup
              legend="Mașina"
              name="car"
              options={cars.map((c) => ({ value: c.id, label: c.name }))}
              value={carId ?? ''}
              onChange={setSelectedCarId}
            />
            <PillGroup legend="Cauciucuri" name="tire" options={TIRES} value={tire} onChange={setTire} />
            <PillGroup
              legend="Condiția pistei"
              name="condition"
              options={CONDITIONS}
              value={condition}
              onChange={setCondition}
            />

            <button type="submit" className="configurator__submit" disabled={!carId || isLoading}>
              <span>{isLoading ? 'Se simulează…' : 'Simulează'}</span>
            </button>

            {error && (
              <p role="alert" className="configurator__error">
                Simularea a eșuat: {error}
              </p>
            )}

            {/* aria-live: screen readers announce the new lap time when it appears. */}
            <div className="configurator__result" aria-live="polite">
              <p className="configurator__result-label">Timp pe tur</p>
              {result ? (
                <p className="configurator__lap-time">{formatLapTime(result.lap_time_s)}</p>
              ) : (
                <p className="configurator__lap-time configurator__lap-time--empty">0:00.000</p>
              )}
              {result && (
                <p className="configurator__speeds">
                  Viteză max. {result.top_speed_kmh} km/h · Viteză min. {result.min_speed_kmh} km/h
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}
