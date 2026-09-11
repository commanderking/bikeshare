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

const randDelay = ([lo, hi]: Interval) =>
  lo + Math.random() * Math.max(0, hi - lo)

/** How long one wave takes end to end, and how fast the forearm swings within it. */
export interface WaveTiming {
  raiseMs: number
  waveMs: number
  lowerMs: number
  /** Radians of forearm swing per ms. */
  stepPerMs: number
}

// The wave's natural length: raise, one full swing, and back down.
export const DEFAULT_WAVE_MS = RAISE_MS + WAVE_MS + LOWER_MS

/**
 * Scale the wave to `totalMs`, holding the raise/swing/lower proportions. The swing
 * rate is refitted so `waveMs` is exactly one whole cycle — otherwise a shortened
 * wave stops mid-swing and reads as the arm being dropped rather than lowered.
 * `getWaveTiming(DEFAULT_WAVE_MS)` reproduces WAVE_FREQ's original pace.
 */
export const getWaveTiming = (totalMs: number): WaveTiming => {
  const scale = totalMs / DEFAULT_WAVE_MS
  const waveMs = WAVE_MS * scale
  return {
    raiseMs: RAISE_MS * scale,
    waveMs,
    lowerMs: LOWER_MS * scale,
    stepPerMs: (2 * Math.PI) / waveMs,
  }
}

/**
 * Start a wave now, bypassing the idle countdown. Ignored if one is already
 * playing, so a burst of triggers cannot restart the arm mid-gesture.
 */
export function triggerWave(s: WaveState): void {
  if (s.phase !== 'idle') return
  s.phase = 'raise'
  s.phaseT = 0
}

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
  interval: Interval,
  timing: WaveTiming
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
      s.raiseAmt = smoothstep(Math.min(s.phaseT / timing.raiseMs, 1))
      if (s.phaseT >= timing.raiseMs) {
        s.phase = 'wave'
        s.phaseT = 0
      }
      break
    case 'wave':
      s.phaseT += dt
      s.raiseAmt = 1
      s.wavePhase += dt * timing.stepPerMs
      if (s.phaseT >= timing.waveMs) {
        s.phase = 'lower'
        s.phaseT = 0
      }
      break
    case 'lower':
      s.phaseT += dt
      s.raiseAmt = smoothstep(1 - Math.min(s.phaseT / timing.lowerMs, 1))
      s.wavePhase += dt * timing.stepPerMs // keep swinging as it fades
      if (s.phaseT >= timing.lowerMs) {
        s.phase = 'idle'
        s.phaseT = 0
        s.raiseAmt = 0
        s.wavePhase = 0
        s.nextWave = randDelay(interval)
      }
      break
  }
}
