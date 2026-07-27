import { describe, it, expect } from 'vitest'
import { expandYouBike1 } from './youbike1'

describe('expandYouBike1', () => {
  const rows = expandYouBike1(
    [
      { year: 2012, trips: 999_000 },
      { year: 2013, trips: 12_000_000 },
      { year: 2021, trips: 19_653_000 },
    ],
    [
      { month: 4, trips: 2_408_000 },
      { month: 5, trips: 1_596_000 },
      { month: 6, trips: 880_000 },
      { month: 7, trips: 1_133_000 },
      { month: 8, trips: 1_365_000 },
      { month: 9, trips: 1_479_000 },
      { month: 10, trips: 1_364_000 },
      { month: 11, trips: 1_285_000 },
      { month: 12, trips: 1_170_000 },
    ]
  )
  const monthsFor = (year: number) => rows.filter((row) => row.year === year)

  it('emits December only for the 2012 rollout year', () => {
    expect(monthsFor(2012)).toEqual([{ year: 2012, month: 12, trips: 999_000 }])
  })

  it('spreads a normal year evenly across all 12 months', () => {
    const y2013 = monthsFor(2013)
    expect(y2013).toHaveLength(12)
    expect(y2013.every((row) => row.trips === 1_000_000)).toBe(true) // 12M / 12
    expect(y2013.map((row) => row.month)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
  })

  it('keeps reported 2021 months and derives Jan–Mar from the remainder', () => {
    const y2021 = monthsFor(2021)
    expect(y2021).toHaveLength(12)
    // reported months are kept exactly
    expect(y2021.find((row) => row.month === 4)!.trips).toBe(2_408_000)
    expect(y2021.find((row) => row.month === 12)!.trips).toBe(1_170_000)
    // Jan/Feb/Mar each = round((19.653M − 12.68M reported) / 3) = 2,324,333
    for (const month of [1, 2, 3]) {
      expect(y2021.find((row) => row.month === month)!.trips).toBe(2_324_333)
    }
  })
})
