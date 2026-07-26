import { RaceCity, getValueAt } from './buildRaceTimeline'

// The largest cumulative value across all cities at a given clock `time` — the
// leader, whoever it currently is. Milestones are measured against this.
export const leaderValueAt = (cities: RaceCity[], time: number): number => {
  let max = 0
  for (const city of cities) {
    const value = getValueAt(city, time)
    if (value !== undefined && value > max) max = value
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
  let milestoneIndex = 0
  let prevLeader = 0
  for (
    let monthIndex = 0;
    monthIndex <= maxT && milestoneIndex < milestones.length;
    monthIndex++
  ) {
    const leader = leaderValueAt(cities, monthIndex)
    while (milestoneIndex < milestones.length && leader >= milestones[milestoneIndex]) {
      const milestone = milestones[milestoneIndex]
      const frac =
        leader > prevLeader ? (milestone - prevLeader) / (leader - prevLeader) : 0
      times[milestoneIndex] =
        monthIndex > 0 ? monthIndex - 1 + Math.min(Math.max(frac, 0), 1) : 0
      milestoneIndex++
    }
    prevLeader = leader
  }
  return times
}

// Index of the active goal at a given `time`: the number of milestones already
// reached, clamped to the last one (so the final segment races toward the finish).
export const goalIndexAt = (time: number, milestoneTimes: number[]): number => {
  let reached = 0
  for (const milestoneTime of milestoneTimes) if (time >= milestoneTime) reached++
  return Math.min(reached, milestoneTimes.length - 1)
}

// The smallest milestone whose crossing time falls in (prev, time], or -1. Used
// during playback to catch the moment the leader hits the next line so the clock
// can hold. The half-open interval means a held/frozen frame (prev === time)
// never re-triggers, and a seek (which resets prev to time) never triggers.
export const firstCrossing = (
  prev: number,
  time: number,
  milestoneTimes: number[]
): number => {
  for (let milestoneIndex = 0; milestoneIndex < milestoneTimes.length; milestoneIndex++) {
    const milestoneTime = milestoneTimes[milestoneIndex]
    if (milestoneTime > prev && milestoneTime <= time) return milestoneIndex
  }
  return -1
}
