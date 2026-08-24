import { useEffect, useState } from 'react'
import Image from 'next/image'
import { HIGHLIGHT_FADE_MS } from '../../constants'
import { ZoomSize } from '../../render/zoomLayout'
import { PlacedHighlight } from '../../highlightStack'

type Props = {
  highlight: PlacedHighlight
  size: ZoomSize
  // The city's bar color, or undefined for highlights not tied to one city.
  accentColor: string | undefined
  visible: boolean
  reduceMotion: boolean
}

// One callout. Stays mounted while fading out (see HighlightArea), so `visible`
// drives the opacity rather than the card mounting and unmounting.
export default function HighlightCard({
  highlight,
  size,
  accentColor,
  visible,
  reduceMotion,
}: Props) {
  const { title, content, image } = highlight
  // A card mounts already visible, which would pop it in — start at 0 and flip on
  // the first commit so the fade-in transition has something to run against. The
  // parent keys this component by highlight id, so each new card gets its own entry.
  const [entered, setEntered] = useState(false)
  useEffect(() => setEntered(true), [])

  return (
    <div
      className="h-full rounded-md border-l-4 bg-gray-50 dark:bg-gray-800"
      style={{
        borderLeftColor: accentColor ?? 'transparent',
        borderLeftWidth: 4 * size.scale,
        padding: 10 * size.scale,
        opacity: visible && entered ? 1 : 0,
        transition: reduceMotion
          ? undefined
          : `opacity ${HIGHLIGHT_FADE_MS}ms ease`,
      }}
    >
      <div
        className="font-bold text-gray-800 dark:text-gray-100"
        style={{ fontSize: size.highlightTitleFont }}
      >
        {title}
      </div>
      {/* A div, not a p: content is authored markup and may contain lists, which
          can't legally nest inside a paragraph. The descendant styles put back what
          Tailwind's preflight resets, so entries can use plain <strong>/<ul> tags
          without repeating classes. */}
      <div
        className="text-gray-600 [&_li]:mt-0.5 [&_strong]:font-semibold [&_strong]:text-gray-800 [&_ul]:mt-1 [&_ul]:list-disc [&_ul]:pl-4 dark:text-gray-300 dark:[&_strong]:text-gray-100"
        style={{ fontSize: size.highlightBodyFont, marginTop: 4 * size.scale }}
      >
        {content}
      </div>
      {image && (
        <Image
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          className="rounded"
          style={{
            width: '100%',
            height: 'auto',
            marginTop: 8 * size.scale,
          }}
        />
      )}
    </div>
  )
}
