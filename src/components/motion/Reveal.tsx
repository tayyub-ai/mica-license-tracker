'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useInView } from './useInView'

// useLayoutEffect on the server warns; fall back to useEffect there.
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

interface RevealProps {
  children: React.ReactNode
  /** Stagger delay in ms. */
  delay?: number
  className?: string
  as?: 'div' | 'section' | 'li' | 'span'
}

/**
 * Fades + lifts children into view on first scroll. SSR and no-JS render fully
 * visible; the hidden start state is only applied on the client (before paint,
 * so there is no flash). Reduced-motion users get an instant reveal via the
 * global prefers-reduced-motion rule, never trapped hidden.
 */
export function Reveal({ children, delay = 0, className, as = 'div' }: RevealProps) {
  const { ref, inView } = useInView<HTMLElement>()
  const [armed, setArmed] = useState(false) // client took control
  const armedRef = useRef(false)

  useIsomorphicLayoutEffect(() => {
    if (!armedRef.current) {
      armedRef.current = true
      setArmed(true)
    }
  }, [])

  const hidden = armed && !inView
  const Tag = as as React.ElementType

  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        opacity: hidden ? 0 : 1,
        transform: hidden ? 'translateY(12px)' : 'translateY(0)',
        transition: 'opacity 0.6s ease, transform 0.6s ease',
        transitionDelay: `${delay}ms`,
        willChange: armed ? 'opacity, transform' : undefined,
      }}
    >
      {children}
    </Tag>
  )
}

export default Reveal
