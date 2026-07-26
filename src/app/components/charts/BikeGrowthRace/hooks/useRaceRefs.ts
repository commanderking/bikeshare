'use client'

import { useMemo, useRef } from 'react'
import { RaceRefs } from '../render/paint'

// Creates the stable bundle of imperative DOM handles the race paints into each
// frame. The individual refs are attached by the presentational components; the
// parent's paint helpers write to them (see paint.ts).
export const useRaceRefs = (): RaceRefs => {
  const barRefs = useRef(new Map<string, HTMLDivElement>())
  const valueRefs = useRef(new Map<string, HTMLSpanElement>())
  const monthLabelRef = useRef<HTMLDivElement>(null)
  const axisTickRefs = useRef<HTMLSpanElement[]>([])
  const axisTickWrapRefs = useRef<HTMLDivElement[]>([])
  const travelerRef = useRef<HTMLDivElement>(null)
  const travelerLabelRef = useRef<HTMLSpanElement>(null)
  const scrubberRef = useRef<HTMLInputElement>(null)

  // Refs are stable, so the bundle is created once.
  return useMemo(
    () => ({
      barRefs,
      valueRefs,
      monthLabelRef,
      axisTickRefs,
      axisTickWrapRefs,
      travelerRef,
      travelerLabelRef,
      scrubberRef,
    }),
    [
      barRefs,
      valueRefs,
      monthLabelRef,
      axisTickRefs,
      axisTickWrapRefs,
      travelerRef,
      travelerLabelRef,
      scrubberRef,
    ]
  )
}
