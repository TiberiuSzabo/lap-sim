import { useEffect, useRef, useState } from 'react'
import { prefersReducedMotion } from '../motion'

// Moves the shown number from its current value to `target` over `durationMs`, like a timer
// settling. With reduced motion the target is returned directly and nothing animates.
export function useAnimatedNumber(target: number, durationMs = 700): number {
  const [shown, setShown] = useState(target)
  // A ref, not state: the next animation must start from wherever the last frame stopped.
  const shownRef = useRef(target)

  useEffect(() => {
    const from = shownRef.current
    if (from === target || prefersReducedMotion()) return

    const start = performance.now()
    let frame = 0
    function tick(now: number) {
      // `now` is when the frame began, which can be slightly before `start`: clamp at 0, or the
      // first frame shows a negative time.
      const progress = Math.min(Math.max((now - start) / durationMs, 0), 1)
      // Ease-out: fast at first, slows down at the end.
      const eased = 1 - (1 - progress) ** 3
      shownRef.current = from + (target - from) * eased
      setShown(shownRef.current)
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, durationMs])

  return prefersReducedMotion() ? target : shown
}
