import { ReactNode, useEffect, useState } from 'react'
import { AllTimeCityTrips } from '@/app/utils/fetchAllTimeTrips'
import {
  BAR_MAX_PCT,
  FADE_MS,
  LABEL_INSIDE_MIN_PX,
  STAGGER_MS,
  formatValue,
} from './constants'
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
  // Whether this row should play its entrance the first time it appears.
  animate: boolean
  // This row's position within the current animating batch, for stagger timing.
  staggerIndex: number
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

// One city's row: name label on the left, proportional bar + trailing biker on
// the right. On first appearance the row fades in, then the biker rides right as
// the bar grows out behind it.
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
  animate,
  staggerIndex,
}: Props) => {
  const widthPct = (value / max) * BAR_MAX_PCT
  // Until measured, assume the label fits (keeps the initial paint clean).
  const barPx =
    trackWidth > 0 ? (widthPct / 100) * trackWidth : Number.POSITIVE_INFINITY
  const labelInside = barPx >= LABEL_INSIDE_MIN_PX

  // Freeze the entrance decision and stagger slot at mount, so a later re-render
  // (e.g. the width measurement landing) can't cancel an in-flight animation.
  const [shouldAnimate] = useState(() => animate && !prefersReducedMotion())
  const [staggerAt] = useState(staggerIndex)
  const [revealed, setRevealed] = useState(!shouldAnimate)
  useEffect(() => {
    if (!shouldAnimate) return
    const raf = requestAnimationFrame(() => setRevealed(true))
    return () => cancelAnimationFrame(raf)
  }, [shouldAnimate])

  const fadeDelayMs = staggerAt * STAGGER_MS
  const rideDelayMs = fadeDelayMs + FADE_MS

  return (
    <div
      className="flex items-center gap-2"
      title={`${d.metroArea}: ${formatValue(value)}${tooltipSuffix}`}
      style={{
        opacity: revealed ? 1 : 0,
        transition: shouldAnimate
          ? `opacity ${FADE_MS}ms ease ${fadeDelayMs}ms`
          : undefined,
      }}
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
        revealed={revealed}
        animate={shouldAnimate}
        rideDelayMs={rideDelayMs}
      />
    </div>
  )
}

export default CityRow
