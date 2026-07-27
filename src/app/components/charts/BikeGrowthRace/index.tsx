'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  useIsomorphicLayoutEffect,
  prefersReducedMotion,
} from '@/app/components/charts/AllTimeTripsBar/motion'
import { scoreCities } from './timeline/buildRaceTimeline'
import { computeAxisState, Transition } from './render/axisState'
import { paintAxis, paintBars, paintReadouts } from './render/paint'
import { firstCrossing } from './timeline/milestones'
import { useRaceData } from './hooks/useRaceData'
import { useRaceRefs } from './hooks/useRaceRefs'
import { useRaceClock } from './hooks/useRaceClock'
import TopAxis from './components/TopAxis'
import RaceTrack from './components/RaceTrack'
import Controls from './components/Controls'
import EstimateNote from './components/EstimateNote'
import {
  DEFAULT_MONTHS_PER_SEC,
  EASE_MS,
  HOLD_MS,
  MILESTONES,
  REACHED_MS,
  TOP_N,
} from './constants'

// Current-frame render state. Bar widths + value text are driven imperatively
// every frame; React only re-renders when the rank order or the month changes.
type Frame = { monthTick: number; order: string[] }

const BikeGrowthRace = () => {
  const {
    loading,
    months,
    cities,
    maxT,
    cityMap,
    speedScale,
    milestoneTimes,
    yearTicks,
  } = useRaceData()
  const refs = useRaceRefs()

  const [reduceMotion] = useState(prefersReducedMotion)
  const [frame, setFrame] = useState<Frame>({ monthTick: 0, order: [] })
  const [ended, setEnded] = useState(false)
  const [speedMul, setSpeedMul] = useState(1)
  const speedMulRef = useRef(1)
  const [openInfo, setOpenInfo] = useState<string | null>(null)
  // Close the "data ends" popover on any outside click.
  useEffect(() => {
    if (!openInfo) return
    const handleOutsideMouseDown = (event: MouseEvent) => {
      if (!(event.target as Element).closest('[data-info-ui]')) setOpenInfo(null)
    }
    document.addEventListener('mousedown', handleOutsideMouseDown)
    return () => document.removeEventListener('mousedown', handleOutsideMouseDown)
  }, [openInfo])

  // Milestone playback state (refs — the goal axis is applied imperatively).
  // `prevT` brackets each frame's advance to detect a crossing; `transition`, when
  // set, means we've reached a milestone and the clock is frozen while the axis
  // eases to the next goal. `clockRef` lets handleFrame reach the clock it feeds.
  const prevT = useRef(0)
  const transition = useRef<Transition | null>(null)
  const clockRef = useRef<ReturnType<typeof useRaceClock>>()

  // Change detection for setFrame.
  const lastMonthTick = useRef(-1)
  const lastOrder = useRef<string[]>([])

  // Score the field at t and paint the bars/axis/readouts imperatively; returns
  // the top-N order. No React state is touched here.
  const scoreAndPaint = useCallback(
    (time: number): string[] => {
      const top = scoreCities(cities, time, TOP_N)
      const axis = computeAxisState(time, transition.current, milestoneTimes)
      paintAxis(refs, axis)
      paintBars(refs, top, axis.axisValue)
      paintReadouts(refs, time, months)
      return top.map(([raceCity]) => raceCity.city)
    },
    [cities, months, milestoneTimes, refs]
  )

  const handleFrame = useCallback(
    (incomingTime: number) => {
      let time = incomingTime
      // Did the leader just cross the next milestone this frame? If so, clamp to
      // the line and freeze the clock through the reached / ease / hold beats. The
      // final milestone (the finish line) is crossed without stopping — no hold.
      const crossedIndex = firstCrossing(prevT.current, time, milestoneTimes)
      if (
        crossedIndex !== -1 &&
        crossedIndex < MILESTONES.length - 1 &&
        clockRef.current
      ) {
        time = milestoneTimes[crossedIndex]
        clockRef.current.tRef.current = time
        transition.current = {
          milestoneIndex: crossedIndex,
          startMs: performance.now(),
        }
        clockRef.current.hold(REACHED_MS + EASE_MS + HOLD_MS)
      }
      prevT.current = time

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
    [scoreAndPaint, milestoneTimes]
  )

  const clock = useRaceClock({
    maxT,
    getMonthsPerSec: () => DEFAULT_MONTHS_PER_SEC * speedMulRef.current,
    onFrame: handleFrame,
    onEnd: () => setEnded(true),
    // Freeze finished (axis fully eased + held): clear the transition and resume.
    onHoldEnd: () => {
      transition.current = null
    },
  })
  clockRef.current = clock

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
      transition.current = null
      prevT.current = 0 // replay from the start; re-arm milestone detection
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
    // A scrub is a jump, not a crossing: cancel any transition and move the
    // bracket to `time` so the seek's frame doesn't fire a hold.
    transition.current = null
    prevT.current = time
    clock.seek(time)
  }

  const handleSpeedChange = (mul: number) => {
    speedMulRef.current = mul
    setSpeedMul(mul)
  }

  if (loading) return <p className="py-8 text-center italic">Loading…</p>
  if (months.length === 0)
    return <p className="py-8 text-center italic">No data available.</p>

  console.log({ frame })
  return (
    <div>
      <TopAxis
        tickWrapRefs={refs.axisTickWrapRefs}
        tickLabelRefs={refs.axisTickRefs}
        travelerRef={refs.travelerRef}
        travelerLabelRef={refs.travelerLabelRef}
      />

      <RaceTrack
        order={frame.order}
        monthTick={frame.monthTick}
        cityMap={cityMap}
        months={months}
        speedScale={speedScale}
        playing={clock.playing}
        reduceMotion={reduceMotion}
        openInfo={openInfo}
        onToggleInfo={(city) =>
          setOpenInfo((prev) => (prev === city ? null : city))
        }
        barRefs={refs.barRefs}
        valueRefs={refs.valueRefs}
        monthLabelRef={refs.monthLabelRef}
      />

      <Controls
        playing={clock.playing}
        ended={ended}
        onPlayPause={handlePlayPause}
        speedMul={speedMul}
        onSpeedChange={handleSpeedChange}
        maxT={maxT}
        onScrub={handleScrub}
        scrubberRef={refs.scrubberRef}
        yearTicks={yearTicks}
      />

      <EstimateNote />
    </div>
  )
}

export default BikeGrowthRace
