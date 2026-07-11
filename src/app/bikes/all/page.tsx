import Biker from '@/app/components/Biker'
import { CITY_BIKE_CONFIG, CONFIGURED_CITY_IDS } from '@/app/components/Biker/cityColors'
import { systems } from '@/app/constants/cities'
import { CITY_IMAGE_URL } from '@/app/constants/bikeImages'

export default function AllBikesPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-center mb-10">Bikes by City</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
        {CONFIGURED_CITY_IDS.map((id) => {
          const config = CITY_BIKE_CONFIG[id]
          const imageUrl = CITY_IMAGE_URL[id]
          const name = systems[id].metroArea
          return (
            <div key={id} className="flex flex-col items-center">
              <h2 className="text-lg font-semibold mb-2">
                {imageUrl ? (
                  <a
                    href={imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {name}
                  </a>
                ) : (
                  name
                )}
              </h2>
              <Biker
                width={250}
                colors={config.colors}
                basketType={config.basketType}
                skirtGuard={config.skirtGuard}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
