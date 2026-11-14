import { RefObject } from 'react'

type Props = {
  top: number
  height: number
  panelLeft: number
  panelRight: number
  connectorRef: RefObject<SVGSVGElement>
  beamRef: RefObject<SVGPolygonElement>
  leftLineRef: RefObject<SVGLineElement>
  rightLineRef: RefObject<SVGLineElement>
}

// The magnifier "beam": dashed lines from the span of Paris's bar the panel is
// showing down to that panel's edges, with a faint fill between. Both lines and the
// beam polygon track live positions (set in paint) — the right one the #2 marker,
// the left one the last-place city still on screen.
export default function ConnectorBand({
  top,
  height,
  panelLeft,
  panelRight,
  connectorRef,
  beamRef,
  leftLineRef,
  rightLineRef,
}: Props) {
  return (
    <svg
      ref={connectorRef}
      className="absolute text-gray-400 opacity-0 dark:text-gray-600"
      style={{ top, left: 0, width: '100%', height }}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <polygon
        ref={beamRef}
        points="0,0 0,0 0,0 0,0"
        fill="rgba(133,191,66,0.12)"
      />
      <line
        ref={leftLineRef}
        x1="0"
        y1="0"
        x2={panelLeft * 100}
        y2="100"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeDasharray="4 3"
        vectorEffect="non-scaling-stroke"
      />
      <line
        ref={rightLineRef}
        x1="0"
        y1="0"
        x2={panelRight * 100}
        y2="100"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeDasharray="4 3"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}
