import { RefObject, useEffect, useRef, useState } from 'react'
import { NAME_COL_PX, ROW_GAP_PX } from './constants'

// Measures the bar track (chart width minus the name column and row gap) so each
// row can decide whether its value label fits inside the bar. Returns a ref to
// attach to the chart root and the current track width in px.
export const useTrackWidth = (): [RefObject<HTMLDivElement>, number] => {
  const rootRef = useRef<HTMLDivElement>(null)
  const [trackWidth, setTrackWidth] = useState(0)

  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const measure = () =>
      setTrackWidth(Math.max(0, el.clientWidth - NAME_COL_PX - ROW_GAP_PX))
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return [rootRef, trackWidth]
}
