// Number of cities visible at once.
export const TOP_N = 10

// --- Row / bar layout (the full stacked layout the finale morph settles into) ---
export const BAR_HEIGHT = 36 // bar thickness; leaves a 6px gap within the row pitch
export const ROW_HEIGHT = 42 // vertical pitch between rows (bar + gap)
// The default biker viewBox has ~45px of empty padding each side; crop to the
// bike's horizontal bounds so it hugs the end of the bar (matches AllTimeTripsBar).
export const BIKER_VIEWBOX = '44 0 116 112'
// The rear wheel's center as a fraction of the rendered biker width. The wheel is
// drawn at cx=66 and BIKER_VIEWBOX crops to x∈[44,160] (width 116), so it lands at
// (66-44)/116 of the box — the offset for parking a bike's back wheel on a mark.
export const REAR_WHEEL_FRAC = (66 - 44) / 116
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
