import { RefObject } from 'react'
import { getZoomStageHeight, ZoomSize } from '../../render/zoomLayout'
import { getCityBarColor } from '../../render/barColor'
import { MonthKey } from '../../timeline/buildRaceTimeline'
import { getHighlightSlots, SLOT_COUNT } from '../../highlightStack'
import { useRaceHighlights } from '../../hooks/useRaceHighlights'
import HighlightCard from './HighlightCard'

// The column's y, from the top of the stage.
const TOP = 146
const SLOT_GAP = 8

type Props = {
  highlightRef: RefObject<HTMLDivElement>
  size: ZoomSize
  left: string
  months: MonthKey[]
  monthTick: number
  reduceMotion: boolean
}

// Callouts annotating moments in the race, in the right column below the date. The
// column is a fixed grid of SLOT_COUNT equal slots that each card is authored into
// by hand, so nothing ever reflows — cards only fade in and out in place, and an
// unclaimed slot simply stays empty. The wrapper's opacity belongs to paint (it
// fades with the rest of the chrome at the finale); each card owns its own fade, so
// the two multiply instead of fighting.
export default function HighlightArea({
  highlightRef,
  size,
  left,
  months,
  monthTick,
  reduceMotion,
}: Props) {
  const highlights = useRaceHighlights(months)
  const placed = getHighlightSlots(highlights, monthTick)
  const top = TOP * size.scale

  return (
    <div
      ref={highlightRef}
      className="absolute grid"
      style={{
        top,
        left,
        right: 0,
        height: getZoomStageHeight(size) - top,
        gridTemplateRows: `repeat(${SLOT_COUNT}, 1fr)`,
        gap: SLOT_GAP * size.scale,
      }}
    >
      {placed.map((highlight) => (
        // Slot height is a fixed budget: the card fills its slot whatever its
        // content, and content taller than the slot is clipped rather than
        // pushing its neighbors around.
        <div
          key={highlight.id}
          className="min-h-0 overflow-hidden"
          style={{ gridRow: highlight.slot }}
        >
          <HighlightCard
            highlight={highlight}
            size={size}
            accentColor={
              highlight.city ? getCityBarColor(highlight.city) : undefined
            }
            visible={highlight.visible}
            reduceMotion={reduceMotion}
          />
        </div>
      ))}
    </div>
  )
}
