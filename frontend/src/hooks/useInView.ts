import { useEffect, useRef, useState } from 'react'

// Becomes true the first time the element scrolls into view, then stays true.
export function useInView<T extends Element>() {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      // Fire when the element's top passes 85% of the screen height, not at the very bottom edge.
      { rootMargin: '0px 0px -15% 0px' },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return { ref, inView }
}
