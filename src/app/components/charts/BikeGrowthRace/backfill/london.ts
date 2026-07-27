import { VolumeByMonth } from '@/app/utils/fetchAllTimeTrips'

const URL = '/data/london_santander_backfill.json'

// London (Barclays Cycle Hire, launched 30 Jul 2010) is the one system reported
// daily rather than monthly, and the CDN feed only begins Jan 2012 — hence a
// bespoke daily aggregator, fed in as a backward 'fill'.

type DailyRow = { date: string; trips: number } // date is "M/D/YY"

export const aggregateLondonDaily = (daily: DailyRow[]): VolumeByMonth[] => {
  const byMonth = new Map<string, VolumeByMonth>()
  for (const { date, trips } of daily) {
    const [month, , shortYear] = date.split('/').map(Number)
    const year = 2000 + shortYear // "10" → 2010
    const key = `${year}-${month}`
    const existing = byMonth.get(key)
    if (existing) existing.trips += trips
    else byMonth.set(key, { year, month, trips })
  }
  return [...byMonth.values()].sort(
    (a, b) => a.year - b.year || a.month - b.month
  )
}

export const loadLondon = async (): Promise<VolumeByMonth[]> => {
  const daily: DailyRow[] = await fetch(URL).then((response) => response.json())
  return aggregateLondonDaily(daily)
}
