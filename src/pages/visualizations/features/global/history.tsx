import yearlyTrips from '@/data/trips_per_year.json'
import _ from 'lodash'
import RankingTable from '@/app/features/dashboard/components/RankingTable'
import { getRankings } from '@/app/utils/yearlyTrips'
export const Visualization = () => {
  const trips = getRankings(yearlyTrips, { year: 2023 })

  // As of this point, Toronto has years from 17 instead of 2017
  const historicalTrips = trips.filter((trip) => trip.year > 2000)

  return (
    <div className="max-w-[600px] m-auto p-8">
      <h3 className="text-xl text-center">Bikeshare Trip Rankings - 2023</h3>
      <RankingTable trips={historicalTrips} />
    </div>
  )
}

export default Visualization
