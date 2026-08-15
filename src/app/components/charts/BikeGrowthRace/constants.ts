// Number of cities visible at once.
export const TOP_N = 10

// --- Row / bar layout (the full stacked layout the finale morph settles into) ---
export const BAR_HEIGHT = 36 // bar thickness; leaves a 6px gap within the row pitch
export const ROW_HEIGHT = 42 // vertical pitch between rows (bar + gap)
// The default biker viewBox has ~45px of empty padding each side; crop to the
// bike's horizontal bounds so it hugs the end of the bar (matches AllTimeTripsBar).
export const BIKER_VIEWBOX = '44 0 116 112'
// The rendered biker's width ÷ height, from BIKER_VIEWBOX's 116×112 crop. Lets a
// caller size a bike by a target height: width = height × BIKER_ASPECT.
export const BIKER_ASPECT = 116 / 112
export const BAR_COLOR = '#2563eb'
// Cap the longest bar short of full width so the value label + trailing biker
// always have room.
export const BAR_MAX_PCT = 84

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

// --- Number formatting ---
const compact = new Intl.NumberFormat('en', {
  notation: 'compact',
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})
export const formatValue = (value: number): string => compact.format(value)
