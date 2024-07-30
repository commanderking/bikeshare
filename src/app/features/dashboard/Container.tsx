'use client'
import yearlyTrips from '@/data/trips_per_year.json'
import LatestYearChart from '@/app/features/dashboard/components/LatestYearChart'
import StackedByYear from '@/app/components/charts/StackedByYear'
import { getUSYearlyTrips, getAggregatedTrips } from '@/app/utils/yearlyTrips'
import Image from 'next/image'

const usTrips = getUSYearlyTrips(yearlyTrips)

const DashboardContainer = () => {
  const currentYear = new Date().getFullYear()

  const recentTrips = yearlyTrips
    .filter((trips) => trips.year === currentYear)
    .sort((a, b) => {
      return b.trip_count - a.trip_count
    })

  const recentUSTrips = getUSYearlyTrips(recentTrips)

  return (
    <div className="text-center mt-16 max-w-[640px] m-auto">
      <h1 className="text-4xl">Cities Bike</h1>
      <p className="pt-4 pb-8 text-lg">
        Visualizing bikeshare rides across the globe
      </p>
      <div>
        <h3 className="text-2xl">US Bikeshares Rankings - 2024</h3>
        <p className="p-4 italic">*For systems that openly share trip data</p>
      </div>

      <table className="m-auto text-left w-1/2 text-sm rtl:text-right text-gray-500 dark:text-gray-400 table-auto">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
            <th className="px-6 py-4">Rank</th>
            <th className="px-6 py-4">Bike System</th>
            <th className="px-6 py-4">Trips</th>
          </tr>
        </thead>
        <tbody>
          {recentUSTrips.map((trip, index) => {
            return (
              <tr
                key={trip.system}
                className=" bg-white border-b dark:bg-gray-800 dark:border-gray-700"
              >
                <td className="px-6 py-4">{index + 1}</td>
                <td className="px-6 py-4 font-semibold">{trip.system}</td>
                <td className="px-6 py-4">
                  {trip.trip_count.toLocaleString()}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <div className="p-8">
        <h3 className="text-2xl">Trips per City</h3>
        <p>NYC leads the way in Bikeshares</p>
        <LatestYearChart data={recentUSTrips} />
      </div>

      <div className="p-8">
        <h3 className="text-2xl">Want to explore more data?</h3>

        <div className="grid grid-cols-2 gap-1">
          <div>
            <a href="./visualizations/2023_memory_lane">
              <StackedByYear data={getAggregatedTrips(usTrips)} />

              <p>How have US bikeshare trips changed over time?</p>
            </a>
          </div>
          <div>
            <a href="./usaCitiesShell">
              <Image
                src="/images/shell.png"
                alt="Shell Image"
                width="500"
                height="400"
              />

              <p>Write your own SQL queries for US cities in the past year.</p>
            </a>
          </div>
        </div>
      </div>
      <div className="pb-24"></div>
    </div>
  )
}

export default DashboardContainer
