import { MutableRefObject, RefObject } from 'react'
import { BAR_MAX_PCT, TICK_INTERVALS } from '../constants'
import { SizeScale } from '../sizing'

type Props = {
  // Fixed-position tick wrappers + label spans, collected for the parent to
  // relabel/fade imperatively each frame.
  tickWrapRefs: MutableRefObject<HTMLDivElement[]>
  tickLabelRefs: MutableRefObject<HTMLSpanElement[]>
  // The single "traveling" max marker, shown only during a rescale.
  travelerRef: RefObject<HTMLDivElement>
  travelerLabelRef: RefObject<HTMLSpanElement>
  // Current layout dimensions (grows in fullscreen); keeps the axis aligned with
  // the rows' name column and scales the tick labels to match.
  size: SizeScale
}

// The top x-axis: evenly spaced ticks spanning the track (0…BAR_MAX_PCT), whose
// labels are set imperatively to the current chart scale, plus a max marker that
// travels from the old scale's right edge to its new home during a rescale. This
// component only renders the shells; the parent paints them via the passed refs.
const TopAxis = ({
  tickWrapRefs,
  tickLabelRefs,
  travelerRef,
  travelerLabelRef,
  size,
}: Props) => (
  <div className="flex items-end gap-1 pb-1">
    <div className="shrink-0" style={{ width: size.nameColPx }} />
    <div className="relative h-5 flex-1">
      {Array.from({ length: TICK_INTERVALS + 1 }).map((_, tickIndex) => (
        <div
          key={tickIndex}
          ref={(el) => {
            if (el) tickWrapRefs.current[tickIndex] = el
          }}
          className="pointer-events-none absolute bottom-0 flex -translate-x-1/2 flex-col items-center"
          style={{ left: `${(tickIndex / TICK_INTERVALS) * BAR_MAX_PCT}%` }}
        >
          <span
            ref={(el) => {
              if (el) tickLabelRefs.current[tickIndex] = el
            }}
            className="mb-0.5 whitespace-nowrap tabular-nums text-gray-400"
            style={{ fontSize: size.axisFontPx }}
          />
          <div className="h-1.5 w-px bg-gray-300 dark:bg-gray-600" />
        </div>
      ))}
      {/* The traveling max marker (hidden until a rescale). */}
      <div
        ref={travelerRef}
        className="pointer-events-none absolute bottom-0 flex -translate-x-1/2 flex-col items-center opacity-0"
        style={{ left: 0 }}
      >
        <span
          ref={travelerLabelRef}
          className="mb-0.5 whitespace-nowrap font-semibold tabular-nums text-gray-500 dark:text-gray-300"
          style={{ fontSize: size.axisFontPx }}
        />
        <div className="h-1.5 w-px bg-gray-400 dark:bg-gray-400" />
      </div>
    </div>
  </div>
)

export default TopAxis
