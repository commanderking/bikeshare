import { describe, it, expect } from 'vitest'
import type { MonthKey } from './buildRaceTimeline'
import {
  computeAxisMaxByMonthIndex,
  computeYearEndTimes,
  firstCrossing,
} from './yearScale'

// Nov 2011 → Feb 2012: indices 0..3, straddling the 10M → 50M rescale.
const months: MonthKey[] = [
  { year: 2011, month: 11 },
  { year: 2011, month: 12 },
  { year: 2012, month: 1 },
  { year: 2012, month: 2 },
]

describe('computeYearEndTimes', () => {
  it('returns the month index of each December', () => {
    expect(computeYearEndTimes(months)).toEqual([1])
  })

  it('finds every December across multiple years', () => {
    const twoYears: MonthKey[] = [
      { year: 2011, month: 12 },
      { year: 2012, month: 6 },
      { year: 2012, month: 12 },
    ]
    expect(computeYearEndTimes(twoYears)).toEqual([0, 2])
  })
})

describe('computeAxisMaxByMonthIndex', () => {
  it('maps each month to its year’s axis max (10M through 2011, 50M from 2012)', () => {
    expect(computeAxisMaxByMonthIndex(months)).toEqual([
      10_000_000, 10_000_000, 50_000_000, 50_000_000,
    ])
  })
})

describe('firstCrossing', () => {
  const stopTimes = [1, 5, 9]

  it('detects a stop whose time falls in (prev, time]', () => {
    expect(firstCrossing(0, 1, stopTimes)).toBe(0)
    expect(firstCrossing(4.5, 5.2, stopTimes)).toBe(1)
  })

  it('does not re-trigger on a held/seeked frame where prev === time', () => {
    expect(firstCrossing(1, 1, stopTimes)).toBe(-1)
  })

  it('returns -1 when nothing crosses', () => {
    expect(firstCrossing(5.1, 8, stopTimes)).toBe(-1)
  })
})
