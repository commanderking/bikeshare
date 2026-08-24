import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { MonthKey } from './timeline/buildRaceTimeline'
import { RaceHighlight } from './highlights'
import {
  getHighlightSlots,
  resolveHighlights,
  ResolvedHighlight,
} from './highlightStack'

// A four-month axis: index 0 = Jan 2020 … index 3 = Apr 2020.
const months: MonthKey[] = [
  { year: 2020, month: 1 },
  { year: 2020, month: 2 },
  { year: 2020, month: 3 },
  { year: 2020, month: 4 },
]

const makeHighlight = (
  id: string,
  month: number,
  placement: RaceHighlight['placement'],
  durationMonths?: number
): RaceHighlight => ({
  id,
  year: 2020,
  month,
  title: id,
  content: id,
  placement,
  durationMonths,
})

// Slot occupancy as `slot:id` per placed card, for compact assertions.
const describeSlots = (placed: ReturnType<typeof getHighlightSlots>) =>
  placed.map(({ slot, id }) => `${slot}:${id}`)

beforeEach(() => {
  vi.spyOn(console, 'warn').mockImplementation(() => {})
})
afterEach(() => {
  vi.restoreAllMocks()
})

describe('resolveHighlights', () => {
  it('places highlights on the axis and derives their end from the duration', () => {
    const resolved = resolveHighlights(months, [
      makeHighlight('b', 3, 1),
      makeHighlight('a', 2, 2, 1),
    ])

    // sorted by start, not source order
    expect(resolved.map((highlight) => highlight.id)).toEqual(['a', 'b'])
    expect(resolved[0]).toMatchObject({ startIndex: 1, endIndex: 1 })
    // no duration given → the default window
    expect(resolved[1]).toMatchObject({ startIndex: 2, endIndex: 7 })
  })

  it('warns and drops highlights off the axis, and no-ops without an axis', () => {
    const resolved = resolveHighlights(months, [
      makeHighlight('early', 1, 1),
      { ...makeHighlight('late', 1, 1), year: 2021 },
    ])

    expect(resolved.map((highlight) => highlight.id)).toEqual(['early'])
    expect(console.warn).toHaveBeenCalledOnce()
    expect(resolveHighlights([], [makeHighlight('any', 1, 1)])).toEqual([])
  })
})

describe('getHighlightSlots', () => {
  const resolve = (highlights: RaceHighlight[]): ResolvedHighlight[] =>
    resolveHighlights(months, highlights)

  it('keeps each card in its authored slot and leaves unclaimed slots empty', () => {
    const resolved = resolve([makeHighlight('second', 1, 2)])

    expect(describeSlots(getHighlightSlots(resolved, 0))).toEqual(['2:second'])
  })

  it('fills both slots independently', () => {
    const resolved = resolve([
      makeHighlight('first', 1, 1),
      makeHighlight('second', 1, 2),
    ])

    expect(describeSlots(getHighlightSlots(resolved, 0))).toEqual([
      '1:first',
      '2:second',
    ])
  })

  it('shows a card only within its window, then holds it for one fading month', () => {
    const resolved = resolve([makeHighlight('solo', 2, 1, 1)]) // index 1 only

    expect(getHighlightSlots(resolved, 0)).toEqual([])
    expect(getHighlightSlots(resolved, 1)[0]).toMatchObject({ visible: true })
    // held one month past its window so the fade-out can run
    expect(getHighlightSlots(resolved, 2)[0]).toMatchObject({ visible: false })
    expect(getHighlightSlots(resolved, 3)).toEqual([])
  })

  it('lets a newer card take a slot from a live one, and warns', () => {
    const resolved = resolve([
      makeHighlight('old', 1, 2),
      makeHighlight('new', 2, 2),
    ])

    expect(describeSlots(getHighlightSlots(resolved, 1))).toEqual(['2:new'])
    expect(console.warn).toHaveBeenCalledOnce()
  })

  it('does not warn when the card being replaced is only fading out', () => {
    const resolved = resolve([
      makeHighlight('old', 1, 2, 1), // ends at index 0, fades through index 1
      makeHighlight('new', 2, 2),
    ])

    expect(describeSlots(getHighlightSlots(resolved, 1))).toEqual(['2:new'])
    expect(console.warn).not.toHaveBeenCalled()
  })

  it('leaves a neighboring slot untouched when one is taken over', () => {
    const resolved = resolve([
      makeHighlight('held', 1, 1),
      makeHighlight('old', 1, 2),
      makeHighlight('new', 2, 2),
    ])

    expect(describeSlots(getHighlightSlots(resolved, 1))).toEqual([
      '1:held',
      '2:new',
    ])
  })
})
