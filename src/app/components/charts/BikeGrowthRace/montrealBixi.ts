import { VolumeByMonth } from '@/app/utils/fetchAllTimeTrips'

const URL = '/data/montreal_bixi_backfill.json'

// BIXI operates a seasonal service (~April–November; winters are closed, matching
// the real monthly data). Spread each year's official annual total evenly across
// its operating months only, leaving winter at zero.
const SEASON_END = 11 // November
const DEFAULT_SEASON_START = 4 // April
// BIXI launched in May 2009, so its first season is shorter.
const LAUNCH_YEAR = 2009
const LAUNCH_SEASON_START = 5 // May

// A row of the backfill file (extra columns like sources/trips_notes are ignored).
type AnnualRow = { year: number; trips: number }

export const expandMontrealBixi = (annual: AnnualRow[]): VolumeByMonth[] => {
  const rows: VolumeByMonth[] = []
  for (const { year, trips } of annual) {
    const start = year === LAUNCH_YEAR ? LAUNCH_SEASON_START : DEFAULT_SEASON_START
    const monthsInSeason = SEASON_END - start + 1
    const perMonth = Math.round(trips / monthsInSeason)
    for (let m = start; m <= SEASON_END; m++) {
      rows.push({ year, month: m, trips: perMonth })
    }
  }
  return rows
}

// Loads Montreal's BIXI backfill (2009–2013) and expands it to monthly rows.
export const loadMontrealBixi = async (): Promise<VolumeByMonth[]> => {
  const annual: AnnualRow[] = await fetch(URL).then((r) => r.json())
  return expandMontrealBixi(annual)
}
