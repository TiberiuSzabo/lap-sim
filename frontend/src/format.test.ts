import { describe, expect, it } from 'vitest'
import { formatLapTime } from './format'

describe('formatLapTime', () => {
  it('formats minutes, seconds and milliseconds', () => {
    expect(formatLapTime(68.409)).toBe('1:08.409')
  })

  it('pads seconds under ten with a leading zero', () => {
    expect(formatLapTime(5.5)).toBe('0:05.500')
  })

  it('rolls over to the next minute instead of showing 60 seconds', () => {
    // Formatting the seconds directly would round 59.9996 up to "0:60.000".
    expect(formatLapTime(59.9996)).toBe('1:00.000')
  })
})
