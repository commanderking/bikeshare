import React from 'react'
import type { BikerColors } from './colors'

/**
 * Main bicycle frame — a step-through (no top tube), drawn as individually
 * named tubes between named joints so each piece maps to a real frame term:
 *
 *   chainstay   bottom bracket → rear axle
 *   seat stay   rear axle → seat tube
 *   seat tube   bottom bracket → saddle
 *   down tube   bottom bracket → head tube   (the low sweep; drawn as a curve)
 *   fork        head tube → front axle
 *   head tube   fork crown → handlebar/stem
 *
 * The front cargo carrier (see Basket.tsx) mounts at HEAD.
 */

// Frame joints, in the 200x112 SVG user space.
const REAR_AXLE = { x: 66, y: 87 }
const FRONT_AXLE = { x: 137, y: 87 }
const BOTTOM_BRACKET = { x: 92, y: 87 } // crank axis & chainring
const HEAD = { x: 130, y: 58 } // head-tube base / fork crown
const STEM_TOP = { x: 122, y: 44.5 } // top of head tube / stem (handlebar sits here)
const SEAT_TOP = { x: 86, y: 50 } // top of seat tube (under the saddle)
const SEAT_STAY_JOINT = { x: 86.8, y: 59.6 } // where the seat stay meets the seat tube

// The down tube is the only tube drawn as a curve rather than a straight line.
// This quadratic control point sets how low it sweeps (a step-through hallmark).
// For a perfectly straight tube, set it to the BOTTOM_BRACKET→HEAD midpoint: (111, 72.5).
const DOWN_TUBE_CURVE = { x: 108, y: 83 }

interface FrameProps {
  colors: BikerColors
}

const Frame: React.FC<FrameProps> = ({ colors: c }) => (
  <g fill="none" strokeLinecap="round">
    {/* chainstay — bottom bracket to rear axle */}
    <line
      x1={BOTTOM_BRACKET.x}
      y1={BOTTOM_BRACKET.y}
      x2={REAR_AXLE.x}
      y2={REAR_AXLE.y}
      stroke={c.frame}
      strokeWidth="3"
    />
    {/* down tube — bottom bracket up to the head tube (curved; step-through) */}
    <path
      d={`M${BOTTOM_BRACKET.x},${BOTTOM_BRACKET.y} Q${DOWN_TUBE_CURVE.x},${DOWN_TUBE_CURVE.y} ${HEAD.x},${HEAD.y}`}
      stroke={c.frame}
      strokeWidth="3"
    />
    {/* seat tube — bottom bracket up to the saddle */}
    <line
      x1={BOTTOM_BRACKET.x}
      y1={BOTTOM_BRACKET.y}
      x2={SEAT_TOP.x}
      y2={SEAT_TOP.y}
      stroke={c.frame}
      strokeWidth="2.6"
    />
    {/* fork — head tube down to the front axle */}
    <line
      x1={HEAD.x}
      y1={HEAD.y}
      x2={FRONT_AXLE.x}
      y2={FRONT_AXLE.y}
      stroke={c.frame}
      strokeWidth="2.6"
    />
    {/* head tube & stem — fork crown up to the handlebar */}
    <line
      x1={HEAD.x}
      y1={HEAD.y}
      x2={STEM_TOP.x}
      y2={STEM_TOP.y}
      stroke={c.frameDark}
      strokeWidth="2.4"
    />
    {/* seat stay — rear axle up to the seat tube */}
    <line
      x1={REAR_AXLE.x}
      y1={REAR_AXLE.y}
      x2={SEAT_STAY_JOINT.x}
      y2={SEAT_STAY_JOINT.y}
      stroke={c.frame}
      strokeWidth="2.6"
    />
  </g>
)

export default Frame
