import React from 'react'

/**
 * The rider's skirt — not to be confused with Skirt.tsx, which is the *bike's*
 * rear-wheel dress guard.
 *
 * A three-quarter panel that starts at the top-left of the hip joint, wraps over
 * it, and fans forward and down across the lap to just above the knee. The top
 * edge opens with an arc of the joint's own radius, so the panel encloses the
 * joint instead of leaving its arc protruding as a tab — the two then read as one
 * garment, which is also why `hip` always takes the legwear color.
 *
 * The thigh swings between 26 and 72 degrees below horizontal over a crank
 * revolution while the panel is static, so each edge is pinned to that sweep:
 *
 *   top edge     rides just above the *flattest* thigh's upper surface, so the
 *                leg can never surface above the skirt. Its outward bulge is
 *                load-bearing, not decoration — a straight edge here grazes the
 *                thigh and a concave one would cut into it.
 *   hem          left straight on purpose. A straight hem releases the leg at a
 *                near-constant fraction of the thigh no matter where the crank
 *                is (74% at the flattest, 76% at the steepest); curving it makes
 *                the skirt visibly longer at one end of the stroke than the other.
 *   back edge    bows left to stay behind the *steepest* thigh, which swings back
 *                past the hip centerline below the seat where the joint circle
 *                no longer covers it.
 *
 * Drawn over the torso, so the top reads as a shirt tucked into it.
 */
const SKIRT_PATH =
  'M82.6,46.7 A3.4,3.4 0 0 1 88.6,44.8 Q96.5,48.2 103.4,52.9 L90.5,65 Q84,57.5 82.6,46.7 Z'

interface RiderSkirtProps {
  color: string
}

const RiderSkirt: React.FC<RiderSkirtProps> = ({ color }) => (
  <path
    d={SKIRT_PATH}
    fill={color}
    stroke={color}
    strokeWidth="0.6"
    strokeLinejoin="round"
  />
)

export default RiderSkirt
