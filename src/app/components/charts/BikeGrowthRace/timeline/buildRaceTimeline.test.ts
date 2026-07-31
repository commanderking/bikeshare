import { describe, it, expect } from 'vitest'
import type { AllTimeCityTrips, VolumeByMonth } from '@/app/utils/fetchAllTimeTrips'
import { buildRaceTimeline, getGrowthAt, getValueAt } from './buildRaceTimeline'

const makeCity = (city: string, months: VolumeByMonth[]): AllTimeCityTrips => ({
  city,
  metroArea: city,
  totalTrips: months.reduce((sum, month) => sum + month.trips, 0),
  months,
  completeMonths: months,
})

describe('buildRaceTimeline', () => {
  it('builds cumulative + monthly series, carrying gaps forward and seeding ramp-in', () => {
    const timeline = buildRaceTimeline([
      // Jan, Feb, (gap Mar), Apr
      makeCity('a', [
        { year: 2020, month: 1, trips: 100 },
        { year: 2020, month: 2, trips: 50 },
        { year: 2020, month: 4, trips: 30 },
      ]),
      // joins in Mar
      makeCity('b', [
        { year: 2020, month: 3, trips: 200 },
        { year: 2020, month: 4, trips: 10 },
      ]),
    ])

    // A leading empty month (Dec 2019) precedes the first data month so the race
    // opens blank and the first tick fills January from zero.
    expect(timeline.months).toEqual([
      { year: 2019, month: 12 },
      { year: 2020, month: 1 },
      { year: 2020, month: 2 },
      { year: 2020, month: 3 },
      { year: 2020, month: 4 },
    ])

    const a = timeline.cities.find((raceCity) => raceCity.city === 'a')!
    expect(a.firstIndex).toBe(1)
    expect(a.lastIndex).toBe(4)
    expect(a.monthlyTrips).toEqual([0, 100, 50, 0, 30]) // gap month = 0
    // seeded 0 in the leading month, then gap carries 150 forward
    expect(a.cumulative).toEqual([0, 100, 150, 150, 180])

    const b = timeline.cities.find((raceCity) => raceCity.city === 'b')!
    expect(b.firstIndex).toBe(3)
    // ramp-in: the index before firstIndex is seeded to 0 so it grows in
    expect(b.cumulative).toEqual([undefined, undefined, 0, 200, 210])

    // the first tick ramps the earliest city in from zero, too
    expect(getValueAt(a, 0)).toBe(0)
    expect(getValueAt(a, 0.5)).toBe(50) // lerp 0 -> 100
    expect(getGrowthAt(a, 0)).toBe(100) // January's trips are being added

    // interpolation: undefined before joining, then lerps within a month
    expect(getValueAt(b, 0)).toBeUndefined()
    expect(getValueAt(b, 2)).toBe(0) // ramp seed
    expect(getValueAt(a, 1.5)).toBe(125) // lerp 100 -> 150
    expect(getGrowthAt(a, 1)).toBe(50) // Feb's trips are being added
  })

  it('caps the axis at finalMonth: cities live past the cap keep their true lastIndex; later launches drop', () => {
    const timeline = buildRaceTimeline(
      [
        makeCity('a', [
          { year: 2020, month: 1, trips: 100 },
          { year: 2020, month: 2, trips: 50 },
          { year: 2020, month: 3, trips: 20 },
          { year: 2020, month: 4, trips: 30 }, // beyond the cap
        ]),
        makeCity('b', [{ year: 2020, month: 3, trips: 200 }]),
        makeCity('c', [{ year: 2020, month: 5, trips: 500 }]), // launches after cap
      ],
      { year: 2020, month: 3 } // cap at March (inclusive)
    )

    expect(timeline.months).toHaveLength(4) // leading Dec 2019 + Jan, Feb, Mar
    const a = timeline.cities.find((raceCity) => raceCity.city === 'a')!
    // A reports through April → true lastIndex 4 sits beyond the 4-long axis,
    // so it stays "live" at the finish (never flagged exhausted).
    expect(a.lastIndex).toBe(4)
    expect(a.cumulative).toEqual([0, 100, 150, 170])
    // C only launches in May, after the cap → not in the race at all.
    expect(timeline.cities.find((raceCity) => raceCity.city === 'c')).toBeUndefined()
  })

  it('returns an empty timeline for empty / dataless input', () => {
    expect(buildRaceTimeline([])).toEqual({ months: [], cities: [] })
    expect(buildRaceTimeline([makeCity('x', [])])).toEqual({ months: [], cities: [] })
  })
})
