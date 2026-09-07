import { useEffect, useRef } from 'react'

// Spacebar as play/pause, for fullscreen — where the controls are hidden and there's
// nothing else to click. Bound to the document so it fires wherever focus landed
// inside the fullscreen element.
export const useSpacebarPlayPause = (
  enabled: boolean,
  onPlayPause: () => void
) => {
  // The handler closes over fresh state (`ended`, the clock) and so is a new function
  // every render; parking it in a ref keeps the listener bound once per enable rather
  // than re-subscribing on each of the race's ~200 month re-renders.
  const playPauseRef = useRef(onPlayPause)
  playPauseRef.current = onPlayPause

  useEffect(() => {
    if (!enabled) return
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore auto-repeat: holding the key down would otherwise toggle every tick.
      if (event.code !== 'Space' || event.repeat) return
      event.preventDefault() // Space would otherwise scroll or re-fire a focused button
      playPauseRef.current()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [enabled])
}
