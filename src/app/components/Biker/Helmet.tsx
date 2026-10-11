import React from 'react'

/**
 * Rider helmets, drawn over the head (center 103,14, r7) in the biker's
 * 200x112 user space. The rider faces right, so every shell's visor/brow sits
 * at the high-x end and any tail trails back toward low x.
 *
 * Shapes are tuned to stay readable at the ~20px-wide sizes the grid pages use,
 * so they differ by silhouette first and vent detail second.
 */
export type HelmetType = 'cap' | 'road' | 'commuter'

/** Shell outline plus the optional forward visor, per type. */
const SHELLS: Record<HelmetType, { shell: string; visor?: string }> = {
  // Shallow cap over the top ~1/3 of the head with a small forward visor.
  cap: {
    shell: 'M95.5,11.5 A8,8 0 0 1 110.5,11.5 Z',
    visor: 'M109,10 L114,11.3 L109,12 Z',
  },
  // Aero road shell: a shallow brow at the front sweeping back into a tail.
  // The 8.6 radius is what keeps the arc clear of the r7 head across its whole
  // span — flatten it much past that and the crown pokes through the shell.
  road: {
    shell: 'M94.6,12.4 A8.6,8.6 0 0 1 110.7,11.2 L109.9,13.9 L97.5,15.4 L92.2,14.6 Z',
  },
  // Deep round commuter dome covering the whole top half of the head, no visor.
  commuter: {
    shell: 'M95.4,14.6 A7.6,7.6 0 0 1 110.6,14.6 Z',
  },
}

/** Vent slots, drawn in `ventColor` on top of the shell. */
const VENTS: Partial<Record<HelmetType, string[]>> = {
  road: ['M99.2,9 L100.6,12.4', 'M103.2,8.4 L104.4,12', 'M107,9.2 L108,12.4'],
  commuter: ['M100.1,9.6 L100.8,12.8', 'M105.4,9.8 L105.9,12.9'],
}

interface HelmetProps {
  type: HelmetType
  color: string
  /** Vent slot color — a darkened shade of the shell. */
  ventColor: string
}

const Helmet: React.FC<HelmetProps> = ({ type, color, ventColor }) => {
  const { shell, visor } = SHELLS[type]
  return (
    <>
      <path d={shell} fill={color} />
      {visor && <path d={visor} fill={color} />}
      {VENTS[type]?.map((d) => (
        <path
          key={d}
          d={d}
          fill="none"
          stroke={ventColor}
          strokeWidth="0.9"
          strokeLinecap="round"
        />
      ))}
    </>
  )
}

export default Helmet
