import * as d3 from 'd3'
import Biker from '@/app/components/Biker'
import { CITY_BIKE_CONFIG } from '@/app/components/Biker/cityBikeConfig'
import { AllTimeCityTrips } from '@/app/utils/fetchAllTimeTrips'

type Props = {
  data: AllTimeCityTrips[]
  // Bar length for a city. Defaults to its all-time total.
  value?: (d: AllTimeCityTrips) => number
  // Formats the in-bar label. Defaults to a compact SI count (e.g. "308M").
  format?: (n: number) => string
  // Optional small gray line under the city name, e.g. its years of operation.
  subLabel?: (d: AllTimeCityTrips) => string | undefined
  // Optional notes keyed by city. Footnoted cities get a superscript number
  // (assigned in this chart's sort order) and a list beneath the bars.
  footnotes?: Record<string, string>
  // Appended to the value in the hover tooltip, e.g. "/year".
  tooltipSuffix?: string
}

// Compact label shown inside each bar, e.g. 308,193,797 -> "308M".
const formatTrips = d3.format('.3~s')

// Full value for tooltips: large counts get thousands separators, small rates
// (e.g. trips per capita) keep one decimal.
const formatTooltip = (n: number): string =>
  n >= 1000 ? Math.round(n).toLocaleString() : n.toFixed(1)

// Each city rides its own bike, parked at the end (right) of its bar.
const BIKER_WIDTH = 52
// Bar thickness, sized to sit level with the biker (viewBox aspect is 112/200,
// so a 52px biker is ~29px tall).
const BAR_HEIGHT = 30
// Cap the longest bar short of full width so the trailing biker always has room.
const BAR_MAX_PCT = 84

export const AllTimeTripsBar = ({
  data,
  value = (d) => d.totalTrips,
  format = formatTrips,
  subLabel,
  footnotes,
  tooltipSuffix = '',
}: Props) => {
  const sorted = data.slice().sort((a, b) => value(b) - value(a))
  const max = Math.max(...sorted.map(value), 1)

  // Number the footnoted cities in this chart's display (sorted) order.
  const footnoteNumber = new Map<string, number>()
  const orderedFootnotes: { note: string }[] = []
  for (const d of sorted) {
    const note = footnotes?.[d.city]
    if (note && !footnoteNumber.has(d.city)) {
      footnoteNumber.set(d.city, orderedFootnotes.length + 1)
      orderedFootnotes.push({ note })
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-2">
      {sorted.map((d) => {
        const config = CITY_BIKE_CONFIG[d.city]
        const cityValue = value(d)
        const widthPct = (cityValue / max) * BAR_MAX_PCT

        return (
          <div
            key={d.city}
            className="flex items-center gap-2"
            title={`${d.metroArea}: ${formatTooltip(cityValue)}${tooltipSuffix}`}
          >
            <div className="shrink-0 w-28 pr-1 text-right text-xs leading-tight">
              {d.metroArea}
              {footnoteNumber.has(d.city) && (
                <sup className="ml-0.5 text-[9px] text-gray-400">
                  {footnoteNumber.get(d.city)}
                </sup>
              )}
              {subLabel?.(d) && (
                <div className="text-[10px] text-gray-400">{subLabel(d)}</div>
              )}
            </div>
            <div className="flex min-w-0 flex-1 items-center">
              <div
                className="flex items-center overflow-hidden rounded-r"
                style={{
                  width: `${widthPct}%`,
                  minWidth: 44,
                  height: BAR_HEIGHT,
                  background: '#2563eb',
                }}
              >
                <span className="whitespace-nowrap pl-2 text-xs font-medium text-white">
                  {format(cityValue)}
                </span>
              </div>
              <div className="shrink-0" style={{ width: BIKER_WIDTH }}>
                {config && (
                  <Biker
                    {...config}
                    width={BIKER_WIDTH}
                    wave={false}
                    speedBursts={false}
                  />
                )}
              </div>
            </div>
          </div>
        )
      })}
      </div>
      {orderedFootnotes.length > 0 && (
        <ol className="mt-3 space-y-1">
          {orderedFootnotes.map((f, i) => (
            <li key={i} className="text-[11px] leading-snug text-gray-500">
              <sup>{i + 1}</sup> {f.note}
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

export default AllTimeTripsBar
