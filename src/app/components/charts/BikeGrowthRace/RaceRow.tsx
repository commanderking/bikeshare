'use client'

import Biker, {
  BasketType,
  BikerColors,
  DownTubeCurve,
  SkirtGuard,
} from '@/app/components/Biker'
import {
  BAR_HEIGHT,
  BIKER_VIEWBOX,
  BIKER_WIDTH,
  NAME_COL_PX,
  REORDER_MS,
  ROW_HEIGHT,
} from './constants'

export type BikerConfig = {
  colors?: Partial<BikerColors>
  basketType?: BasketType
  skirtGuard?: SkirtGuard
  downTube?: DownTubeCurve
}

type Props = {
  city: string
  metroArea: string
  config?: BikerConfig
  // Bar fill, derived from the city's livery (see barColorFor).
  barColor: string
  // Vertical slot; the row slides between slots on a rank change.
  rank: number
  reduceMotion: boolean
  // Crank speed for this month; ignored while paused.
  bikerSpeed: number
  bikerPaused: boolean
  // Past its last data month: show the marker, park the bike.
  exhausted: boolean
  dataEndsLabel: string
  infoOpen: boolean
  onToggleInfo: () => void
  // Imperative handles the parent updates every frame (bar width, value text).
  barRef: (el: HTMLDivElement | null) => void
  valueRef: (el: HTMLSpanElement | null) => void
}

// One city's row: right-aligned name (with an exhausted marker), then the
// proportional bar, its value label, and the city's biker at the bar's end.
// Positioned absolutely by rank so a swap animates as a vertical slide, while the
// bar width + value text are driven imperatively by the parent each frame.
const RaceRow = ({
  city,
  metroArea,
  config,
  barColor,
  rank,
  reduceMotion,
  bikerSpeed,
  bikerPaused,
  exhausted,
  dataEndsLabel,
  infoOpen,
  onToggleInfo,
  barRef,
  valueRef,
}: Props) => (
  <div
    className="absolute left-0 right-0 flex items-center gap-1"
    style={{
      top: 0,
      height: ROW_HEIGHT,
      transform: `translateY(${rank * ROW_HEIGHT}px)`,
      transition: reduceMotion ? undefined : `transform ${REORDER_MS}ms ease`,
      // The row's transform makes it its own stacking context, so the popover's
      // own z-index can't rise above sibling rows below it. Lift the whole row
      // while its popover is open.
      zIndex: infoOpen ? 30 : undefined,
    }}
  >
    {/* Name column, right-aligned toward the bars. */}
    <div
      className="relative shrink-0 pr-1 text-right text-xs leading-tight"
      style={{ width: NAME_COL_PX }}
    >
      <span className="inline-flex items-center justify-end gap-0.5 align-middle">
        <span className="truncate">{metroArea}</span>
        {exhausted && (
          <button
            data-info-ui
            type="button"
            aria-label={`${metroArea}: data ends ${dataEndsLabel}`}
            onClick={onToggleInfo}
            className="text-red-500 hover:text-red-700"
          >
            {/* Filled dot + "i" — meaning is not carried by color alone. */}
            <svg viewBox="0 0 16 16" width="13" height="13" className="block">
              <circle cx="8" cy="8" r="7" fill="currentColor" />
              <line x1="8" y1="7" x2="8" y2="11.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
              <circle cx="8" cy="4.6" r="0.9" fill="white" />
            </svg>
          </button>
        )}
      </span>
      {exhausted && infoOpen && (
        <div
          data-info-ui
          className="absolute left-0 top-full z-20 mt-1 w-48 rounded border border-gray-200 bg-white p-2 text-left text-xs font-normal leading-snug text-gray-700 shadow-lg dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
        >
          Data ends {dataEndsLabel}. The bar is frozen at this city&apos;s last
          reported total.
        </div>
      )}
    </div>

    {/* Track: bar grows, pushing the biker (snug against its end) and then the
        value label toward the right. */}
    <div className="flex min-w-0 flex-1 items-center gap-1">
      <div
        ref={barRef}
        className="rounded-r"
        style={{
          width: 0,
          height: BAR_HEIGHT,
          background: barColor,
        }}
      />
      {/* Biker rides right at the bar's end, so it tracks the bar smoothly and
          never shifts with the (variable-width) number, which now trails it. */}
      <div className="shrink-0" style={{ width: BIKER_WIDTH }}>
        {config && (
          <Biker
            {...config}
            width={BIKER_WIDTH}
            viewBox={BIKER_VIEWBOX}
            speed={bikerSpeed}
            paused={bikerPaused}
            wave={false}
            speedBursts={false}
          />
        )}
      </div>
      <span
        ref={valueRef}
        className="shrink-0 whitespace-nowrap text-xs font-medium tabular-nums text-gray-700 dark:text-gray-200"
      />
    </div>
  </div>
)

export default RaceRow
