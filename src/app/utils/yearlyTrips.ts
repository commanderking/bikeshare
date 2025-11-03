import _ from 'lodash'
import { systems } from '@/app/constants/cities'
import { Country } from '@/app/model/System'
import {
  RawYearlyTrip,
  YearlyTrip,
  YearlyTripWithSystem,
} from '@/app/model/YearlyTrip'

const removeNullCases = (yearlyTrip: RawYearlyTrip) => {
  const { year, duration_median, duration_q1, duration_q3 } = yearlyTrip
  const possibleNullValues = [year, duration_median, duration_q1, duration_q3]
  return !possibleNullValues.some((value) => value === null)
}

const toTripsWithSystemData = (yearlyTrip: YearlyTrip) => ({
  ...yearlyTrip,
  ...systems[yearlyTrip.city],
})

const byCountry = (country?: Country) => (yearlyTrip: YearlyTripWithSystem) =>
  !country || country === yearlyTrip.country

const byYear = (year?: number) => (yearlyTrip: YearlyTripWithSystem) =>
  !year || year === yearlyTrip.year

type RankingOptions = { year?: number; country?: Country; count?: number }

export const getRankings = (
  trips: RawYearlyTrip[],
  options?: RankingOptions
) => {
  const { country, year, count } = options || {
    country: undefined,
    year: undefined,
    count: undefined,
  }

  console.log({ trips })
  return trips
    .filter(removeNullCases)
    .map(toTripsWithSystemData)
    .filter(byCountry(country))
    .filter(byYear(year))
    .slice() // Creating shallow copy before sort
    .sort((a, b) => b.trip_count - a.trip_count)
    .slice(0, count ?? undefined)
}

export const getAggregatedTrips = (yearlyTrips: YearlyTrip[]) => {
  const grouped = _.groupBy(yearlyTrips, 'year')
  const aggregated = _.mapValues(grouped, (trips) => {
    return trips.reduce(
      (accumulatedTrips, trip) => {
        return {
          trip_count: (accumulatedTrips.trip_count += trip.trip_count),
          year: trip.year,
          city: accumulatedTrips.city,
        }
      },
      {
        trip_count: 0,
        year: 0,
        city: 'all',
      }
    )
  })

  const aggregatedTrips = Object.values(aggregated).sort(
    (a, b) => a.year - b.year
  )

  return aggregatedTrips
}
