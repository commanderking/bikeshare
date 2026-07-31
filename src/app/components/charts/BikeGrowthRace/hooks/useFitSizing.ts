import { RefObject, useState } from 'react'
import { useIsomorphicLayoutEffect } from '@/app/components/charts/AllTimeTripsBar/motion'
import { TOP_N } from '../constants'
import { BASE_SIZE, scaleToRowHeight, SizeScale } from '../sizing'

// Cap the fullscreen row height: past this the bikers/text read as oversized and
// the track floats in too much empty space on very tall displays.
const MAX_ROW_HEIGHT = 72

// The layout dimensions to render at. Normal size keeps the fixed constants; in
// fullscreen the row height is the measured track area divided across the visible
// cities (clamped), and every other size scales off it. The track area is observed
// so the fit re-settles when the window/display changes underneath fullscreen.
export const useFitSizing = (
  trackAreaRef: RefObject<HTMLElement>,
  isFullscreen: boolean
): SizeScale => {
  const [size, setSize] = useState<SizeScale>(BASE_SIZE)

  useIsomorphicLayoutEffect(() => {
    const element = trackAreaRef.current
    if (!isFullscreen || !element) {
      setSize(BASE_SIZE)
      return
    }
    const measure = () => {
      const rowHeight = Math.min(element.clientHeight / TOP_N, MAX_ROW_HEIGHT)
      setSize(scaleToRowHeight(rowHeight))
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [isFullscreen, trackAreaRef])

  return size
}
