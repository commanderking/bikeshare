import { systems } from '@/app/constants/cities'

const BASE =
  'https://cdn.jsdelivr.net/gh/commanderking/citybikeshare@main/analysis'

// One row of the `volume_by_month` field in each city's visuals.json.
export type VolumeByMonth = {
  year: number
  month: number
  trips: number
}

type CityVisuals = {
  volume_by_month?: VolumeByMonth[]
}

export type AllTimeCityTrips = {
  // The systems key, which doubles as the CDN folder name.
  city: string
  // Human-readable label for the chart (e.g. "New York City").
  metroArea: string
  totalTrips: number
  // All monthly rows, sorted chronologically.
  months: VolumeByMonth[]
  // Complete monthly rows, chronological, with the (usually partial) latest
  // month dropped. Charts annualize over a window of these on the client.
  completeMonths: VolumeByMonth[]
}

const sortMonths = (rows: VolumeByMonth[]): VolumeByMonth[] =>
  rows.slice().sort((a, b) => a.year - b.year || a.month - b.month)

// Sorts months chronologically and drops the most recent one, which is usually
// still in progress in the feed.
const getCompleteMonths = (rows: VolumeByMonth[]): VolumeByMonth[] =>
  sortMonths(rows).slice(0, -1)

// Finds a city's most recent "full" year of service and its trip total.
//
// A full calendar year (Jan–Dec) is the goal, but winter-closing systems never
// have all 12 months. So we treat a year as full when it contains the city's
// *typical season* — the months present in at least half of its years. That
// filters out stray off-season months and one-off data gaps. Returns the latest
// qualifying year with the sum of every month recorded in that year.
export const lastFullYearStats = (
  months: VolumeByMonth[]
): { year: number; trips: number } | null => {
  if (months.length === 0) return null

  const byYear = new Map<number, Map<number, number>>()
  for (const row of months) {
    if (!byYear.has(row.year)) byYear.set(row.year, new Map())
    byYear.get(row.year)!.set(row.month, row.trips)
  }
  const years = [...byYear.keys()].sort((a, b) => a - b)

  const yearsPerMonth = new Map<number, number>()
  for (const monthMap of byYear.values()) {
    for (const month of monthMap.keys()) {
      yearsPerMonth.set(month, (yearsPerMonth.get(month) ?? 0) + 1)
    }
  }
  const typicalSeason = [...yearsPerMonth.entries()]
    .filter(([, count]) => count * 2 >= years.length)
    .map(([month]) => month)
  if (typicalSeason.length === 0) return null

  for (let i = years.length - 1; i >= 0; i--) {
    const monthMap = byYear.get(years[i])!
    if (typicalSeason.every((month) => monthMap.has(month))) {
      const trips = [...monthMap.values()].reduce((sum, t) => sum + t, 0)
      return { year: years[i], trips }
    }
  }
  return null
}

// Annualizes a city's trips by averaging its complete months and scaling to 12.
// `windowMonths` limits it to the most recent N complete months (e.g. 24 for
// "Recent 2 Years"); omit it to use the city's entire history. Extrapolating
// from a monthly rate keeps young systems comparable with mature ones.
export const annualizeTrips = (
  completeMonths: VolumeByMonth[],
  windowMonths?: number
): number => {
  const window = windowMonths
    ? completeMonths.slice(-windowMonths)
    : completeMonths
  if (window.length === 0) return 0
  const total = window.reduce((sum, row) => sum + row.trips, 0)
  return (total / window.length) * 12
}

// Sums every month in a city's visuals.json to get its all-time trip total, and
// keeps the complete monthly series for on-the-fly annualization.
// The CDN folder is the systems *key* (e.g. new_york_city), not the `id`.
const getCityAllTimeTrips = async (city: string): Promise<AllTimeCityTrips> => {
  const res = await fetch(`${BASE}/${city}/visuals.json`)
  if (!res.ok) {
    throw new Error(`${city} visuals failed: ${res.status}`)
  }
  const visuals = (await res.json()) as CityVisuals
  const rawMonths = visuals.volume_by_month ?? []
  const totalTrips = rawMonths.reduce((sum, row) => sum + row.trips, 0)

  return {
    city,
    metroArea: systems[city].metroArea,
    totalTrips,
    months: sortMonths(rawMonths),
    completeMonths: getCompleteMonths(rawMonths),
  }
}

// Fetches every city's visuals in parallel and returns their all-time totals.
// A single failing city is logged and skipped rather than failing the page.
export const fetchAllTimeTrips = async (): Promise<AllTimeCityTrips[]> => {
  const results = await Promise.all(
    Object.keys(systems).map(async (city) => {
      try {
        return await getCityAllTimeTrips(city)
      } catch (error) {
        console.error(error)
        return null
      }
    })
  )

  return results.filter((city): city is AllTimeCityTrips => city !== null)
}
