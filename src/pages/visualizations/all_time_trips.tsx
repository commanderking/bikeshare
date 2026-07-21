import { useState } from 'react'
import AllTimeTripsBar from '@/app/components/charts/AllTimeTripsBar'
import ChartTextLayout from '@/app/components/ChartTextLayout'
import { useAllTimeTrips } from '@/app/hooks/useAllTimeTrips'
import {
  AllTimeCityTrips,
  annualizeTrips,
  lastFullYearStats,
} from '@/app/utils/fetchAllTimeTrips'
import { POPULATION_SERVED } from '@/app/constants/areasServed'

// Cities span a huge range (~300M down to ~0.5M trips), so we split them into
// two charts by volume. This keeps the smallest systems from rendering as
// negligible slivers next to the largest.
const HIGH_VOLUME_COUNT = 13

// Per-city notes for the All Time Trips charts (keyed by systems key).
const ALL_TIME_FOOTNOTES: Record<string, string> = {
  taipei:
    'Only includes YouBike 2.0 trips. Trip data for YouBike 1.0, which started in 2009, have not been released by the government.',
}

// Window options for the Trips per Year charts.
const YEAR_WINDOWS = {
  recent2: { label: 'Recent 2 Years', months: 24 },
  all: { label: 'All Time', months: undefined },
} as const
type YearWindow = keyof typeof YEAR_WINDOWS

export const Visualization = () => {
  const { trips, loading } = useAllTimeTrips()
  const [yearWindow, setYearWindow] = useState<YearWindow>('recent2')

  const sorted = trips.slice().sort((a, b) => b.totalTrips - a.totalTrips)
  const highVolume = sorted.slice(0, HIGH_VOLUME_COUNT)
  const lowVolume = sorted.slice(HIGH_VOLUME_COUNT)

  const annualized = (d: AllTimeCityTrips) =>
    annualizeTrips(d.completeMonths, YEAR_WINDOWS[yearWindow].months)

  // Trips per capita for each city's last full year of service (see helper).
  const fullYearByCity = new Map(
    trips.map((d) => [d.city, lastFullYearStats(d.months)])
  )
  const perCapita = (d: AllTimeCityTrips) => {
    const stats = fullYearByCity.get(d.city)
    const population = POPULATION_SERVED[d.city] ?? 0
    return stats && population ? stats.trips / population : 0
  }
  const oneDecimal = (n: number) => n.toFixed(1)

  // Years of operation, e.g. "2010–2026" (months arrive sorted ascending).
  const yearsOfOperation = (d: AllTimeCityTrips) => {
    if (d.months.length === 0) return undefined
    const first = d.months[0].year
    const last = d.months[d.months.length - 1].year
    return first === last ? `${first}` : `${first}–${last}`
  }

  // A compact note listing which year each shown city's per-capita is based on.
  const yearsByCity = new Map<number, string[]>()
  for (const d of [...highVolume, ...lowVolume]) {
    const year = fullYearByCity.get(d.city)?.year
    if (!year) continue
    if (!yearsByCity.has(year)) yearsByCity.set(year, [])
    yearsByCity.get(year)!.push(d.metroArea)
  }
  const yearNote = [...yearsByCity.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([year, cities]) => `${year} — ${cities.join(', ')}`)
    .join('; ')

  return (
    <div className="max-w-[720px] m-auto p-8">
      <h1 className="text-3xl text-center pb-8">Bikeshare Trips by Each City</h1>

      {loading ? (
        <p className="text-center italic py-8">Loading…</p>
      ) : (
        <>
          <h2 className="text-2xl pb-2">All Time Trips</h2>
          <ChartTextLayout title="Highest volume cities">
            <AllTimeTripsBar
              data={highVolume}
              subLabel={yearsOfOperation}
              footnotes={ALL_TIME_FOOTNOTES}
              tooltipSuffix=" trips"
            />
          </ChartTextLayout>

          <ChartTextLayout title="Lower volume cities">
            <AllTimeTripsBar
              data={lowVolume}
              footnotes={ALL_TIME_FOOTNOTES}
              tooltipSuffix=" trips"
            />
          </ChartTextLayout>

          <div className="flex items-center justify-between pb-1">
            <h2 className="text-2xl">Trips per Year</h2>
            <select
              value={yearWindow}
              onChange={(e) => setYearWindow(e.target.value as YearWindow)}
              className="rounded border border-gray-300 px-2 py-1 text-sm"
            >
              {Object.entries(YEAR_WINDOWS).map(([key, { label }]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <p className="text-sm text-gray-500 pb-2">
            Average trips per complete month over the selected window,
            extrapolated to a full year, so recently launched systems compare
            fairly with mature ones.
          </p>
          <ChartTextLayout title="Highest volume cities">
            <AllTimeTripsBar
              data={highVolume}
              value={annualized}
              tooltipSuffix=" trips/year"
            />
          </ChartTextLayout>

          <ChartTextLayout title="Lower volume cities">
            <AllTimeTripsBar
              data={lowVolume}
              value={annualized}
              tooltipSuffix=" trips/year"
            />
          </ChartTextLayout>

          <h2 className="text-2xl pb-1">Trips per Capita</h2>
          <p className="text-sm text-gray-500 pb-2">
            Trips in each city&apos;s last full year of service, divided by the
            population of every municipality it serves. A &ldquo;full year&rdquo;
            is January–December, except for winter-closing systems, where it is
            the last complete operating season.
          </p>
          <ChartTextLayout title="Highest volume cities">
            <AllTimeTripsBar
              data={highVolume}
              value={perCapita}
              format={oneDecimal}
              tooltipSuffix=" trips/capita"
            />
          </ChartTextLayout>

          <ChartTextLayout title="Lower volume cities">
            <AllTimeTripsBar
              data={lowVolume}
              value={perCapita}
              format={oneDecimal}
              tooltipSuffix=" trips/capita"
            />
          </ChartTextLayout>

          <p className="text-xs text-gray-500 pb-8">
            Last full year of service used, by city: {yearNote}.
          </p>
        </>
      )}
    </div>
  )
}

export default Visualization
