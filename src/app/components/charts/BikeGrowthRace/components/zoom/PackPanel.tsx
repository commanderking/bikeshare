import { RefObject } from 'react'

type Props = {
  panelRef: RefObject<HTMLDivElement>
  top: number
  left: string
  width: string
  height: number
  capFont: number
}

// The inset's framed backdrop and "The Pack" caption. A pure container — it dissolves
// in Beat 1 of the finale via paint; the pack rows themselves live as stage siblings.
export default function PackPanel({
  panelRef,
  top,
  left,
  width,
  height,
  capFont,
}: Props) {
  return (
    <div
      ref={panelRef}
      className="absolute rounded-lg border border-gray-300 bg-gray-100/70 dark:border-gray-700 dark:bg-gray-800/40"
      style={{ top, left, width, height }}
    >
      <span
        className="absolute left-3 top-2 font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
        style={{ fontSize: capFont }}
      >
        The Pack
      </span>
    </div>
  )
}
