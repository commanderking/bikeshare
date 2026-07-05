// Pure pose math: given a crank angle (legs) or a raise/wave phase (arm),
// return the SVG coordinates of each joint. No React, no DOM — unit-testable.

import {
  BOTTOM_BRACKET,
  HIP,
  CRANK_LEN,
  THIGH_LEN,
  SHIN_LEN,
  ANKLE_LIFT,
  SHOULDER,
  UPPER_ARM_LEN,
  FOREARM_LEN,
  REST_UPPER_ARM_ANGLE,
  WAVE_UPPER_ARM_ANGLE,
  REST_BEND,
  BEND_MID,
  BEND_AMP,
  INIT_CRANK_ANGLE,
  lerp,
} from './geometry'

/** Two-bone IK for the legs: solve the knee so thigh+shin reach the pedal. */
export function knee(px: number, py: number): [number, number] {
  const dx = px - HIP.x
  const dy = py - HIP.y
  const dist = Math.sqrt(dx * dx + dy * dy)
  const d = Math.min(dist, THIGH_LEN + SHIN_LEN - 0.3)
  const fx = dist > 0 ? (dx * d) / dist : 0
  const fy = dist > 0 ? (dy * d) / dist : 0
  const cosA =
    (THIGH_LEN * THIGH_LEN + d * d - SHIN_LEN * SHIN_LEN) /
    (2 * THIGH_LEN * Math.max(d, 1))
  const a = Math.acos(Math.max(-1, Math.min(1, cosA)))
  const la = Math.atan2(fy, fx)
  return [HIP.x + THIGH_LEN * Math.cos(la - a), HIP.y + THIGH_LEN * Math.sin(la - a)]
}

/** The ankle sits a little above the pedal, since no foot is drawn. */
export function ankleAbove(pedal: { x: number; y: number }) {
  return { x: pedal.x, y: pedal.y - ANKLE_LIFT }
}

/** Near and far pedal positions for a given crank angle. */
export function pedals(ang: number) {
  const s = Math.sin(ang)
  const c = Math.cos(ang)
  return {
    nearPedal: { x: BOTTOM_BRACKET.x + CRANK_LEN * s, y: BOTTOM_BRACKET.y - CRANK_LEN * c },
    farPedal: { x: BOTTOM_BRACKET.x - CRANK_LEN * s, y: BOTTOM_BRACKET.y + CRANK_LEN * c },
  }
}

/**
 * Forward-kinematics arm pose.
 * @param raise 0 = riding (hand on bar), 1 = fully raised
 * @param wavePhase oscillation phase (radians); amplitude scales with `raise`
 */
export function armPose(raise: number, wavePhase: number) {
  const upperArmAngle = lerp(REST_UPPER_ARM_ANGLE, WAVE_UPPER_ARM_ANGLE, raise)
  // Bend the forearm off the upper arm: sweeps BEND_MIN..BEND_MAX while waving.
  const waveBend = -(BEND_MID + BEND_AMP * Math.sin(wavePhase))
  const bend = lerp(REST_BEND, waveBend, raise)
  const forearmAngle = upperArmAngle + bend
  const elbowX = SHOULDER.x + UPPER_ARM_LEN * Math.cos(upperArmAngle)
  const elbowY = SHOULDER.y + UPPER_ARM_LEN * Math.sin(upperArmAngle)
  const handX = elbowX + FOREARM_LEN * Math.cos(forearmAngle)
  const handY = elbowY + FOREARM_LEN * Math.sin(forearmAngle)
  return { elbowX, elbowY, handX, handY }
}

// Rest pose for the initial render, so the animated parts don't flash at the
// origin (top-left) before the first animation frame sets their coordinates.
export const INIT = (() => {
  const { nearPedal, farPedal } = pedals(INIT_CRANK_ANGLE)
  const nearAnkle = ankleAbove(nearPedal)
  const farAnkle = ankleAbove(farPedal)
  const [nearKneeX, nearKneeY] = knee(nearAnkle.x, nearAnkle.y)
  const [farKneeX, farKneeY] = knee(farAnkle.x, farAnkle.y)
  return {
    nearPedal,
    farPedal,
    nearAnkle,
    farAnkle,
    nearKnee: { x: nearKneeX, y: nearKneeY },
    farKnee: { x: farKneeX, y: farKneeY },
    arm: armPose(0, 0),
  }
})()
