import type { ReactNode } from 'react'
import { useInView } from '../hooks/useInView'
import './Reveal.css'

type Props = {
  children: ReactNode
  // Animate the list items inside one after another instead of the whole block at once.
  stagger?: boolean
}

export function Reveal({ children, stagger = false }: Props) {
  const { ref, inView } = useInView<HTMLDivElement>()
  const className = `${stagger ? 'reveal-list' : 'reveal'} ${inView ? 'is-visible' : ''}`
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
