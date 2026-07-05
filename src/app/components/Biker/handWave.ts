// The occasional hand-wave: a self-contained, one-off animation the biker plays
// now and then while idle. Pure and framerate-independent — driven by elapsed
// time in ms, no React or DOM. `advanceWave` mutates the state in place each
// frame to avoid per-frame allocations.

import {
  FIRST_WAVE_MS,
  RAISE_MS,
  WAVE_MS,
  LOWER_MS,
  WAVE_FREQ,
  smoothstep,
} from './geometry'

export type WavePhase = 'idle' | 'raise' | 'wave' | 'lower'

export interface WaveState {
  phase: WavePhase
  phaseT: number // ms elapsed in the current phase
  raiseAmt: number // 0 = arm on bar, 1 = fully raised
  wavePhase: number // forearm oscillation phase (radians)
  nextWave: number // ms until the next wave while idle
}

type Interval = [number, number]

const randDelay = ([lo, hi]: Interval) => lo + Math.random() * Math.max(0, hi - lo)

const WAVE_STEP = (WAVE_FREQ * 2 * Math.PI) / 1000 // radians of swing per ms

export function createWave(_interval: Interval): WaveState {
  return {
    phase: 'idle',
    phaseT: 0,
    raiseAmt: 0,
    wavePhase: 0,
    // First wave is a fixed greeting shortly after mount; subsequent waves use
    // the random interval (set when each wave finishes, in the 'lower' phase).
    nextWave: FIRST_WAVE_MS,
  }
}

/** Advance the wave by `dt` ms. Mutates `s`. */
export function advanceWave(
  s: WaveState,
  dt: number,
  enabled: boolean,
  interval: Interval
): void {
  if (!enabled && s.phase === 'idle') return
  switch (s.phase) {
    case 'idle':
      s.nextWave -= dt
      if (s.nextWave <= 0) {
        s.phase = 'raise'
        s.phaseT = 0
      }
      break
    case 'raise':
      s.phaseT += dt
      s.raiseAmt = smoothstep(Math.min(s.phaseT / RAISE_MS, 1))
      if (s.phaseT >= RAISE_MS) {
        s.phase = 'wave'
        s.phaseT = 0
      }
      break
    case 'wave':
      s.phaseT += dt
      s.raiseAmt = 1
      s.wavePhase += dt * WAVE_STEP
      if (s.phaseT >= WAVE_MS) {
        s.phase = 'lower'
        s.phaseT = 0
      }
      break
    case 'lower':
      s.phaseT += dt
      s.raiseAmt = smoothstep(1 - Math.min(s.phaseT / LOWER_MS, 1))
      s.wavePhase += dt * WAVE_STEP // keep swinging as it fades
      if (s.phaseT >= LOWER_MS) {
        s.phase = 'idle'
        s.phaseT = 0
        s.raiseAmt = 0
        s.wavePhase = 0
        s.nextWave = randDelay(interval)
      }
      break
  }
}
