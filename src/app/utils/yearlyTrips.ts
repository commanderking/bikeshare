import _ from 'lodash'
import { systems } from '@/app/constants/cities'
import { Country } from '@/app/model/System'
import { YearlyTrip, YearlyTripWithSystem } from '@/app/model/YearlyTrip'

const toTripsWithSystemData = (yearlyTrip: YearlyTrip) => ({
  ...yearlyTrip,
  ...systems[yearlyTrip.system_name],
})

const byCountry = (country?: Country) => (yearlyTrip: YearlyTripWithSystem) => {
  return !country || country === yearlyTrip.country
}

const byYear = (year?: number) => (yearlyTrip: YearlyTripWithSystem) =>
  !year || year === yearlyTrip.year

type RankingOptions = { year?: number; country?: Country; count?: number }

export const getRankings = (trips: YearlyTrip[], options?: RankingOptions) => {
  const { country, year, count } = options || {
    country: undefined,
    year: undefined,
    count: undefined,
  }
  return trips
    .map(toTripsWithSystemData)
    .filter(byCountry(country))
    .filter(byYear(year))
    .slice() // Creating shallow copy before sort
    .sort((a, b) => b.trip_count - a.trip_count)
    .slice(0, count ?? undefined)
}

export const getAggregatedTrips = (yearlyTrips: YearlyTrip[]) => {
  const grouped = _.groupBy(yearlyTrips, 'year')

  console.log({ grouped })
  const aggregated = _.mapValues(grouped, (trips) => {
    return trips.reduce(
      (accumulatedTrips, trip) => {
        return {
          trip_count: (accumulatedTrips.trip_count += trip.trip_count),
          year: trip.year,
          system_name: accumulatedTrips.system_name,
        }
      },
      {
        trip_count: 0,
        year: 0,
        system_name: 'all',
      }
    )
  })

  const aggregatedTrips = Object.values(aggregated).sort(
    (a, b) => a.year - b.year
  )

  return aggregatedTrips
}
