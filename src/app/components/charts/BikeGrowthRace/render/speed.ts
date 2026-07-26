import { scaleSqrt } from 'd3'
import { DEFAULT_SPEED } from '@/app/components/Biker/geometry'
import { RaceCity } from '../timeline/buildRaceTimeline'

// Biker cadence range (crank radians/frame). Anchored around the biker's
// DEFAULT_SPEED (0.032): a slow-but-visible floor up to a brisk sprint.
export const MIN_SPEED = DEFAULT_SPEED * 0.4
export const MAX_SPEED = DEFAULT_SPEED * 2.8

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
