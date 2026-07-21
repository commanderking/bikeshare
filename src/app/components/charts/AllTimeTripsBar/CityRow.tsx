import { ReactNode } from 'react'
import { AllTimeCityTrips } from '@/app/utils/fetchAllTimeTrips'
import { BAR_MAX_PCT, LABEL_INSIDE_MIN_PX, formatValue } from './constants'
import CityLabel from './CityLabel'
import CityBar from './CityBar'

type Props = {
  d: AllTimeCityTrips
  // This city's already-computed metric value.
  value: number
  // The chart's max value, for scaling the bar width.
  max: number
  format: (n: number) => string
  trackWidth: number
  subLabel?: string
  footnoteNumber?: number
  tooltipSuffix: string
  info?: ReactNode
  infoOpen: boolean
  onToggleInfo: () => void
}

// One city's row: name label on the left, biker + proportional bar on the right.
const CityRow = ({
  d,
  value,
  max,
  format,
  trackWidth,
  subLabel,
  footnoteNumber,
  tooltipSuffix,
  info,
  infoOpen,
  onToggleInfo,
}: Props) => {
  const widthPct = (value / max) * BAR_MAX_PCT
  // Until measured, assume the label fits (keeps the initial paint clean).
  const barPx =
    trackWidth > 0 ? (widthPct / 100) * trackWidth : Number.POSITIVE_INFINITY
  const labelInside = barPx >= LABEL_INSIDE_MIN_PX

  return (
    <div
      className="flex items-center gap-2"
      title={`${d.metroArea}: ${formatValue(value)}${tooltipSuffix}`}
    >
      <CityLabel
        name={d.metroArea}
        footnoteNumber={footnoteNumber}
        subLabel={subLabel}
        info={info}
        infoOpen={infoOpen}
        onToggleInfo={onToggleInfo}
      />
      <CityBar
        city={d.city}
        widthPct={widthPct}
        label={format(value)}
        labelInside={labelInside}
      />
    </div>
  )
}

export default CityRow
