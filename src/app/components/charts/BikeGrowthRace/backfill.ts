'use client'

import { useEffect, useState } from 'react'
import { AllTimeCityTrips, VolumeByMonth } from '@/app/utils/fetchAllTimeTrips'
import { loadYouBike1 } from './youbike1'
import { loadMontrealBixi } from './montrealBixi'

// How a backfill combines with a city's real monthly data:
//   'sum'  — a distinct co-running system whose trips add to the real months
//            (e.g. Taipei YouBike 1.0 alongside 2.0 during their overlap).
//   'fill' — the same system extended backward, so real months always win and
//            the backfill only fills months with no real data (e.g. Montreal
//            BIXI's pre-2014 seasons).
type BackfillMode = 'sum' | 'fill'

type Backfill = {
  city: string // systems key
  mode: BackfillMode
  load: () => Promise<VolumeByMonth[]>
}

// The registered backfills. Adding a city is a one-liner: a loader + a mode.
const BACKFILLS: Backfill[] = [
  { city: 'taipei', mode: 'sum', load: loadYouBike1 },
  { city: 'montreal', mode: 'fill', load: loadMontrealBixi },
]

type Loaded = { rows: VolumeByMonth[]; mode: BackfillMode }

// Merges one city's backfill rows into its series. Real data is always kept; a
// month present in both is summed ('sum') or left untouched ('fill').
const applyOne = (d: AllTimeCityTrips, { rows, mode }: Loaded): AllTimeCityTrips => {
  const byKey = new Map<string, VolumeByMonth>()
  for (const r of d.months) byKey.set(`${r.year}-${r.month}`, { ...r })
  for (const r of rows) {
    const key = `${r.year}-${r.month}`
    const existing = byKey.get(key)
    if (!existing) byKey.set(key, { ...r })
    else if (mode === 'sum') existing.trips += r.trips
    // 'fill': a real month already exists — keep it, ignore the backfill.
  }
  const months = [...byKey.values()].sort(
    (a, b) => a.year - b.year || a.month - b.month
  )
  const totalTrips = months.reduce((sum, r) => sum + r.trips, 0)
  return { ...d, months, completeMonths: months.slice(0, -1), totalTrips }
}

// Applies every loaded backfill to its city; other cities pass through.
export const applyBackfills = (
  trips: AllTimeCityTrips[],
  byCity: Map<string, Loaded> | null
): AllTimeCityTrips[] => {
  if (!byCity || byCity.size === 0) return trips
  return trips.map((d) => {
    const loaded = byCity.get(d.city)
    return loaded && loaded.rows.length > 0 ? applyOne(d, loaded) : d
  })
}

type UseBackfills = { byCity: Map<string, Loaded> | null; loading: boolean }

// Loads every registered backfill in parallel. A single failing backfill is
// logged and skipped (empty rows) rather than blocking the race.
export const useBackfills = (): UseBackfills => {
  const [state, setState] = useState<UseBackfills>({ byCity: null, loading: true })

  useEffect(() => {
    let cancelled = false
    Promise.all(
      BACKFILLS.map(async (b) => {
        try {
          return { city: b.city, rows: await b.load(), mode: b.mode }
        } catch (error) {
          console.error(`backfill failed for ${b.city}`, error)
          return { city: b.city, rows: [] as VolumeByMonth[], mode: b.mode }
        }
      })
    ).then((results) => {
      if (cancelled) return
      const byCity = new Map<string, Loaded>()
      for (const r of results) byCity.set(r.city, { rows: r.rows, mode: r.mode })
      setState({ byCity, loading: false })
    })
    return () => {
      cancelled = true
    }
  }, [])

  return state
}
