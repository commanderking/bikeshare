import { smoothstep } from '@/app/components/Biker/geometry'
import { goalIndexAt } from '../timeline/milestones'
import {
  AXIS_FADE_MS,
  BAR_MAX_PCT,
  EASE_MS,
  formatAxis,
  MILESTONES,
  REACHED_MS,
  TICK_INTERVALS,
} from '../constants'

// An in-progress milestone rescale: we reached milestone `milestoneIndex` at
// `startMs`, and the axis is easing from that goal to the next.
export type Transition = { milestoneIndex: number; startMs: number }

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
// current milestone goal, all ticks solid, no traveler. During a rescale it's
// choreographed across three beats (timings in constants): reach (hold at the
// line) → ease (intermediate ticks fade; the max marker peels off the right edge
// and travels) → hold (new-scale ticks fade in; the traveler fades out).
export const computeAxisState = (
  time: number,
  transition: Transition | null,
  milestoneTimes: number[],
  now = performance.now()
): AxisState => {
  if (!transition) {
    const axisValue = MILESTONES[goalIndexAt(time, milestoneTimes)]
    return {
      axisValue,
      tickScale: axisValue,
      tickOpacity: () => 1,
      travelerOpacity: 0,
      travelerLabel: '',
      travelerLeftPct: 0,
    }
  }

  const from = MILESTONES[transition.milestoneIndex]
  const to = MILESTONES[transition.milestoneIndex + 1] ?? from
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
