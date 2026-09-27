import { useEffect, useRef } from 'react'
import endFrame from '../assets/hero/hero-end.jpg'
import poster from '../assets/hero/hero-poster.jpg'
import video from '../assets/hero/hero-scrub.mp4'
import { prefersReducedMotion } from '../motion'
import './Hero.css'

// The title fades in over the last 20% of the scroll, once the smoke fills the frame.
const TITLE_START = 0.8
// Share of the remaining distance covered per 60 fps frame. Lower = smoother but laggier.
const SMOOTHING = 0.12

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const isStatic = prefersReducedMotion()

  useEffect(() => {
    const section = sectionRef.current
    const videoElement = videoRef.current
    if (isStatic || !section || !videoElement) return
    // `target` follows the scroll exactly; `shown` glides towards it, so a mouse wheel's jumpy
    // steps become one continuous movement of the video.
    let target = 0
    let shown = 0
    let frame = 0
    let lastTime = 0

    // Arrow functions (not `function`) so TypeScript keeps knowing section/video are not null.
    const readScroll = () => {
      const rect = section.getBoundingClientRect()
      // How far we have scrolled through the tall section: 0 at its top, 1 when its end reaches
      // the bottom of the screen.
      const scrollable = rect.height - window.innerHeight
      target = Math.min(Math.max(-rect.top / scrollable, 0), 1)
    }

    const render = (progress: number) => {
      if (videoElement.duration) {
        videoElement.currentTime = progress * videoElement.duration
      }
      const titleIn = Math.max((progress - TITLE_START) / (1 - TITLE_START), 0)
      // CSS variables instead of React state: ~60 updates a second without re-rendering anything.
      section.style.setProperty('--progress', String(progress))
      section.style.setProperty('--title-in', String(titleIn))
    }

    const tick = (now: number) => {
      // Scale the step by the real frame time, so a 120 Hz screen glides at the same speed.
      const frames = lastTime ? (now - lastTime) / (1000 / 60) : 1
      lastTime = now
      shown += (target - shown) * (1 - (1 - SMOOTHING) ** frames)
      if (Math.abs(target - shown) < 0.0005) shown = target
      render(shown)
      // Keep gliding until we arrive, then stop using the CPU.
      frame = shown === target ? 0 : requestAnimationFrame(tick)
      if (!frame) lastTime = 0
    }

    const onScroll = () => {
      readScroll()
      if (!frame) frame = requestAnimationFrame(tick)
    }

    // Start where the page already is (e.g. after a reload halfway down), without gliding.
    readScroll()
    shown = target
    render(shown)
    const onMetadata = () => render(shown)

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    // The duration is unknown until the metadata arrives; seek again once it does.
    videoElement.addEventListener('loadedmetadata', onMetadata)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      videoElement.removeEventListener('loadedmetadata', onMetadata)
      cancelAnimationFrame(frame)
    }
  }, [isStatic])

  return (
    <section
      id="top"
      ref={sectionRef}
      className={`hero ${isStatic ? 'hero--static' : ''}`}
      aria-labelledby="hero-title"
    >
      <div className="hero__sticky">
        {isStatic ? (
          <img className="hero__media" src={endFrame} alt="" />
        ) : (
          <video
            ref={videoRef}
            className="hero__media"
            src={video}
            poster={poster}
            muted
            playsInline
            preload="auto"
            aria-hidden="true"
          />
        )}
        {/* The last frame is not fully white; this veil keeps the dark title readable. */}
        <div className="hero__veil" aria-hidden="true" />
        <div className="hero__content">
          <p className="hero__eyebrow">Simulator de tur</p>
          <h1 id="hero-title" className="hero__title">
            Lap Sim
          </h1>
          <p className="hero__subtitle">Trei mașini. Un singur tur.</p>
        </div>
        <p className="hero__hint" aria-hidden="true">
          Derulează
        </p>
      </div>
    </section>
  )
}
