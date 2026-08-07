import BikeGrowthRace from '@/app/components/charts/BikeGrowthRace'

export const Visualization = () => (
  <div className="max-w-[1200px] m-auto p-8">
    <h1 className="text-3xl text-center pb-2">Bikeshare Trips</h1>
    <p className="text-center text-sm text-gray-500 pb-8">
      Cumulative trips since each city&apos;s first ride. Cities join the race
      when they launch and each keeps pedalling at that month&apos;s growth
      rate.
    </p>
    <BikeGrowthRace />
  </div>
)

export default Visualization
