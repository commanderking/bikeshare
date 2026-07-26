import { BAR_COLOR } from '../constants'
import type { BikerConfig } from '../components/RaceRow'

// A color is "pale" — near-white or light-gray — when even its darkest channel
// is bright. This keys on paleness, not luminance, so saturated colors that
// happen to be bright (Helsinki's yellow, cyans, oranges) are NOT rejected;
// only washed-out panels (Mexico City gray, the Nordic near-whites) are.
const isPale = (hex: string): boolean => {
  const hexDigits = hex.replace('#', '')
  const full =
    hexDigits.length === 3
      ? hexDigits
          .split('')
          .map((char) => char + char)
          .join('')
      : hexDigits
  const red = parseInt(full.slice(0, 2), 16) / 255
  const green = parseInt(full.slice(2, 4), 16) / 255
  const blue = parseInt(full.slice(4, 6), 16) / 255
  return Math.min(red, green, blue) > 0.62
}

// The bar fill for a city: its skirt-guard color — usually the most distinctive
// part of the livery. When that panel is pale (Mexico City, Oslo, Trondheim,
// Rosario, …) it would vanish against the page, so fall back to the guard's
// outer rib, then the frame, then the default blue.
export const barColorFor = (config?: BikerConfig): string => {
  if (!config?.skirtGuard) return BAR_COLOR
  const { color, outerGuard } = config.skirtGuard
  if (color && !isPale(color)) return color
  if (outerGuard?.color && !isPale(outerGuard.color)) return outerGuard.color
  return config.colors?.frameDark ?? config.colors?.frame ?? BAR_COLOR
}
