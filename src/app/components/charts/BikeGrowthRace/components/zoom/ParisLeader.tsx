import { RefObject } from 'react'
import { ZoomSize } from '../../render/zoomLayout'
import RaceBiker, { BikerRender } from './RaceBiker'

type Props = {
  size: ZoomSize
  metro: string | undefined
  color: string
  biker: BikerRender
  nameRef: RefObject<HTMLSpanElement>
  colNameRef: RefObject<HTMLSpanElement>
  barRef: RefObject<HTMLDivElement>
  shadeRef: RefObject<HTMLDivElement>
  tailRef: RefObject<HTMLDivElement>
  valueRef: RefObject<HTMLSpanElement>
  markerRef: RefObject<HTMLDivElement>
}

// Paris: the runaway leader's standalone bar above the pack. Its width, value text,
// the #2 shade/marker overlay, and (at the finale) the crossfade of "PARIS" into a
// name-column "Paris" are all driven imperatively from ZoomRaceTrack's paint.
export default function ParisLeader({
  size,
  metro,
  color,
  biker,
  nameRef,
  colNameRef,
  barRef,
  shadeRef,
  tailRef,
  valueRef,
  markerRef,
}: Props) {
  return (
    <>
      <span
        ref={nameRef}
        className="absolute font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400"
        style={{
          top: size.leaderTop - size.smallFont - 3,
          left: 0,
          fontSize: size.smallFont,
        }}
      >
        {metro}
      </span>
      {/* the name-column label Paris crossfades into during the morph */}
      <span
        ref={colNameRef}
        className="absolute flex items-center justify-end overflow-hidden whitespace-nowrap font-semibold text-gray-700 opacity-0 dark:text-gray-100"
        style={{
          top: size.leaderTop,
          right: '100%',
          width: 0,
          height: size.leaderBarHeight,
          fontSize: size.packFont,
        }}
      >
        {metro}
      </span>
      <div
        ref={barRef}
        className="absolute rounded"
        style={{
          top: size.leaderTop,
          left: 0,
          width: 0,
          height: size.leaderBarHeight,
          background: color,
        }}
      />
      <div
        ref={shadeRef}
        className="absolute rounded-l opacity-0"
        style={{
          top: size.leaderTop,
          left: 0,
          width: 0,
          height: size.leaderBarHeight,
          background: 'rgba(255,255,255,0.28)',
          borderRight: '1px dashed rgba(255,255,255,0.6)',
        }}
      />
      <div
        ref={tailRef}
        className="absolute flex items-center"
        style={{
          top: size.leaderTop,
          left: 0,
          height: size.leaderBarHeight,
          paddingLeft: size.tailGap,
          gap: size.tailGap,
        }}
      >
        <RaceBiker biker={biker} width={size.bikerWidth} />
        <span
          ref={valueRef}
          className="shrink-0 whitespace-nowrap font-bold tabular-nums text-gray-700 dark:text-gray-100"
          style={{ fontSize: size.emphFont }}
        />
      </div>
      <div
        ref={markerRef}
        className="absolute opacity-0"
        style={{
          top: size.leaderTop - 4 * size.scale,
          left: 0,
          height: size.leaderBarHeight + size.bandGap,
          width: 0,
        }}
      >
        <div className="absolute inset-y-0 -left-px w-0.5 rounded bg-gray-900 dark:bg-gray-100" />
      </div>
    </>
  )
}
