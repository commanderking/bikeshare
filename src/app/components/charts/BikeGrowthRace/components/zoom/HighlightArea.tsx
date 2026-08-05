import { RefObject } from 'react'
import { ZoomSize } from '../../render/zoomLayout'

type Props = {
  highlightRef: RefObject<HTMLDivElement>
  size: ZoomSize
  left: string
}

// Placeholder for future callouts annotating moments in the race. Fades out with the
// rest of the chrome at the finale.
export default function HighlightArea({ highlightRef, size, left }: Props) {
  return (
    <div
      ref={highlightRef}
      className="absolute rounded-md border border-dashed border-gray-300 p-3 text-gray-400 dark:border-gray-600 dark:text-gray-500"
      style={{ top: size.dateTop + 76 * size.scale, left, right: 0 }}
    >
      <span
        className="font-bold uppercase tracking-wider"
        style={{ fontSize: size.capFont }}
      >
        Highlight area
      </span>
    </div>
  )
}
