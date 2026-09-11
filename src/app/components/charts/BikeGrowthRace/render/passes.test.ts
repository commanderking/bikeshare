import { describe, expect, it } from 'vitest'
import { getPassers } from './passes'

describe('getPassers', () => {
  it('finds nobody when the order holds', () => {
    expect(getPassers(['a', 'b', 'c'], ['a', 'b', 'c'])).toEqual([])
  })

  it('names the city that moved up, not the one it went by', () => {
    expect(getPassers(['a', 'b', 'c'], ['b', 'a', 'c'])).toEqual(['b'])
  })

  it('names a city once however many places it gained', () => {
    expect(getPassers(['a', 'b', 'c'], ['c', 'a', 'b'])).toEqual(['c'])
  })

  // A city dropping out of the top-10 is replaced from below; the newcomer did not
  // overtake anyone on screen, so this must stay silent.
  it('ignores a city entering or leaving the field', () => {
    expect(getPassers(['a', 'b', 'c'], ['a', 'b', 'd'])).toEqual([])
  })

  it('still catches an overtake alongside a substitution', () => {
    expect(getPassers(['a', 'b', 'c'], ['b', 'a', 'd'])).toEqual(['b'])
  })

  it('names every city that gained in a multi-way shuffle', () => {
    expect(getPassers(['a', 'b', 'c', 'd'], ['b', 'a', 'd', 'c'])).toEqual([
      'b',
      'd',
    ])
  })

  it('handles an empty previous order (first frame)', () => {
    expect(getPassers([], ['a', 'b'])).toEqual([])
  })
})
