'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Fires once when the element first scrolls into view. SSR-safe: returns
 * `inView = false` on the server and reveals on the client. Falls back to
 * `true` immediately when IntersectionObserver is unavailable so content is
 * never trapped hidden.
 */
export function useInView<T extends Element = HTMLDivElement>(
  options: IntersectionObserverInit = { rootMargin: '0px 0px -10% 0px', threshold: 0.15 },
) {
  const ref = useRef<T | null>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      }
    }, options)
    observer.observe(el)
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { ref, inView }
}

/** True when the user prefers reduced motion (always false during SSR). */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return reduced
}
