export function formatLapTime(seconds: number): string {
  // Work in whole milliseconds: formatting the seconds directly turns 59.9996 into "0:60.000".
  const totalMs = Math.round(seconds * 1000)
  const minutes = Math.floor(totalMs / 60_000)
  const rest = ((totalMs % 60_000) / 1000).toFixed(3).padStart(6, '0')
  return `${minutes}:${rest}`
}
