import type { Tire } from '../api'
import { TIRE_LABELS } from '../labels'
import './TireBadge.css'

// Band colours follow the convention used in F1 (soft red, medium yellow, inter green, wet blue).
const TIRES: Record<Tire, { color: string; grooves: 'none' | 'shallow' | 'deep'; text: string }> = {
  soft: {
    color: '#e10600',
    grooves: 'none',
    text: 'Cea mai multă aderență pe uscat. Pe ud, aproape de nefolosit.',
  },
  slick: {
    color: '#f5c400',
    grooves: 'none',
    text: 'Rapid pe uscat, dar fără șanțuri nu poate evacua apa.',
  },
  intermediate: {
    color: '#2fa84f',
    grooves: 'shallow',
    text: 'Șanțuri fine: cel mai bun compromis pe pista umedă.',
  },
  wet: {
    color: '#1e7fd8',
    grooves: 'deep',
    text: 'Șanțuri adânci care evacuează apa. Cel mai rapid pe ud.',
  },
}

const SPOKE_ANGLES = [0, 72, 144, 216, 288]
const CHEVRON_ROWS = [8, 28, 48, 68, 88, 108]

type Props = {
  tire: Tire
}

export function TireBadge({ tire }: Props) {
  const { color, grooves, text } = TIRES[tire]
  return (
    <div className="tire-badge">
      <svg className="tire-badge__drawing" viewBox="0 0 170 120" aria-hidden="true">
        {/* Side view: rubber, coloured compound band, rim with five spokes. */}
        <circle cx="60" cy="60" r="58" fill="#0b0b0b" />
        <circle cx="60" cy="60" r="47" fill="none" stroke={color} strokeWidth="4" />
        <circle cx="60" cy="60" r="36" fill="#3a3a3a" />
        {SPOKE_ANGLES.map((angle) => (
          <line
            key={angle}
            x1="60"
            y1="60"
            x2="60"
            y2="27"
            stroke="#6b6b6b"
            strokeWidth="7"
            strokeLinecap="round"
            transform={`rotate(${angle} 60 60)`}
          />
        ))}
        <circle cx="60" cy="60" r="8" fill="#1f1f1f" />

        {/* Tread seen from the front: smooth for slicks, chevron grooves for inters and wets. */}
        <rect x="132" y="2" width="36" height="116" rx="8" fill="#0b0b0b" />
        {grooves !== 'none' &&
          CHEVRON_ROWS.map((y) => (
            <path
              key={y}
              d={grooves === 'deep' ? `M136 ${y} L150 ${y + 10} L164 ${y}` : `M140 ${y + 2} L150 ${y + 7} L160 ${y + 2}`}
              fill="none"
              stroke="#3d3d3d"
              strokeWidth={grooves === 'deep' ? 4 : 2}
            />
          ))}
        {grooves === 'deep' && <line x1="150" y1="4" x2="150" y2="116" stroke="#3d3d3d" strokeWidth="3" />}
      </svg>
      <div>
        <p className="tire-badge__name">
          <span className="tire-badge__dot" style={{ background: color }} aria-hidden="true" />
          {TIRE_LABELS[tire]}
        </p>
        <p className="tire-badge__text">{text}</p>
      </div>
    </div>
  )
}
