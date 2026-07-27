import { describe, it, expect } from 'vitest'
import { smoothstep } from '@/app/components/Biker/geometry'
import { computeAxisState } from './axisState'
import { AXIS_FADE_MS, EASE_MS, formatAxis, REACHED_MS } from '../constants'

// Two months on the 10M scale, two on the 50M scale — only the steady
// (no-transition) case reads these.
const axisMaxByMonthIndex = [10_000_000, 10_000_000, 50_000_000, 50_000_000]

describe('computeAxisState', () => {
  it('sits at the filling month’s max with no traveler when not transitioning', () => {
    const state = computeAxisState(2.5, null, axisMaxByMonthIndex)
    expect(state.axisValue).toBe(50_000_000)
    expect(state.tickScale).toBe(50_000_000)
    expect(state.tickOpacity(3)).toBe(1)
    expect(state.travelerOpacity).toBe(0)
  })

  it('follows the month currently filling (floor + 1), so it adopts the new', () => {
    // Index 1 is the finished year’s December (10M); filling index 2 (50M) means
    // resuming past the pause reads the new scale, not a snap back to the old one.
    expect(computeAxisState(0.5, null, axisMaxByMonthIndex).axisValue).toBe(10_000_000)
    expect(computeAxisState(1.2, null, axisMaxByMonthIndex).axisValue).toBe(50_000_000)
  })

  const from = 10_000_000
  const to = 50_000_000
  const transition = { fromMax: from, toMax: to, startMs: 0 }

  it('holds at the old scale during the REACHED beat', () => {
    const state = computeAxisState(0, transition, axisMaxByMonthIndex, REACHED_MS * 0.5)
    expect(state.axisValue).toBe(from) // still the old scale
    expect(state.tickScale).toBe(from)
    expect(state.travelerOpacity).toBe(0)
  })

  it('eases the axis open and shows the traveler during the EASE beat', () => {
    const now = REACHED_MS + EASE_MS * 0.5 // progress = 0.5
    const state = computeAxisState(0, transition, axisMaxByMonthIndex, now)
    expect(state.axisValue).toBeCloseTo(from + (to - from) * smoothstep(0.5))
    expect(state.travelerOpacity).toBe(1)
    expect(state.travelerLabel).toBe(formatAxis(from))
    expect(state.tickOpacity(0)).toBe(1) // origin tick stays solid
    expect(state.tickOpacity(5)).toBeCloseTo(0.5) // 1 − progress
  })

  it('settles on the new scale with the traveler fading during the HOLD beat', () => {
    const now = REACHED_MS + EASE_MS + AXIS_FADE_MS * 0.5 // fadeIn = 0.5
    const state = computeAxisState(0, transition, axisMaxByMonthIndex, now)
    expect(state.axisValue).toBe(to) // fully on the new scale
    expect(state.tickScale).toBe(to)
    expect(state.travelerOpacity).toBeCloseTo(0.5) // 1 − fadeIn
    expect(state.tickOpacity(3)).toBeCloseTo(0.5) // fadeIn
    expect(state.tickOpacity(0)).toBe(1)
  })
})
