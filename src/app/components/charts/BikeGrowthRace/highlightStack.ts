import { getMonthIndex, MonthKey } from './timeline/buildRaceTimeline'
import { DEFAULT_HIGHLIGHT_MONTHS, RaceHighlight } from './highlights'

// The right column is a fixed grid of this many equal slots, so a card authored
// into slot 2 always lands at the same y no matter what its neighbors hold.
export const SLOT_COUNT = 2

// Months a card lingers past its window, invisible, so its fade-out has something
// to run against before it unmounts. In race months (not wall clock) like every
// other timing here, which keeps scrubbing and pausing correct.
const EXIT_MONTHS = 1

// An authored highlight placed on the race axis: on screen while monthTick is
// within [startIndex, endIndex], both inclusive.
export type ResolvedHighlight = RaceHighlight & {
  startIndex: number
  endIndex: number
}

// A resolved highlight that's on screen at some month — `visible` goes false while
// it fades out.
type LiveHighlight = ResolvedHighlight & { visible: boolean }

// A live highlight positioned in the column, in its authored (1-based) slot.
export type PlacedHighlight = LiveHighlight & { slot: number }

// Places every authored highlight on the axis, sorted by start. Highlights whose
// month falls off the axis are dropped with a warning rather than throwing — a
// typo'd year shouldn't take down the race for a decorative overlay.
export const resolveHighlights = (
  months: MonthKey[],
  highlights: RaceHighlight[]
): ResolvedHighlight[] => {
  if (months.length === 0) return []
  const resolved: ResolvedHighlight[] = []
  for (const highlight of highlights) {
    const startIndex = getMonthIndex(months, highlight)
    if (startIndex < 0) {
      console.warn(
        `Race highlight "${highlight.id}" is outside the race axis (${highlight.year}-${highlight.month}) — skipping.`
      )
      continue
    }
    const duration = highlight.durationMonths ?? DEFAULT_HIGHLIGHT_MONTHS
    resolved.push({
      ...highlight,
      startIndex,
      endIndex: startIndex + duration - 1,
    })
  }
  return resolved.sort(
    (highlightA, highlightB) => highlightA.startIndex - highlightB.startIndex
  )
}

// The cards to render at `monthTick`, each in its authored slot. Walks the
// highlights in start order so a later card simply overwrites an earlier one —
// two live cards claiming the same slot is an authoring error, and newest-wins is
// what falling through the loop already does. Overwriting a card that's only
// fading out is routine, so the warning fires only when both are live.
export const getHighlightSlots = (
  resolved: ResolvedHighlight[],
  monthTick: number
): PlacedHighlight[] => {
  const slots: (LiveHighlight | null)[] = new Array(SLOT_COUNT).fill(null)
  for (const highlight of resolved) {
    if (
      monthTick < highlight.startIndex ||
      monthTick > highlight.endIndex + EXIT_MONTHS
    ) {
      continue
    }
    const live: LiveHighlight = {
      ...highlight,
      visible: monthTick <= highlight.endIndex,
    }
    const slotIndex = highlight.placement - 1
    const occupant = slots[slotIndex]
    if (occupant && occupant.visible && live.visible) {
      console.warn(
        `Race highlights "${occupant.id}" and "${highlight.id}" both claim slot ${highlight.placement} — "${highlight.id}" wins.`
      )
    }
    slots[slotIndex] = live
  }

  return slots.flatMap((occupant, slotIndex) =>
    occupant ? [{ ...occupant, slot: slotIndex + 1 }] : []
  )
}
