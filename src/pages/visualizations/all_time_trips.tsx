import { useState } from 'react'
import AllTimeTripsBar from '@/app/components/charts/AllTimeTripsBar'
import ChartTextLayout from '@/app/components/ChartTextLayout'
import { useAllTimeTrips } from '@/app/hooks/useAllTimeTrips'
import {
  AllTimeCityTrips,
  annualizeTrips,
  lastFullYearStats,
} from '@/app/utils/fetchAllTimeTrips'
import {
  AREAS_SERVED,
  POPULATION_SERVED,
  POPULATION_SOURCES,
} from '@/app/constants/areasServed'

// Per-city notes for the All Time Trips chart (keyed by systems key).
const ALL_TIME_FOOTNOTES: Record<string, string> = {
  taipei:
    'Only includes YouBike 2.0 trips. Trip data for YouBike 1.0, which started in 2009, have not been released by the government. It is estimated that 200 million YouBike 1.0 trips were taken during its lifetime (https://english.ftvnews.com.tw/news/2022C01W08EA)',
}

// Window options for the Trips per Year charts.
const YEAR_WINDOWS = {
  recent2: { label: 'Recent 2 Years', months: 24 },
  all: { label: 'Every Year', months: undefined },
} as const
type YearWindow = keyof typeof YEAR_WINDOWS

export const Visualization = () => {
  const { trips, loading } = useAllTimeTrips()
  const [yearWindow, setYearWindow] = useState<YearWindow>('recent2')
  const [showSources, setShowSources] = useState(false)

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
  // Population of all served municipalities, shown under the per-capita bars.
  const compactNumber = new Intl.NumberFormat('en', {
    notation: 'compact',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })
  const populationLabel = (d: AllTimeCityTrips) => {
    const population = POPULATION_SERVED[d.city]
    return population ? `${compactNumber.format(population)} people` : undefined
  }

  // Years of operation, e.g. "2010–2026" (months arrive sorted ascending).
  const yearsOfOperation = (d: AllTimeCityTrips) => {
    if (d.months.length === 0) return undefined
    const first = d.months[0].year
    const last = d.months[d.months.length - 1].year
    return first === last ? `${first}` : `${first}–${last}`
  }

  // Compact note listing which year each given city's per-capita is based on.
  // Built from the chart's currently visible cities so it stays in sync.
  const yearNote = (cities: AllTimeCityTrips[]) => {
    const byYear = new Map<number, string[]>()
    for (const d of cities) {
      const year = fullYearByCity.get(d.city)?.year
      if (!year) continue
      if (!byYear.has(year)) byYear.set(year, [])
      byYear.get(year)!.push(d.metroArea)
    }
    return [...byYear.entries()]
      .sort((a, b) => b[0] - a[0])
      .map(([year, names]) => `${year} — ${names.join(', ')}`)
      .join('; ')
  }

  return (
    <div className="max-w-[720px] m-auto p-8">
      <h1 className="text-3xl text-center pb-8">
        Ranking Cities by Bikeshare Trips (3 ways)
      </h1>

      {loading ? (
        <p className="text-center italic py-8">Loading…</p>
      ) : (
        <>
          <ChartTextLayout
            title={<h2 className="text-2xl pb-2">All Time Trips</h2>}
          >
            <AllTimeTripsBar
              data={trips}
              subLabel={yearsOfOperation}
              footnotes={ALL_TIME_FOOTNOTES}
              tooltipSuffix=" trips"
            />
          </ChartTextLayout>

          <h2 className="text-2xl pb-1">Trips per Year</h2>
          <ChartTextLayout
            title={
              <p className="text-sm text-gray-500 pb-2">
                Shows the average number of trips taken in a year. Defaults to
                using the past two full years to better approximate a recent
                average.
              </p>
            }
          >
            <div className="flex items-center gap-2 pb-3">
              <label htmlFor="year-window" className="text-sm text-gray-700">
                Average over:
              </label>
              <select
                id="year-window"
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
            <AllTimeTripsBar
              data={trips}
              value={annualized}
              subLabel={yearsOfOperation}
              tooltipSuffix=" trips/year"
            />
          </ChartTextLayout>

          <h2 className="text-2xl pb-1">Trips per Capita</h2>
          <ChartTextLayout
            title={
              <p className="text-sm text-gray-500 pb-2">
                Trips in each city&apos;s last full year of service, divided by
                the population of every municipality it serves. A &ldquo;full
                year&rdquo; is January–December, except for winter-closing
                systems, where it is the last complete operating season.
              </p>
            }
          >
            <AllTimeTripsBar
              data={trips}
              value={perCapita}
              subLabel={populationLabel}
              info={(d) => (
                <>
                  <span className="font-medium">Included areas:</span>{' '}
                  {AREAS_SERVED[d.city]?.coveredAreas
                    .map((a) => a.name)
                    .join(', ')}
                </>
              )}
              tooltipSuffix=" trips/capita"
              footer={(visible) => (
                <p className="mt-3 text-xs text-gray-500">
                  Last full year of service used, by city: {yearNote(visible)}.
                </p>
              )}
            />
            <button
              type="button"
              onClick={() => setShowSources((prev) => !prev)}
              className="mt-3 text-sm text-blue-600 hover:underline"
            >
              {showSources
                ? 'Hide population sources'
                : 'View population sources'}
            </button>
            {showSources && (
              <ul className="mt-2 space-y-1">
                {POPULATION_SOURCES.map((s) => (
                  <li key={s.sourceUrl} className="text-xs">
                    <a
                      href={s.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {s.source}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </ChartTextLayout>
        </>
      )}
    </div>
  )
}

export default Visualization
