import { describe, it, expect } from 'vitest'
import type { AllTimeCityTrips, VolumeByMonth } from '@/app/utils/fetchAllTimeTrips'
import { applyBackfills, Loaded } from './backfill'

const makeCity = (city: string, months: VolumeByMonth[]): AllTimeCityTrips => ({
  city,
  metroArea: city,
  totalTrips: months.reduce((sum, month) => sum + month.trips, 0),
  months,
  completeMonths: months,
})

const tripsOf = (cityTrips: AllTimeCityTrips, year: number, month: number) =>
  cityTrips.months.find((row) => row.year === year && row.month === month)?.trips

describe('applyBackfills', () => {
  const base = [
    makeCity('taipei', [{ year: 2020, month: 4, trips: 100 }]),
    makeCity('montreal', [{ year: 2020, month: 5, trips: 200 }]),
    makeCity('other', [{ year: 2020, month: 6, trips: 50 }]),
  ]

  it("sums overlapping months in 'sum' mode and inserts new ones", () => {
    const byCity = new Map<string, Loaded>([
      [
        'taipei',
        {
          mode: 'sum',
          rows: [
            { year: 2020, month: 4, trips: 10 }, // overlaps a real month → summed
            { year: 2020, month: 3, trips: 7 }, // new month → inserted
          ],
        },
      ],
    ])
    const result = applyBackfills(base, byCity)
    const taipei = result.find((cityTrips) => cityTrips.city === 'taipei')!
    expect(tripsOf(taipei, 2020, 4)).toBe(110) // 100 + 10
    expect(tripsOf(taipei, 2020, 3)).toBe(7)
    expect(taipei.totalTrips).toBe(117)
  })

  it("keeps the real month in 'fill' mode and only fills gaps", () => {
    const byCity = new Map<string, Loaded>([
      [
        'montreal',
        {
          mode: 'fill',
          rows: [
            { year: 2020, month: 5, trips: 999 }, // overlaps a real month → ignored
            { year: 2019, month: 5, trips: 300 }, // new month → inserted
          ],
        },
      ],
    ])
    const result = applyBackfills(base, byCity)
    const montreal = result.find((cityTrips) => cityTrips.city === 'montreal')!
    expect(tripsOf(montreal, 2020, 5)).toBe(200) // real kept, NOT 999
    expect(tripsOf(montreal, 2019, 5)).toBe(300)
    expect(montreal.totalTrips).toBe(500)
  })

  it('leaves cities without a backfill untouched', () => {
    const byCity = new Map<string, Loaded>([
      ['taipei', { mode: 'sum', rows: [{ year: 2020, month: 4, trips: 10 }] }],
    ])
    const result = applyBackfills(base, byCity)
    const other = result.find((cityTrips) => cityTrips.city === 'other')!
    expect(other.months).toEqual([{ year: 2020, month: 6, trips: 50 }])
  })

  it('is a no-op when there are no backfills', () => {
    expect(applyBackfills(base, null)).toBe(base)
  })
})
