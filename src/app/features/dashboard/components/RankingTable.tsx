import { YearlyTripWithSystem } from '@/app/model/YearlyTrip'

type Props = { trips: YearlyTripWithSystem[] }

const RankingTable = ({ trips }: Props) => {
  return (
    <table className="m-auto text-left w-1/2 text-sm rtl:text-right text-gray-500 dark:text-gray-400 table-auto">
      <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
        <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
          <th className="px-6 py-4">Rank</th>
          <th className="px-6 py-4">Metro Area</th>
          <th className="px-6 py-4">Trips</th>
        </tr>
      </thead>
      <tbody>
        {trips.map((trip, index) => {
          return (
            <tr
              key={trip.system}
              className=" bg-white border-b dark:bg-gray-800 dark:border-gray-700"
            >
              <td className="px-6 py-4">{index + 1}</td>
              <td className="px-6 py-4 font-semibold">{trip.metroArea}</td>
              <td className="px-6 py-4 text-right">
                {trip.trip_count.toLocaleString()}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

export default RankingTable
