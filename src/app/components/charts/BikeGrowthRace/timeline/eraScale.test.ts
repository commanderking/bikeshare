import { describe, it, expect } from 'vitest'
import type { MonthKey } from './buildRaceTimeline'
import {
  computeAxisMaxByMonthIndex,
  computeEraEndTimes,
  getNextCrossingIndex,
} from './eraScale'

// Nov 2014 → Feb 2015: indices 0..3, straddling the 50M → 125M era boundary.
const months: MonthKey[] = [
  { year: 2014, month: 11 },
  { year: 2014, month: 12 },
  { year: 2015, month: 1 },
  { year: 2015, month: 2 },
]

describe('computeEraEndTimes', () => {
  it('returns only the Decembers that close an era, skipping interior ones', () => {
    // Dec 2014 and Dec 2017 end eras; Dec 2015/2016 fall inside the 2015–2017 era.
    const span: MonthKey[] = [
      { year: 2014, month: 12 }, // 0 — era end
      { year: 2015, month: 12 }, // 1 — interior
      { year: 2016, month: 12 }, // 2 — interior
      { year: 2017, month: 12 }, // 3 — era end
    ]
    expect(computeEraEndTimes(span)).toEqual([0, 3])
  })

  it('does not list the final era’s end (the finish never holds)', () => {
    // 2025 closes the last era, so its December is not a stop.
    expect(computeEraEndTimes([{ year: 2025, month: 12 }])).toEqual([])
  })
})

describe('computeAxisMaxByMonthIndex', () => {
  it('maps each month to its era’s axis max (50M through 2014, 125M from 2015)', () => {
    expect(computeAxisMaxByMonthIndex(months)).toEqual([
      50_000_000, 50_000_000, 125_000_000, 125_000_000,
    ])
  })
})

describe('getNextCrossingIndex', () => {
  const stopTimes = [1, 5, 9]

  it('detects a stop whose time falls in (prev, time]', () => {
    expect(getNextCrossingIndex(0, 1, stopTimes)).toBe(0)
    expect(getNextCrossingIndex(4.5, 5.2, stopTimes)).toBe(1)
  })

  it('returns the earliest stop when a frame spans several', () => {
    expect(getNextCrossingIndex(0, 9, stopTimes)).toBe(0)
  })

  it('does not re-trigger on a held/seeked frame where prev === time', () => {
    expect(getNextCrossingIndex(1, 1, stopTimes)).toBe(-1)
  })

  it('returns -1 when nothing crosses', () => {
    expect(getNextCrossingIndex(5.1, 8, stopTimes)).toBe(-1)
  })
})
