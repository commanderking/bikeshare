import { systems } from '@/app/constants/cities'
import { YearlyTrip } from '@/app/model/YearlyTrip'

const BASE =
  'https://cdn.jsdelivr.net/gh/commanderking/citybikeshare@main/analysis'

// The per-city summary.json omits the `city` field (it's implied by the path),
// so everything except `city` describes a single city's yearly rows.
type CitySummaryRow = Omit<YearlyTrip, 'city'>

export const getCitySummary = async (city: string): Promise<YearlyTrip[]> => {
  const res = await fetch(`${BASE}/${city}/summary.json`)
  if (!res.ok) {
    throw new Error(`${city} summary failed: ${res.status}`)
  }
  const rows = (await res.json()) as CitySummaryRow[]
  return rows.map((row) => ({ ...row, city }))
}

// Fetches every city's summary in parallel and flattens them into the same
// shape the old trips_per_year.json provided. A single failing city is logged
// and skipped rather than failing the whole dashboard.
export const fetchYearlyTrips = async (): Promise<YearlyTrip[]> => {
  const results = await Promise.all(
    Object.keys(systems).map(async (city) => {
      try {
        return await getCitySummary(city)
      } catch (error) {
        console.error(error)
        return [] as YearlyTrip[]
      }
    })
  )

  return results.flat()
}
