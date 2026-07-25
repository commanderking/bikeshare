import { AllTimeCityTrips } from '@/app/utils/fetchAllTimeTrips'

// A point on the shared month axis.
export type MonthKey = { year: number; month: number }

// One city's frame-ready series, indexed by month index (0-based position on the
// shared axis). See buildRaceTimeline for how the arrays are filled.
export type RaceCity = {
  city: string
  metroArea: string
  // Month index of the city's first data row (when it "joins").
  firstIndex: number
  // Month index of the city's last data row (after which it is "exhausted").
  lastIndex: number
  // Running total through month i. `undefined` before the city joins; held flat
  // at the final total from lastIndex onward. Set to 0 at firstIndex-1 so the
  // city visibly ramps up from zero during its launch month.
  cumulative: (number | undefined)[]
  // Trips recorded in month i (0 for gaps, before joining, and after exhaustion).
  monthlyTrips: number[]
}

export type RaceTimeline = {
  months: MonthKey[]
  cities: RaceCity[]
}

// Absolute month ordinal so months across years compare/subtract cleanly.
const ordinalOf = (year: number, month: number) => year * 12 + (month - 1)
const keyOf = (ordinal: number): MonthKey => ({
  year: Math.floor(ordinal / 12),
  month: (ordinal % 12) + 1,
})

// Transforms every city's monthly volume into a shared-axis race model:
// a single month axis spanning the earliest to latest data across all cities,
// plus per-city cumulative + monthly series aligned to that axis.
//
// Endpoints are kept as-is (no truncation): a city's series holds flat past its
// last data month so the UI can mark it "exhausted" rather than hide it.
export const buildRaceTimeline = (
  data: AllTimeCityTrips[]
): RaceTimeline => {
  // Cities with at least one month of data, each reduced to an ordinal->trips map
  // (summing any duplicate rows defensively).
  const prepared = data
    .map((d) => {
      const byOrdinal = new Map<number, number>()
      for (const row of d.months) {
        const ord = ordinalOf(row.year, row.month)
        byOrdinal.set(ord, (byOrdinal.get(ord) ?? 0) + row.trips)
      }
      return { city: d.city, metroArea: d.metroArea, byOrdinal }
    })
    .filter((p) => p.byOrdinal.size > 0)

  if (prepared.length === 0) return { months: [], cities: [] }

  let minOrd = Infinity
  let maxOrd = -Infinity
  for (const p of prepared) {
    for (const ord of p.byOrdinal.keys()) {
      if (ord < minOrd) minOrd = ord
      if (ord > maxOrd) maxOrd = ord
    }
  }

  const length = maxOrd - minOrd + 1
  const months: MonthKey[] = Array.from({ length }, (_, i) => keyOf(minOrd + i))

  const cities: RaceCity[] = prepared.map((p) => {
    const ordinals = [...p.byOrdinal.keys()]
    const firstIndex = Math.min(...ordinals) - minOrd
    const lastIndex = Math.max(...ordinals) - minOrd

    const cumulative: (number | undefined)[] = new Array(length).fill(undefined)
    const monthlyTrips: number[] = new Array(length).fill(0)

    let running = 0
    for (let i = firstIndex; i <= lastIndex; i++) {
      const trips = p.byOrdinal.get(minOrd + i) ?? 0 // 0 for interior gaps
      running += trips
      monthlyTrips[i] = trips
      cumulative[i] = running
    }
    // Hold flat at the final total after the city is exhausted.
    for (let i = lastIndex + 1; i < length; i++) cumulative[i] = running
    // Ramp in from zero across the launch month (so it grows in, not pops in).
    if (firstIndex > 0) cumulative[firstIndex - 1] = 0

    return { city: p.city, metroArea: p.metroArea, firstIndex, lastIndex, cumulative, monthlyTrips }
  })

  return { months, cities }
}

// Interpolated cumulative value at fractional clock time `t` (in month-index
// units). Continuous within a month; `undefined` before the city has joined.
export const valueAt = (c: RaceCity, t: number): number | undefined => {
  const m = Math.floor(t)
  const a = c.cumulative[m]
  if (a === undefined) return undefined
  const b = c.cumulative[m + 1]
  if (b === undefined) return a
  return a + (b - a) * (t - m)
}

// Trips being added during the month currently filling at time `t` — the growth
// rate that drives biker cadence. Constant across [m, m+1), so it only changes at
// month boundaries. Zero once the city is exhausted (flat cumulative).
export const growthAt = (c: RaceCity, t: number): number => {
  const m = Math.floor(t)
  const a = c.cumulative[m]
  if (a === undefined) return 0
  const b = c.cumulative[m + 1]
  return b === undefined ? 0 : b - a
}
