import DurationHistogram from '@/app/components/charts/DurationHistogram'
import data from '@/data/duration_buckets.json'
import DurationFacets from '@/app/components/charts/DurationFacets'
import { DurationBucket } from '@/app/model/DurationBucket'

const CITY = 'new_york_city'
const YEAR = 2024

const cityData = data
  .filter((cityYear) => cityYear.city === CITY && cityYear.year === YEAR)
  .filter((cityYear) => cityYear.bucket < 3600 && cityYear.bucket >= 60)
  .map((cityYear) => ({
    ...cityYear,
    bucket: cityYear.bucket / 60,
  }))

type MaxCountByCity = {
  [city: string]: number
}

const maxCountByCity: MaxCountByCity = {}

const getMaxBucketCountPerCity = (data: DurationBucket[], year: number) => {
  return data
    .filter((bucket) => bucket.year === year)
    .reduce((cities, currentCityYear: DurationBucket) => {
      const { city } = currentCityYear

      if (city === null) {
        return cities
      }

      const max = !cities[city]
        ? currentCityYear.count
        : Math.max(cities[city], currentCityYear.count)

      return {
        ...cities,
        [city]: max,
      }
    }, maxCountByCity)
}

const getRelativeTripsPerDuration = (data: DurationBucket[], year: number) => {
  return data
    .filter((cityYear) => cityYear.year === year)
    .filter((cityYear) => cityYear.bucket < 2700 && cityYear.bucket >= 60)
    .map((cityYear) => {
      return {
        ...cityYear,
        bucket: cityYear.bucket / 60,
        // count: (cityYear.count / maxCountByCity[cityYear.city]) * 100,
      }
    })
    .sort((a, b) =>
      a.city === b.city ? a.bucket - b.bucket : a.city.localeCompare(b.city)
    )
}

const allCityData = getRelativeTripsPerDuration(data, YEAR)

const cityYearHistory = data
  .filter((durationBucket) => durationBucket.city === CITY)
  .filter((cityYear) => cityYear.bucket < 2700 && cityYear.bucket >= 60)
  .map((cityYear) => {
    return {
      ...cityYear,
      bucket: cityYear.bucket / 60,
      // count: (cityYear.count / maxCountByCity[cityYear.city]) * 100,
    }
  })
  .sort((a, b) => a.year - b.year)

export default function App() {
  return (
    <div className="p-6">
      <h3 className="text-2xl font-semibold mb-4">
        {CITY} – {YEAR} Trip Duration Histogram
      </h3>
      <DurationHistogram data={cityData} />

      <h3 className="text-2xl text-center">Trip Duration by City</h3>
      <DurationFacets data={allCityData} normalize />

      <h3 className="text-2xl font-semibold mb-4">{CITY} – History by Year</h3>
      <DurationFacets data={cityYearHistory} facetKey="year" facetColumns={1} />
    </div>
  )
}
