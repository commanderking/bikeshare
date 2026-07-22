import Biker from '@/app/components/Biker'
import { CITY_BIKE_CONFIG } from '@/app/components/Biker/cityBikeConfig'
import {
  BAR_COLOR,
  BAR_HEIGHT,
  BIKER_VIEWBOX,
  BIKER_WIDTH,
  RIDE_MS,
} from './constants'

type Props = {
  // Systems key, used to pick the city's bike livery.
  city: string
  widthPct: number
  label: string
  // Whether the value label fits inside the bar (white) or sits past it (dark).
  labelInside: boolean
  // Entrance animation: when false the bar starts collapsed and grows to
  // widthPct once `revealed` flips, carrying the trailing biker rightward.
  revealed: boolean
  animate: boolean
  rideDelayMs: number
}

// The proportional bar and its value label, with the biker trailing at the right.
const CityBar = ({
  city,
  widthPct,
  label,
  labelInside,
  revealed,
  animate,
  rideDelayMs,
}: Props) => {
  const config = CITY_BIKE_CONFIG[city]

  return (
    <div className="flex min-w-0 flex-1 items-center gap-1">
      <div
        className="flex items-center overflow-hidden rounded-r"
        style={{
          width: revealed ? `${widthPct}%` : 0,
          height: BAR_HEIGHT,
          background: BAR_COLOR,
          transition: animate
            ? `width ${RIDE_MS}ms ease-out ${rideDelayMs}ms`
            : undefined,
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
    </div>
  )
}

export default CityBar
