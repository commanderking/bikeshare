import { MutableRefObject, RefObject } from 'react'
import { AxisState } from './axisState'
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

// Sizes each visible bar to the current axis (the final-segment leader may
// overshoot BAR_MAX_PCT, capped at BAR_HARD_MAX_PCT) and writes its value label.
export const paintBars = (
  refs: RaceRefs,
  top: Array<[RaceCity, number]>,
  axisValue: number
): void => {
  for (const [raceCity, value] of top) {
    const bar = refs.barRefs.current.get(raceCity.city)
    if (bar) {
      const pct = Math.min((value / axisValue) * BAR_MAX_PCT, BAR_HARD_MAX_PCT)
      bar.style.width = `${pct}%`
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
