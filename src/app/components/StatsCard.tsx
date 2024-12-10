import RadialRank from '@/app/components/charts/RadialRank'
import { getRating } from '@/app/constants/ratings2024'
import { formatCitySystemData } from '@/app/utils/systemStatistics'

const StatsCard = ({ city, name }: { city: string; name: string }) => {
  const systemData = formatCitySystemData(city)

  console.log({ systemData })

  const radialData = getRating(city)
  if (!systemData || !radialData) return null

  return (
    <div className="max-w-sm mx-auto bg-white border border-gray-300 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300 w-full md:w-1/2 inline-block">
      <h2 className="mt-0 text-lg font-semibold text-gray-800 mb-4">{name}</h2>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-gray-600">Rating:</span>
        </div>
        <span className="text-gray-900 font-medium">{radialData.grade}</span>
      </div>
      <RadialRank
        data={[radialData]}
        options={{
          hideLegend: true,
        }}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {/* <FaBicycle className="text-blue-500" /> */}
          <span className="text-gray-600">Trips (Lifetime):</span>
        </div>
        <span className="text-gray-900 font-medium">
          {systemData.totalRows.toLocaleString()}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {/* <FaChartBar className="text-green-500" /> */}
          <span className="text-gray-600">First Trip:</span>
        </div>
        <span className="text-gray-900 font-medium">
          {systemData.firstTrip}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {/* <FaChartBar className="text-green-500" /> */}
          <span className="text-gray-600">Data Completeness (%):</span>
        </div>
        <span className="text-gray-900 font-medium">
          {systemData.percentComplete}%
        </span>
      </div>
    </div>
  )
}

export default StatsCard
