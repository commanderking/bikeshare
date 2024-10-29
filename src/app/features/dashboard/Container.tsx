'use client'
import yearlyTrips from '@/data/trips_per_year.json'
import LatestYearChart from '@/app/features/dashboard/components/LatestYearChart'
import USMapChart from '@/app/components/charts/USMap'
import RankingTable from '@/app/features/dashboard/components/RankingTable'
import { getRankings } from '@/app/utils/yearlyTrips'
import Image from 'next/image'

const DashboardContainer = () => {
  const currentYear = new Date().getFullYear()

  const recentGlobalTrips = getRankings(yearlyTrips, {
    year: 2023,
    count: 10,
  })
  const recentUSTrips = getRankings(yearlyTrips, {
    year: currentYear,
    country: 'USA',
  })

  return (
    <div className="text-center mt-16 max-w-[640px] m-auto">
      <h1 className="text-4xl">Cities Bike</h1>
      <p className="pt-4 pb-8 text-lg">
        Visualizing bikeshare rides across the USA
      </p>
      <USMapChart data={recentUSTrips} />
      <div className="pt-8">
        <h3 className="text-2xl">US Bikeshare Rankings - 2024</h3>
        <p className="p-4 italic">*For systems that openly share trip data</p>
      </div>

      <RankingTable trips={recentUSTrips} />

      <div className="pt-8">
        <h3 className="text-2xl">Trips per City</h3>
        <p>NYC leads the way in Bikeshares</p>
        <LatestYearChart data={recentUSTrips} />
      </div>

      <div className="pt-8">
        <h3 className="text-2xl">Want to explore more data?</h3>

        <div className="grid grid-cols-2 gap-1">
          <div>
            <a href="./visualizations/features/usa_history_15_years">
              <Image
                src="/images/features_usa_history_15_years.png"
                alt="Shell Image"
                width="500"
                height="400"
              />

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
