import { VolumeByMonth } from '@/app/utils/fetchAllTimeTrips'

// Official YouBike 1.0 source figures, served as static assets. Only the raw
// numbers are stored; every monthly figure below is derived from them here.
const ANNUAL_URL = '/data/taipei_youbike_1.0.json'
const MONTHLY_2021_URL = '/data/taipei_youbike_1.0_2021_monthly.json'

// A row of the annual file (extra columns like stations/bikes are ignored).
type AnnualRow = { year: number; trips: number }
// A row of the 2021 monthly file.
type MonthlyRow = { month: number; trips: number }

// Expands the official YouBike 1.0 figures into synthetic monthly rows:
//   - 2012: the single rollout month (December) as-is.
//   - 2013–2020: the annual total spread evenly across all 12 months.
//   - 2021: reported monthly trips where available (Apr–Dec); Jan–Mar are the
//     average of the remainder (annual − reported), split three ways.
export const expandYouBike1 = (
  annual: AnnualRow[],
  monthly2021: MonthlyRow[]
): VolumeByMonth[] => {
  const rows: VolumeByMonth[] = []
  const annualByYear = new Map(annual.map((r) => [r.year, r.trips]))

  for (const { year, trips } of annual) {
    if (year === 2012) {
      rows.push({ year, month: 12, trips }) // rollout: December only
    } else if (year === 2021) {
      // Handled below from the monthly file.
    } else {
      const perMonth = Math.round(trips / 12)
      for (let m = 1; m <= 12; m++) rows.push({ year, month: m, trips: perMonth })
    }
  }

  // 2021: keep reported months exactly; spread the rest across the missing ones.
  const reported = monthly2021.reduce((sum, r) => sum + r.trips, 0)
  const annual2021 = annualByYear.get(2021) ?? reported
  const present = new Set(monthly2021.map((r) => r.month))
  const missing = [1, 2, 3].filter((m) => !present.has(m))
  const perMissing =
    missing.length > 0 ? Math.max(0, Math.round((annual2021 - reported) / missing.length)) : 0
  for (const m of missing) rows.push({ year: 2021, month: m, trips: perMissing })
  for (const { month, trips } of monthly2021) rows.push({ year: 2021, month, trips })

  return rows
}

// Loads the two YouBike 1.0 source files and expands them to monthly rows.
export const loadYouBike1 = async (): Promise<VolumeByMonth[]> => {
  const [annual, monthly2021]: [AnnualRow[], MonthlyRow[]] = await Promise.all([
    fetch(ANNUAL_URL).then((r) => r.json()),
    fetch(MONTHLY_2021_URL).then((r) => r.json()),
  ])
  return expandYouBike1(annual, monthly2021)
}
