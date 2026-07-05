'use client'

import React, { useEffect, useRef } from 'react'

export interface BikerColors {
  frame: string
  frameDark: string
  saddle: string
  shirt: string
  shirtBack: string
  pants: string
  pantsBack: string
  shoe: string
  skin: string
  wheelRim: string
  spoke: string
  hub: string
  ring: string
  crank: string
  ground: string
}

const DEFAULT_COLORS: BikerColors = {
  frame: '#1f7a8c',
  frameDark: '#175d6b',
  saddle: '#2e2e2e',
  shirt: '#3b6ea5',
  shirtBack: '#2f5985',
  pants: '#eef1f5',
  pantsBack: '#cfd6dc',
  shoe: '#2b2b2b',
  skin: '#caa07a',
  wheelRim: '#777',
  spoke: '#bbb',
  hub: '#666',
  ring: '#999',
  crank: '#888',
  ground: '#ccc',
}

interface BikerProps {
  /** Crank angular velocity in radians per animation frame. Higher = faster pedalling. */
  speed?: number
  /** Freeze the animation on the current pose. */
  paused?: boolean
  /** Show the ground line beneath the wheels. */
  showGround?: boolean
  /** Occasionally play idle gestures such as waving. */
  gestures?: boolean
  /** Random idle delay between gestures, in milliseconds: [min, max]. */
  gestureInterval?: [number, number]
  /** Override any subset of the default colors. */
  colors?: Partial<BikerColors>
  width?: number | string
  height?: number | string
  className?: string
  style?: React.CSSProperties
}

// --- Fixed rig geometry (SVG user units) ---
const BB = { x: 92, y: 80 } // bottom bracket (crank axis)
const HIP = { x: 86, y: 47 }
const CR = 7 // crank arm length
const TH = 22 // thigh length
const SH = 21 // shin length
const GEAR_RATIO = 2.4 // wheel rotations per crank rotation — locks wheel & pedal speed
const DEG = 180 / Math.PI
const RAD = Math.PI / 180

// --- Arm kinematics, derived from the original static pose so that the
// resting arm (raise = 0) is pixel-identical to the hand-on-bar drawing. ---
const SHOULDER = { x: 101, y: 20 }
const REST_ELBOW = { x: 104, y: 34 }
const REST_HAND = { x: 118, y: 44.5 }
const UPPER_LEN = Math.hypot(
  REST_ELBOW.x - SHOULDER.x,
  REST_ELBOW.y - SHOULDER.y
)
const FORE_LEN = Math.hypot(
  REST_HAND.x - REST_ELBOW.x,
  REST_HAND.y - REST_ELBOW.y
)
const REST_UPPER_A = Math.atan2(
  REST_ELBOW.y - SHOULDER.y,
  REST_ELBOW.x - SHOULDER.x
)
const REST_FORE_A = Math.atan2(
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
const WAVE_UPPER_A = TORSO_ANGLE + Math.PI / 2
// Forearm swing expressed as the elbow bend RELATIVE to the upper arm. During
// the wave it oscillates between these limits; negative because it folds upward
// in SVG's y-down space. Rest keeps its original absolute pose.
const REST_BEND = REST_FORE_A - REST_UPPER_A
const BEND_MIN = 75 * RAD
const BEND_MAX = 105 * RAD
const BEND_MID = (BEND_MIN + BEND_MAX) / 2
const BEND_AMP = (BEND_MAX - BEND_MIN) / 2
const WAVE_FREQ = 1.4 // waves per second

// --- Gesture timing (ms) ---
const RAISE_MS = 400
const WAVE_MS = 1000 / WAVE_FREQ // one full back-and-forth wave
const LOWER_MS = 500

const smoothstep = (t: number) => t * t * (3 - 2 * t)
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/** Two-bone IK for the legs: solve the knee so thigh+shin reach the pedal. */
function knee(px: number, py: number): [number, number] {
  const dx = px - HIP.x
  const dy = py - HIP.y
  const dist = Math.sqrt(dx * dx + dy * dy)
  const d = Math.min(dist, TH + SH - 0.3)
  const fx = dist > 0 ? (dx * d) / dist : 0
  const fy = dist > 0 ? (dy * d) / dist : 0
  const cosA = (TH * TH + d * d - SH * SH) / (2 * TH * Math.max(d, 1))
  const a = Math.acos(Math.max(-1, Math.min(1, cosA)))
  const la = Math.atan2(fy, fx)
  return [HIP.x + TH * Math.cos(la - a), HIP.y + TH * Math.sin(la - a)]
}

/**
 * Forward-kinematics arm pose.
 * @param raise 0 = riding (hand on bar), 1 = fully raised
 * @param wavePhase oscillation phase (radians); amplitude scales with `raise`
 */
function armPose(raise: number, wavePhase: number) {
  const upperA = lerp(REST_UPPER_A, WAVE_UPPER_A, raise)
  // Bend the forearm off the upper arm: sweeps BEND_MIN..BEND_MAX while waving.
  const waveBend = -(BEND_MID + BEND_AMP * Math.sin(wavePhase))
  const bend = lerp(REST_BEND, waveBend, raise)
  const foreA = upperA + bend
  const ex = SHOULDER.x + UPPER_LEN * Math.cos(upperA)
  const ey = SHOULDER.y + UPPER_LEN * Math.sin(upperA)
  const hx = ex + FORE_LEN * Math.cos(foreA)
  const hy = ey + FORE_LEN * Math.sin(foreA)
  return { ex, ey, hx, hy }
}

const INIT_ANG = 0.4 // starting crank angle

/** Near (p1) and far (p2) pedal positions for a given crank angle. */
function pedals(ang: number) {
  const s = Math.sin(ang)
  const c = Math.cos(ang)
  return {
    p1: { x: BB.x + CR * s, y: BB.y - CR * c },
    p2: { x: BB.x - CR * s, y: BB.y + CR * c },
  }
}

// Rest pose for the initial render, so the animated parts don't flash at the
// origin (top-left) before the first animation frame sets their coordinates.
const INIT = (() => {
  const { p1, p2 } = pedals(INIT_ANG)
  const [k1x, k1y] = knee(p1.x, p1.y)
  const [k2x, k2y] = knee(p2.x, p2.y)
  return { p1, p2, k1: { x: k1x, y: k1y }, k2: { x: k2x, y: k2y }, arm: armPose(0, 0) }
})()

type GesturePhase = 'idle' | 'raise' | 'wave' | 'lower'

const Biker: React.FC<BikerProps> = ({
  speed = 0.032,
  paused = false,
  showGround = false,
  gestures = true,
  gestureInterval = [5000, 10000],
  colors,
  width = 200,
  height,
  className,
  style,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null)

  // Refs to the parts the animation loop mutates each frame.
  const els = useRef<Record<string, SVGElement | null>>({})
  const reg = (id: string) => (el: SVGElement | null) => {
    els.current[id] = el
  }

  // Keep live prop values readable inside the rAF loop without restarting it.
  const speedRef = useRef(speed)
  const pausedRef = useRef(paused)
  const gesturesRef = useRef(gestures)
  const intervalRef = useRef(gestureInterval)
  useEffect(() => {
    speedRef.current = speed
  }, [speed])
  useEffect(() => {
    pausedRef.current = paused
  }, [paused])
  useEffect(() => {
    gesturesRef.current = gestures
  }, [gestures])
  useEffect(() => {
    intervalRef.current = gestureInterval
  }, [gestureInterval])

  useEffect(() => {
    let raf = 0
    let ang = INIT_ANG
    let wheelDeg = 0
    let lastT = performance.now()

    // Gesture state machine.
    let phase: GesturePhase = 'idle'
    let phaseT = 0 // ms elapsed in the current phase
    let raiseAmt = 0
    let wavePhase = 0
    const randDelay = () => {
      const [lo, hi] = intervalRef.current
      return lo + Math.random() * Math.max(0, hi - lo)
    }
    let nextGesture = randDelay()

    const set = (id: string, attrs: Record<string, number | string>) => {
      const e = els.current[id]
      if (!e) return
      for (const [k, v] of Object.entries(attrs)) {
        e.setAttribute(k, typeof v === 'number' ? v.toFixed(2) : v)
      }
    }

    const advanceGesture = (dt: number) => {
      if (!gesturesRef.current && phase === 'idle') return
      switch (phase) {
        case 'idle':
          nextGesture -= dt
          if (nextGesture <= 0) {
            phase = 'raise'
            phaseT = 0
          }
          break
        case 'raise':
          phaseT += dt
          raiseAmt = smoothstep(Math.min(phaseT / RAISE_MS, 1))
          if (phaseT >= RAISE_MS) {
            phase = 'wave'
            phaseT = 0
          }
          break
        case 'wave':
          phaseT += dt
          raiseAmt = 1
          wavePhase += (dt / 1000) * WAVE_FREQ * 2 * Math.PI
          if (phaseT >= WAVE_MS) {
            phase = 'lower'
            phaseT = 0
          }
          break
        case 'lower':
          phaseT += dt
          raiseAmt = smoothstep(1 - Math.min(phaseT / LOWER_MS, 1))
          wavePhase += (dt / 1000) * WAVE_FREQ * 2 * Math.PI // keep swinging as it fades
          if (phaseT >= LOWER_MS) {
            phase = 'idle'
            phaseT = 0
            raiseAmt = 0
            wavePhase = 0
            nextGesture = randDelay()
          }
          break
      }
    }

    const frame = (now: number) => {
      const dt = now - lastT
      lastT = now
      const spd = speedRef.current

      if (!pausedRef.current) {
        ang += spd
        // Wheel spin derives from the same crank increment, so pedals and
        // wheels can never drift out of sync at any speed.
        wheelDeg = (wheelDeg + spd * GEAR_RATIO * DEG) % 360
        advanceGesture(dt)
      }

      const s = Math.sin(ang)
      const c = Math.cos(ang)
      const p1x = BB.x + CR * s
      const p1y = BB.y - CR * c
      const p2x = BB.x - CR * s
      const p2y = BB.y + CR * c

      const wheel = wheelDeg.toFixed(2)
      set('rearSpokes', { transform: `rotate(${wheel})` })
      set('frontSpokes', { transform: `rotate(${wheel})` })

      set('ck1', { x1: BB.x, y1: BB.y, x2: p1x, y2: p1y })
      set('ck2', { x1: BB.x, y1: BB.y, x2: p2x, y2: p2y })
      set('pd1', { x: p1x - 3, y: p1y - 1.1 })
      set('pd2', { x: p2x - 3, y: p2y - 1.1 })

      const [k1x, k1y] = knee(p1x, p1y)
      set('rt', { x1: HIP.x, y1: HIP.y, x2: k1x, y2: k1y })
      set('rs', { x1: k1x, y1: k1y, x2: p1x, y2: p1y })

      const [k2x, k2y] = knee(p2x, p2y)
      set('lt', { x1: HIP.x, y1: HIP.y, x2: k2x, y2: k2y })
      set('ls', { x1: k2x, y1: k2y, x2: p2x, y2: p2y })

      // Arm: rest pose when raiseAmt is 0, raised/waving otherwise.
      const { ex, ey, hx, hy } = armPose(raiseAmt, wavePhase)
      set('ua', { x1: SHOULDER.x, y1: SHOULDER.y, x2: ex, y2: ey })
      set('fa', { x1: ex, y1: ey, x2: hx, y2: hy })
      set('hand', { cx: hx, cy: hy })

      raf = requestAnimationFrame(frame)
    }

    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [])

  const c = { ...DEFAULT_COLORS, ...colors }

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 200 112"
      width={width}
      height={height}
      className={className}
      style={{ display: 'block', ...style }}
      role="img"
      aria-label="Cyclist riding a bikeshare bicycle"
    >
      {showGround && (
        <line
          x1="10"
          y1="105"
          x2="190"
          y2="105"
          stroke={c.ground}
          strokeWidth="1"
        />
      )}

      {/* REAR WHEEL center (66,87) r=18 */}
      <g transform="translate(66,87)">
        <circle r="18" fill="none" stroke={c.wheelRim} strokeWidth="2.1" />
        <g ref={reg('rearSpokes')} style={{ transformOrigin: '0 0' }}>
          <line
            x1="0"
            y1="-18"
            x2="0"
            y2="18"
            stroke={c.spoke}
            strokeWidth="0.85"
          />
          <line
            x1="-18"
            y1="0"
            x2="18"
            y2="0"
            stroke={c.spoke}
            strokeWidth="0.85"
          />
          <line
            x1="-12.73"
            y1="-12.73"
            x2="12.73"
            y2="12.73"
            stroke={c.spoke}
            strokeWidth="0.85"
          />
          <line
            x1="12.73"
            y1="-12.73"
            x2="-12.73"
            y2="12.73"
            stroke={c.spoke}
            strokeWidth="0.85"
          />
        </g>
        <circle r="2.8" fill={c.hub} />
      </g>

      {/* FRONT WHEEL center (134,87) r=18 */}
      <g transform="translate(134,87)">
        <circle r="18" fill="none" stroke={c.wheelRim} strokeWidth="2.1" />
        <g ref={reg('frontSpokes')} style={{ transformOrigin: '0 0' }}>
          <line
            x1="0"
            y1="-18"
            x2="0"
            y2="18"
            stroke={c.spoke}
            strokeWidth="0.85"
          />
          <line
            x1="-18"
            y1="0"
            x2="18"
            y2="0"
            stroke={c.spoke}
            strokeWidth="0.85"
          />
          <line
            x1="-12.73"
            y1="-12.73"
            x2="12.73"
            y2="12.73"
            stroke={c.spoke}
            strokeWidth="0.85"
          />
          <line
            x1="12.73"
            y1="-12.73"
            x2="-12.73"
            y2="12.73"
            stroke={c.spoke}
            strokeWidth="0.85"
          />
        </g>
        <circle r="2.8" fill={c.hub} />
      </g>

      {/* FAR-SIDE LEG + CRANK — drawn before the frame so the frame overlaps it */}
      <line
        ref={reg('lt')}
        x1={HIP.x}
        y1={HIP.y}
        x2={INIT.k2.x}
        y2={INIT.k2.y}
        stroke={c.pantsBack}
        strokeWidth="4.0"
        strokeLinecap="round"
        opacity="0.65"
      />
      <line
        ref={reg('ls')}
        x1={INIT.k2.x}
        y1={INIT.k2.y}
        x2={INIT.p2.x}
        y2={INIT.p2.y}
        stroke={c.pantsBack}
        strokeWidth="4.0"
        strokeLinecap="round"
        opacity="0.65"
      />
      <line
        ref={reg('ck2')}
        x1={BB.x}
        y1={BB.y}
        x2={INIT.p2.x}
        y2={INIT.p2.y}
        stroke={c.crank}
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.5"
      />
      <rect
        ref={reg('pd2')}
        x={INIT.p2.x - 3}
        y={INIT.p2.y - 1.1}
        width="6"
        height="2.2"
        rx="1"
        fill={c.shoe}
        opacity="0.5"
      />

      {/* MAIN FRAME (simple step-through) */}
      <g fill="none" strokeLinecap="round">
        <line
          x1="66"
          y1="87"
          x2="92"
          y2="80"
          stroke={c.frame}
          strokeWidth="3"
        />
        <line
          x1="92"
          y1="80"
          x2="130"
          y2="58"
          stroke={c.frame}
          strokeWidth="3"
        />
        <line
          x1="92"
          y1="80"
          x2="86"
          y2="50"
          stroke={c.frame}
          strokeWidth="2.6"
        />
        <line
          x1="130"
          y1="58"
          x2="134"
          y2="87"
          stroke={c.frame}
          strokeWidth="2.6"
        />
        <line
          x1="130"
          y1="58"
          x2="122"
          y2="44.5"
          stroke={c.frameDark}
          strokeWidth="2.4"
        />
        <line
          x1="66"
          y1="87"
          x2="86.8"
          y2="59.6"
          stroke={c.frame}
          strokeWidth="2.6"
        />
      </g>

      {/* HANDLEBAR, near seat height */}
      <line
        x1="118"
        y1="44.5"
        x2="122"
        y2="44.5"
        stroke={c.frameDark}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <circle cx="118" cy="44.5" r="1.6" fill={c.frameDark} />

      {/* BASKET BRACKET — backward-L at the head-tube junction, plus diagonal support */}
      <path
        d="M139.3,58 L139.3,46 M139.3,58 L130,58"
        fill="none"
        stroke={c.frameDark}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <line
        x1="130"
        y1="58"
        x2="139.3"
        y2="46"
        stroke={c.crank}
        strokeWidth="1"
        strokeLinecap="round"
      />

      {/* chainring */}
      <circle
        cx="92"
        cy="80"
        r="7"
        fill="none"
        stroke={c.ring}
        strokeWidth="1.4"
      />
      <circle cx="92" cy="80" r="2" fill={c.ring} />

      {/* saddle */}
      <line
        x1="81"
        y1="50.5"
        x2="88"
        y2="51"
        stroke={c.saddle}
        strokeWidth="5"
        strokeLinecap="round"
      />

      {/* NEAR-SIDE CRANK + LEG — drawn on top, in front of the frame */}
      <line
        ref={reg('ck1')}
        x1={BB.x}
        y1={BB.y}
        x2={INIT.p1.x}
        y2={INIT.p1.y}
        stroke={c.crank}
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <rect
        ref={reg('pd1')}
        x={INIT.p1.x - 3}
        y={INIT.p1.y - 1.1}
        width="6"
        height="2.2"
        rx="1"
        fill={c.shoe}
      />
      <line
        ref={reg('rt')}
        x1={HIP.x}
        y1={HIP.y}
        x2={INIT.k1.x}
        y2={INIT.k1.y}
        stroke={c.pants}
        strokeWidth="4.4"
        strokeLinecap="round"
      />
      <line
        ref={reg('rs')}
        x1={INIT.k1.x}
        y1={INIT.k1.y}
        x2={INIT.p1.x}
        y2={INIT.p1.y}
        stroke={c.pants}
        strokeWidth="4.4"
        strokeLinecap="round"
      />

      {/* HIP / BUTT joint */}
      <circle cx="86" cy="47" r="3.4" fill={c.pants} />

      {/* FAR-SIDE ARM (right) — static, always gripping the bar; drawn behind
          the torso in a muted shade so the near arm can wave freely */}
      <g opacity="0.75">
        <line
          x1="100"
          y1="20.5"
          x2="103"
          y2="34.5"
          stroke={c.shirtBack}
          strokeWidth="2.8"
          strokeLinecap="round"
        />
        <line
          x1="103"
          y1="34.5"
          x2="119.5"
          y2="44.5"
          stroke={c.shirtBack}
          strokeWidth="2.8"
          strokeLinecap="round"
        />
        <circle cx="119.5" cy="44.5" r="2.1" fill={c.skin} />
      </g>

      {/* TORSO */}
      <line
        x1="86"
        y1="47"
        x2="100"
        y2="19"
        stroke={c.shirt}
        strokeWidth="4.2"
        strokeLinecap="round"
      />

      {/* ARM — driven by the gesture state machine (rest pose = hand on bar) */}
      <line
        ref={reg('ua')}
        x1={SHOULDER.x}
        y1={SHOULDER.y}
        x2={INIT.arm.ex}
        y2={INIT.arm.ey}
        stroke={c.shirt}
        strokeWidth="2.8"
        strokeLinecap="round"
      />
      <line
        ref={reg('fa')}
        x1={INIT.arm.ex}
        y1={INIT.arm.ey}
        x2={INIT.arm.hx}
        y2={INIT.arm.hy}
        stroke={c.shirt}
        strokeWidth="2.8"
        strokeLinecap="round"
      />
      <circle
        ref={reg('hand')}
        cx={INIT.arm.hx}
        cy={INIT.arm.hy}
        r="2.1"
        fill={c.skin}
      />

      {/* HEAD */}
      <circle cx="103" cy="14" r="7" fill={c.skin} />
    </svg>
  )
}

export default Biker
