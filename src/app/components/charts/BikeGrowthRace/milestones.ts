import { RaceCity, valueAt } from './buildRaceTimeline'

// The largest cumulative value across all cities at clock time t — the leader,
// whoever it currently is. Milestones are measured against this.
export const leaderValueAt = (cities: RaceCity[], t: number): number => {
  let max = 0
  for (const c of cities) {
    const v = valueAt(c, t)
    if (v !== undefined && v > max) max = v
  }
  return max
}

// The (fractional) clock time at which the leader first reaches each milestone.
// One forward pass over the month axis, interpolating within the crossing month.
// Milestones never reached (e.g. a finish goal set above the all-time max) get
// Infinity. Times are ascending, matching the ascending milestones.
export const computeMilestoneTimes = (
  cities: RaceCity[],
  milestones: number[],
  maxT: number
): number[] => {
  const times = new Array(milestones.length).fill(Infinity)
  let mi = 0
  let prevLeader = 0
  for (let i = 0; i <= maxT && mi < milestones.length; i++) {
    const leader = leaderValueAt(cities, i)
    while (mi < milestones.length && leader >= milestones[mi]) {
      const M = milestones[mi]
      const frac = leader > prevLeader ? (M - prevLeader) / (leader - prevLeader) : 0
      times[mi] = i > 0 ? i - 1 + Math.min(Math.max(frac, 0), 1) : 0
      mi++
    }
    prevLeader = leader
  }
  return times
}

// Index of the active goal at time t: the number of milestones already reached,
// clamped to the last one (so the final segment races toward the finish goal).
export const goalIndexAt = (
  t: number,
  milestoneTimes: number[]
): number => {
  let reached = 0
  for (const mt of milestoneTimes) if (t >= mt) reached++
  return Math.min(reached, milestoneTimes.length - 1)
}

// The smallest milestone whose crossing time falls in (prev, t], or -1. Used
// during playback to catch the moment the leader hits the next line so the clock
// can hold. The half-open interval means a held/frozen frame (prev === t) never
// re-triggers, and a seek (which resets prev to t) never triggers.
export const firstCrossing = (
  prev: number,
  t: number,
  milestoneTimes: number[]
): number => {
  for (let k = 0; k < milestoneTimes.length; k++) {
    const mt = milestoneTimes[k]
    if (mt > prev && mt <= t) return k
  }
  return -1
}
