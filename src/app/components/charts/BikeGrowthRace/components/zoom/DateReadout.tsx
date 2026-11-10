import { RefObject } from 'react'
import { ZoomSize } from '../../render/zoomLayout'

type Props = {
  dateRef: RefObject<HTMLDivElement>
  monthRef: RefObject<HTMLSpanElement>
  size: ZoomSize
  right: string
  monthName: string
  year: number | undefined
}

// The current month + year, parked in the pack's bottom-right corner. It can sit
// over the rows because the pack is ranked: the bars nearest it are the shortest on
// screen, so the corner it occupies is empty. The panel's bottom is also the stage's,
// so `bottom` measures from both. The right edge lines up with the panel, which needs
// a stage-fraction, so it arrives as a prop. This is the resting position — paint
// slides it in from the left edge as the pack enters.
export default function DateReadout({
  dateRef,
  monthRef,
  size,
  right,
  monthName,
  year,
}: Props) {
  return (
    <div
      ref={dateRef}
      className="absolute text-right"
      style={{ bottom: size.panelPadBottom, right }}
    >
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
