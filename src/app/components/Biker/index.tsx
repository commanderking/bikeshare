'use client'

import React from 'react'
import { BikerColors, DEFAULT_COLORS } from './colors'
import { BOTTOM_BRACKET, HIP, SHOULDER, DEFAULT_SPEED } from './geometry'
import { INIT } from './kinematics'
import { useBikerAnimation } from './useBikerAnimation'
import { DEFAULT_WAVE_MS } from './handWave'
import Wheel from './Wheel'
import Frame, { DownTubeCurve } from './Frame'
import Basket, { BasketType } from './Basket'
import Skirt, { SkirtGuard } from './Skirt'
import RiderSkirt from './RiderSkirt'
import Helmet, { HelmetType } from './Helmet'
import { RiderOutfit, getOutfitColors, getHelmetVentColor } from './outfit'

export type { BikerColors, BasketType, SkirtGuard, DownTubeCurve }
export type { HelmetType, RiderOutfit }

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
  /**
   * Bump to make the biker wave once, now — independent of `wave`, which only
   * governs the idle waves it plays on its own. Ignored at 0 and mid-wave.
   */
  waveNonce?: number
  /** End-to-end length of one wave in ms. */
  waveDurationMs?: number
  /** Occasionally sprint for a couple of seconds. */
  speedBursts?: boolean
  /** Override any subset of the default colors. */
  colors?: Partial<BikerColors>
  /** Front cargo carrier shape. */
  basketType?: BasketType
  /** Rear dress/skirt guard shape + color. */
  skirtGuard?: SkirtGuard
  /** What the rider wears. Omitted, they keep the default long sleeves + pants. */
  outfit?: RiderOutfit
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
  waveNonce = 0,
  waveDurationMs = DEFAULT_WAVE_MS,
  speedBursts = true,
  colors,
  basketType = 'rack',
  skirtGuard = { type: 'halfDisc', color: '#f5e79e' },
  outfit,
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
    waveNonce,
    waveDurationMs,
  })
  // `colors` is applied last so a caller can still pin an individual part.
  const resolvedColors = {
    ...DEFAULT_COLORS,
    ...(outfit && getOutfitColors(outfit)),
    ...colors,
  }
  const helmetType = outfit?.helmet.type ?? 'cap'

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
          stroke={resolvedColors.ground}
          strokeWidth="1"
        />
      )}

      <Wheel
        cx={66}
        cy={87}
        spokesRef={reg('rearSpokes')}
        colors={resolvedColors}
      />
      <Wheel
        cx={137}
        cy={87}
        spokesRef={reg('frontSpokes')}
        colors={resolvedColors}
      />

      {/* REAR skirt/dress guard (shape + color via the skirtGuard prop) */}
      <Skirt guard={skirtGuard} />
      {/* FRONT fender — thin partial guard on the back of the front wheel */}
      <path
        d="M116.5 87.7 A20.5 20.5 0 0 1 137.7 66.5"
        fill="none"
        stroke={resolvedColors.frontFender}
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
        stroke={resolvedColors.thigh}
        strokeWidth="4.0"
        strokeLinecap="round"
      />
      <line
        ref={reg('farShin')}
        x1={INIT.farKnee.x}
        y1={INIT.farKnee.y}
        x2={INIT.farAnkle.x}
        y2={INIT.farAnkle.y}
        stroke={resolvedColors.shin}
        strokeWidth="4.0"
        strokeLinecap="round"
      />
      <line
        ref={reg('farCrank')}
        x1={BOTTOM_BRACKET.x}
        y1={BOTTOM_BRACKET.y}
        x2={INIT.farPedal.x}
        y2={INIT.farPedal.y}
        stroke={resolvedColors.crank}
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
        fill={resolvedColors.shoe}
        opacity="0.5"
      />

      {/* MAIN FRAME — step-through, drawn as labeled tubes (see Frame.tsx) */}
      <Frame colors={resolvedColors} downTube={downTube} />

      {/* HANDLEBAR, near seat height */}
      <line
        x1="118"
        y1="44.5"
        x2="122"
        y2="44.5"
        stroke={resolvedColors.frameDark}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <circle cx="118" cy="44.5" r="1.6" fill={resolvedColors.frameDark} />

      {/* FRONT CARGO CARRIER — shape varies by city (wire / box / rack / none) */}
      <Basket type={basketType} colors={resolvedColors} />

      {/* chainring — smaller than the crank so the pedals sweep outside it */}
      <circle
        cx="92"
        cy="87"
        r="5"
        fill="none"
        stroke={resolvedColors.ring}
        strokeWidth="1.4"
      />
      <circle cx="92" cy="87" r="1.8" fill={resolvedColors.ring} />

      {/* saddle */}
      <line
        x1="81"
        y1="50.5"
        x2="88"
        y2="51"
        stroke={resolvedColors.saddle}
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
        stroke={resolvedColors.crank}
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
        fill={resolvedColors.shoe}
      />
      <line
        ref={reg('nearThigh')}
        x1={HIP.x}
        y1={HIP.y}
        x2={INIT.nearKnee.x}
        y2={INIT.nearKnee.y}
        stroke={resolvedColors.thigh}
        strokeWidth="4.4"
        strokeLinecap="round"
      />
      <line
        ref={reg('nearShin')}
        x1={INIT.nearKnee.x}
        y1={INIT.nearKnee.y}
        x2={INIT.nearAnkle.x}
        y2={INIT.nearAnkle.y}
        stroke={resolvedColors.shin}
        strokeWidth="4.4"
        strokeLinecap="round"
      />

      {/* HIP / BUTT joint */}
      <circle cx="86" cy="47" r="3.4" fill={resolvedColors.hip} />

      {/* FAR ARM (his left) — driven by the hand-wave state machine (rest pose =
          hand on bar); drawn behind the torso and muted for depth */}
      <g opacity="0.75">
        <line
          ref={reg('upperArm')}
          x1={SHOULDER.x}
          y1={SHOULDER.y}
          x2={INIT.arm.elbowX}
          y2={INIT.arm.elbowY}
          stroke={resolvedColors.shirtBack}
          strokeWidth="2.8"
          strokeLinecap="round"
        />
        <line
          ref={reg('forearm')}
          x1={INIT.arm.elbowX}
          y1={INIT.arm.elbowY}
          x2={INIT.arm.handX}
          y2={INIT.arm.handY}
          stroke={resolvedColors.forearmBack}
          strokeWidth="2.8"
          strokeLinecap="round"
        />
        <circle
          ref={reg('hand')}
          cx={INIT.arm.handX}
          cy={INIT.arm.handY}
          r="2.1"
          fill={resolvedColors.skin}
        />
      </g>

      {/* TORSO */}
      <line
        x1="86"
        y1="47"
        x2="100"
        y2="19"
        stroke={resolvedColors.shirt}
        strokeWidth="4.2"
        strokeLinecap="round"
      />

      {/* RIDER'S SKIRT — over the torso, so the top reads as tucked into it */}
      {outfit?.legwear.type === 'skirt' && (
        <RiderSkirt color={outfit.legwear.color} />
      )}

      {/* NEAR ARM (his right) — static, always gripping the bar; drawn in front */}
      <line
        x1="100"
        y1="20.5"
        x2="103"
        y2="34.5"
        stroke={resolvedColors.shirt}
        strokeWidth="2.8"
        strokeLinecap="round"
      />
      <line
        x1="103"
        y1="34.5"
        x2="119.5"
        y2="44.5"
        stroke={resolvedColors.forearm}
        strokeWidth="2.8"
        strokeLinecap="round"
      />
      <circle cx="119.5" cy="44.5" r="2.1" fill={resolvedColors.skin} />

      {/* HEAD */}
      <circle cx="103" cy="14" r="7" fill={resolvedColors.skin} />

      {/* HELMET — shell shape varies by rider (see Helmet.tsx) */}
      <Helmet
        type={helmetType}
        color={resolvedColors.helmet}
        ventColor={getHelmetVentColor(resolvedColors.helmet)}
      />
    </svg>
  )
}

export default Biker
