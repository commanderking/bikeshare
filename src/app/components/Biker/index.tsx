'use client'

import React from 'react'
import { BikerColors, DEFAULT_COLORS } from './colors'
import { BOTTOM_BRACKET, HIP, SHOULDER, DEFAULT_SPEED } from './geometry'
import { INIT } from './kinematics'
import { useBikerAnimation } from './useBikerAnimation'
import Wheel from './Wheel'
import Frame, { DownTubeCurve } from './Frame'
import Basket, { BasketType } from './Basket'
import Skirt, { SkirtGuard } from './Skirt'

export type { BikerColors, BasketType, SkirtGuard, DownTubeCurve }

interface BikerProps {
  /** Crank angular velocity in radians per animation frame. Higher = faster pedalling. */
  speed?: number
  /** Freeze the animation on the current pose. */
  paused?: boolean
  /** Show the ground line beneath the wheels. */
  showGround?: boolean
  /** Occasionally play the idle hand-wave. */
  wave?: boolean
  /** Random idle delay between waves, in milliseconds: [min, max]. */
  waveInterval?: [number, number]
  /** Occasionally sprint for a couple of seconds. */
  speedBursts?: boolean
  /** Override any subset of the default colors. */
  colors?: Partial<BikerColors>
  /** Front cargo carrier shape. */
  basketType?: BasketType
  /** Rear dress/skirt guard shape + color. */
  skirtGuard?: SkirtGuard
  /** Down-tube sweep profile; varies with the bike's frame dimensions. */
  downTube?: DownTubeCurve
  width?: number | string
  height?: number | string
  /** Override the SVG viewBox, e.g. to crop the empty side padding. */
  viewBox?: string
  className?: string
  style?: React.CSSProperties
}

const Biker: React.FC<BikerProps> = ({
  speed = DEFAULT_SPEED,
  paused = false,
  showGround = false,
  wave = true,
  waveInterval = [5000, 10000],
  speedBursts = true,
  colors,
  basketType = 'rack',
  skirtGuard = { type: 'halfDisc', color: '#f5e79e' },
  downTube = 'default',
  width = 200,
  height,
  viewBox = '0 0 200 112',
  className,
  style,
}) => {
  const reg = useBikerAnimation({
    speed,
    paused,
    wave,
    waveInterval,
    speedBursts,
  })
  const c = { ...DEFAULT_COLORS, ...colors }

  return (
    <svg
      viewBox={viewBox}
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

      <Wheel cx={66} cy={87} spokesRef={reg('rearSpokes')} colors={c} />
      <Wheel cx={137} cy={87} spokesRef={reg('frontSpokes')} colors={c} />

      {/* REAR skirt/dress guard (shape + color via the skirtGuard prop) */}
      <Skirt guard={skirtGuard} />
      {/* FRONT fender — thin partial guard on the back of the front wheel */}
      <path
        d="M116.5 87.7 A20.5 20.5 0 0 1 137.7 66.5"
        fill="none"
        stroke={c.frontFender}
        strokeWidth="2.2"
        strokeLinecap="round"
      />

      {/* FAR-SIDE LEG + CRANK — drawn before the frame so the frame overlaps it */}
      <line
        ref={reg('farThigh')}
        x1={HIP.x}
        y1={HIP.y}
        x2={INIT.farKnee.x}
        y2={INIT.farKnee.y}
        stroke={c.pantsBack}
        strokeWidth="4.0"
        strokeLinecap="round"
        opacity="0.65"
      />
      <line
        ref={reg('farShin')}
        x1={INIT.farKnee.x}
        y1={INIT.farKnee.y}
        x2={INIT.farAnkle.x}
        y2={INIT.farAnkle.y}
        stroke={c.pantsBack}
        strokeWidth="4.0"
        strokeLinecap="round"
        opacity="0.65"
      />
      <line
        ref={reg('farCrank')}
        x1={BOTTOM_BRACKET.x}
        y1={BOTTOM_BRACKET.y}
        x2={INIT.farPedal.x}
        y2={INIT.farPedal.y}
        stroke={c.crank}
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.5"
      />
      <rect
        ref={reg('farPedal')}
        x={INIT.farPedal.x - 3}
        y={INIT.farPedal.y - 1.1}
        width="6"
        height="2.2"
        rx="1"
        fill={c.shoe}
        opacity="0.5"
      />

      {/* MAIN FRAME — step-through, drawn as labeled tubes (see Frame.tsx) */}
      <Frame colors={c} downTube={downTube} />

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

      {/* FRONT CARGO CARRIER — shape varies by city (wire / box / rack / none) */}
      <Basket type={basketType} colors={c} />

      {/* chainring — smaller than the crank so the pedals sweep outside it */}
      <circle
        cx="92"
        cy="87"
        r="5"
        fill="none"
        stroke={c.ring}
        strokeWidth="1.4"
      />
      <circle cx="92" cy="87" r="1.8" fill={c.ring} />

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
        ref={reg('nearCrank')}
        x1={BOTTOM_BRACKET.x}
        y1={BOTTOM_BRACKET.y}
        x2={INIT.nearPedal.x}
        y2={INIT.nearPedal.y}
        stroke={c.crank}
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <rect
        ref={reg('nearPedal')}
        x={INIT.nearPedal.x - 3}
        y={INIT.nearPedal.y - 1.1}
        width="6"
        height="2.2"
        rx="1"
        fill={c.shoe}
      />
      <line
        ref={reg('nearThigh')}
        x1={HIP.x}
        y1={HIP.y}
        x2={INIT.nearKnee.x}
        y2={INIT.nearKnee.y}
        stroke={c.pants}
        strokeWidth="4.4"
        strokeLinecap="round"
      />
      <line
        ref={reg('nearShin')}
        x1={INIT.nearKnee.x}
        y1={INIT.nearKnee.y}
        x2={INIT.nearAnkle.x}
        y2={INIT.nearAnkle.y}
        stroke={c.pants}
        strokeWidth="4.4"
        strokeLinecap="round"
      />

      {/* HIP / BUTT joint */}
      <circle cx="86" cy="47" r="3.4" fill={c.pants} />

      {/* FAR ARM (his left) — driven by the hand-wave state machine (rest pose =
          hand on bar); drawn behind the torso and muted for depth */}
      <g opacity="0.75">
        <line
          ref={reg('upperArm')}
          x1={SHOULDER.x}
          y1={SHOULDER.y}
          x2={INIT.arm.elbowX}
          y2={INIT.arm.elbowY}
          stroke={c.shirtBack}
          strokeWidth="2.8"
          strokeLinecap="round"
        />
        <line
          ref={reg('forearm')}
          x1={INIT.arm.elbowX}
          y1={INIT.arm.elbowY}
          x2={INIT.arm.handX}
          y2={INIT.arm.handY}
          stroke={c.shirtBack}
          strokeWidth="2.8"
          strokeLinecap="round"
        />
        <circle
          ref={reg('hand')}
          cx={INIT.arm.handX}
          cy={INIT.arm.handY}
          r="2.1"
          fill={c.skin}
        />
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

      {/* NEAR ARM (his right) — static, always gripping the bar; drawn in front */}
      <line
        x1="100"
        y1="20.5"
        x2="103"
        y2="34.5"
        stroke={c.shirt}
        strokeWidth="2.8"
        strokeLinecap="round"
      />
      <line
        x1="103"
        y1="34.5"
        x2="119.5"
        y2="44.5"
        stroke={c.shirt}
        strokeWidth="2.8"
        strokeLinecap="round"
      />
      <circle cx="119.5" cy="44.5" r="2.1" fill={c.skin} />

      {/* HEAD */}
      <circle cx="103" cy="14" r="7" fill={c.skin} />

      {/* HELMET — shallow cap over the top ~1/3 of the head with a small forward visor */}
      <path d="M95.5 11.5 A8 8 0 0 1 110.5 11.5 Z" fill={c.helmet} />
      <path d="M109 10 L114 11.3 L109 12 Z" fill={c.helmet} />
    </svg>
  )
}

export default Biker
