import { useEffect, useState } from 'react'
import { fetchYearlyTrips } from '@/app/utils/fetchYearlyTrips'
import { YearlyTrip } from '@/app/model/YearlyTrip'

type UseYearlyTrips = {
  trips: YearlyTrip[]
  loading: boolean
  error: Error | null
}

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
