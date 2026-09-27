const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export type Car = {
  id: string
  name: string
  mass_kg: number
  power_kw: number
  top_speed_kmh: number
}

export type Tire = 'soft' | 'slick' | 'intermediate' | 'wet'
export type Condition = 'dry' | 'damp' | 'wet'

export type SimulateRequest = {
  car_id: string
  track_id: string
  tire: Tire
  condition: Condition
}

export type TelemetryPoint = {
  distance_m: number
  speed_kmh: number
}

export type RunSummary = {
  id: string
  created_at: string
  car_id: string
  track_id: string
  tire: Tire
  condition: Condition
  lap_time_s: number
  top_speed_kmh: number
  min_speed_kmh: number
}

export type Run = RunSummary & {
  telemetry: TelemetryPoint[]
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, init)
  // fetch only rejects on network errors; a 404 or 500 still "succeeds", so check it ourselves.
  if (!response.ok) {
    throw new Error(`${path} failed with status ${response.status}`)
  }
  return response.json() as Promise<T>
}

export function getCars(): Promise<Car[]> {
  return request<Car[]>('/api/cars')
}

export function getRuns(): Promise<RunSummary[]> {
  return request<RunSummary[]>('/api/runs')
}

export function getRun(id: string): Promise<Run> {
  return request<Run>(`/api/runs/${encodeURIComponent(id)}`)
}

export function simulate(body: SimulateRequest): Promise<Run> {
  return request<Run>('/api/simulate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}
