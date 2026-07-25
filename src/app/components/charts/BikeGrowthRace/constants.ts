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

// Milestone goals the race steps through. The x-axis is fixed at the current
// goal (not the leader), so each segment is a distinct race to a line. When the
// leader reaches a goal, the clock holds briefly then snaps to the next goal.
// The final goal (300M) is a marked finish line the leader crosses *and keeps
// going* past — the axis stays at the 300M scale and the bar overshoots the
// line, so reaching 300M gets no hold (see the crossing check in index.tsx).
export const MILESTONES = [
  1_000_000, 10_000_000, 50_000_000, 100_000_000, 200_000_000, 300_000_000,
]
// Hard cap on bar width (% of track) so an overshooting final bar still leaves
// room for its value label + biker. Above BAR_MAX_PCT; only the final segment
// ever exceeds BAR_MAX_PCT.
export const BAR_HARD_MAX_PCT = 88
// At a reached milestone the clock freezes through three beats: a moment at the
// line with the bar full (REACHED_MS), the axis easing open to the next goal
// (EASE_MS), then a hold at the new scale so the viewer can re-orient (HOLD_MS).
export const REACHED_MS = 1000
export const EASE_MS = 1000
export const HOLD_MS = 1000
// During beat 3 (HOLD_MS), how long the new-scale ticks take to fade in (and the
// traveling max marker to fade out). Kept < HOLD_MS so they settle before resume.
export const AXIS_FADE_MS = 500

// --- Number formatting ---
const compact = new Intl.NumberFormat('en', {
  notation: 'compact',
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})
export const formatValue = (n: number): string => compact.format(n)

// Axis-tick labels: compact, no forced decimals ("0", "10M", "1.5M").
const compactAxis = new Intl.NumberFormat('en', {
  notation: 'compact',
  maximumFractionDigits: 1,
})
export const formatAxis = (n: number): string =>
  n < 1 ? '0' : compactAxis.format(n)

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]
export const formatMonth = (m: { year: number; month: number }): string =>
  `${MONTH_NAMES[m.month - 1]} ${m.year}`
