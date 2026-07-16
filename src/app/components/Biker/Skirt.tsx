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
  | 'OUTER_GUARD_150'

/**
 * Optional arc band riding on the upper wheel, concentric with it. Its inner
 * edge sits at the middle of the tire (r 18) and its outer edge follows the top
 * of the skirt guards (r 20.5) — a fender rib. Swept from `startDeg` to
 * `endDeg`, measured in degrees CCW from 3 o'clock (0°); may run up to ~200°.
 */
export interface OuterGuard {
  /** Sweep start, degrees CCW from 3 o'clock. Default 0 (3 o'clock). */
  startDeg?: number
  /** Sweep end, degrees CCW from 3 o'clock (up to ~200). Default 180 (9 o'clock). */
  endDeg?: number
  /** Band color; defaults to the skirt guard's color. */
  color?: string
}

export interface SkirtGuard {
  type: SkirtType
  color: string
  outerGuard?: OuterGuard
}

// Rear wheel center + the two concentric radii the outerGuard band rides between.
const WHEEL = { cx: 66, cy: 87 }
const OUTER_GUARD_R_INNER = 18 // middle of the tire (kept — the band's bottom edge)
const OUTER_GUARD_R_OUTER = 20.5 // top edge of the skirt guards / front-fender standoff

const round = (n: number) => Math.round(n * 100) / 100

/** Point on a circle of radius `r` at `deg` CCW from 3 o'clock (screen y is down). */
const polar = (r: number, deg: number): [number, number] => {
  const t = (deg * Math.PI) / 180
  return [WHEEL.cx + r * Math.cos(t), WHEEL.cy - r * Math.sin(t)]
}

/** Ring-segment path for the outerGuard band, swept `startDeg`→`endDeg`. */
function outerGuardPath(startDeg: number, endDeg: number): string {
  const rOut = OUTER_GUARD_R_OUTER
  const rIn = OUTER_GUARD_R_INNER
  const [x1, y1] = polar(rOut, startDeg)
  const [x2, y2] = polar(rOut, endDeg)
  const [x3, y3] = polar(rIn, endDeg)
  const [x4, y4] = polar(rIn, startDeg)
  const large = Math.abs(endDeg - startDeg) > 180 ? 1 : 0
  // Outer edge sweeps CCW on screen (flag 0); inner edge returns CW (flag 1).
  return (
    `M${round(x1)},${round(y1)} ` +
    `A${rOut},${rOut} 0 ${large} 0 ${round(x2)},${round(y2)} ` +
    `L${round(x3)},${round(y3)} ` +
    `A${rIn},${rIn} 0 ${large} 1 ${round(x4)},${round(y4)} Z`
  )
}

// Top edge of every shape rides at r 20.5 — the same standoff from the tire as
// the front fender — while the bottom vertices keep their original positions.
const PATHS: Record<SkirtType, string> = {
  // original solid panel over the upper-front of the wheel
  halfDisc: 'M45.81,83.44 A20.5,20.5 0 0 1 82.16,74.38 L71,88 Z',
  // two levels joined by a 45° diagonal step
  LEVEL_1:
    'M46.99,79.32 A20.5,20.5 0 0 1 86.5,87 L84,87 L68.06,87 L64.2,83.14 L48.41,83.14 Z',
  // two levels joined by a tangent step-arc; upper edge ends inside the wheel (cap to 10 o'clock)
  LEVEL_2:
    'M48.24,76.75 A20.5,20.5 0 0 1 86.5,87 L71.66,87 A7.46,7.46 0 0 0 64.97,82.89 L55.3,82.89 Z',
  // pie sector 9→1 o'clock (replaces the old minimal fender)
  '9_1_CIRCLE': 'M45.5,87 A20.5,20.5 0 0 1 76.25,69.24 L66,87 Z',
  // pie sector 10→3 o'clock
  '10_3_CIRCLE': 'M48.24,76.75 A20.5,20.5 0 0 1 86.5,87 L66,87 Z',
  // pie sector 11→3 o'clock
  '11_3_CIRCLE': 'M55.75,69.24 A20.5,20.5 0 0 1 86.5,87 L66,87 Z',
  // symmetric truncated wedge 10→2 o'clock with a flat bottom
  FIN: 'M48.24,76.75 A20.5,20.5 0 0 1 83.76,76.75 L69.6,87 L62.4,87 Z',
  // right sector + left sector with a quarter-oval scoop
  CRESCENT:
    'M66,87 L86.5,87 A20.5,20.5 0 0 0 48.24,76.75 A13.89,9.77 0 0 1 62.91,87 Z',
  // full outerGuard band as a standalone guard: 3 o'clock up over the top to 150°
  OUTER_GUARD_150: outerGuardPath(0, 150),
}

interface SkirtProps {
  guard: SkirtGuard
}

const Skirt: React.FC<SkirtProps> = ({ guard }) => (
  <>
    <path
      d={PATHS[guard.type]}
      fill={guard.color}
      stroke={guard.color}
      strokeWidth="0.75"
      strokeLinejoin="round"
    />
    {guard.outerGuard && (
      <path
        d={outerGuardPath(
          guard.outerGuard.startDeg ?? 0,
          guard.outerGuard.endDeg ?? 180,
        )}
        fill={guard.outerGuard.color ?? guard.color}
        stroke={guard.outerGuard.color ?? guard.color}
        strokeWidth="0.5"
        strokeLinejoin="round"
      />
    )}
  </>
)

export default Skirt
