import { useRouter } from 'next/router'
import BikeGrowthRace from '@/app/components/charts/BikeGrowthRace'

export const Visualization = () => {
  // ?autoplay=0 lets scripts/record-race.mjs start the race itself, so its first
  // recorded frame is the start of the race.
  const { query } = useRouter()

  return (
    <div className="max-w-[1200px] m-auto p-8">
      <h1 className="text-3xl text-center pb-2">Bikeshare Trips</h1>
      <p className="text-center text-sm text-gray-500 pb-8">
        Cumulative trips since each city&apos;s first ride. Cities join the race
        when they launch and each keeps pedalling at that month&apos;s growth
        rate.
      </p>
      <BikeGrowthRace autoplay={query.autoplay !== '0'} />
    </div>
  )
}

export default Visualization
