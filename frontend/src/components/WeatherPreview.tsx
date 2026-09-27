import type { Car, Condition } from '../api'
import { CarImage } from './CarImage'
import './WeatherPreview.css'

const CONDITIONS: Condition[] = ['dry', 'damp', 'wet']

const WEATHER_LABELS: Record<Condition, string> = {
  dry: 'Uscat · soare',
  damp: 'Umed · înnorat',
  wet: 'Ud · ploaie',
}

type Props = {
  car: Car
  condition: Condition
}

// All three photos are stacked and loaded up front; changing the condition only changes which one
// is visible, so the switch is an instant crossfade instead of waiting for a download.
export function WeatherPreview({ car, condition }: Props) {
  return (
    <figure className="weather">
      {CONDITIONS.map((c) => (
        <CarImage
          key={c}
          car={car}
          condition={c}
          decorative={c !== condition}
          className={`weather__photo ${c === condition ? 'weather__photo--visible' : ''}`}
        />
      ))}
      <figcaption className="weather__label">{WEATHER_LABELS[condition]}</figcaption>
    </figure>
  )
}
