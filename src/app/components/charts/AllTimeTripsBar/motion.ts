import { useEffect, useLayoutEffect } from 'react'

// True when the user has asked the OS to minimize non-essential motion.
export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

// useLayoutEffect on the client (needed to measure before paint for FLIP),
// falling back to useEffect on the server to avoid the SSR warning.
export const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect
