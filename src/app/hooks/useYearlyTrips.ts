import { useEffect, useState } from 'react'
import { fetchYearlyTrips } from '@/app/utils/fetchYearlyTrips'
import { YearlyTrip } from '@/app/model/YearlyTrip'

type UseYearlyTrips = {
  trips: YearlyTrip[]
  loading: boolean
  error: Error | null
}

// Loads all city summaries from the CDN, replacing the old static
// trips_per_year.json import. Fetches once on mount.
export const useYearlyTrips = (): UseYearlyTrips => {
  const [state, setState] = useState<UseYearlyTrips>({
    trips: [],
    loading: true,
    error: null,
  })

  useEffect(() => {
    let cancelled = false

    fetchYearlyTrips()
      .then((trips) => {
        if (!cancelled) {
          setState({ trips, loading: false, error: null })
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setState({ trips: [], loading: false, error })
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  return state
}
