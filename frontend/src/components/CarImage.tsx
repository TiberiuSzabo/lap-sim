import type { Car, Condition } from '../api'
import { CAR_PHOTOS } from '../carPhotos'
import './CarImage.css'

type Props = {
  car: Car
  condition?: Condition
  className?: string
  // Decorative images get an empty alt, so screen readers skip them.
  decorative?: boolean
}

export function CarImage({ car, condition = 'dry', className = '', decorative = false }: Props) {
  const photos = CAR_PHOTOS[car.id]
  if (!photos) {
    // A car added to the backend without photos still gets a clean placeholder.
    return (
      <div className={`car-image car-image--placeholder ${className}`} aria-hidden="true">
        {car.name}
      </div>
    )
  }
  return (
    <img
      className={`car-image ${className}`}
      src={photos.byCondition[condition]}
      alt={decorative ? '' : photos.alt}
      loading="lazy"
    />
  )
}
