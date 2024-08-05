import _ from 'lodash'
import { US_SYSTEMS, systems } from '@/app/constants/cities'
import { YearlyTrip } from '@/app/model/YearlyTrip'

export const getUSYearlyTrips = (yearlyTrips: YearlyTrip[]) => {
  return yearlyTrips.filter((trips) => {
    return US_SYSTEMS.includes(trips.system)
  })
}

export const getAggregatedTrips = (yearlyTrips: YearlyTrip[]) => {
  const grouped = _.groupBy(yearlyTrips, 'year')
  const aggregated = _.mapValues(grouped, (trips) => {
    return trips.reduce(
      (accumulatedTrips, trip) => {
        return {
          trip_count: (accumulatedTrips.trip_count += trip.trip_count),
          year: trip.year,
          system: accumulatedTrips.system,
        }
      },
      {
        trip_count: 0,
        year: 0,
        system: 'all',
      }
    )
  })

  const aggregatedTrips = Object.values(aggregated).sort(
    (a, b) => a.year - b.year
  )

  return aggregatedTrips
}

export const getYearlyTripsWithSystemMetadata = (yearlyTrips: YearlyTrip[]) => {
  return yearlyTrips.map((yearlyTrip) => {
    return {
      ...yearlyTrip,
      ...systems[yearlyTrip.system],
    }
  })
}
