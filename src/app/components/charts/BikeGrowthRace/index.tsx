'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  useIsomorphicLayoutEffect,
  prefersReducedMotion,
} from '@/app/components/charts/AllTimeTripsBar/motion'
import { scoreCities } from './timeline/buildRaceTimeline'
import { useRaceData } from './hooks/useRaceData'
import { useRaceClock } from './hooks/useRaceClock'
import { useFullscreen } from './hooks/useFullscreen'
import { useZoomFit } from './hooks/useZoomFit'
import ZoomRaceTrack, { ZoomTrackHandle } from './components/ZoomRaceTrack'
import Controls from './components/Controls'
import EstimateNote from './components/EstimateNote'
import { DEFAULT_MONTHS_PER_SEC, TOP_N } from './constants'

// Current-frame render state. Bar widths + value text are driven imperatively
// every frame; React only re-renders when the rank order or the month changes.
type Frame = { monthTick: number; order: string[] }

// Duration of the end-of-race morph into the full stacked layout.
const MORPH_MS = 2500

const BikeGrowthRace = () => {
  const { loading, months, cities, maxT, cityMap, speedScale, yearTicks } =
    useRaceData()

  // Fullscreen fills the screen: the chart root goes fullscreen (hiding the page
  // chrome for free), and the track area's measured height drives the size scale so
  // Paris, the pack, bikers, and text all grow to fit.
  const rootRef = useRef<HTMLDivElement>(null)
  const trackAreaRef = useRef<HTMLDivElement>(null)
  const { isFullscreen, toggle: toggleFullscreen } = useFullscreen(rootRef)
  const size = useZoomFit(trackAreaRef, isFullscreen)

  const [reduceMotion] = useState(prefersReducedMotion)
  const [frame, setFrame] = useState<Frame>({ monthTick: 0, order: [] })
  const [ended, setEnded] = useState(false)
  const [speedMul, setSpeedMul] = useState(1)
  const speedMulRef = useRef(1)
  // Bumped on replay to remount the view, clearing the morph's imperative styles so
  // it snaps cleanly back to the zoom layout.
  const [replayCount, setReplayCount] = useState(0)

  const clockRef = useRef<ReturnType<typeof useRaceClock>>()
  // The view paints itself imperatively through this handle each frame.
  const zoomTrackRef = useRef<ZoomTrackHandle>(null)
  const scrubberRef = useRef<HTMLInputElement>(null)

  // Change detection for setFrame.
  const lastMonthTick = useRef(-1)
  const lastOrder = useRef<string[]>([])

  // Score the field at t, paint the view imperatively, and sync the scrubber;
  // returns the top-N order. No React state is touched here.
  const scoreAndPaint = useCallback(
    (time: number): string[] => {
      const top = scoreCities(cities, time, TOP_N)
      zoomTrackRef.current?.paint(time)
      if (scrubberRef.current) scrubberRef.current.value = String(time)
      return top.map(([raceCity]) => raceCity.city)
    },
    [cities]
  )

  const handleFrame = useCallback(
    (time: number) => {
      const order = scoreAndPaint(time)
      const monthTick = Math.floor(time)
      const orderChanged =
        order.length !== lastOrder.current.length ||
        order.some((id, index) => id !== lastOrder.current[index])
      if (monthTick !== lastMonthTick.current || orderChanged) {
        lastMonthTick.current = monthTick
        lastOrder.current = order
        setFrame({ monthTick, order })
      }
    },
    [scoreAndPaint]
  )

  const clock = useRaceClock({
    maxT,
    getMonthsPerSec: () => DEFAULT_MONTHS_PER_SEC * speedMulRef.current,
    onFrame: handleFrame,
    onEnd: () => setEnded(true),
    onHoldEnd: () => {}, // the view never holds — it runs straight through
  })
  clockRef.current = clock

  // The finale: once the race ends, morph the layout toward the full stacked view
  // over MORPH_MS — dissolve the magnifier chrome, then travel the bars out. Driven
  // imperatively (no per-frame React re-render); snaps back on replay (ended → false).
  useEffect(() => {
    if (!ended) {
      zoomTrackRef.current?.paint(clockRef.current?.tRef.current ?? 0, 0)
      return
    }
    const startMs = performance.now()
    let raf = 0
    const step = () => {
      const morph = Math.min((performance.now() - startMs) / MORPH_MS, 1)
      zoomTrackRef.current?.paint(clockRef.current?.tRef.current ?? maxT, morph)
      if (morph < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [ended, maxT])

  // Initialize (and, unless reduced motion, auto-play) once the data is in.
  useIsomorphicLayoutEffect(() => {
    if (loading || months.length === 0) return
    clock.seek(0)
    if (!reduceMotion) clock.play()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, months.length])

  // After a reorder/month re-render, repaint so newly mounted rows get correct
  // widths before the browser paints (no flash from width 0).
  useIsomorphicLayoutEffect(() => {
    if (months.length > 0) scoreAndPaint(clock.tRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frame])

  const handlePlayPause = () => {
    if (ended) {
      setEnded(false)
      setReplayCount((count) => count + 1) // remount the view (clears the morph)
      clock.play()
    } else if (clock.playing) {
      clock.pause()
    } else {
      clock.play()
    }
  }

  const handleScrub = (time: number) => {
    clock.pause()
    if (ended) setEnded(false)
    clock.seek(time)
  }

  const handleSpeedChange = (mul: number) => {
    speedMulRef.current = mul
    setSpeedMul(mul)
  }

  if (loading) return <p className="py-8 text-center italic">Loading…</p>
  if (months.length === 0)
    return <p className="py-8 text-center italic">No data available.</p>

  return (
    <div
      ref={rootRef}
      className={
        isFullscreen
          ? 'flex h-full flex-col bg-white p-8 dark:bg-gray-900'
          : undefined
      }
    >
      <div className="flex justify-end pb-1">
        <button
          type="button"
          onClick={toggleFullscreen}
          className="text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          {isFullscreen ? 'Exit full screen' : 'Full screen'}
        </button>
      </div>

      {/* In fullscreen this fills the leftover height and centers the view; its
          measured height is what useZoomFit scales the layout against. */}
      <div
        ref={trackAreaRef}
        className={
          isFullscreen
            ? 'flex min-h-0 flex-1 flex-col justify-center overflow-hidden'
            : undefined
        }
      >
        <ZoomRaceTrack
          key={replayCount}
          ref={zoomTrackRef}
          order={frame.order}
          cityMap={cityMap}
          monthTick={frame.monthTick}
          months={months}
          reduceMotion={reduceMotion}
          size={size}
          speedScale={speedScale}
          playing={clock.playing}
        />
      </div>

      <Controls
        playing={clock.playing}
        ended={ended}
        onPlayPause={handlePlayPause}
        speedMul={speedMul}
        onSpeedChange={handleSpeedChange}
        maxT={maxT}
        onScrub={handleScrub}
        scrubberRef={scrubberRef}
        yearTicks={yearTicks}
      />

      {!isFullscreen && <EstimateNote />}
    </div>
  )
}

export default BikeGrowthRace
