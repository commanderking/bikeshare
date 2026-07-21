import { ReactNode, useEffect, useState } from 'react'
import { AllTimeCityTrips } from '@/app/utils/fetchAllTimeTrips'
import { formatValue } from './constants'
import { useTrackWidth } from './useTrackWidth'
import CityRow from './CityRow'

type Props = {
  data: AllTimeCityTrips[]
  // Bar length for a city. Defaults to its all-time total.
  value?: (d: AllTimeCityTrips) => number
  // Formats the in-bar label. Defaults to a compact one-decimal count.
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

  // Which city's info popover is open (only one at a time). Clicking anywhere
  // outside an info element closes it.
  const [openInfo, setOpenInfo] = useState<string | null>(null)
  useEffect(() => {
    if (!openInfo) return
    const onDown = (e: MouseEvent) => {
      if (!(e.target as Element).closest('[data-info-ui]')) setOpenInfo(null)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [openInfo])

  const [rootRef, trackWidth] = useTrackWidth()

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
        {visible.map((d) => (
          <CityRow
            key={d.city}
            d={d}
            value={value(d)}
            max={max}
            format={format}
            trackWidth={trackWidth}
            subLabel={subLabel?.(d)}
            footnoteNumber={footnoteNumber.get(d.city)}
            tooltipSuffix={tooltipSuffix}
            info={info?.(d)}
            infoOpen={openInfo === d.city}
            onToggleInfo={() =>
              setOpenInfo((prev) => (prev === d.city ? null : d.city))
            }
          />
        ))}
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
