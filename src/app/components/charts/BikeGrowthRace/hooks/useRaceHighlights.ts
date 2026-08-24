'use client'

import { useMemo } from 'react'
import { MonthKey } from '../timeline/buildRaceTimeline'
import { RACE_HIGHLIGHTS } from '../highlights'
import { resolveHighlights, ResolvedHighlight } from '../highlightStack'

// The authored highlights placed on the race axis, recomputed only when the axis
// itself changes. Which of them are on screen at a given month is a per-frame
// question — see getHighlightSlots.
export const useRaceHighlights = (months: MonthKey[]): ResolvedHighlight[] =>
  useMemo(() => resolveHighlights(months, RACE_HIGHLIGHTS), [months])
