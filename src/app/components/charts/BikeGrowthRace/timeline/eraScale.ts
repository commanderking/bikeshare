import { MonthKey } from './buildRaceTimeline'
import { axisMaxForYear, ERA_END_YEARS } from '../constants'

// The clock time of each era end: the month index of the December that closes an
// era (its year is in ERA_END_YEARS). At that time December's trips have finished
// filling, so the bar shows the era's final total and the race pauses. The final
// era isn't listed — it runs to the finish, which the clock ends at without a hold.
export const computeEraEndTimes = (months: MonthKey[]): number[] => {
  const eraEndYears = new Set(ERA_END_YEARS)
  const times: number[] = []
  months.forEach((month, monthIndex) => {
    if (month.month === 12 && eraEndYears.has(month.year)) times.push(monthIndex)
  })
  return times
}

// The axis max for each month index, from its calendar year. Read at floor(time)
// to get the scale the bars are drawn against in steady state.
export const computeAxisMaxByMonthIndex = (months: MonthKey[]): number[] =>
  months.map((month) => axisMaxForYear(month.year))

// Index of the earliest stop in (prev, time], or -1 — the next era end the clock
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
