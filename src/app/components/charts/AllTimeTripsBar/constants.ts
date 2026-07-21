// Always-one-decimal compact formatting for every number in the chart, e.g.
// 308,193,797 -> "308.2M", 45,013,292 -> "45.0M", 5.48 -> "5.5".
const compact = new Intl.NumberFormat('en', {
  notation: 'compact',
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})
export const formatValue = (n: number): string => compact.format(n)

// Each city rides its own bike, sitting to the left of its bar. The default
// biker viewBox (0 0 200 112) has ~45px of empty padding on each side; crop to
// the bike's actual horizontal bounds so it doesn't leave a wide gap.
export const BIKER_VIEWBOX = '44 0 116 112'
export const BIKER_WIDTH = 30
// Bar thickness, sized to sit level with the biker (cropped viewBox aspect is
// 112/116, so a 30px biker is ~29px tall).
export const BAR_HEIGHT = 30
// Bar fill color.
export const BAR_COLOR = '#2563eb'
// Cap the longest bar short of full width so the trailing biker always has room.
export const BAR_MAX_PCT = 84
// City-name column (w-28) + row gap (gap-2), subtracted to get the track width.
export const NAME_COL_PX = 112
export const ROW_GAP_PX = 8
// Bars wider than this keep their value label inside (white); shorter bars show
// it just past the bar end (dark) so the bar can stay fully proportional.
export const LABEL_INSIDE_MIN_PX = 48
