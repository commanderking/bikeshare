import React from 'react'
import type { BikerColors } from './colors'

interface WheelProps {
  cx: number
  cy: number
  /** Ref-callback for the rotating spokes group (driven by the animation loop). */
  spokesRef: (el: SVGGElement | null) => void
  colors: BikerColors
}

/** One wheel: rim, four spokes (rotated each frame via `spokesRef`), and hub. */
const Wheel: React.FC<WheelProps> = ({ cx, cy, spokesRef, colors }) => (
  <g transform={`translate(${cx},${cy})`}>
    <circle r="18" fill="none" stroke={colors.wheelRim} strokeWidth="2.1" />
    <g ref={spokesRef} style={{ transformOrigin: '0 0' }}>
      <line x1="0" y1="-18" x2="0" y2="18" stroke={colors.spoke} strokeWidth="0.85" />
      <line x1="-18" y1="0" x2="18" y2="0" stroke={colors.spoke} strokeWidth="0.85" />
      <line
        x1="-12.73"
        y1="-12.73"
        x2="12.73"
        y2="12.73"
        stroke={colors.spoke}
        strokeWidth="0.85"
      />
      <line
        x1="12.73"
        y1="-12.73"
        x2="-12.73"
        y2="12.73"
        stroke={colors.spoke}
        strokeWidth="0.85"
      />
    </g>
    <circle r="2.8" fill={colors.hub} />
  </g>
)

export default Wheel
