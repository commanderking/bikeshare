import yearlyTrips from '@/data/trips_per_year.json'
import _ from 'lodash'
import { useEffect, useState } from 'react'
import TripsByYear from '@/app/components/charts/TripsByYear'
import Select from 'react-select'
import StackedByYear from '@/app/components/charts/StackedByYear'
import ChartTextLayout from '@/app/components/ChartTextLayout'
import * as Plot from '@observablehq/plot'
import { AggregatedTrip } from '@/app/model/YearlyTrip'
import { getRankings, getAggregatedTrips } from '@/app/utils/yearlyTrips'
export const Visualization = () => {
  const [cities, setCities] = useState<string[]>([])
  const [selectedCities, setSelectedCities] = useState<string[]>([])

  const [aggregatedData, setAggregatedData] = useState<AggregatedTrip[]>([])

  const usaTrips = getRankings(yearlyTrips, {
    country: 'USA',
  })
  useEffect(() => {
    const cities = _.uniq(usaTrips.map((trips) => trips.city))
    setCities(cities)
  }, [])

  useEffect(() => {
    const aggregatedTrips = getAggregatedTrips(usaTrips)
    setAggregatedData(aggregatedTrips)
  }, [yearlyTrips])

  const historicalTrips = usaTrips.filter((trip) => trip.year !== 2024)
  const tripsByYearAndSystem = usaTrips.sort((a, b) => a.year - b.year)

  // Above 2 million trips per year
  const tierTwoSystems = [
    'chicago',
    'washington_dc',
    'boston',
    'san_francisco',
    'philadelphia',
  ]

  // Around 1 million trips or less per year
  const tierThreeSystems = [
    'los_angeles',
    'pittsburgh',
    'columbus',
    'chattanooga',
    'austin',
  ]

  return (
    <div className="max-w-[600px] m-auto p-8">
      <div className="pb-8">
        <h1 className="text-4xl">Take a Trip Down the Bike (Memory) Lane!</h1>
        <h3 className="text-xl">
          Analyzing 14 Years of Bikeshare Trips in the United States
        </h3>
        <p className="pt-8 pb-4">
          Many city bikeshares publish data for every single trip taken on their
          bikes, including each trip's start and end locations, and trip
          duration. Through these individual trips, we can analyze the overall
          trends of bikeshare trips in the United States. The visualizations
          below use bikeshare data from 11 major metropolitan areas including:
          Austin, Boston, Chicago, Chattanooga, Columbus, DC, Los Angeles, NYC,
          Philadelphia, Pittsburgh, and San Francisco.
        </p>
        <p>
          Some of the counts for each city different than what's reported on
          official city websites, which suggests that city officials may be
          using slightly different data than what's publicly published. In all
          cities, we've used what's been published directly by the bikeshare
          system. Some of these systems filter out trips that "are taken by
          staff as they service and inspect the system" and also "any trips that
          were below 60 seconds in length (potentially false starts or users
          trying to re-dock a bike to ensure it was secure)" (
          <a href="https://bluebikes.com/system-data" target="_blank">
            source
          </a>
          )
        </p>
      </div>

      <div>
        <ChartTextLayout title="How many trips are taken each year?">
          <StackedByYear data={aggregatedData} />
          <p className="pt-4">
            The number of bikeshare trips has increased almost every year since
            the first US bikeshare was introduced in Washington D.C. The
            exception is in 2020, when COVID-19 forced many cities to implement
            social distancing. Since then, bikeshare trips have resumed their
            initial trajectory, reaching 54 million total bike trips in 2023.
          </p>
        </ChartTextLayout>
      </div>

      <ChartTextLayout title="Which cities have the most bikeshare trips?">
        <TripsByYear
          data={tripsByYearAndSystem}
          marks={[
            Plot.text(
              tripsByYearAndSystem,
              Plot.selectLast({
                filter: (d) =>
                  ['new_york_city', 'chicago', 'washington_dc'].includes(
                    d.city
                  ),
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
        <p className="pt-4">
          Since launching in 2013, New York City has consistently lead all
          cities in total trips. In 2023, NYC surpassed 36 million rides, more
          than all other US cities combined. The city with the second most
          rides, Chicago, had just over 5.7 million rides.
        </p>

        <div className="pt-8">
          <TripsByYear
            data={tripsByYearAndSystem.filter((trips) =>
              tierTwoSystems.includes(trips.city)
            )}
            marks={[
              Plot.text(
                tripsByYearAndSystem.filter((trips) =>
                  tierTwoSystems.includes(trips.city)
                ),
                Plot.selectLast({
                  x: 'year',
                  y: 'trip_count',
                  z: 'city',
                  text: 'metroArea',
                  textAnchor: 'start',
                  dx: 5,
                })
              ),
            ]}
          />
          <p className="pt-4">
            When NYC is excluded, we can better see the trends of other
            individual cities. While most cities continue to see ridership
            increase every year, some cities such as Chicago, Boston, and SF may
            be seeing their trip counts plateau.
          </p>
        </div>

        <div className="pt-4">
          <TripsByYear
            data={tripsByYearAndSystem.filter((trips) =>
              tierThreeSystems.includes(trips.city)
            )}
            marks={[
              Plot.text(
                tripsByYearAndSystem.filter((trips) =>
                  tierThreeSystems.includes(trips.city)
                ),
                Plot.selectLast({
                  x: 'year',
                  y: 'trip_count',
                  z: 'city',
                  text: 'metroArea',
                  textAnchor: 'start',
                  dx: 5,
                })
              ),
            ]}
          />
          <p className="pt-4">
            For cities with less than 1 million trips per year, we see a mixed
            bag. Some cities like Pittsburgh and Los Angeles are on an upswing,
            but the number of trips in Austin and Chattanooga have dropped in
            the past couple of years. Note that Chattanooga has yet to publish
            their 2023 data on their website.
          </p>
        </div>
      </ChartTextLayout>

      <ChartTextLayout title="Your turn!">
        <p className="pb-4">
          Below you can select a city to better see its trends. Or select
          multiple cities to compare how trips vary across those cities.
        </p>
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
          placeholder="Select one or more cities..."
        />
        <TripsByYear
          data={historicalTrips
            .sort((a, b) => a.year - b.year)
            .filter((trip) =>
              selectedCities.find((city) => city === trip.city)
            )}
        />
      </ChartTextLayout>
    </div>
  )
}

export default Visualization
