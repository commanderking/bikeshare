import { useEffect, useState } from 'react'
import { fetchAllTimeTrips, AllTimeCityTrips } from '@/app/utils/fetchAllTimeTrips'

type UseAllTimeTrips = {
  trips: AllTimeCityTrips[]
  loading: boolean
  error: Error | null
}

export const useAllTimeTrips = (): UseAllTimeTrips => {
  const [state, setState] = useState<UseAllTimeTrips>({
    trips: [],
    loading: true,
    error: null,
  })

  useEffect(() => {
    let cancelled = false

    fetchAllTimeTrips()
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
