import './Hero.css'

// Static placeholder; the scroll-driven video replaces the background in a later step.
export function Hero() {
  return (
    <section id="top" className="hero dark" aria-labelledby="hero-title">
      <p className="hero__eyebrow">Simulator de tur</p>
      <h1 id="hero-title" className="hero__title">
        Lap Sim
      </h1>
      <p className="hero__subtitle">Trei mașini. Un singur tur.</p>
    </section>
  )
}
