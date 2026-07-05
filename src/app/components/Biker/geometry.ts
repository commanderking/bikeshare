// All fixed rig dimensions and the scalars derived from them. Pure numbers and
// math helpers only — no React, no DOM. The whole biker is drawn in a
// 200 x 112 SVG user-space coordinate system (y increases downward).

// --- Fixed rig geometry ---
export const BOTTOM_BRACKET = { x: 92, y: 87 } // crank axis, level with the wheel centers
export const HIP = { x: 86, y: 47 }
export const CRANK_LEN = 8 // crank arm length
export const THIGH_LEN = 23.5 // lengthened so the leg still reaches the lower pedal
export const SHIN_LEN = 22.5
export const ANKLE_LIFT = 3.2 // shin ends this far above the pedal center, so its rounded end just meets the pedal's top
export const GEAR_RATIO = 2.4 // wheel rotations per crank rotation — locks wheel & pedal speed
export const INIT_CRANK_ANGLE = 0.4 // starting crank angle
export const DEFAULT_SPEED = 0.032 // base crank angular velocity (radians/frame)

export const DEG_PER_RAD = 180 / Math.PI
export const RAD_PER_DEG = Math.PI / 180

// --- Arm kinematics, derived from the original static pose so that the
// resting arm (raise = 0) is pixel-identical to the hand-on-bar drawing. ---
export const SHOULDER = { x: 101, y: 20 }
const REST_ELBOW = { x: 104, y: 34 }
const REST_HAND = { x: 118, y: 44.5 }
export const UPPER_ARM_LEN = Math.hypot(
  REST_ELBOW.x - SHOULDER.x,
  REST_ELBOW.y - SHOULDER.y
)
export const FOREARM_LEN = Math.hypot(
  REST_HAND.x - REST_ELBOW.x,
  REST_HAND.y - REST_ELBOW.y
)
export const REST_UPPER_ARM_ANGLE = Math.atan2(
  REST_ELBOW.y - SHOULDER.y,
  REST_ELBOW.x - SHOULDER.x
)
export const REST_FOREARM_ANGLE = Math.atan2(
  REST_HAND.y - REST_ELBOW.y,
  REST_HAND.x - REST_ELBOW.x
)

// Torso axis (hip -> shoulder), used to bound how high the upper arm may raise.
const TORSO_HIP = { x: 86, y: 47 }
const TORSO_SHOULDER = { x: 100, y: 19 }
const TORSO_ANGLE = Math.atan2(
  TORSO_SHOULDER.y - TORSO_HIP.y,
  TORSO_SHOULDER.x - TORSO_HIP.x
)
// Raised "wave" target: the upper arm rises to at most perpendicular with the
// torso (never beyond).
export const WAVE_UPPER_ARM_ANGLE = TORSO_ANGLE + Math.PI / 2

// Forearm swing expressed as the elbow bend RELATIVE to the upper arm. During
// the wave it oscillates between these limits; negative because it folds upward
// in SVG's y-down space. Rest keeps its original absolute pose.
export const REST_BEND = REST_FOREARM_ANGLE - REST_UPPER_ARM_ANGLE
const BEND_MIN = 75 * RAD_PER_DEG
const BEND_MAX = 105 * RAD_PER_DEG
export const BEND_MID = (BEND_MIN + BEND_MAX) / 2
export const BEND_AMP = (BEND_MAX - BEND_MIN) / 2
export const WAVE_FREQ = 1.4 // waves per second

// --- Hand-wave timing (ms) ---
export const FIRST_WAVE_MS = 250 // greet with one wave shortly after mount
export const RAISE_MS = 400
export const WAVE_MS = 1000 / WAVE_FREQ // one full back-and-forth wave
export const LOWER_MS = 500

// --- Speed bursts (occasional sprints) ---
export const BURST_MULTIPLIER = 3 // a sprint runs at this multiple of the base speed
export const BURST_GAP_MS: [number, number] = [5000, 10000] // idle time between sprints
export const BURST_DURATION_MS: [number, number] = [2000, 3000] // how long a sprint lasts
export const BURST_RAMP_MS = 500 // ease in/out when entering/leaving a sprint

// --- Generic math helpers ---
export const smoothstep = (t: number) => t * t * (3 - 2 * t)
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
