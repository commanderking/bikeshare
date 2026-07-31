import { AllTimeCityTrips } from '@/app/utils/fetchAllTimeTrips'

// A point on the shared month axis.
export type MonthKey = { year: number; month: number }

// A 0-based position on the shared race axis (0 = the earliest month across all
// cities). It's the array index into cumulative[]/monthlyTrips[] and the clock's
// unit `time`. The absolute month ordinal it derives from (see getMonthOrdinal)
// is only a transient used to establish the axis origin, not a coordinate the
// model carries around.
type MonthIndex = number

// One city's frame-ready series, indexed by month index (see MonthIndex).
export type RaceCity = {
  city: string
  metroArea: string
  // Month index of the city's first data row (when it "joins").
  firstIndex: MonthIndex
  // Month index of the city's last data row (after which it is "exhausted").
  lastIndex: MonthIndex
  // Running total through each month. `undefined` before the city joins; held
  // flat at the final total from lastIndex onward. Set to 0 at firstIndex-1 so
  // the city visibly ramps up from zero during its launch month.
  cumulative: (number | undefined)[]
  // Trips recorded in each month (0 for gaps, before joining, and after exhaustion).
  monthlyTrips: number[]
}

export type RaceTimeline = {
  months: MonthKey[]
  cities: RaceCity[]
}

// Absolute month count (Jan of year 0 = 0). Used only transiently — to find the
// axis origin and to read calendar months back out — so the model can work
// entirely in month-index space.
const getMonthOrdinal = (year: number, month: number): number =>
  year * 12 + (month - 1)
const getMonthKey = (ordinal: number): MonthKey => ({
  year: Math.floor(ordinal / 12),
  month: (ordinal % 12) + 1,
})

// One city reduced to its trips grouped by absolute month ordinal — the only
// coordinate available before the shared axis origin is known. buildCity converts
// these onto the axis (month-index space).
type PreparedCity = {
  city: string
  metroArea: string
  byMonthOrdinal: Map<number, number>
}

// Groups one city's raw monthly rows into a map keyed by month ordinal, summing
// any duplicate rows defensively.
const groupCityByMonthOrdinal = (cityTrips: AllTimeCityTrips): PreparedCity => {
  const byMonthOrdinal = new Map<number, number>()
  for (const row of cityTrips.months) {
    const ordinal = getMonthOrdinal(row.year, row.month)
    byMonthOrdinal.set(ordinal, (byMonthOrdinal.get(ordinal) ?? 0) + row.trips)
  }
  return { city: cityTrips.city, metroArea: cityTrips.metroArea, byMonthOrdinal }
}

// Groups every city by month ordinal and drops those with no data.
const prepareCities = (data: AllTimeCityTrips[]): PreparedCity[] =>
  data
    .map(groupCityByMonthOrdinal)
    .filter((preparedCity) => preparedCity.byMonthOrdinal.size > 0)

// The shared axis origin + length. `minOrdinal` anchors month index 0; `length`
// is the month count, optionally capped at `finalMonth` (inclusive). Returns null
// when there's nothing to render (no data, or the cap precedes all data).
const getAxisBounds = (
  prepared: PreparedCity[],
  finalMonth?: MonthKey | null
): { minOrdinal: number; length: number } | null => {
  let minOrdinal = Infinity
  let maxOrdinal = -Infinity
  for (const preparedCity of prepared) {
    for (const ordinal of preparedCity.byMonthOrdinal.keys()) {
      if (ordinal < minOrdinal) minOrdinal = ordinal
      if (ordinal > maxOrdinal) maxOrdinal = ordinal
    }
  }
  if (!Number.isFinite(minOrdinal)) return null

  const capOrdinal = finalMonth
    ? getMonthOrdinal(finalMonth.year, finalMonth.month)
    : maxOrdinal
  const axisEndOrdinal = Math.min(maxOrdinal, capOrdinal)
  if (axisEndOrdinal < minOrdinal) return null

  return { minOrdinal, length: axisEndOrdinal - minOrdinal + 1 }
}

// Builds one city's frame-ready series on the shared axis. Converts the city's
// absolute-keyed months onto the axis once, then works purely in month-index
// space: fills the cumulative + monthly arrays, holds flat past the last data
// month (so the UI can mark exhaustion), and seeds a zero at firstIndex-1 so the
// city ramps in rather than popping in. Returns null if it only launches after
// the axis ends.
const buildCity = (
  preparedCity: PreparedCity,
  minOrdinal: number,
  length: number
): RaceCity | null => {
  const tripsByIndex = new Map<number, number>()
  for (const [ordinal, trips] of preparedCity.byMonthOrdinal) {
    tripsByIndex.set(ordinal - minOrdinal, trips)
  }
  const indices = [...tripsByIndex.keys()]
  const firstIndex = Math.min(...indices)
  if (firstIndex >= length) return null // launches after the axis ends
  // True last-data index — may sit beyond a capped axis, in which case the city
  // is still "live" at the finish (never flagged exhausted).
  const lastIndex = Math.max(...indices)

  const cumulative: (number | undefined)[] = new Array(length).fill(undefined)
  const monthlyTrips: number[] = new Array(length).fill(0)

  let running = 0
  const end = Math.min(lastIndex, length - 1)
  for (let monthIndex = firstIndex; monthIndex <= end; monthIndex++) {
    const trips = tripsByIndex.get(monthIndex) ?? 0 // 0 for interior gaps
    running += trips
    monthlyTrips[monthIndex] = trips
    cumulative[monthIndex] = running
  }
  // Data ends within the axis → hold flat (exhausted). Extends past a cap → no-op.
  for (let monthIndex = lastIndex + 1; monthIndex < length; monthIndex++) {
    cumulative[monthIndex] = running
  }
  // Ramp in from zero across the launch month.
  if (firstIndex > 0) cumulative[firstIndex - 1] = 0

  return {
    city: preparedCity.city,
    metroArea: preparedCity.metroArea,
    firstIndex,
    lastIndex,
    cumulative,
    monthlyTrips,
  }
}

// Transforms every city's monthly volume into a shared-axis race model: a single
// month axis (earliest→latest data, optionally capped at `finalMonth`) plus each
// city's cumulative + monthly series aligned to it. See the helpers for each step.
export const buildRaceTimeline = (
  data: AllTimeCityTrips[],
  finalMonth?: MonthKey | null
): RaceTimeline => {
  const prepared = prepareCities(data)
  const bounds = getAxisBounds(prepared, finalMonth)
  if (!bounds) return { months: [], cities: [] }

  // Open on an empty month before any city has data, so the chart starts blank
  // and the first tick fills the first month from zero — the same zero-ramp every
  // joining city gets (see buildCity's firstIndex-1 seed), now applied to the
  // earliest city too instead of it popping in fully formed.
  const minOrdinal = bounds.minOrdinal - 1
  const length = bounds.length + 1
  const months = Array.from({ length }, (_, monthIndex) =>
    getMonthKey(minOrdinal + monthIndex)
  )
  const cities = prepared
    .map((preparedCity) => buildCity(preparedCity, minOrdinal, length))
    .filter((raceCity): raceCity is RaceCity => raceCity !== null)

  return { months, cities }
}

// Interpolated cumulative value at fractional clock `time` (in month-index units).
// Continuous within a month; `undefined` before the city has joined.
export const getValueAt = (
  city: RaceCity,
  time: number
): number | undefined => {
  const monthIndex = Math.floor(time)
  const atMonth = city.cumulative[monthIndex]
  if (atMonth === undefined) return undefined
  const nextMonth = city.cumulative[monthIndex + 1]
  if (nextMonth === undefined) return atMonth
  return atMonth + (nextMonth - atMonth) * (time - monthIndex)
}

// Trips being added during the month currently filling at `time` — the growth
// rate that drives biker cadence. Constant across a month, so it only changes at
// month boundaries. Zero once the city is exhausted (flat cumulative).
export const getGrowthAt = (city: RaceCity, time: number): number => {
  const monthIndex = Math.floor(time)
  const atMonth = city.cumulative[monthIndex]
  if (atMonth === undefined) return 0
  const nextMonth = city.cumulative[monthIndex + 1]
  return nextMonth === undefined ? 0 : nextMonth - atMonth
}

// The visible race field at `time`: every joined city scored by its interpolated
// cumulative, sorted descending, limited to the top `topN`.
export const scoreCities = (
  cities: RaceCity[],
  time: number,
  topN: number
): Array<[RaceCity, number]> => {
  const scored: Array<[RaceCity, number]> = []
  for (const city of cities) {
    const value = getValueAt(city, time)
    // Skip cities still at zero (the pre-launch ramp seed) so the chart opens
    // blank and a city surfaces only once it has trips.
    if (value !== undefined && value > 0) scored.push([city, value])
  }
  scored.sort((a, b) => b[1] - a[1])
  return scored.slice(0, topN)
}
