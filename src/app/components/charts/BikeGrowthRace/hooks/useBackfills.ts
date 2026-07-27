'use client'

import { useEffect, useState } from 'react'
import { VolumeByMonth } from '@/app/utils/fetchAllTimeTrips'
import { BACKFILLS, Loaded } from '../backfill/backfill'

type UseBackfills = { byCity: Map<string, Loaded> | null; loading: boolean }

// Loads every registered backfill in parallel. A single failing backfill is
// logged and skipped (empty rows) rather than blocking the race.
export const useBackfills = (): UseBackfills => {
  const [state, setState] = useState<UseBackfills>({ byCity: null, loading: true })

  useEffect(() => {
    let cancelled = false
    Promise.all(
      BACKFILLS.map(async (backfill) => {
        try {
          return {
            city: backfill.city,
            rows: await backfill.load(),
            mode: backfill.mode,
          }
        } catch (error) {
          console.error(`backfill failed for ${backfill.city}`, error)
          return { city: backfill.city, rows: [] as VolumeByMonth[], mode: backfill.mode }
        }
      })
    ).then((results) => {
      if (cancelled) return
      const byCity = new Map<string, Loaded>()
      for (const result of results) {
        byCity.set(result.city, { rows: result.rows, mode: result.mode })
      }
      setState({ byCity, loading: false })
    })
    return () => {
      cancelled = true
    }
  }, [])

  return state
}
