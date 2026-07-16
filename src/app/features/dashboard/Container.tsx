'use client'
import { useYearlyTrips } from '@/app/hooks/useYearlyTrips'
import LatestYearChart from '@/app/features/dashboard/components/LatestYearChart'
import USMapChart from '@/app/components/charts/USMap'
import RankingTable from '@/app/features/dashboard/components/RankingTable'
import { getRankings } from '@/app/utils/yearlyTrips'
import CyclingBiker from '@/app/components/Biker/CyclingBiker'
import Image from 'next/image'

const CURRENT_YEAR = 2025

const DashboardContainer = () => {
  const { trips, loading } = useYearlyTrips()

  const recentUSTrips = getRankings(trips, {
    year: CURRENT_YEAR,
    country: 'USA',
  })

  const topGlobalTrips = getRankings(trips, {
    year: CURRENT_YEAR,
    count: 10,
  })

  return (
    <div className="prose text-center mt-16 max-w-[640px] m-auto">
      <h1 className="text-4xl">Cities Bike</h1>
      <CyclingBiker width={400} className="mx-auto" />
      <p className="pt-4 pb-8 text-lg">
        Visualizing bikeshare rides across the USA
      </p>
      {loading ? (
        <p className="py-16 italic">Loading bikeshare data…</p>
      ) : (
        <>
          <USMapChart data={recentUSTrips} />
          <div className="pt-8">
            <h3 className="text-2xl">US Bikeshare Rankings - {CURRENT_YEAR}</h3>
            <p className="p-4 italic">
              *For systems that openly share trip data
            </p>
          </div>

          <RankingTable trips={recentUSTrips} />

          <div className="pt-8">
            <h3 className="text-2xl">Trips per City ({CURRENT_YEAR})</h3>
            <p>NYC leads the way in Bikeshares</p>
            <LatestYearChart data={recentUSTrips} />
          </div>

          <div className="pt-8">
            <h2>How about global trends?</h2>
            <h3 className="text-2xl">
              Top 10 Cities Worldwide - {CURRENT_YEAR}
            </h3>
            <RankingTable trips={topGlobalTrips} />
          </div>
        </>
      )}

      <div className="pt-8">
        <h3 className="text-2xl">Want to explore more data?</h3>

        <div className="grid grid-cols-2 gap-1">
          <div>
            <a href="./visualizations/usa_history_15_years">
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
          <div>
            <a href="./data_quality_awards/2024">
              <Image
                src="/images/data_quality_preview.png"
                alt="Data Quality Preview"
                width="500"
                height="400"
              />

              <p>2024 Data Quality Rankings</p>
            </a>
          </div>
        </div>
      </div>
      <div className="pb-24"></div>
    </div>
  )
}

export default DashboardContainer
