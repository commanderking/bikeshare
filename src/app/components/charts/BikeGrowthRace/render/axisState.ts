import { smoothstep } from '@/app/components/Biker/geometry'
import {
  AXIS_FADE_MS,
  BAR_MAX_PCT,
  EASE_MS,
  formatAxis,
  REACHED_MS,
  TICK_INTERVALS,
} from '../constants'

// An in-progress rescale at a year end: the axis is easing from `fromMax` (the
// finished year's scale) to `toMax` (the year about to play), begun at `startMs`.
export type Transition = { fromMax: number; toMax: number; startMs: number }

// Everything the top axis needs for one frame: the chart's current max scale
// (`axisValue`), the value the fixed ticks are labeled against (`tickScale`),
// per-tick opacity, and the traveling max marker's state.
export type AxisState = {
  axisValue: number
  tickScale: number
  tickOpacity: (tickIndex: number) => number
  travelerOpacity: number
  travelerLabel: string
  travelerLeftPct: number
}

// Computes the axis state at a given `time`. In steady state the axis sits at the
// current year's max, all ticks solid, no traveler. During a rescale it's
// choreographed across three beats (timings in constants): reach (hold at the old
// scale) → ease (intermediate ticks fade; the max marker peels off the right edge
// and travels) → hold (new-scale ticks fade in; the traveler fades out).
export const computeAxisState = (
  time: number,
  transition: Transition | null,
  axisMaxByMonthIndex: number[],
  now = performance.now()
): AxisState => {
  if (!transition) {
    // Track the year of the month currently filling (floor(time) + 1), not the
    // one just completed. A year-end pause sits on December — the finished year —
    // so keying off floor(time) would snap the axis back to that year's (narrower)
    // scale for the frames between resume and crossing into January, undoing the
    // rescale that just eased open. The filling month is already in the new year.
    const fillingMonth = Math.min(
      Math.floor(time) + 1,
      axisMaxByMonthIndex.length - 1
    )
    const axisValue = axisMaxByMonthIndex[fillingMonth]
    return {
      axisValue,
      tickScale: axisValue,
      tickOpacity: () => 1,
      travelerOpacity: 0,
      travelerLabel: '',
      travelerLeftPct: 0,
    }
  }

  const { fromMax: from, toMax: to } = transition
  const elapsed = now - transition.startMs
  const progress =
    elapsed <= REACHED_MS ? 0 : Math.min((elapsed - REACHED_MS) / EASE_MS, 1)
  const axisValue = from + (to - from) * smoothstep(progress)

  // Beat 1 — reached: hold at the line, everything on the old scale.
  if (elapsed <= REACHED_MS) {
    return {
      axisValue,
      tickScale: from,
      tickOpacity: () => 1,
      travelerOpacity: 0,
      travelerLabel: '',
      travelerLeftPct: 0,
    }
  }

  // Beat 2 — ease: labels stay on the old scale while fading; the last tick is
  // handed off to the traveler, which sits where a `from` bar ends.
  if (elapsed <= REACHED_MS + EASE_MS) {
    return {
      axisValue,
      tickScale: from,
      tickOpacity: (tickIndex) =>
        tickIndex === 0 ? 1 : tickIndex === TICK_INTERVALS ? 0 : 1 - progress,
      travelerOpacity: 1,
      travelerLabel: formatAxis(from),
      travelerLeftPct: (from / axisValue) * BAR_MAX_PCT,
    }
  }

  // Beat 3 — hold on the new scale; its ticks fade in as the traveler fades out.
  const fadeIn = Math.min((elapsed - REACHED_MS - EASE_MS) / AXIS_FADE_MS, 1)
  return {
    axisValue,
    tickScale: to,
    tickOpacity: (tickIndex) => (tickIndex === 0 ? 1 : fadeIn),
    travelerOpacity: 1 - fadeIn,
    travelerLabel: formatAxis(from),
    travelerLeftPct: (from / to) * BAR_MAX_PCT,
  }
}
