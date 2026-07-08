import React from 'react'
import type { BikerColors } from './colors'

/**
 * Front cargo carrier variants, interpreted from real bikeshare photos.
 * Cities with similar hardware share a shape (see cityColors.ts):
 *   - 'none'  no front carrier (Austin, Bergen)
 *   - 'wire'  open mesh bucket basket (Boston, Chattanooga, Seoul, Taipei)
 *   - 'box'   solid cargo box / branded carrier (Mexico City)
 *   - 'rack'  flat tubular front rack + bungee (Chicago, Columbus) — the default
 */
export type BasketType = 'none' | 'wire' | 'box' | 'rack'

interface BasketProps {
  type: BasketType
  colors: BikerColors
}

/** Mounted ahead of the head tube, above the front wheel. */
const Basket: React.FC<BasketProps> = ({ type, colors: c }) => {
  if (type === 'none') return null

  if (type === 'rack') {
    return (
      <>
        <path
          d="M139.3,58 L139.3,46 M139.3,58 L130,58"
          fill="none"
          stroke={c.basket}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <line
          x1="130"
          y1="58"
          x2="139.3"
          y2="46"
          stroke={c.crank}
          strokeWidth="1"
          strokeLinecap="round"
        />
      </>
    )
  }

  if (type === 'box') {
    return (
      <g strokeLinejoin="round">
        <rect
          x="128"
          y="50.5"
          width="19"
          height="7.25"
          rx="1.5"
          fill={c.basket}
          stroke={c.basket}
          strokeWidth="0.6"
        />
        {/* lid seam */}
        <line
          x1="128.5"
          y1="52.3"
          x2="146.5"
          y2="52.3"
          stroke={c.crank}
          strokeWidth="0.7"
          opacity="0.5"
        />
      </g>
    )
  }

  // 'wire' — open mesh bucket basket
  return (
    <g fill="none" stroke={c.basket} strokeLinecap="round" strokeLinejoin="round">
      {/* mounting struts to fork crown + head tube */}
      <line x1="131" y1="51" x2="130" y2="58" strokeWidth="1.2" />
      <line x1="128.5" y1="41.5" x2="122.5" y2="44.5" strokeWidth="1.1" />
      {/* top rim + tapered sides + bottom */}
      <line x1="127.5" y1="40" x2="147.5" y2="40" strokeWidth="1.4" />
      <path d="M128.5,40 L131.5,51 L143.5,51 L146.5,40" strokeWidth="1.2" />
      {/* mesh */}
      <line x1="129.3" y1="45.5" x2="145.7" y2="45.5" strokeWidth="0.55" />
      <line x1="133" y1="40.5" x2="133.8" y2="50.5" strokeWidth="0.55" />
      <line x1="137.5" y1="40.5" x2="137.5" y2="50.5" strokeWidth="0.55" />
      <line x1="142" y1="40.5" x2="141.2" y2="50.5" strokeWidth="0.55" />
    </g>
  )
}

export default Basket
