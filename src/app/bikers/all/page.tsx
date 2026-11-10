import Biker from '@/app/components/Biker'
import {
  CITY_BIKE_CONFIG,
  CONFIGURED_CITY_IDS,
} from '@/app/components/Biker/cityBikeConfig'
import { CITY_RIDER_OUTFIT } from '@/app/components/Biker/cityRiderConfig'
import { systems } from '@/app/constants/cities'

export default function AllBikersPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-center mb-2">Bikers by City</h1>
      <p className="text-center text-gray-500 mb-10">
        Every city&apos;s bike, each with a rider of its own.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
        {CONFIGURED_CITY_IDS.map((id) => (
          <div key={id} className="flex flex-col items-center">
            <h2 className="text-lg font-semibold mb-2">{systems[id].metroArea}</h2>
            <Biker
              width={250}
              colors={CITY_BIKE_CONFIG[id].colors}
              basketType={CITY_BIKE_CONFIG[id].basketType}
              skirtGuard={CITY_BIKE_CONFIG[id].skirtGuard}
              downTube={CITY_BIKE_CONFIG[id].downTube}
              outfit={CITY_RIDER_OUTFIT[id]}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
