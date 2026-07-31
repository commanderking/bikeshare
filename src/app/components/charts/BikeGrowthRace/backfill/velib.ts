import { VolumeByMonth } from '@/app/utils/fetchAllTimeTrips'

const URL = '/data/velib_annual_trips_2007_2026.csv'

// Paris (Vélib', launched 15 Jul 2007) has no monthly trip feed at all — its
// entire series is this CSV of annual totals, so it enters the race as a
// 'whole_city' backfill rather than augmenting CDN data. Vélib' runs year-round,
// so each annual total is spread evenly across its months; the 2007 launch total
// covers only Jul–Dec, so it spreads across those six months.
const LAUNCH_YEAR = 2007
const LAUNCH_START_MONTH = 7 // July

type AnnualRow = { year: number; trips: number }

// The CSV's later columns (trips_notes, sources) are quoted and full of commas,
// but year and trips are the first two unquoted integers on every data line — so
// read them straight off the front. The header ("year,trips,…") fails the match
// and is skipped, as is any blank trailing line.
export const parseVelibAnnual = (csv: string): AnnualRow[] => {
  const rows: AnnualRow[] = []
  for (const line of csv.split('\n')) {
    const match = line.match(/^(\d+),(\d+)/)
    if (match) rows.push({ year: Number(match[1]), trips: Number(match[2]) })
  }
  return rows
}

// Spreads each annual total evenly across its active months (all 12, or Jul–Dec
// in the 2007 launch year).
export const expandVelibAnnual = (annual: AnnualRow[]): VolumeByMonth[] => {
  const rows: VolumeByMonth[] = []
  for (const { year, trips } of annual) {
    const startMonth = year === LAUNCH_YEAR ? LAUNCH_START_MONTH : 1
    const monthsActive = 12 - startMonth + 1
    const perMonth = Math.round(trips / monthsActive)
    for (let month = startMonth; month <= 12; month++) {
      rows.push({ year, month, trips: perMonth })
    }
  }
  return rows
}

// Loads Paris's Vélib' annual CSV and expands it to monthly rows.
export const loadVelib = async (): Promise<VolumeByMonth[]> => {
  const csv = await fetch(URL).then((response) => response.text())
  return expandVelibAnnual(parseVelibAnnual(csv))
}
