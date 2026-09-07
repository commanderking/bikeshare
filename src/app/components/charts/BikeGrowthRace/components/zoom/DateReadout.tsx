import { RefObject } from 'react'
import { ZoomSize } from '../../render/zoomLayout'

// Gap between the underside of Paris's bar and the month line.
const BAR_GAP = 5

type Props = {
  dateRef: RefObject<HTMLDivElement>
  monthRef: RefObject<HTMLSpanElement>
  size: ZoomSize
  right: string
  monthName: string
  year: number | undefined
}

// The current month + year, tucked under the right end of Paris's bar. The vertical
// anchor follows the bar and so comes from `size`; the right edge lines up with the
// panel below, which needs a stage-fraction, so it arrives as a prop. This is the
// resting position — paint slides it in from the left edge as the pack enters.
export default function DateReadout({
  dateRef,
  monthRef,
  size,
  right,
  monthName,
  year,
}: Props) {
  const top = size.leaderTop + size.leaderBarHeight + BAR_GAP * size.scale

  return (
    <div ref={dateRef} className="absolute text-right" style={{ top, right }}>
      {/* The month is shorter than the year, so it has room to shift within the
          block. inline-block is load-bearing: it keeps the span shrink-wrapped (so
          offsetLeft is the distance paint has to travel) while giving it a box a
          transform can actually move — transforms are ignored on inline elements. */}
      <div
        className="font-semibold text-gray-500 dark:text-gray-400"
        style={{ fontSize: size.monthFont }}
      >
        <span ref={monthRef} className="inline-block">
          {monthName}
        </span>
      </div>
      <div
        className="font-extrabold leading-none tracking-tight tabular-nums text-gray-800 dark:text-gray-100"
        style={{ fontSize: size.yearFont }}
      >
        {year}
      </div>
    </div>
  )
}
