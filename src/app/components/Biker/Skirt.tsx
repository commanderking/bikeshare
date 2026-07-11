import React from 'react'

/**
 * Rear dress/skirt guard shapes, drawn as filled outlines over the rear wheel
 * (center 66,87, r18). Bundled as { type, color } so the skirt can carry more
 * options later.
 *
 * Every shape's top edge is a concentric arc riding just above the rim. The
 * paths are transformed from the design sketches in `docs/skirt-sketches/`
 * (authored in a wheel space of center 100,100, R70, scaled here by 18/70).
 * See the `skirt-guard-sketch` skill for how each is constructed.
 */
export type SkirtType =
  | 'halfDisc'
  | 'LEVEL_1'
  | 'LEVEL_2'
  | '9_1_CIRCLE'
  | '10_3_CIRCLE'
  | '11_3_CIRCLE'
  | 'FIN'
  | 'CRESCENT'

export interface SkirtGuard {
  type: SkirtType
  color: string
}

const PATHS: Record<SkirtType, string> = {
  // original solid panel over the upper-front of the wheel
  halfDisc: 'M46.3 83.53 A20 20 0 0 1 81.76 74.69 L71 88 Z',
  // two levels joined by a 45° diagonal step
  LEVEL_1:
    'M47.88,79.68 A19.54,19.54 0 0 1 85.54,87.0 L84.0,87.0 L68.06,87.0 L64.2,83.14 L48.41,83.14 Z',
  // two levels joined by a tangent step-arc; upper edge ends inside the wheel (cap to 10 o'clock)
  LEVEL_2:
    'M49.07,77.23 A19.54,19.54 0 0 1 85.54,87.0 L71.66,87.0 A7.46,7.46 0 0 0 64.97,82.89 L55.3,82.89 Z',
  // pie sector 9→1 o'clock (replaces the old minimal fender)
  '9_1_CIRCLE': 'M46.46,87.0 A19.54,19.54 0 0 1 75.77,70.07 L66.0,87.0 Z',
  // pie sector 10→3 o'clock
  '10_3_CIRCLE': 'M49.07,77.23 A19.54,19.54 0 0 1 85.54,87.0 L66.0,87.0 Z',
  // pie sector 11→3 o'clock
  '11_3_CIRCLE': 'M56.23,70.07 A19.54,19.54 0 0 1 85.54,87.0 L66.0,87.0 Z',
  // symmetric truncated wedge 10→2 o'clock with a flat bottom
  FIN: 'M49.07,77.23 A19.54,19.54 0 0 1 82.93,77.23 L69.6,87.0 L62.4,87.0 Z',
  // right sector + left sector with a quarter-oval scoop
  CRESCENT:
    'M66.0,87.0 L85.54,87.0 A19.54,19.54 0 0 0 49.07,77.23 A13.89,9.77 0 0 1 62.91,87.0 Z',
}

interface SkirtProps {
  guard: SkirtGuard
}

const Skirt: React.FC<SkirtProps> = ({ guard }) => (
  <path
    d={PATHS[guard.type]}
    fill={guard.color}
    stroke={guard.color}
    strokeWidth="0.75"
    strokeLinejoin="round"
  />
)

export default Skirt
