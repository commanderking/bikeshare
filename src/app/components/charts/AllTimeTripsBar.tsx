import { ReactNode, useEffect, useRef, useState } from 'react'
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
  // How many top cities to show before "Show all". Defaults to 10.
  collapsedCount?: number
  // Optional content rendered beneath the chart, receiving the visible
  // (sorted + sliced) cities so it can stay in sync as the chart expands.
  footer?: (visibleCities: AllTimeCityTrips[]) => ReactNode
  // Optional popover content per city. When provided, an info icon sits next to
  // the city name and reveals this content on click.
  info?: (d: AllTimeCityTrips) => ReactNode
  // Appended to the value in the hover tooltip, e.g. "/year".
  tooltipSuffix?: string
}

// Always-one-decimal compact formatting for every number in the chart, e.g.
// 308,193,797 -> "308.2M", 45,013,292 -> "45.0M", 5.48 -> "5.5".
const compact = new Intl.NumberFormat('en', {
  notation: 'compact',
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})
const formatValue = (n: number): string => compact.format(n)

// Each city rides its own bike, sitting to the left of its bar. The default
// biker viewBox (0 0 200 112) has ~45px of empty padding on each side; crop to
// the bike's actual horizontal bounds so it doesn't leave a wide gap.
const BIKER_VIEWBOX = '44 0 116 112'
const BIKER_WIDTH = 30
// Bar thickness, sized to sit level with the biker (cropped viewBox aspect is
// 112/116, so a 30px biker is ~29px tall).
const BAR_HEIGHT = 30
// Cap the longest bar short of full width so the trailing biker always has room.
const BAR_MAX_PCT = 84
// City-name column (w-28) + row gap (gap-2), subtracted to get the track width.
const NAME_COL_PX = 112
const ROW_GAP_PX = 8
// Bars wider than this keep their value label inside (white); shorter bars show
// it just past the bar end (dark) so the bar can stay fully proportional.
const LABEL_INSIDE_MIN_PX = 48

export const AllTimeTripsBar = ({
  data,
  value = (d) => d.totalTrips,
  format = formatValue,
  subLabel,
  footnotes,
  collapsedCount = 10,
  footer,
  info,
  tooltipSuffix = '',
}: Props) => {
  const [expanded, setExpanded] = useState(false)

  // Which city's info popover is open (only one at a time).
  const [openInfo, setOpenInfo] = useState<string | null>(null)
  useEffect(() => {
    if (!openInfo) return
    const onDown = (e: MouseEvent) => {
      if (!(e.target as Element).closest('[data-info-ui]')) setOpenInfo(null)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [openInfo])

  // Measure the bar track so we can decide, per row, whether the value label
  // fits inside the bar or needs to sit just past its end.
  const rootRef = useRef<HTMLDivElement>(null)
  const [trackWidth, setTrackWidth] = useState(0)
  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const measure = () =>
      setTrackWidth(Math.max(0, el.clientWidth - NAME_COL_PX - ROW_GAP_PX))
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const sorted = data.slice().sort((a, b) => value(b) - value(a))
  const max = Math.max(...sorted.map(value), 1)

  const canExpand = sorted.length > collapsedCount
  const visible = expanded ? sorted : sorted.slice(0, collapsedCount)

  // Number the footnoted cities among the visible rows, in display order.
  const footnoteNumber = new Map<string, number>()
  const orderedFootnotes: { note: string }[] = []
  for (const d of visible) {
    const note = footnotes?.[d.city]
    if (note && !footnoteNumber.has(d.city)) {
      footnoteNumber.set(d.city, orderedFootnotes.length + 1)
      orderedFootnotes.push({ note })
    }
  }

  return (
    <div ref={rootRef}>
      <div className="flex flex-col gap-2">
      {visible.map((d) => {
        const config = CITY_BIKE_CONFIG[d.city]
        const cityValue = value(d)
        const widthPct = (cityValue / max) * BAR_MAX_PCT
        const label = format(cityValue)
        // Until measured, assume the label fits (keeps the initial paint clean).
        const barPx =
          trackWidth > 0
            ? (widthPct / 100) * trackWidth
            : Number.POSITIVE_INFINITY
        const labelInside = barPx >= LABEL_INSIDE_MIN_PX

        return (
          <div
            key={d.city}
            className="flex items-center gap-2"
            title={`${d.metroArea}: ${formatValue(cityValue)}${tooltipSuffix}`}
          >
            <div className="relative shrink-0 w-28 pr-1 text-right text-xs leading-tight">
              <span className="inline-flex items-center justify-end gap-0.5 align-middle">
                {d.metroArea}
                {info && (
                  <button
                    data-info-ui
                    type="button"
                    aria-label={`Details for ${d.metroArea}`}
                    onClick={() =>
                      setOpenInfo((prev) => (prev === d.city ? null : d.city))
                    }
                    className="text-gray-400 hover:text-blue-600"
                  >
                    <svg
                      viewBox="0 0 16 16"
                      width="13"
                      height="13"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      className="block"
                    >
                      <circle cx="8" cy="8" r="6.5" />
                      <line x1="8" y1="7.2" x2="8" y2="11.2" />
                      <circle cx="8" cy="4.8" r="0.5" fill="currentColor" stroke="none" />
                    </svg>
                  </button>
                )}
              </span>
              {footnoteNumber.has(d.city) && (
                <sup className="ml-0.5 text-[9px] text-gray-400">
                  {footnoteNumber.get(d.city)}
                </sup>
              )}
              {info && openInfo === d.city && (
                <div
                  data-info-ui
                  className="absolute left-0 top-full z-20 mt-1 w-60 rounded border border-gray-200 bg-white p-2 text-left text-xs font-normal leading-snug text-gray-700 shadow-lg"
                >
                  {info(d)}
                </div>
              )}
              {subLabel?.(d) && (
                <div className="text-[10px] text-gray-400">{subLabel(d)}</div>
              )}
            </div>
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
                  background: '#2563eb',
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
          </div>
        )
      })}
      </div>
      {canExpand && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="mt-3 text-sm text-blue-600 hover:underline"
        >
          {expanded ? 'Show fewer' : `Show all ${sorted.length} cities`}
        </button>
      )}
      {orderedFootnotes.length > 0 && (
        <ol className="mt-3 space-y-1">
          {orderedFootnotes.map((f, i) => (
            <li key={i} className="text-[11px] leading-snug text-gray-500">
              <sup>{i + 1}</sup> {f.note}
            </li>
          ))}
        </ol>
      )}
      {footer?.(visible)}
    </div>
  )
}

export default AllTimeTripsBar
