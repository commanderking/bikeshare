// Number of cities visible at once.
export const TOP_N = 12

// --- Row / bar layout ---
export const BAR_HEIGHT = 30 // bar thickness, sized to sit level with the biker
export const ROW_HEIGHT = 42 // vertical pitch between rows (bar + gap)
export const BIKER_WIDTH = 30
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

// The x-axis scale is pinned to the calendar year, not the leader: the race
// pauses at each year end (see computeYearEndTimes) and, when the year about to
// play needs more room, the axis eases open to a wider max. Each entry is the max
// that holds from `fromYear` until the next entry supersedes it. Ticks fall out
// of the max automatically (TICK_INTERVALS steps), so 10M reads "0, 1M … 10M".
// Breakpoints were chosen so every year's leader fits under its max, verified
// against the data — 10M ends at 2011 because the leader crosses it during 2012.
export const AXIS_RESCALES = [
  { fromYear: 2009, max: 10_000_000 }, // 2009–2011
  { fromYear: 2012, max: 50_000_000 }, // 2012–2014
  { fromYear: 2015, max: 100_000_000 }, // 2015–2017
  { fromYear: 2018, max: 200_000_000 }, // 2018–2020
  { fromYear: 2021, max: 300_000_000 }, // 2021–2023
  // 2024 onward. Taipei (~414M once YouBike 1.0 is folded in) crosses 400M and
  // keeps going, so the final bar overshoots the line (see BAR_HARD_MAX_PCT).
  { fromYear: 2024, max: 400_000_000 },
]

// The axis max in force during a calendar year: the last rescale whose `fromYear`
// has arrived. Years before the first entry fall back to the first max.
export const axisMaxForYear = (year: number): number => {
  let max = AXIS_RESCALES[0].max
  for (const rescale of AXIS_RESCALES) if (year >= rescale.fromYear) max = rescale.max
  return max
}

// Hard cap on bar width (% of track) so an overshooting final bar still leaves
// room for its value label + biker. Above BAR_MAX_PCT; only the final year's
// leader ever exceeds BAR_MAX_PCT.
export const BAR_HARD_MAX_PCT = 88
// Number of intervals on the top x-axis (→ TICK_INTERVALS + 1 ticks/labels).
export const TICK_INTERVALS = 10

// --- Year-end pauses ---
// The race freezes at each year end so the finished year can be read. A year
// whose successor needs a wider axis instead runs the choreographed rescale
// (reach → ease → hold): the two still beats sum to YEAR_END_HOLD_MS, so a
// rescale pause is a normal pause plus the EASE_MS the axis takes to open.
export const YEAR_END_HOLD_MS = 3000
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
