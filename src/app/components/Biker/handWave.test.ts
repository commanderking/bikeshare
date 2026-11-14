import { describe, expect, it } from 'vitest'
import {
  advanceWave,
  createWave,
  DEFAULT_WAVE_MS,
  getWaveTiming,
  triggerWave,
} from './handWave'
import { LOWER_MS, RAISE_MS, WAVE_FREQ, WAVE_MS } from './geometry'

const INTERVAL: [number, number] = [5000, 10000]

// Run a triggered wave to completion, sampling as the rAF loop does.
const playWave = (totalMs: number) => {
  const state = createWave(INTERVAL)
  const timing = getWaveTiming(totalMs)
  triggerWave(state)
  let elapsed = 0
  let peakRaise = 0
  // `false` for enabled: a triggered wave must finish even with idle waving off,
  // which is how the race uses it.
  while (state.phase !== 'idle' && elapsed < totalMs * 3) {
    advanceWave(state, 16, false, INTERVAL, timing)
    peakRaise = Math.max(peakRaise, state.raiseAmt)
    elapsed += 16
  }
  return { state, elapsed, peakRaise }
}

describe('getWaveTiming', () => {
  it('reproduces the original pace at the default length', () => {
    const timing = getWaveTiming(DEFAULT_WAVE_MS)
    expect(timing.raiseMs).toBeCloseTo(RAISE_MS, 6)
    expect(timing.waveMs).toBeCloseTo(WAVE_MS, 6)
    expect(timing.lowerMs).toBeCloseTo(LOWER_MS, 6)
    // The original swing rate was WAVE_FREQ cycles per second.
    expect(timing.stepPerMs).toBeCloseTo((WAVE_FREQ * 2 * Math.PI) / 1000, 9)
  })

  it('scales the phases to any total', () => {
    const timing = getWaveTiming(1000)
    expect(timing.raiseMs + timing.waveMs + timing.lowerMs).toBeCloseTo(1000, 6)
  })

  it('keeps the swing a whole cycle so the arm never stops mid-gesture', () => {
    const timing = getWaveTiming(1000)
    expect(timing.stepPerMs * timing.waveMs).toBeCloseTo(2 * Math.PI, 9)
  })
})

describe('triggerWave', () => {
  it('starts a wave from idle', () => {
    const state = createWave(INTERVAL)
    triggerWave(state)
    expect(state.phase).toBe('raise')
  })

  it('is ignored while one is already playing, so bursts cannot restart the arm', () => {
    const state = createWave(INTERVAL)
    triggerWave(state)
    advanceWave(state, 300, false, INTERVAL, getWaveTiming(1000))
    const { phaseT } = state
    triggerWave(state)
    expect(state.phaseT).toBe(phaseT)
  })
})

describe('a one-second wave', () => {
  it('raises, swings and lowers within its billed length', () => {
    const { state, elapsed, peakRaise } = playWave(1000)
    expect(state.phase).toBe('idle')
    expect(peakRaise).toBe(1) // the arm actually gets all the way up
    expect(state.raiseAmt).toBe(0) // and all the way back down
    // One frame of slop: phases only end on a sampled step.
    expect(elapsed).toBeGreaterThanOrEqual(1000)
    expect(elapsed).toBeLessThanOrEqual(1000 + 16 * 3)
  })
})
