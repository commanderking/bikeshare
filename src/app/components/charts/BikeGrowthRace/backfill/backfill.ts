import { AllTimeCityTrips, VolumeByMonth } from '@/app/utils/fetchAllTimeTrips'
import { loadYouBike1 } from './youbike1'
import { loadMontrealBixi } from './montrealBixi'
import { loadLondon } from './london'

// How a backfill combines with a city's real monthly data:
//   'sum'  — a distinct co-running system whose trips add to the real months
//            (e.g. Taipei YouBike 1.0 alongside 2.0 during their overlap).
//   'fill' — the same system extended backward, so real months always win and
//            the backfill only fills months with no real data (e.g. Montreal
//            BIXI's pre-2014 seasons).
export type BackfillMode = 'sum' | 'fill'

type Backfill = {
  city: string // systems key
  mode: BackfillMode
  load: () => Promise<VolumeByMonth[]>
}

// The registered backfills. Adding a city is a one-liner: a loader + a mode.
export const BACKFILLS: Backfill[] = [
  { city: 'taipei', mode: 'sum', load: loadYouBike1 },
  { city: 'montreal', mode: 'fill', load: loadMontrealBixi },
  { city: 'london', mode: 'fill', load: loadLondon },
]

export type Loaded = { rows: VolumeByMonth[]; mode: BackfillMode }

// Merges one city's backfill rows into its series. Real data is always kept; a
// month present in both is summed ('sum') or left untouched ('fill').
const applyOne = (
  cityTrips: AllTimeCityTrips,
  { rows, mode }: Loaded
): AllTimeCityTrips => {
  const byKey = new Map<string, VolumeByMonth>()
  for (const row of cityTrips.months) {
    byKey.set(`${row.year}-${row.month}`, { ...row })
  }
  for (const row of rows) {
    const key = `${row.year}-${row.month}`
    const existing = byKey.get(key)
    if (!existing) byKey.set(key, { ...row })
    else if (mode === 'sum') existing.trips += row.trips
    // 'fill': a real month already exists — keep it, ignore the backfill.
  }
  const months = [...byKey.values()].sort(
    (a, b) => a.year - b.year || a.month - b.month
  )
  const totalTrips = months.reduce((sum, month) => sum + month.trips, 0)
  return { ...cityTrips, months, completeMonths: months.slice(0, -1), totalTrips }
}

// Applies every loaded backfill to its city; other cities pass through.
export const applyBackfills = (
  trips: AllTimeCityTrips[],
  byCity: Map<string, Loaded> | null
): AllTimeCityTrips[] => {
  if (!byCity || byCity.size === 0) return trips
  return trips.map((cityTrips) => {
    const loaded = byCity.get(cityTrips.city)
    return loaded && loaded.rows.length > 0
      ? applyOne(cityTrips, loaded)
      : cityTrips
  })
}
