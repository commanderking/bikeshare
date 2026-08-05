import { RefObject, useState } from 'react'
import { useIsomorphicLayoutEffect } from '@/app/components/charts/AllTimeTripsBar/motion'
import {
  BASE_ZOOM_SIZE,
  BASE_ZOOM_STAGE_HEIGHT,
  makeZoomSize,
  ZoomSize,
} from '../render/zoomLayout'

// Cap the fullscreen scale so bikers/text don't read as oversized on tall displays.
const MAX_SCALE = 1.7

// The zoom view's pixel sizing. Normal size keeps the base values; in fullscreen
// the whole stage scales to fill the measured track area (clamped, never below 1),
// so Paris, the pack, bikers, and text all grow together. The track area is
// observed so the fit re-settles when the window/display changes.
export const useZoomFit = (
  trackAreaRef: RefObject<HTMLElement>,
  isFullscreen: boolean
): ZoomSize => {
  const [size, setSize] = useState<ZoomSize>(BASE_ZOOM_SIZE)

  useIsomorphicLayoutEffect(() => {
    const element = trackAreaRef.current
    if (!isFullscreen || !element) {
      setSize(BASE_ZOOM_SIZE)
      return
    }
    const measure = () => {
      const scale = Math.min(
        Math.max(element.clientHeight / BASE_ZOOM_STAGE_HEIGHT, 1),
        MAX_SCALE
      )
      setSize(makeZoomSize(scale))
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [isFullscreen, trackAreaRef])

  return size
}
