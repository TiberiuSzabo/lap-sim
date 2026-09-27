import type { Car } from '../api'
import { CarImage } from '../components/CarImage'
import { SectionHeader } from '../components/SectionHeader'
import './CarsSection.css'

type Props = {
  cars: Car[]
  error: string | null
}

export function CarsSection({ cars, error }: Props) {
  return (
    <section id="masini" className="section" aria-labelledby="masini-title">
      <div className="container">
        <SectionHeader id="masini-title" eyebrow="Garajul" title="Trei mașini." accent="Trei filozofii.">
          Aripă mare, motor central, putere electrică. Aceeași pistă, aceleași legi ale fizicii.
        </SectionHeader>

        {error && (
          <p role="alert" className="cars__message">
            Nu mă pot conecta la API. Pornește backend-ul și reîncarcă pagina.
          </p>
        )}
        {!error && cars.length === 0 && <p className="cars__message">Se încarcă mașinile…</p>}

        <ul className="cars__grid">
          {cars.map((car) => (
            <li key={car.id} className="car-card">
              <CarImage car={car} className="car-card__image" />
              <h3 className="car-card__name">{car.name}</h3>
              <dl className="car-card__specs">
                <div>
                  <dt>Putere</dt>
                  <dd>{car.power_kw} kW</dd>
                </div>
                <div>
                  <dt>Masă</dt>
                  <dd>{car.mass_kg} kg</dd>
                </div>
                <div>
                  <dt>Viteză max.</dt>
                  <dd>{car.top_speed_kmh} km/h</dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
