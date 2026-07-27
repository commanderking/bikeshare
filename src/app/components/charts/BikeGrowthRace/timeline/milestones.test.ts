import { describe, it, expect } from 'vitest'
import type { AllTimeCityTrips, VolumeByMonth } from '@/app/utils/fetchAllTimeTrips'
import { buildRaceTimeline } from './buildRaceTimeline'
import { computeMilestoneTimes, firstCrossing } from './milestones'

const makeCity = (city: string, months: VolumeByMonth[]): AllTimeCityTrips => ({
  city,
  metroArea: city,
  totalTrips: months.reduce((sum, month) => sum + month.trips, 0),
  months,
  completeMonths: months,
})

// A single leader whose cumulative is 10, 20, 30, 40 across four months.
const leaderCities = buildRaceTimeline([
  makeCity('leader', [
    { year: 2020, month: 1, trips: 10 },
    { year: 2020, month: 2, trips: 10 },
    { year: 2020, month: 3, trips: 10 },
    { year: 2020, month: 4, trips: 10 },
  ]),
]).cities

describe('computeMilestoneTimes', () => {
  it('interpolates the crossing time within a month and marks unreached milestones Infinity', () => {
    const times = computeMilestoneTimes(leaderCities, [15, 40, 100], 3)
    expect(times[0]).toBeCloseTo(0.5) // 15 is halfway between month 0 (10) and month 1 (20)
    expect(times[1]).toBe(3) // reaches exactly 40 at the last month
    expect(times[2]).toBe(Infinity) // never reaches 100
  })

  it('reports 0 for a milestone already met at the first month', () => {
    const times = computeMilestoneTimes(leaderCities, [5], 3)
    expect(times[0]).toBe(0)
  })
})

describe('firstCrossing', () => {
  const milestoneTimes = [0.5, 3, Infinity]

  it('detects a milestone whose crossing time falls in (prev, time]', () => {
    expect(firstCrossing(0, 0.5, milestoneTimes)).toBe(0)
    expect(firstCrossing(2.9, 3.1, milestoneTimes)).toBe(1)
  })

  it('does not re-trigger on a held/seeked frame where prev === time', () => {
    expect(firstCrossing(0.5, 0.5, milestoneTimes)).toBe(-1)
  })

  it('returns -1 when nothing crosses (including Infinity milestones)', () => {
    expect(firstCrossing(3.1, 5, milestoneTimes)).toBe(-1)
  })
})
