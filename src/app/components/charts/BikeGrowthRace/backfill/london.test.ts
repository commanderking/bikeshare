import { describe, it, expect } from 'vitest'
import { aggregateLondonDaily } from './london'

describe('aggregateLondonDaily', () => {
  it('sums daily rows into one chronological row per calendar month', () => {
    const rows = aggregateLondonDaily([
      { date: '7/30/10', trips: 6897 },
      { date: '7/31/10', trips: 5564 },
      { date: '8/1/10', trips: 4303 },
      { date: '8/2/10', trips: 6642 },
    ])
    expect(rows).toEqual([
      { year: 2010, month: 7, trips: 6897 + 5564 },
      { year: 2010, month: 8, trips: 4303 + 6642 },
    ])
  })

  it('parses two-digit years as 20xx', () => {
    const [row] = aggregateLondonDaily([{ date: '1/5/10', trips: 1 }])
    expect(row.year).toBe(2010)
  })

  it('orders months chronologically regardless of input order', () => {
    const rows = aggregateLondonDaily([
      { date: '9/1/10', trips: 10 },
      { date: '8/1/10', trips: 20 },
    ])
    expect(rows.map((row) => row.month)).toEqual([8, 9])
  })
})
