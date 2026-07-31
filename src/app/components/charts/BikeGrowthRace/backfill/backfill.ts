import { AllTimeCityTrips, VolumeByMonth } from '@/app/utils/fetchAllTimeTrips'
import { loadYouBike1 } from './youbike1'
import { loadMontrealBixi } from './montrealBixi'
import { loadLondon } from './london'
import { loadVelib } from './velib'

// How a backfill combines with a city's real monthly data:
//   'sum'        — a distinct co-running system whose trips add to the real
//                  months (e.g. Taipei YouBike 1.0 alongside 2.0 in their overlap).
//   'fill'       — the same system extended backward, so real months always win
//                  and the backfill only fills months with no real data (e.g.
//                  Montreal BIXI's pre-2014 seasons).
//   'whole_city' — the backfill *is* the entire city; there is no CDN trip feed,
//                  so it enters the race as a brand-new city (e.g. Paris Vélib').
export type BackfillMode = 'sum' | 'fill' | 'whole_city'

type Backfill = {
  city: string // systems key
  mode: BackfillMode
  // Chart label for a 'whole_city' backfill, which has no AllTimeCityTrips to
  // draw its metroArea from. Ignored for 'sum'/'fill' (those extend a real city).
  metroArea?: string
  load: () => Promise<VolumeByMonth[]>
}

// The registered backfills. Adding a city is a one-liner: a loader + a mode.
export const BACKFILLS: Backfill[] = [
  { city: 'taipei', mode: 'sum', load: loadYouBike1 },
  { city: 'montreal', mode: 'fill', load: loadMontrealBixi },
  { city: 'london', mode: 'fill', load: loadLondon },
  { city: 'paris', mode: 'whole_city', metroArea: 'Paris', load: loadVelib },
]

export type Loaded = {
  rows: VolumeByMonth[]
  mode: BackfillMode
  metroArea?: string
}

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

// Builds a brand-new city out of a 'whole_city' backfill — for a system with no
// CDN trip feed, whose entire series is the backfill (e.g. Paris Vélib' from CSV).
const createCity = (
  city: string,
  { rows, metroArea }: Loaded
): AllTimeCityTrips => {
  const months = [...rows].sort((a, b) => a.year - b.year || a.month - b.month)
  const totalTrips = months.reduce((sum, month) => sum + month.trips, 0)
  return {
    city,
    metroArea: metroArea ?? city,
    totalTrips,
    months,
    completeMonths: months.slice(0, -1),
  }
}

// Applies every loaded backfill: 'sum'/'fill' merge into their existing city;
// 'whole_city' with no matching real data joins as a new city. Untouched cities
// pass through.
export const applyBackfills = (
  trips: AllTimeCityTrips[],
  byCity: Map<string, Loaded> | null
): AllTimeCityTrips[] => {
  if (!byCity || byCity.size === 0) return trips
  const existing = new Set(trips.map((cityTrips) => cityTrips.city))
  const merged = trips.map((cityTrips) => {
    const loaded = byCity.get(cityTrips.city)
    return loaded && loaded.rows.length > 0
      ? applyOne(cityTrips, loaded)
      : cityTrips
  })
  const created: AllTimeCityTrips[] = []
  for (const [city, loaded] of byCity) {
    if (loaded.mode === 'whole_city' && loaded.rows.length > 0 && !existing.has(city)) {
      created.push(createCity(city, loaded))
    }
  }
  return created.length > 0 ? [...merged, ...created] : merged
}
