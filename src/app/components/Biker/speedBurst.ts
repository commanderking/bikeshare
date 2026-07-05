// Occasional sprints: every few seconds the biker pedals hard for a couple of
// seconds, then eases back to its base speed. Pure and framerate-independent —
// driven by elapsed time in ms, no React or DOM. `advanceSpeedBurst` mutates
// the state in place each frame.

import { BURST_GAP_MS, BURST_DURATION_MS } from './geometry'

type Interval = [number, number]

export interface SpeedBurstState {
  active: boolean // true while sprinting
  remaining: number // ms left in the current phase (sprint or idle)
}

const randRange = ([lo, hi]: Interval) => lo + Math.random() * Math.max(0, hi - lo)

export function createSpeedBurst(): SpeedBurstState {
  return { active: false, remaining: randRange(BURST_GAP_MS) }
}

/** Advance the sprint scheduler by `dt` ms. Mutates `s`. */
export function advanceSpeedBurst(
  s: SpeedBurstState,
  dt: number,
  enabled: boolean
): void {
  // Let an in-progress sprint finish, but don't start new ones while disabled.
  if (!enabled && !s.active) return
  s.remaining -= dt
  if (s.remaining <= 0) {
    s.active = !s.active
    s.remaining = randRange(s.active ? BURST_DURATION_MS : BURST_GAP_MS)
  }
}
