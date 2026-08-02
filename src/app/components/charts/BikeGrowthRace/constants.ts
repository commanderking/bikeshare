// Number of cities visible at once.
export const TOP_N = 10

// --- Row / bar layout ---
export const BAR_HEIGHT = 36 // bar thickness; leaves a 6px gap within the row pitch
export const ROW_HEIGHT = 42 // vertical pitch between rows (bar + gap)
export const BIKER_WIDTH = 36 // matches BAR_HEIGHT so the bike fills the bar's height
// The default biker viewBox has ~45px of empty padding each side; crop to the
// bike's horizontal bounds so it hugs the end of the bar (matches AllTimeTripsBar).
export const BIKER_VIEWBOX = '44 0 116 112'
export const BAR_COLOR = '#2563eb'
// Cap the longest bar short of full width so the value label + trailing biker
// always have room.
export const BAR_MAX_PCT = 84
// City-name column width (px).
export const NAME_COL_PX = 112

// --- Motion timing ---
// Row slide on a rank swap (ms).
export const REORDER_MS = 500
// Clock pace: months advanced per real second at 1x. ~197 months, so the full
// race is ~1.5 min at 1x.
export const DEFAULT_MONTHS_PER_SEC = 2
// Speed multipliers offered in the controls (relative to the 1x pace above).
export const SPEED_OPTIONS = [0.5, 1, 2, 4] as const

// Cap the race at a final month, inclusive: it runs only up to and including
// this month. Data past it is ignored, and cities still reporting past it are
// not marked exhausted. Set to null to run through the latest available month.
export const FINAL_MONTH: { year: number; month: number } | null = {
  year: 2025,
  month: 12,
}

// The race advances through "eras" — spans of years that share one x-axis scale.
// It pauses only at an era's end (not every year); the axis then eases open to the
// next era's max during that pause. Ticks fall out of the max (TICK_INTERVALS
// steps), so 40M reads "0, 4M …". `startYear` opens an era; it runs until the next
// opens.
//
// Three regimes:
//   2007–2014 — the axis holds at 50M. Paris passes 50M in 2009 and breaks off
//     the chart (see BAR_HARD_MAX_PCT), so this whole stretch is the rest of the
//     field climbing toward that mark — by end-2014 the chasers (Taipei 34.6M,
//     London 32.1M) reach ~65–70% of it. The first pause is Dec 2014, when that
//     climb pays off.
//   2015–2022 — the axis is sized to the *runner-up*: each max puts the 2nd-place
//     city at ~75% of the axis at the era's end, leaving headroom that reads as
//     Paris's continuing dominance while keeping the pack legible. This works
//     because the runner-up is monotonic (the 2nd-largest of monotonically-growing
//     cumulatives only grows), so its era-end value is the era's peak — the number
//     each max clears. Paris stays off the chart, but by less each era.
//   2023–2025 — the finale switches to Paris's *own* total (650M), so the leader
//     drops back onto the chart as a whole bar (~82%) and the off-chart break
//     heals: as the axis opens into this era the break fades and Paris's green
//     fills back in (see paintBars). The runner-up (Taipei) sits ~52% here.
export const ERAS = [
  { startYear: 2007, max: 50_000_000 }, //  2007–2014 held at 50M
  { startYear: 2015, max: 125_000_000 }, // #2 Taipei 95.0M → 76%  (Paris 343.6M)
  { startYear: 2018, max: 200_000_000 }, // #2 Taipei 149.8M → 75% (Paris 374.6M)
  { startYear: 2020, max: 310_000_000 }, // #2 Taipei 232.8M → 75% (Paris 490.9M)
  { startYear: 2023, max: 650_000_000 }, // Paris's own scale — leader 632.4M → 82%
]

// The last year of every era except the final one — the years the race pauses at
// (its December). An era ends the year before the next opens; the final era runs
// to the finish line, which never holds.
export const ERA_END_YEARS = ERAS.slice(1).map((era) => era.startYear - 1)

// The axis max in force during a calendar year: the max of the era it falls in
// (the last era to have opened). Years before the first era fall back to its max.
export const axisMaxForYear = (year: number): number => {
  let max = ERAS[0].max
  for (const era of ERAS) if (year >= era.startYear) max = era.max
  return max
}

// The pin for a bar that overshoots its axis. Paris runs past every era's scale
// up to 2022 (the 2023 finale is sized to Paris itself, so it fits); its bar
// clamps here, just past the last tick, while its value label carries the true
// total. Above BAR_MAX_PCT so the pinned bar still leaves room for that label + biker.
export const BAR_HARD_MAX_PCT = 88
// Number of intervals on the top x-axis (→ TICK_INTERVALS + 1 ticks/labels).
export const TICK_INTERVALS = 10

// --- Era-end pauses ---
// The race freezes at each era end so the finished era can be read. When the next
// era needs a wider axis (every boundary, as it happens) it runs the choreographed
// rescale (reach → ease → hold): the two still beats sum to ERA_END_HOLD_MS, so a
// rescale pause is a plain pause plus the EASE_MS the axis takes to open. The
// plain-hold path only fires if two adjacent eras ever share a max.
export const ERA_END_HOLD_MS = 3000
export const REACHED_MS = 1500 // beat 1: hold the finished year at the old scale
export const EASE_MS = 1000 // beat 2: axis eases open to the new scale
export const HOLD_MS = 1500 // beat 3: settle at the new scale
// During beat 3 (HOLD_MS), how long the new-scale ticks take to fade in (and the
// traveling max marker to fade out). Kept < HOLD_MS so they settle before resume.
export const AXIS_FADE_MS = 500

// --- Number formatting ---
const compact = new Intl.NumberFormat('en', {
  notation: 'compact',
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})
export const formatValue = (value: number): string => compact.format(value)

// Axis-tick labels: compact, no forced decimals ("0", "10M", "1.5M").
const compactAxis = new Intl.NumberFormat('en', {
  notation: 'compact',
  maximumFractionDigits: 1,
})
export const formatAxis = (value: number): string =>
  value < 1 ? '0' : compactAxis.format(value)

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]
export const formatMonth = (month: { year: number; month: number }): string =>
  `${MONTH_NAMES[month.month - 1]} ${month.year}`
