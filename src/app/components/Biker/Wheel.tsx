import React from 'react'
import type { BikerColors } from './colors'

interface WheelProps {
  cx: number
  cy: number
  /** Ref-callback for the rotating spokes group (driven by the animation loop). */
  spokesRef: (el: SVGGElement | null) => void
  colors: BikerColors
}

/** One wheel: black outer tire, a thin colored inner rim (half the tire's
 *  width), six spokes (rotated each frame via `spokesRef`), and hub. */
const Wheel: React.FC<WheelProps> = ({ cx, cy, spokesRef, colors }) => (
  <g transform={`translate(${cx},${cy})`}>
    <circle r="18" fill="none" stroke={colors.tire} strokeWidth="2.1" />
    <circle r="16.4" fill="none" stroke={colors.wheelRim} strokeWidth="1.5" />
    {/* Three diameters 60° apart. Six rather than eight so the pattern repeats
        every 60°, keeping top-speed spin clearly forward (see GEAR_RATIO). */}
    <g ref={spokesRef} style={{ transformOrigin: '0 0' }}>
      <line
        x1="0"
        y1="-16"
        x2="0"
        y2="16"
        stroke={colors.spoke}
        strokeWidth="0.85"
      />
      <line
        x1="13.86"
        y1="-8"
        x2="-13.86"
        y2="8"
        stroke={colors.spoke}
        strokeWidth="0.85"
      />
      <line
        x1="-13.86"
        y1="-8"
        x2="13.86"
        y2="8"
        stroke={colors.spoke}
        strokeWidth="0.85"
      />
    </g>
    <circle r="2.8" fill={colors.hub} />
  </g>
)

export default Wheel
