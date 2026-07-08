import Biker from '@/app/components/Biker'
import { CITY_BIKE_CONFIG, CONFIGURED_CITY_IDS } from '@/app/components/Biker/cityColors'
import { systems } from '@/app/constants/cities'

export default function AllBikesPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-center mb-10">Bikes by City</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
        {CONFIGURED_CITY_IDS.map((id) => {
          const config = CITY_BIKE_CONFIG[id]
          return (
            <div key={id} className="flex flex-col items-center">
              <h2 className="text-lg font-semibold mb-2">{systems[id].metroArea}</h2>
              <Biker
                width={250}
                colors={config.colors}
                basketType={config.basketType}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
