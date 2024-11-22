type CityStats = {
  name: string
  trips: number
  percentComplete: number
}

const StatsCard = ({ name, trips, percentComplete }: CityStats) => {
  return (
    <div className="max-w-sm mx-auto bg-white border border-gray-300 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
      <h2 className="mt-0 text-lg font-semibold text-gray-800 mb-4">{name}</h2>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {/* <FaBicycle className="text-blue-500" /> */}
          <span className="text-gray-600">Trips:</span>
        </div>
        <span className="text-gray-900 font-medium">
          {trips.toLocaleString()}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {/* <FaChartBar className="text-green-500" /> */}
          <span className="text-gray-600">Data Completeness (%):</span>
        </div>
        <span className="text-gray-900 font-medium">{percentComplete}%</span>
      </div>
    </div>
  )
}

export default StatsCard
