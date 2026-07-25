'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAllTimeTrips } from '@/app/hooks/useAllTimeTrips'
import { CITY_BIKE_CONFIG } from '@/app/components/Biker/cityBikeConfig'
import { smoothstep } from '@/app/components/Biker/geometry'
import { useIsomorphicLayoutEffect, prefersReducedMotion } from '@/app/components/charts/AllTimeTripsBar/motion'
import {
  buildRaceTimeline,
  growthAt,
  RaceCity,
  valueAt,
} from './buildRaceTimeline'
import { makeSpeedScale, referenceGrowth } from './speed'
import { useRaceClock } from './useRaceClock'
import {
  computeMilestoneTimes,
  firstCrossing,
  goalIndexAt,
} from './milestones'
import RaceRow, { BikerConfig } from './RaceRow'
import { barColorFor } from './barColor'
import Controls from './Controls'
import {
  AXIS_FADE_MS,
  BAR_HARD_MAX_PCT,
  BAR_MAX_PCT,
  DEFAULT_MONTHS_PER_SEC,
  EASE_MS,
  formatAxis,
  formatMonth,
  formatValue,
  HOLD_MS,
  MILESTONES,
  NAME_COL_PX,
  REACHED_MS,
  ROW_HEIGHT,
  TOP_N,
} from './constants'

// Number of intervals on the top x-axis (→ TICK_INTERVALS + 1 ticks/labels).
const TICK_INTERVALS = 10

// Current-frame render state. Bar widths + value text are driven imperatively
// every frame; React only re-renders when the rank order or the month changes.
type Frame = { monthTick: number; order: string[] }

const BikeGrowthRace = () => {
  const { trips, loading } = useAllTimeTrips()

  const timeline = useMemo(() => buildRaceTimeline(trips), [trips])
  const { months, cities } = timeline
  const maxT = Math.max(0, months.length - 1)

  const cityMap = useMemo(
    () => new Map(cities.map((c) => [c.city, c])),
    [cities]
  )
  const speedScale = useMemo(
    () => makeSpeedScale(referenceGrowth(cities)),
    [cities]
  )
  // Time at which the leader reaches each milestone — drives the goal axis, the
  // playback holds, and the scrubber ticks.
  const milestoneTimes = useMemo(
    () => computeMilestoneTimes(cities, MILESTONES, maxT),
    [cities, maxT]
  )
  // First month index of each calendar year — the scrubber's timeline ticks.
  const yearTicks = useMemo(() => {
    const ticks: { year: number; t: number }[] = []
    let last = -1
    months.forEach((m, i) => {
      if (m.year !== last) {
        ticks.push({ year: m.year, t: i })
        last = m.year
      }
    })
    return ticks
  }, [months])

  const [reduceMotion] = useState(prefersReducedMotion)
  const [frame, setFrame] = useState<Frame>({ monthTick: 0, order: [] })
  const [ended, setEnded] = useState(false)
  const [speedMul, setSpeedMul] = useState(1)
  const speedMulRef = useRef(1)
  const [openInfo, setOpenInfo] = useState<string | null>(null)
  // Close the "data ends" popover on any outside click.
  useEffect(() => {
    if (!openInfo) return
    const onDown = (e: MouseEvent) => {
      if (!(e.target as Element).closest('[data-info-ui]')) setOpenInfo(null)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [openInfo])

  // Imperative handles for the per-frame updates.
  const barRefs = useRef(new Map<string, HTMLDivElement>())
  const valueRefs = useRef(new Map<string, HTMLSpanElement>())
  const monthLabelRef = useRef<HTMLDivElement>(null)
  const axisTickRefs = useRef<HTMLSpanElement[]>([])
  const axisTickWrapRefs = useRef<HTMLDivElement[]>([])
  // The single max marker that travels from the old scale's right edge to its
  // home on the new scale during a rescale.
  const travelerRef = useRef<HTMLDivElement>(null)
  const travelerLabelRef = useRef<HTMLSpanElement>(null)
  const scrubberRef = useRef<HTMLInputElement>(null)

  // Milestone playback state (all refs — the goal axis is applied imperatively).
  // `prevT` brackets each frame's advance to detect a crossing. `transition`, when
  // set, means we've reached milestone `k` and the clock is frozen while the axis
  // eases from goal k to goal k+1 (over EASE_MS from `startMs`) and then holds.
  // `clockRef` lets onFrame reach the clock it feeds.
  const prevT = useRef(0)
  const transition = useRef<{ k: number; startMs: number } | null>(null)
  const clockRef = useRef<ReturnType<typeof useRaceClock>>()

  // Change detection for setFrame.
  const lastMonthTick = useRef(-1)
  const lastOrder = useRef<string[]>([])

  // Score every joined city at time t, paint the visible bars/labels/scrubber
  // imperatively, and return the top-N order. No React state is touched here.
  const scoreAndPaint = useCallback(
    (t: number): string[] => {
      const scored: Array<[RaceCity, number]> = []
      for (const c of cities) {
        const v = valueAt(c, t)
        if (v !== undefined) scored.push([c, v])
      }
      scored.sort((a, b) => b[1] - a[1])
      const top = scored.slice(0, TOP_N)

      // Bars are scaled to the current milestone goal (a fixed line), not the
      // leader. During a transition the axis eases from the reached goal to the
      // next one, so the bars smoothly shrink into the new scale.
      //
      // The top axis is choreographed across the same three beats:
      //   Beat 1 (REACHED_MS): old scale, all ticks solid, no traveler.
      //   Beat 2 (EASE_MS):    intermediates fade out; the max marker peels off
      //                        the right edge and travels (tracking the bars).
      //   Beat 3 (HOLD_MS):    new-scale ticks fade in; traveler crossfades out.
      // `tickScale` labels the fixed ticks; `tickOpacity(i)` and the traveler
      // fields drive the fades. In steady state everything is solid, no traveler.
      let axisValue: number
      let tickScale: number
      let tickOpacity: (i: number) => number
      let travelerOpacity = 0
      let travelerLabel = ''
      let travelerLeftPct = 0
      const tr = transition.current
      if (tr) {
        const from = MILESTONES[tr.k]
        const to = MILESTONES[tr.k + 1] ?? from
        const elapsed = performance.now() - tr.startMs
        const progress =
          elapsed <= REACHED_MS
            ? 0
            : Math.min((elapsed - REACHED_MS) / EASE_MS, 1)
        axisValue = from + (to - from) * smoothstep(progress)
        if (elapsed <= REACHED_MS) {
          tickScale = from
          tickOpacity = () => 1
        } else if (elapsed <= REACHED_MS + EASE_MS) {
          // Slide: labels stay on the old scale while fading; the last tick is
          // "handed off" to the traveler, which sits where a `from` bar ends.
          tickScale = from
          tickOpacity = (i) =>
            i === 0 ? 1 : i === TICK_INTERVALS ? 0 : 1 - progress
          travelerOpacity = 1
          travelerLabel = formatAxis(from)
          travelerLeftPct = (from / axisValue) * BAR_MAX_PCT
        } else {
          const fadeIn = Math.min(
            (elapsed - REACHED_MS - EASE_MS) / AXIS_FADE_MS,
            1
          )
          tickScale = to
          tickOpacity = (i) => (i === 0 ? 1 : fadeIn)
          travelerOpacity = 1 - fadeIn
          travelerLabel = formatAxis(from)
          travelerLeftPct = (from / to) * BAR_MAX_PCT
        }
      } else {
        axisValue = MILESTONES[goalIndexAt(t, milestoneTimes)]
        tickScale = axisValue
        tickOpacity = () => 1
      }

      // Top axis: fixed-position ticks get relabeled to the current scale and
      // faded per beat; the traveler is positioned + faded imperatively.
      for (let i = 0; i < axisTickRefs.current.length; i++) {
        const label = axisTickRefs.current[i]
        if (label) label.textContent = formatAxis((i / TICK_INTERVALS) * tickScale)
        const wrap = axisTickWrapRefs.current[i]
        if (wrap) wrap.style.opacity = String(tickOpacity(i))
      }
      if (travelerRef.current) {
        travelerRef.current.style.opacity = String(travelerOpacity)
        travelerRef.current.style.left = `${travelerLeftPct}%`
      }
      if (travelerLabelRef.current) {
        travelerLabelRef.current.textContent = travelerLabel
      }

      for (const [c, v] of top) {
        const bar = barRefs.current.get(c.city)
        // Allow the final-segment leader to overshoot the 300M line (past
        // BAR_MAX_PCT), capped so the value label + biker stay on-screen.
        if (bar) {
          const pct = Math.min((v / axisValue) * BAR_MAX_PCT, BAR_HARD_MAX_PCT)
          bar.style.width = `${pct}%`
        }
        const label = valueRefs.current.get(c.city)
        if (label) label.textContent = formatValue(v)
      }

      const di = Math.max(0, Math.min(Math.round(t), months.length - 1))
      if (monthLabelRef.current && months[di]) {
        monthLabelRef.current.textContent = formatMonth(months[di])
      }
      if (scrubberRef.current) scrubberRef.current.value = String(t)

      return top.map(([c]) => c.city)
    },
    [cities, months, milestoneTimes]
  )

  const onFrame = useCallback(
    (tIn: number) => {
      let t = tIn
      // Did the leader just cross the next milestone this frame? If so, clamp to
      // the line and freeze the clock through the reached / ease / hold beats.
      // The final milestone (300M) is a finish line the leader crosses without
      // stopping, so it gets no hold — the bar simply overshoots it.
      const k = firstCrossing(prevT.current, t, milestoneTimes)
      if (k !== -1 && k < MILESTONES.length - 1 && clockRef.current) {
        t = milestoneTimes[k]
        clockRef.current.tRef.current = t
        transition.current = { k, startMs: performance.now() }
        clockRef.current.hold(REACHED_MS + EASE_MS + HOLD_MS)
      }
      prevT.current = t

      const order = scoreAndPaint(t)
      const monthTick = Math.floor(t)
      const orderChanged =
        order.length !== lastOrder.current.length ||
        order.some((id, i) => id !== lastOrder.current[i])
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
    onFrame,
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

  const onPlayPause = () => {
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

  const onScrub = (t: number) => {
    clock.pause()
    if (ended) setEnded(false)
    // A scrub is a jump, not a crossing: cancel any transition and move the
    // bracket to t so the seek's frame doesn't fire a hold.
    transition.current = null
    prevT.current = t
    clock.seek(t)
  }

  const onSpeedChange = (mul: number) => {
    speedMulRef.current = mul
    setSpeedMul(mul)
  }

  if (loading) return <p className="py-8 text-center italic">Loading…</p>
  if (months.length === 0)
    return <p className="py-8 text-center italic">No data available.</p>

  return (
    <div>
      {/* Top x-axis: ticks span the track, scaled to the current chart max.
          Positions are fixed (0…BAR_MAX_PCT); labels are set imperatively. */}
      <div className="flex items-end gap-1 pb-1">
        <div className="shrink-0" style={{ width: NAME_COL_PX }} />
        <div className="relative h-5 flex-1">
          {Array.from({ length: TICK_INTERVALS + 1 }).map((_, i) => (
            <div
              key={i}
              ref={(el) => {
                if (el) axisTickWrapRefs.current[i] = el
              }}
              className="pointer-events-none absolute bottom-0 flex -translate-x-1/2 flex-col items-center"
              style={{ left: `${(i / TICK_INTERVALS) * BAR_MAX_PCT}%` }}
            >
              <span
                ref={(el) => {
                  if (el) axisTickRefs.current[i] = el
                }}
                className="mb-0.5 whitespace-nowrap text-[10px] tabular-nums text-gray-400"
              />
              <div className="h-1.5 w-px bg-gray-300 dark:bg-gray-600" />
            </div>
          ))}
          {/* The traveling max marker (hidden until a rescale). */}
          <div
            ref={travelerRef}
            className="pointer-events-none absolute bottom-0 flex -translate-x-1/2 flex-col items-center opacity-0"
            style={{ left: 0 }}
          >
            <span
              ref={travelerLabelRef}
              className="mb-0.5 whitespace-nowrap text-[10px] font-semibold tabular-nums text-gray-500 dark:text-gray-300"
            />
            <div className="h-1.5 w-px bg-gray-400 dark:bg-gray-400" />
          </div>
        </div>
      </div>

      <div className="relative" style={{ height: TOP_N * ROW_HEIGHT }}>
        {frame.order.map((cityId, rank) => {
          const c = cityMap.get(cityId)
          if (!c) return null
          const exhausted = frame.monthTick >= c.lastIndex
          const speed = speedScale(growthAt(c, frame.monthTick))
          const config = CITY_BIKE_CONFIG[cityId] as BikerConfig | undefined
          return (
            <RaceRow
              key={cityId}
              city={cityId}
              metroArea={c.metroArea}
              config={config}
              barColor={barColorFor(config)}
              rank={rank}
              reduceMotion={reduceMotion}
              bikerSpeed={speed}
              bikerPaused={exhausted || !clock.playing}
              exhausted={exhausted}
              dataEndsLabel={formatMonth(months[c.lastIndex])}
              infoOpen={openInfo === cityId}
              onToggleInfo={() =>
                setOpenInfo((prev) => (prev === cityId ? null : cityId))
              }
              barRef={(el) => {
                if (el) barRefs.current.set(cityId, el)
                else barRefs.current.delete(cityId)
              }}
              valueRef={(el) => {
                if (el) valueRefs.current.set(cityId, el)
                else valueRefs.current.delete(cityId)
              }}
            />
          )
        })}

        {/* Big month/year readout in the empty bottom-right corner — the last
            few (smallest) cities never reach it. */}
        <div
          ref={monthLabelRef}
          className="pointer-events-none absolute bottom-0 right-0 text-4xl font-bold tabular-nums text-gray-800 dark:text-gray-100"
        />
      </div>

      <Controls
        playing={clock.playing}
        ended={ended}
        onPlayPause={onPlayPause}
        speedMul={speedMul}
        onSpeedChange={onSpeedChange}
        maxT={maxT}
        onScrub={onScrub}
        scrubberRef={scrubberRef}
        yearTicks={yearTicks}
      />
    </div>
  )
}

export default BikeGrowthRace
