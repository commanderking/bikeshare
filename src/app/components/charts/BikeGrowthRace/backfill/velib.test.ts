import { describe, it, expect } from 'vitest'
import { parseVelibAnnual, expandVelibAnnual } from './velib'

describe('parseVelibAnnual', () => {
  it('reads year + trips off the front, ignoring quoted comma-laden columns', () => {
    const csv = [
      'year,trips,trips_accuracy,trips_notes,sources',
      '2007,11800000,"estimated, Jul-Dec","note, with, commas","src, with, commas"',
      '2008,28700000,"estimated","another, note","another, src"',
      '', // trailing blank line
    ].join('\n')
    expect(parseVelibAnnual(csv)).toEqual([
      { year: 2007, trips: 11800000 },
      { year: 2008, trips: 28700000 },
    ])
  })
})

describe('expandVelibAnnual', () => {
  it('spreads the 2007 launch total across Jul–Dec only', () => {
    const rows = expandVelibAnnual([{ year: 2007, trips: 11_800_000 }])
    expect(rows.map((row) => row.month)).toEqual([7, 8, 9, 10, 11, 12])
    expect(rows[0].trips).toBe(Math.round(11_800_000 / 6))
  })

  it('spreads a full year evenly across all 12 months', () => {
    const rows = expandVelibAnnual([{ year: 2008, trips: 28_700_000 }])
    expect(rows).toHaveLength(12)
    expect(rows[0]).toEqual({ year: 2008, month: 1, trips: Math.round(28_700_000 / 12) })
    expect(rows[11].month).toBe(12)
  })
})
