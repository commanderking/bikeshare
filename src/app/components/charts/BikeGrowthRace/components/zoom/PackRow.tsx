import { RefCallback } from 'react'
import { REORDER_MS } from '../../constants'
import { ZoomSize } from '../../render/zoomLayout'
import RaceBiker, { BikerRender } from './RaceBiker'

type Props = {
  rank: number
  size: ZoomSize
  reduceMotion: boolean
  metro: string | undefined
  color: string
  biker: BikerRender
  rowLeft: string
  rowRight: string
  rowRef: RefCallback<HTMLDivElement>
  nameRef: RefCallback<HTMLSpanElement>
  barRef: RefCallback<HTMLDivElement>
  valueRef: RefCallback<HTMLSpanElement>
}

// One pack member: name | bar | biker | value. A rank swap slides the row via a CSS
// transform transition; its width, value text, and finale travel come from paint.
export default function PackRow({
  rank,
  size,
  reduceMotion,
  metro,
  color,
  biker,
  rowLeft,
  rowRight,
  rowRef,
  nameRef,
  barRef,
  valueRef,
}: Props) {
  return (
    <div
      ref={rowRef}
      className="absolute flex items-center"
      style={{
        top: size.panelTop + size.panelPadTop,
        left: rowLeft,
        right: rowRight,
        height: size.barHeight,
        gap: size.tailGap,
        transform: `translateY(${rank * size.rowPitch}px)`,
        transition: reduceMotion ? undefined : `transform ${REORDER_MS}ms ease`,
      }}
    >
      <span
        ref={nameRef}
        className="shrink-0 whitespace-nowrap text-right font-semibold text-gray-500 dark:text-gray-400"
        style={{ width: size.nameColWidth, fontSize: size.packFont }}
      >
        {metro}
      </span>
      <div
        className="flex min-w-0 flex-1 items-center"
        style={{ gap: size.tailGap }}
      >
        <div
          ref={barRef}
          className="rounded"
          style={{ width: 0, height: size.barHeight, background: color }}
        />
        <RaceBiker biker={biker} width={size.bikerWidth} />
        <span
          ref={valueRef}
          className="shrink-0 whitespace-nowrap font-semibold tabular-nums text-gray-700 dark:text-gray-200"
          style={{ fontSize: size.packFont }}
        />
      </div>
    </div>
  )
}
