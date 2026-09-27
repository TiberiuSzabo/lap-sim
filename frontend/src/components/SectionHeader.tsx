import type { ReactNode } from 'react'
import { Reveal } from './Reveal'
import './SectionHeader.css'

type Props = {
  id: string
  eyebrow: string
  title: string
  accent: string
  children?: ReactNode
}

export function SectionHeader({ id, eyebrow, title, accent, children }: Props) {
  return (
    <Reveal>
      <div className="section-header">
        <p className="section-header__eyebrow">{eyebrow}</p>
        <h2 id={id} className="section-header__title">
          {title} <em>{accent}</em>
        </h2>
        {children && <p className="section-header__lede">{children}</p>}
      </div>
    </Reveal>
  )
}
