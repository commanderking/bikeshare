import Biker from '@/app/components/Biker'
import { CITY_BIKE_CONFIG } from '@/app/components/Biker/cityBikeConfig'
import { BAR_COLOR, BAR_HEIGHT, BIKER_VIEWBOX, BIKER_WIDTH } from './constants'

type Props = {
  // Systems key, used to pick the city's bike livery.
  city: string
  widthPct: number
  label: string
  // Whether the value label fits inside the bar (white) or sits past it (dark).
  labelInside: boolean
}

// The biker (left), the proportional bar, and its value label.
const CityBar = ({ city, widthPct, label, labelInside }: Props) => {
  const config = CITY_BIKE_CONFIG[city]

  return (
    <div className="flex min-w-0 flex-1 items-center gap-1">
      <div className="shrink-0" style={{ width: BIKER_WIDTH }}>
        {config && (
          <Biker
            {...config}
            width={BIKER_WIDTH}
            viewBox={BIKER_VIEWBOX}
            wave={false}
            speedBursts={false}
          />
        )}
      </div>
      <div
        className="flex items-center overflow-hidden rounded-r"
        style={{
          width: `${widthPct}%`,
          height: BAR_HEIGHT,
          background: BAR_COLOR,
        }}
      >
        {labelInside && (
          <span className="whitespace-nowrap pl-2 text-xs font-medium text-white">
            {label}
          </span>
        )}
      </div>
      {!labelInside && (
        <span className="whitespace-nowrap text-xs font-medium text-gray-700">
          {label}
        </span>
      )}
    </div>
  )
}

export default CityBar
