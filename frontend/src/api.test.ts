import { afterEach, describe, expect, it, vi } from 'vitest'
import { getCars, getRun, simulate } from './api'

function mockFetch(body: unknown, status = 200) {
  const fetchMock = vi
    .fn()
    .mockResolvedValue(
      new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('api client', () => {
  it('getCars calls /api/cars and returns the parsed list', async () => {
    const cars = [
      { id: '911-gt3', name: '911 GT3', mass_kg: 1435, power_kw: 375, top_speed_kmh: 318 },
    ]
    const fetchMock = mockFetch(cars)

    await expect(getCars()).resolves.toEqual(cars)
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:8000/api/cars', undefined)
  })

  it('simulate sends a JSON POST with the request body', async () => {
    const fetchMock = mockFetch({ id: 'run-1' })
    const body = {
      car_id: '911-gt3',
      track_id: 'test-ring',
      tire: 'wet',
      condition: 'wet',
    } as const

    await simulate(body)

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('http://localhost:8000/api/simulate')
    expect(init.method).toBe('POST')
    expect(init.headers).toEqual({ 'Content-Type': 'application/json' })
    expect(JSON.parse(init.body)).toEqual(body)
  })

  it('throws on an error status, because fetch itself does not', async () => {
    mockFetch({ detail: 'Unknown run: nope' }, 404)

    await expect(getRun('nope')).rejects.toThrow('status 404')
  })

  it('escapes the run id in the URL', async () => {
    const fetchMock = mockFetch({})

    await getRun('a/b')

    expect(fetchMock.mock.calls[0][0]).toBe('http://localhost:8000/api/runs/a%2Fb')
  })
})
