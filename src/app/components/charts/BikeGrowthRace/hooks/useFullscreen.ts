import { RefObject, useCallback, useEffect, useState } from 'react'

// Drives the browser Fullscreen API for a single element. `isFullscreen` tracks
// the actual fullscreen element via the fullscreenchange event, so pressing Esc
// (which we don't handle ourselves) still flips the state back.
export const useFullscreen = (ref: RefObject<HTMLElement>) => {
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const handleChange = () =>
      setIsFullscreen(document.fullscreenElement === ref.current)
    document.addEventListener('fullscreenchange', handleChange)
    return () =>
      document.removeEventListener('fullscreenchange', handleChange)
  }, [ref])

  const toggle = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen()
    else ref.current?.requestFullscreen()
  }, [ref])

  return { isFullscreen, toggle }
}
