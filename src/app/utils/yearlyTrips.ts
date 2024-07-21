import _ from 'lodash'
import yearlyTrips from '@/data/trips_per_year.json'

export const getAggregatedTrips = () => {
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
        system: 'all_us_cities',
      }
    )
  })

  const aggregatedTrips = Object.values(aggregated).sort(
    (a, b) => a.year - b.year
  )

  return aggregatedTrips
}
