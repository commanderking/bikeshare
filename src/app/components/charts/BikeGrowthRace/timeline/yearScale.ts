import { MonthKey } from './buildRaceTimeline'
import { axisMaxForYear } from '../constants'

// The clock time of each year end: the month index of that year's December. At
// this time December's trips have finished filling, so the bar shows the year's
// final total and the race pauses. The shared axis spans continuous months, so
// every year on it has a December. The last entry is the finish line; the caller
// leaves it un-held (the clock ends there).
export const computeYearEndTimes = (months: MonthKey[]): number[] => {
  const times: number[] = []
  months.forEach((month, monthIndex) => {
    if (month.month === 12) times.push(monthIndex)
  })
  return times
}

// The axis max for each month index, from its calendar year. Read at floor(time)
// to get the scale the bars are drawn against in steady state.
export const computeAxisMaxByMonthIndex = (months: MonthKey[]): number[] =>
  months.map((month) => axisMaxForYear(month.year))

// Index of the earliest stop in (prev, time], or -1 — the next year end the clock
// has reached this frame, so it can pause there. The earliest (not latest) so a
// frame whose advance spans several stops pauses at each in order rather than
// skipping ahead. The half-open interval means a held/frozen frame (prev === time)
// never re-triggers, and a seek (prev reset to time) never does.
export const getNextCrossingIndex = (
  prev: number,
  time: number,
  stopTimes: number[]
): number => {
  for (let stopIndex = 0; stopIndex < stopTimes.length; stopIndex++) {
    const stopTime = stopTimes[stopIndex]
    if (stopTime > prev && stopTime <= time) return stopIndex
  }
  return -1
}
