import { describe, it, expect } from 'vitest'
import { smoothstep } from '@/app/components/Biker/geometry'
import { computeAxisState } from './axisState'
import {
  AXIS_FADE_MS,
  EASE_MS,
  formatAxis,
  MILESTONES,
  REACHED_MS,
} from '../constants'

// One tick time per milestone; only the steady (no-transition) case reads these.
const milestoneTimes = MILESTONES.map((_, index) => index * 10)

describe('computeAxisState', () => {
  it('sits at the current goal with no traveler when not transitioning', () => {
    // time 15 is past milestoneTimes[0]=0 and [1]=10 → two milestones reached.
    const state = computeAxisState(15, null, milestoneTimes)
    expect(state.axisValue).toBe(MILESTONES[2])
    expect(state.tickScale).toBe(MILESTONES[2])
    expect(state.tickOpacity(3)).toBe(1)
    expect(state.travelerOpacity).toBe(0)
  })

  const transition = { milestoneIndex: 1, startMs: 0 }
  const from = MILESTONES[1]
  const to = MILESTONES[2]

  it('holds at the old scale during the REACHED beat', () => {
    const state = computeAxisState(0, transition, milestoneTimes, REACHED_MS * 0.5)
    expect(state.axisValue).toBe(from) // still the old scale
    expect(state.tickScale).toBe(from)
    expect(state.travelerOpacity).toBe(0)
  })

  it('eases the axis open and shows the traveler during the EASE beat', () => {
    const now = REACHED_MS + EASE_MS * 0.5 // progress = 0.5
    const state = computeAxisState(0, transition, milestoneTimes, now)
    expect(state.axisValue).toBeCloseTo(from + (to - from) * smoothstep(0.5))
    expect(state.travelerOpacity).toBe(1)
    expect(state.travelerLabel).toBe(formatAxis(from))
    expect(state.tickOpacity(0)).toBe(1) // origin tick stays solid
    expect(state.tickOpacity(5)).toBeCloseTo(0.5) // 1 − progress
  })

  it('settles on the new scale with the traveler fading during the HOLD beat', () => {
    const now = REACHED_MS + EASE_MS + AXIS_FADE_MS * 0.5 // fadeIn = 0.5
    const state = computeAxisState(0, transition, milestoneTimes, now)
    expect(state.axisValue).toBe(to) // fully on the new scale
    expect(state.tickScale).toBe(to)
    expect(state.travelerOpacity).toBeCloseTo(0.5) // 1 − fadeIn
    expect(state.tickOpacity(3)).toBeCloseTo(0.5) // fadeIn
    expect(state.tickOpacity(0)).toBe(1)
  })
})
