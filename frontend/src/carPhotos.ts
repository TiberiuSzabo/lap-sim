import type { Condition } from './api'
import caymanDamp from './assets/cars/cayman-gt4rs-damp.jpg'
import caymanDry from './assets/cars/cayman-gt4rs-dry.jpg'
import caymanWet from './assets/cars/cayman-gt4rs-wet.jpg'
import gt3Damp from './assets/cars/911-gt3-damp.jpg'
import gt3Dry from './assets/cars/911-gt3-dry.jpg'
import gt3Wet from './assets/cars/911-gt3-wet.jpg'
import taycanDamp from './assets/cars/taycan-turbo-gt-damp.jpg'
import taycanDry from './assets/cars/taycan-turbo-gt-dry.jpg'
import taycanWet from './assets/cars/taycan-turbo-gt-wet.jpg'

export type CarPhotos = {
  alt: string
  byCondition: Record<Condition, string>
}

// Keyed by the car id from the API. AI-generated images: same car and camera angle per condition,
// so the configurator can crossfade between them.
export const CAR_PHOTOS: Record<string, CarPhotos> = {
  '911-gt3': {
    alt: '911 GT3 roșu pe linia boxelor',
    byCondition: { dry: gt3Dry, damp: gt3Damp, wet: gt3Wet },
  },
  'cayman-gt4rs': {
    alt: '718 Cayman GT4 RS roșu pe linia boxelor',
    byCondition: { dry: caymanDry, damp: caymanDamp, wet: caymanWet },
  },
  'taycan-turbo-gt': {
    alt: 'Taycan Turbo GT roșu pe linia boxelor',
    byCondition: { dry: taycanDry, damp: taycanDamp, wet: taycanWet },
  },
}
