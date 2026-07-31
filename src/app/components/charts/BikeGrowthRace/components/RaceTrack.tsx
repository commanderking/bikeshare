import { MutableRefObject, RefObject } from 'react'
import { CITY_BIKE_CONFIG } from '@/app/components/Biker/cityBikeConfig'
import { getGrowthAt, MonthKey, RaceCity } from '../timeline/buildRaceTimeline'
import { barColorFor } from '../render/barColor'
import { formatMonth, TOP_N } from '../constants'
import { SizeScale } from '../sizing'
import RaceRow, { BikerConfig } from './RaceRow'

type Props = {
  // The visible cities, top-ranked first (their index is their vertical slot).
  order: string[]
  // Current whole-month index — drives biker cadence + the exhausted flag.
  monthTick: number
  cityMap: Map<string, RaceCity>
  months: MonthKey[]
  speedScale: (growth: number) => number
  playing: boolean
  // Current layout dimensions; grows to fill the screen in fullscreen.
  size: SizeScale
  // True while the clock is holding (a year-end pause): time is frozen, so no
  // trips accrue and the bikers park even though playback is technically active.
  frozen: boolean
  reduceMotion: boolean
  openInfo: string | null
  onToggleInfo: (city: string) => void
  // Per-frame imperative handles the parent paints into.
  barRefs: MutableRefObject<Map<string, HTMLDivElement>>
  valueRefs: MutableRefObject<Map<string, HTMLSpanElement>>
  monthLabelRef: RefObject<HTMLDivElement>
}

// The chart body: one absolutely-positioned RaceRow per visible city (positioned
// by rank so swaps slide), plus the big month/year readout in the empty
// bottom-right corner. Bar widths + value text are painted by the parent via the
// ref maps; this component only wires up structure and per-row derived props.
const RaceTrack = ({
  order,
  monthTick,
  cityMap,
  months,
  speedScale,
  playing,
  size,
  frozen,
  reduceMotion,
  openInfo,
  onToggleInfo,
  barRefs,
  valueRefs,
  monthLabelRef,
}: Props) => (
  <div className="relative" style={{ height: TOP_N * size.rowHeight }}>
    {order.map((cityId, rank) => {
      const raceCity = cityMap.get(cityId)
      if (!raceCity) return null
      const exhausted = monthTick >= raceCity.lastIndex
      const growth = getGrowthAt(raceCity, monthTick)
      const speed = speedScale(growth)
      // Park the biker whenever no trips are accruing this frame: paused/ended
      // playback, a year-end hold, past the city's data, or a zero-trip month
      // (an off-season gap) — pedalling should track trips, not just motion.
      const bikerPaused = !playing || frozen || exhausted || growth <= 0
      const config = CITY_BIKE_CONFIG[cityId] as BikerConfig | undefined
      return (
        <RaceRow
          key={cityId}
          city={cityId}
          metroArea={raceCity.metroArea}
          config={config}
          barColor={barColorFor(config)}
          rank={rank}
          reduceMotion={reduceMotion}
          size={size}
          bikerSpeed={speed}
          bikerPaused={bikerPaused}
          exhausted={exhausted}
          dataEndsLabel={formatMonth(
            months[Math.min(raceCity.lastIndex, months.length - 1)]
          )}
          infoOpen={openInfo === cityId}
          onToggleInfo={() => onToggleInfo(cityId)}
          barRef={(el) => {
            if (el) barRefs.current.set(cityId, el)
            else barRefs.current.delete(cityId)
          }}
          valueRef={(el) => {
            if (el) valueRefs.current.set(cityId, el)
            else valueRefs.current.delete(cityId)
          }}
        />
      )
    })}

    {/* Big month/year readout in the empty bottom-right corner — the last
        few (smallest) cities never reach it. */}
    <div
      ref={monthLabelRef}
      className="pointer-events-none absolute bottom-0 right-0 font-bold tabular-nums text-gray-800 dark:text-gray-100"
      style={{ fontSize: size.monthFontPx }}
    />
  </div>
)

export default RaceTrack
