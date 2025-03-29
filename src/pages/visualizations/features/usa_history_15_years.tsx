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

  console.log({ cities })
  const [selectedCities, setSelectedCities] = useState<string[]>([])

  const [aggregatedData, setAggregatedData] = useState<AggregatedTrip[]>([])

  const usaTrips = getRankings(yearlyTrips, {
    country: 'USA',
  })
  useEffect(() => {
    const cities = _.uniq(usaTrips.map((trips) => trips.system_name))
    setCities(cities)
  }, [])

  useEffect(() => {
    const aggregatedTrips = getAggregatedTrips(usaTrips)

    console.log({ aggregatedTrips })
    setAggregatedData(aggregatedTrips)
  }, [yearlyTrips])

  const historicalTrips = usaTrips.filter((trip) => trip.year !== 2025)

  const tripsByYearAndSystem = historicalTrips.sort((a, b) => a.year - b.year)

  // Above 2 million trips per year
  const tierTwoSystems = [
    'chicago_bikeshare',
    'washington_dc_bikeshare',
    'boston_bikeshare',
    'san_francisco_bikeshare',
    'philadelphia_bikeshare',
  ]

  // Around 1 million trips or less per year
  const tierThreeSystems = [
    'los_angeles_bikeshare',
    'pittsburgh_bikeshare',
    'columbus_bikeshare',
    'chattanooga_bikeshare',
    'austin_bikeshare',
  ]

  return (
    <div className="prose w-full max-w-[600px] m-auto p-8">
      <div>
        <h1 className="text-4xl">Take a Trip Down the Bike (Memory) Lane!</h1>
        <h3 className="text-xl">
          Analyzing 14 Years of Bikeshare Trips in the United States
        </h3>
        <p>
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
          <p>
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
                  [
                    'new_york_city_bikeshare',
                    'chicago_bikeshare',
                    'washington_dc_bikeshare',
                  ].includes(d.system_name),
                x: 'year',
                y: 'trip_count',
                z: 'metroArea',
                text: 'metroArea',
                textAnchor: 'start',
                dx: 5,
              })
            ),
          ]}
        />
        <p>
          Since launching in 2013, New York City has consistently lead all
          cities in total trips. In 2024, NYC surpassed 44 million rides, more
          than all other US cities combined. The city with the second most
          rides, Chicago, had just over 5.7 million rides.
        </p>

        <div>
          <TripsByYear
            data={tripsByYearAndSystem.filter((trips) =>
              tierTwoSystems.includes(trips.system_name)
            )}
            marks={[
              Plot.text(
                tripsByYearAndSystem.filter((trips) =>
                  tierTwoSystems.includes(trips.system_name)
                ),
                Plot.selectLast({
                  x: 'year',
                  y: 'trip_count',
                  z: 'system_name',
                  text: 'metroArea',
                  textAnchor: 'start',
                  dx: 5,
                })
              ),
            ]}
          />
          <p className="pt-4">
            When NYC is excluded, we can better see the trends of other
            individual cities. After a few years of stagnant growth, Boston and
            San Francisco trips are sharply increasing. DC's bikeshare trips
            seem to be increasing at an exponential rate, while those in Chicago
            and Philadelphia may be plateauing.
          </p>
        </div>

        <div className="pt-4">
          <TripsByYear
            data={tripsByYearAndSystem.filter((trips) =>
              tierThreeSystems.includes(trips.system_name)
            )}
            marks={[
              Plot.text(
                tripsByYearAndSystem.filter((trips) =>
                  tierThreeSystems.includes(trips.system_name)
                ),
                Plot.selectLast({
                  x: 'year',
                  y: 'trip_count',
                  z: 'system_name',
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
            the past couple of years. Note that Austin only published 2024 data
            for half the year, and Chattanooga has not published data since mid
            2022.
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
              selectedCities.find((city) => city === trip.system_name)
            )}
        />
      </ChartTextLayout>
    </div>
  )
}

export default Visualization
