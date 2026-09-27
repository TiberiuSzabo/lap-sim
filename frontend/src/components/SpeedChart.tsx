import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { TooltipContentProps, TooltipValueType } from 'recharts'
import { SERIES_COLORS, type ComparedRun } from '../comparison'
import { formatLapTime } from '../format'
import { runLabel } from '../labels'
import './SpeedChart.css'

// Recharts draws SVG attributes, where CSS variables are not reliable, so chart chrome uses hex.
const SURFACE = '#f2f2f2'
const GRID = '#dcdcdc'
const AXIS_TEXT = '#5c5c5c'
const TABLE_STEP_M = 100

type Row = Record<string, number>

const seriesKey = (slot: number) => `s${slot}`

// One row per distance with a column per run, so the tooltip can list every run at that point.
function mergeTelemetry(compared: ComparedRun[]): Row[] {
  const rows = new Map<number, Row>()
  for (const { run, slot } of compared) {
    for (const point of run.telemetry) {
      const row = rows.get(point.distance_m) ?? { distance_m: point.distance_m }
      row[seriesKey(slot)] = point.speed_kmh
      rows.set(point.distance_m, row)
    }
  }
  return [...rows.values()].sort((a, b) => a.distance_m - b.distance_m)
}

function formatKm(meters: number): string {
  return `${(meters / 1000).toLocaleString('ro-RO')} km`
}

function SpeedTooltip({ active, payload, label }: TooltipContentProps<TooltipValueType, string | number>) {
  if (!active || !payload?.length) return null
  return (
    <div className="speed-tooltip">
      <p className="speed-tooltip__distance">{formatKm(Number(label))}</p>
      {payload.map((item) => (
        <p key={String(item.dataKey)} className="speed-tooltip__row">
          <span className="speed-tooltip__key" style={{ background: item.color }} aria-hidden="true" />
          <strong>{item.value} km/h</strong>
          <span className="speed-tooltip__name">{item.name}</span>
        </p>
      ))}
    </div>
  )
}

type Props = {
  compared: ComparedRun[]
  carNames: Record<string, string>
  onRemove: (runId: string) => void
}

export function SpeedChart({ compared, carNames, onRemove }: Props) {
  if (compared.length === 0) {
    return (
      <p className="speed-chart__empty">
        Simulează un tur sau bifează unul din istoric ca să-l vezi pe grafic.
      </p>
    )
  }

  const rows = mergeTelemetry(compared)
  const maxDistance = rows[rows.length - 1].distance_m
  const xTicks = Array.from({ length: Math.floor(maxDistance / 500) + 1 }, (_, i) => i * 500)
  const tableRows = rows.filter((row) => row.distance_m % TABLE_STEP_M === 0)

  return (
    <figure className="speed-chart">
      <ul className="speed-chart__legend" aria-label="Tururi pe grafic">
        {compared.map(({ run, slot }) => (
          <li key={run.id} className="speed-chart__legend-item">
            <span className="speed-chart__key" style={{ background: SERIES_COLORS[slot] }} aria-hidden="true" />
            <span>{runLabel(run, carNames)}</span>
            <strong>{formatLapTime(run.lap_time_s)}</strong>
            <button
              type="button"
              className="speed-chart__remove"
              onClick={() => onRemove(run.id)}
              aria-label={`Scoate de pe grafic: ${runLabel(run, carNames)}`}
            >
              ×
            </button>
          </li>
        ))}
      </ul>

      <div className="speed-chart__plot">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} stroke={GRID} />
            <XAxis
              dataKey="distance_m"
              type="number"
              domain={[0, maxDistance]}
              ticks={xTicks}
              tickFormatter={formatKm}
              tick={{ fill: AXIS_TEXT, fontSize: 12 }}
              stroke={GRID}
            />
            <YAxis
              width={72}
              tickFormatter={(v: number) => `${v} km/h`}
              tick={{ fill: AXIS_TEXT, fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={SpeedTooltip} cursor={{ stroke: AXIS_TEXT, strokeWidth: 1 }} />
            {compared.map(({ run, slot }) => (
              <Line
                key={run.id}
                dataKey={seriesKey(slot)}
                name={runLabel(run, carNames)}
                stroke={SERIES_COLORS[slot]}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, stroke: SURFACE, strokeWidth: 2 }}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* The chart is not readable by screen readers or at low contrast; the table carries the same data. */}
      <details className="speed-chart__table">
        <summary>Vezi datele ca tabel (la fiecare {TABLE_STEP_M} m)</summary>
        <div className="speed-chart__table-scroll" tabIndex={0} role="region" aria-label="Viteze pe distanță">
          <table>
            <thead>
              <tr>
                <th scope="col">Distanță</th>
                {compared.map(({ run }) => (
                  <th key={run.id} scope="col">
                    {runLabel(run, carNames)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row) => (
                <tr key={row.distance_m}>
                  <th scope="row">{row.distance_m} m</th>
                  {compared.map(({ run, slot }) => (
                    <td key={run.id}>{row[seriesKey(slot)]} km/h</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  )
}
