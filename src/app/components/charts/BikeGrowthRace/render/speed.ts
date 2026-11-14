import { scaleSqrt } from 'd3'
import { DEFAULT_SPEED } from '@/app/components/Biker/geometry'
import { RaceCity } from '../timeline/buildRaceTimeline'

// Biker cadence range (crank radians per 60 fps frame). Anchored around the
// biker's DEFAULT_SPEED (0.032): a slow-but-visible floor (~7 RPM) up to a
// spinning ~128 RPM. The ceiling is capped by the wheels, not the legs: at
// GEAR_RATIO 1.4 this spins them ~18°/frame, near the ~20° limit for clearly
// forward spin (see GEAR_RATIO) — raise it only alongside a lower gear.
export const MIN_SPEED = DEFAULT_SPEED * 0.4
export const MAX_SPEED = DEFAULT_SPEED * 7

// A stable reference growth rate — a high percentile of every city's monthly
// trips — so cadence is comparable across the whole race rather than re-scaled
// per frame. Using a percentile (not the max) keeps one runaway month from
// flattening everyone else's pedalling.
export const referenceGrowth = (
  cities: RaceCity[],
  percentile = 0.9
): number => {
  const vals: number[] = []
  for (const city of cities) {
    for (const trips of city.monthlyTrips) if (trips > 0) vals.push(trips)
  }
  if (vals.length === 0) return 1
  vals.sort((a, b) => a - b)
  return vals[Math.floor((vals.length - 1) * percentile)] || 1
}

// Maps a month's growth rate (trips/month) to a biker cadence. Sqrt so small
// systems still visibly pedal; clamped so a huge month doesn't over-spin.
export const makeSpeedScale = (
  reference: number
): ((growth: number) => number) => {
  const scale = scaleSqrt()
    .domain([0, Math.max(reference, 1)])
    .range([MIN_SPEED, MAX_SPEED])
    .clamp(true)
  return (growth: number) => scale(Math.max(0, growth))
}
