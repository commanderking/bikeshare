import { RefObject } from 'react'
import { getLeaderBikerWidth, ZoomSize } from '../../render/zoomLayout'
import RaceBiker, { BikerRender } from './RaceBiker'

// Gap between the eyebrow label and the top of the leader's bar. Unscaled, like the
// value it replaces — it is breathing room, not part of the layout that grows.
const LABEL_BOTTOM_GAP = 7

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
          top: size.leaderTop - size.smallFont - LABEL_BOTTOM_GAP,
          left: 0,
          fontSize: size.smallFont,
        }}
      >
        {/* The qualifier names what the bar measures — without it the leader's bar
            is just a number. Only on this eyebrow: the name-column label below
            sits among the pack's city names, where it would read as noise. */}
        {metro && `${metro} (Total Trips)`}
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
          // Paint scales this down during the finale; pivot at the bar's tip so the
          // bike shrinks toward the bar end rather than drifting off it.
          transformOrigin: 'left center',
        }}
      >
        <RaceBiker biker={biker} width={getLeaderBikerWidth(size)} />
      </div>
      {/* Trip count parked just inside the bar's right end. Paint puts `left` at the
          bar's tip and translateX(-100%) hangs the label back inside it, so it tracks
          the tip without the tail having to reserve width for it. Hidden until the
          bar is wide enough to hold it — before that it would spill out the
          left-hand end. Dark, not white: the bar colors are mid-tone liveries that
          white text washes out against. */}
      <span
        ref={valueRef}
        className="absolute flex items-center whitespace-nowrap font-bold tabular-nums text-gray-900 opacity-0"
        style={{
          top: size.leaderTop,
          left: 0,
          height: size.leaderBarHeight,
          paddingRight: size.tailGap * 2,
          transform: 'translateX(-100%)',
          fontSize: size.emphFont,
        }}
      />
    </>
  )
}
