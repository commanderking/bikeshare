'use client'

import { useCallback, useEffect, useMemo, useRef } from 'react'

// Half amplitude. The bell is a foreground sound over a silent chart, so full
// scale reads as a shout.
const GAIN = 0.1

// Shortest gap between two rings. Passes can land within hundredths of a second of
// each other, which would machine-gun; this collapses a cluster into one strike.
const MIN_GAP_MS = 150

type Bell = {
  /**
   * Start the audio pipeline. Must be called from a user gesture — browsers refuse
   * to start an AudioContext without one, and the race autoplays, so there is no
   * gesture to piggyback on. Safe to call repeatedly.
   */
  arm: () => void
  /** Strike the bell, unless one just rang. No-op until `arm` has loaded the clip. */
  ring: () => void
}

/**
 * A bell that can overlap itself. Decodes the clip once and spends a throwaway
 * source node per strike — a single <audio> element cannot restart mid-play, so
 * two passes close together would cut each other off.
 */
export const useBell = (src: string): Bell => {
  const contextRef = useRef<AudioContext | null>(null)
  const bufferRef = useRef<AudioBuffer | null>(null)
  const gainRef = useRef<GainNode | null>(null)
  const lastRingRef = useRef(0)

  useEffect(
    () => () => {
      void contextRef.current?.close()
      contextRef.current = null
      bufferRef.current = null
      gainRef.current = null
    },
    []
  )

  const arm = useCallback(() => {
    if (contextRef.current) {
      void contextRef.current.resume()
      return
    }
    const AudioCtor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext
    if (!AudioCtor) return

    const context = new AudioCtor()
    contextRef.current = context
    const gain = context.createGain()
    gain.gain.value = GAIN
    gain.connect(context.destination)
    gainRef.current = gain
    void fetch(src)
      .then((response) => response.arrayBuffer())
      .then((bytes) => context.decodeAudioData(bytes))
      .then((buffer) => {
        bufferRef.current = buffer
      })
      // A missing or undecodable clip just leaves the bell silent; the race is
      // perfectly watchable without it.
      .catch(() => {
        bufferRef.current = null
      })
  }, [src])

  const ring = useCallback(() => {
    const context = contextRef.current
    const buffer = bufferRef.current
    const gain = gainRef.current
    if (!context || !buffer || !gain) return

    const now = performance.now()
    if (now - lastRingRef.current < MIN_GAP_MS) return
    lastRingRef.current = now

    const source = context.createBufferSource()
    source.buffer = buffer
    source.connect(gain)
    source.start()
  }, [])

  // Memoised so the frame loop that depends on it is not rebuilt every render.
  return useMemo(() => ({ arm, ring }), [arm, ring])
}
