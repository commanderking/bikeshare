import RankingTable from '@/app/features/dashboard/components/RankingTable'
import { getRankings } from '@/app/utils/yearlyTrips'
import { useYearlyTrips } from '@/app/hooks/useYearlyTrips'

const YEAR = 2024

export const Visualization = () => {
  const { trips, loading } = useYearlyTrips()

  const rankedTrips = getRankings(trips, { year: YEAR })
  const historicalTrips = rankedTrips.filter((trip) => trip.year > 2000)

  return (
    <div className="max-w-[600px] m-auto p-8">
      <h3 className="text-xl text-center">
        Global Bikeshare Trip Rankings - {YEAR}
      </h3>
      {loading ? (
        <p className="text-center italic py-8">Loading…</p>
      ) : (
        <RankingTable trips={historicalTrips} />
      )}
    </div>
  )
}

export default Visualization
