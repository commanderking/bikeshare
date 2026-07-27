'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

type Options = {
  // Largest clock time (months.length - 1). The race ends here.
  maxT: number
  // Current pace in months/second, read fresh each frame (so a speed change
  // takes effect immediately without restarting the loop).
  getMonthsPerSec: () => number
  // Called every animation frame (and on every seek) with the current time.
  onFrame: (time: number) => void
  // Called once when the clock reaches maxT.
  onEnd: () => void
  // Called when a hold (see `hold`) finishes, just before the clock resumes.
  onHoldEnd: () => void
}

type RaceClock = {
  // Current clock time. A ref so per-frame reads never trigger a re-render.
  tRef: React.MutableRefObject<number>
  playing: boolean
  play: () => void
  pause: () => void
  seek: (time: number) => void
  // Freeze time (without changing `playing`) for `ms`, then resume. Used to pause
  // at a year end. The frozen frame keeps re-rendering.
  hold: (ms: number) => void
}

// A requestAnimationFrame clock that advances a fractional month index. Owns
// play/pause/seek; the caller does all rendering in `onFrame`.
export const useRaceClock = ({
  maxT,
  getMonthsPerSec,
  onFrame,
  onEnd,
  onHoldEnd,
}: Options): RaceClock => {
  const tRef = useRef(0)
  const [playing, setPlaying] = useState(false)

  const rafRef = useRef<number>()
  const lastTsRef = useRef<number>()
  // Timestamp until which the clock is frozen (null = not holding).
  const holdUntilRef = useRef<number | null>(null)

  // Keep the latest callbacks/pace without re-subscribing the rAF loop.
  const onFrameRef = useRef(onFrame)
  onFrameRef.current = onFrame
  const onEndRef = useRef(onEnd)
  onEndRef.current = onEnd
  const onHoldEndRef = useRef(onHoldEnd)
  onHoldEndRef.current = onHoldEnd
  const getMpsRef = useRef(getMonthsPerSec)
  getMpsRef.current = getMonthsPerSec

  const stop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = undefined
    lastTsRef.current = undefined
  }, [])

  const loop = useCallback(
    (ts: number) => {
      if (lastTsRef.current == null) lastTsRef.current = ts
      const dt = (ts - lastTsRef.current) / 1000
      lastTsRef.current = ts

      // Frozen at a year end: keep repainting the same frame until the hold is up.
      if (holdUntilRef.current != null) {
        if (ts < holdUntilRef.current) {
          onFrameRef.current(tRef.current)
          rafRef.current = requestAnimationFrame(loop)
          return
        }
        holdUntilRef.current = null
        onHoldEndRef.current()
      }

      let time = tRef.current + dt * getMpsRef.current()
      if (time >= maxT) {
        tRef.current = maxT
        onFrameRef.current(maxT)
        stop()
        setPlaying(false)
        onEndRef.current()
        return
      }
      tRef.current = time
      onFrameRef.current(time)
      rafRef.current = requestAnimationFrame(loop)
    },
    [maxT, stop]
  )

  const play = useCallback(() => {
    if (tRef.current >= maxT) tRef.current = 0 // replay from the start
    setPlaying(true)
  }, [maxT])

  const pause = useCallback(() => setPlaying(false), [])

  const seek = useCallback(
    (time: number) => {
      holdUntilRef.current = null // scrubbing cancels any in-progress hold
      tRef.current = Math.max(0, Math.min(time, maxT))
      onFrameRef.current(tRef.current)
    },
    [maxT]
  )

  const hold = useCallback((ms: number) => {
    holdUntilRef.current = performance.now() + ms
  }, [])

  useEffect(() => {
    if (!playing) {
      stop()
      return
    }
    lastTsRef.current = undefined
    rafRef.current = requestAnimationFrame(loop)
    return stop
  }, [playing, loop, stop])

  return { tRef, playing, play, pause, seek, hold }
}
