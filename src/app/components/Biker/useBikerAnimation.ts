import { useEffect, useRef } from 'react'
import {
  BOTTOM_BRACKET,
  HIP,
  SHOULDER,
  GEAR_RATIO,
  DEG_PER_RAD,
  INIT_CRANK_ANGLE,
  BURST_MULTIPLIER,
  BURST_RAMP_MS,
} from './geometry'
import { knee, pedals, armPose, ankleAbove } from './kinematics'
import { advanceWave, createWave } from './handWave'
import { advanceSpeedBurst, createSpeedBurst } from './speedBurst'

interface AnimationOptions {
  speed: number
  paused: boolean
  wave: boolean
  waveInterval: [number, number]
  speedBursts: boolean
}

/**
 * Runs the rAF loop that animates the biker. Owns the map of part elements and
 * returns a `reg(id)` ref-callback factory that the SVG attaches to each
 * animated part. Live prop values are read through refs so the loop never
 * restarts when props change.
 */
export function useBikerAnimation({
  speed,
  paused,
  wave,
  waveInterval,
  speedBursts,
}: AnimationOptions) {
  // Refs to the parts the loop mutates each frame, keyed by id.
  const els = useRef<Record<string, SVGElement | null>>({})
  const reg = (id: string) => (el: SVGElement | null) => {
    els.current[id] = el
  }

  const speedRef = useRef(speed)
  const pausedRef = useRef(paused)
  const waveRef = useRef(wave)
  const waveIntervalRef = useRef(waveInterval)
  const speedBurstsRef = useRef(speedBursts)
  useEffect(() => {
    speedRef.current = speed
  }, [speed])
  useEffect(() => {
    pausedRef.current = paused
  }, [paused])
  useEffect(() => {
    waveRef.current = wave
  }, [wave])
  useEffect(() => {
    waveIntervalRef.current = waveInterval
  }, [waveInterval])
  useEffect(() => {
    speedBurstsRef.current = speedBursts
  }, [speedBursts])

  useEffect(() => {
    let raf = 0
    let ang = INIT_CRANK_ANGLE
    let wheelDeg = 0
    let lastT = performance.now()
    let effSpeed = speedRef.current // applied crank speed, eased toward the target
    const waveState = createWave(waveIntervalRef.current)
    const burst = createSpeedBurst()

    const set = (id: string, attrs: Record<string, number | string>) => {
      const e = els.current[id]
      if (!e) return
      for (const [k, v] of Object.entries(attrs)) {
        e.setAttribute(k, typeof v === 'number' ? v.toFixed(2) : v)
      }
    }

    const frame = (now: number) => {
      const dt = now - lastT
      lastT = now

      if (!pausedRef.current) {
        advanceSpeedBurst(burst, dt, speedBurstsRef.current)
        // Ease the applied speed toward the target (sprint speed or base speed)
        // so sprints accelerate and decelerate instead of snapping.
        const targetSpeed = burst.active
          ? speedRef.current * BURST_MULTIPLIER
          : speedRef.current
        effSpeed += (targetSpeed - effSpeed) * Math.min(1, dt / BURST_RAMP_MS)

        ang += effSpeed
        // Wheel spin derives from the same crank increment, so pedals and
        // wheels can never drift out of sync at any speed.
        wheelDeg = (wheelDeg + effSpeed * GEAR_RATIO * DEG_PER_RAD) % 360
        advanceWave(waveState, dt, waveRef.current, waveIntervalRef.current)
      }

      const { nearPedal, farPedal } = pedals(ang)
      const nearAnkle = ankleAbove(nearPedal)
      const farAnkle = ankleAbove(farPedal)

      const wheel = wheelDeg.toFixed(2)
      set('rearSpokes', { transform: `rotate(${wheel})` })
      set('frontSpokes', { transform: `rotate(${wheel})` })

      set('nearCrank', { x1: BOTTOM_BRACKET.x, y1: BOTTOM_BRACKET.y, x2: nearPedal.x, y2: nearPedal.y })
      set('farCrank', { x1: BOTTOM_BRACKET.x, y1: BOTTOM_BRACKET.y, x2: farPedal.x, y2: farPedal.y })
      set('nearPedal', { x: nearPedal.x - 3, y: nearPedal.y - 1.1 })
      set('farPedal', { x: farPedal.x - 3, y: farPedal.y - 1.1 })

      const [nearKneeX, nearKneeY] = knee(nearAnkle.x, nearAnkle.y)
      set('nearThigh', { x1: HIP.x, y1: HIP.y, x2: nearKneeX, y2: nearKneeY })
      set('nearShin', { x1: nearKneeX, y1: nearKneeY, x2: nearAnkle.x, y2: nearAnkle.y })

      const [farKneeX, farKneeY] = knee(farAnkle.x, farAnkle.y)
      set('farThigh', { x1: HIP.x, y1: HIP.y, x2: farKneeX, y2: farKneeY })
      set('farShin', { x1: farKneeX, y1: farKneeY, x2: farAnkle.x, y2: farAnkle.y })

      // Arm: rest pose when raiseAmt is 0, raised/waving otherwise.
      const { elbowX, elbowY, handX, handY } = armPose(
        waveState.raiseAmt,
        waveState.wavePhase
      )
      set('upperArm', { x1: SHOULDER.x, y1: SHOULDER.y, x2: elbowX, y2: elbowY })
      set('forearm', { x1: elbowX, y1: elbowY, x2: handX, y2: handY })
      set('hand', { cx: handX, cy: handY })

      raf = requestAnimationFrame(frame)
    }

    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [])

  return reg
}
