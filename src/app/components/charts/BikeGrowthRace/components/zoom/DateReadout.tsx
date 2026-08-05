import { RefObject } from 'react'
import { ZoomSize } from '../../render/zoomLayout'

type Props = {
  dateRef: RefObject<HTMLDivElement>
  size: ZoomSize
  left: string
  monthName: string
  year: number | undefined
}

// The current month + year, top-right during play; paint slides it to the bottom
// corner during the finale.
export default function DateReadout({
  dateRef,
  size,
  left,
  monthName,
  year,
}: Props) {
  return (
    <div
      ref={dateRef}
      className="absolute"
      style={{ top: size.dateTop, left, right: 0 }}
    >
      <div
        className="font-semibold text-gray-500 dark:text-gray-400"
        style={{ fontSize: size.monthFont }}
      >
        {monthName}
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
