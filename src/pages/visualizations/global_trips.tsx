import yearlyTrips from '@/data/trips_per_year.json'
import _ from 'lodash'
import RankingTable from '@/app/features/dashboard/components/RankingTable'
import { getRankings } from '@/app/utils/yearlyTrips'

const YEAR = 2024

export const Visualization = () => {
  const trips = getRankings(yearlyTrips, { year: YEAR })

  const historicalTrips = trips.filter((trip) => trip.year > 2000)

  return (
    <div className="max-w-[600px] m-auto p-8">
      <h3 className="text-xl text-center">
        Global Bikeshare Trip Rankings - {YEAR}
      </h3>
      <RankingTable trips={historicalTrips} />
    </div>
  )
}

export default Visualization
