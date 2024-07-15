import yearlyTrips from '@/data/trips_per_year.json'
import _ from 'lodash'
import { useEffect, useState, useRef } from 'react'
import TripsByYear from '@/app/components/charts/TripsByYear'
import Select from 'react-select'
import StackedByYear from '@/app/components/charts/StackedByYear'
import ChartTextLayout from '@/app/components/ChartTextLayout'
import * as Plot from '@observablehq/plot'

export const Visualization = () => {
  const [cities, setCities] = useState<string[]>([])
  const [selectedCities, setSelectedCities] = useState<string[]>([])

  const [aggregatedData, setAggregatedData] = useState([])

  useEffect(() => {
    const cities = _.uniq(yearlyTrips.map((trips) => trips.system))
    setCities(cities)
  }, [yearlyTrips])

  useEffect(() => {
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

    setAggregatedData(aggregatedTrips)
  }, [yearlyTrips])

  console.log({ aggregatedData })

  const tripsByYearAndSystem = yearlyTrips
    .sort((a, b) => a.year - b.year)
    .filter((trip) => trip.year !== 2024)

  // Above 2 million trips per year
  const tierTwoCities = ['chicago', 'dc', 'boston', 'sf']

  // Around 1 million trips or less per year
  const tierThreeCities = [
    'philadelphia',
    'los_angeles',
    'pittsburgh',
    'columbus',
  ]

  return (
    <div className="max-w-[600px] m-auto p-8">
      <div>
        <h1 className="text-4xl">Take a Trip Down the Bike (Memory) Lane!</h1>
        <h3 className="text-xl">
          Analyzing 14 Years of Bikeshare Trips in the United States
        </h3>
      </div>
      <p className="pt-8">
        Many city bikeshares publish data for every single trip taken on their
        bikes, including each trip's start and end locations, and trip duration.
        Through these individual trips, we can analyze the overall trends of
        bikeshare trips in the United States. The visualizations below use
        bikeshare data from 9 major metropolitan areas including: Boston,
        Chicago, Columbus, DC, Los Angeles, NYC, Philadelphia, Pittsburgh, and
        San Francisco.
      </p>

      {aggregatedData && (
        <ChartTextLayout title="How many trips are taken each year?">
          <StackedByYear data={aggregatedData} />
          <p>
            The number of bikeshare trips has increased almost every year since
            the first US bikeshare was introduced in Washington D.C. The
            exception is in 2020, when COVID-19 forced many cities to implement
            social distancing. Since then, bikeshare trips have resumed their
            initial trajectory, reaching 54 million total bike trips in 2023.
          </p>
        </ChartTextLayout>
      )}

      <ChartTextLayout title="Which cities have the most bikeshare trips?">
        <TripsByYear
          data={tripsByYearAndSystem}
          marks={[
            Plot.text(
              tripsByYearAndSystem,
              Plot.selectLast({
                filter: (d) => ['nyc', 'chicago', 'dc'].includes(d.system),
                x: 'year',
                y: 'trip_count',
                z: 'system',
                text: 'system',
                textAnchor: 'start',
                dx: 5,
              })
            ),
          ]}
        />
        <p>
          Since launching in 2013, New York City has consistently lead all
          cities in total trips. In 2023, NYC surpassed 36 million rides, more
          than all other US cities combined. The city with the second most
          rides, Chicago, had just over 5.7 million rides.
        </p>
        <p></p>

        <TripsByYear
          data={tripsByYearAndSystem.filter((trips) =>
            tierTwoCities.includes(trips.system)
          )}
          marks={[
            Plot.text(
              tripsByYearAndSystem.filter((trips) =>
                tierTwoCities.includes(trips.system)
              ),
              Plot.selectLast({
                x: 'year',
                y: 'trip_count',
                z: 'system',
                text: 'system',
                textAnchor: 'start',
                dx: 5,
              })
            ),
          ]}
        />
        <p>
          When NYC is excluded, we can better see the trends of other individual
          cities. While most cities continue to see ridership increase every
          year, some cities such as Chicago, Boston, and SF may be seeing their
          trip counts plateau.
        </p>
      </ChartTextLayout>

      <ChartTextLayout title="Compare bikeshare across different cities">
        <Select
          onChange={(selectedOptions) => {
            setSelectedCities(selectedOptions.map((option) => option.value))
          }}
          isMulti
          options={cities.map((city) => {
            return {
              value: city,
              label: city,
            }
          })}
          placeholder="Select one or more cities to compare total rides"
        />
        <TripsByYear
          data={yearlyTrips
            .sort((a, b) => a.year - b.year)
            .filter((trip) =>
              selectedCities.find((city) => city === trip.system)
            )}
        />
      </ChartTextLayout>
    </div>
  )
}

export default Visualization

// <ul className="list-disc pl-10">
// <li>
//   Boston (includes Brookline, Cambridge, Everett, Malden, Somerville)
// </li>
// <li>Chicago</li>
// <li>Columbus</li>
// <li>Washington DC</li>
// <li>Los Angeles</li>
// <li>New York City (includes Jersey City)</li>
// <li>Philadelphia</li>
// <li>Pittsburgh</li>
// <li>San Francisco</li>
// </ul>
