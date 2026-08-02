import { MutableRefObject, RefObject } from 'react'
import { AxisState, Transition } from './axisState'
import { MonthKey, RaceCity } from '../timeline/buildRaceTimeline'
import {
  BAR_HARD_MAX_PCT,
  BAR_MAX_PCT,
  formatAxis,
  formatMonth,
  formatValue,
  TICK_INTERVALS,
} from '../constants'

// The bundle of imperative DOM handles the race paints into each frame. Created
// by useRaceRefs, threaded to the presentational components (which attach them)
// and to these painters (which write to them).
export type RaceRefs = {
  barRefs: MutableRefObject<Map<string, HTMLDivElement>>
  valueRefs: MutableRefObject<Map<string, HTMLSpanElement>>
  monthLabelRef: RefObject<HTMLDivElement>
  axisTickRefs: MutableRefObject<HTMLSpanElement[]>
  axisTickWrapRefs: MutableRefObject<HTMLDivElement[]>
  travelerRef: RefObject<HTMLDivElement>
  travelerLabelRef: RefObject<HTMLSpanElement>
  scrubberRef: RefObject<HTMLInputElement>
}

// Relabels + fades the fixed axis ticks to the current scale, and positions/fades
// the traveling max marker.
export const paintAxis = (refs: RaceRefs, axis: AxisState): void => {
  for (let tickIndex = 0; tickIndex < refs.axisTickRefs.current.length; tickIndex++) {
    const label = refs.axisTickRefs.current[tickIndex]
    if (label) {
      label.textContent = formatAxis((tickIndex / TICK_INTERVALS) * axis.tickScale)
    }
    const wrap = refs.axisTickWrapRefs.current[tickIndex]
    if (wrap) wrap.style.opacity = String(axis.tickOpacity(tickIndex))
  }
  if (refs.travelerRef.current) {
    refs.travelerRef.current.style.opacity = String(axis.travelerOpacity)
    refs.travelerRef.current.style.left = `${axis.travelerLeftPct}%`
  }
  if (refs.travelerLabelRef.current) {
    refs.travelerLabelRef.current.textContent = axis.travelerLabel
  }
}

// Places the off-chart break for one bar. It enters once the value passes the
// axis max — the bar crossing the last tick (only Paris does). Steady state:
// parked at that tick. During a rescale it keys off the *old* max, so the break
// stays with Paris through the whole ease rather than dropping as the bar unpins;
// and when the new scale takes Paris back under its max (the 2023 finale), it
// slides inward — tracking the old max to its place on the opening axis — while
// dissolving, so it's gone and Paris's green has filled back in by the time the
// axis settles. Slide and fade both run off `axisValue`, so they finish together.
const paintOffChartBreak = (
  bar: HTMLDivElement,
  value: number,
  axisValue: number,
  transition: Transition | null
): void => {
  const breakMark = bar.parentElement?.querySelector<HTMLElement>(
    '[data-off-chart-break]'
  )
  if (!breakMark) return

  const oldMax = transition ? transition.fromMax : axisValue
  if (value <= oldMax) {
    breakMark.style.opacity = '0' // within the axis — no break
    return
  }

  if (transition && value <= transition.toMax) {
    // Healing into the finale: slide with the old max, dissolving as it opens.
    breakMark.style.left = `${(transition.fromMax / axisValue) * BAR_MAX_PCT}%`
    const opened =
      (axisValue - transition.fromMax) / (transition.toMax - transition.fromMax)
    breakMark.style.opacity = `${Math.max(0, 1 - opened)}`
  } else {
    // Still past the axis (steady state or a non-final rescale): park at the tick.
    breakMark.style.left = `${BAR_MAX_PCT}%`
    breakMark.style.opacity = '1'
  }
}

// Sizes each visible bar to the current axis, writes its value label, and places
// the off-chart break (see paintOffChartBreak). `transition` is the in-flight
// rescale, if any — it drives the break's slide-and-dissolve into the finale.
export const paintBars = (
  refs: RaceRefs,
  top: Array<[RaceCity, number]>,
  axisValue: number,
  transition: Transition | null = null
): void => {
  for (const [raceCity, value] of top) {
    const bar = refs.barRefs.current.get(raceCity.city)
    if (bar) {
      const rawPct = (value / axisValue) * BAR_MAX_PCT
      bar.style.width = `${rawPct > BAR_HARD_MAX_PCT ? BAR_HARD_MAX_PCT : rawPct}%`
      paintOffChartBreak(bar, value, axisValue, transition)
    }
    const label = refs.valueRefs.current.get(raceCity.city)
    if (label) label.textContent = formatValue(value)
  }
}

// Writes the big month/year readout and syncs the scrubber's position to `time`.
export const paintReadouts = (
  refs: RaceRefs,
  time: number,
  months: MonthKey[]
): void => {
  const monthIndex = Math.max(0, Math.min(Math.round(time), months.length - 1))
  if (refs.monthLabelRef.current && months[monthIndex]) {
    refs.monthLabelRef.current.textContent = formatMonth(months[monthIndex])
  }
  if (refs.scrubberRef.current) refs.scrubberRef.current.value = String(time)
}
