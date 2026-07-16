'use client'

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import Biker from '.'
import { CITY_BIKE_CONFIG, CONFIGURED_CITY_IDS } from './cityBikeConfig'
import { systems } from '@/app/constants/cities'

// SVG viewBox is 200x112, so height is width * this.
const BIKER_ASPECT = 112 / 200
// Ground line's y position within the 112-tall viewBox, matching Biker's showGround.
const GROUND_Y = 105
const GROUND_COLOR = '#ccc'

// How long each biker sits on screen before riding off (ms).
const DEFAULT_RIDE_MS = 3000
// How long the ride-off / ride-in transitions take (ms).
const EXIT_MS = 1200
const ENTER_MS = 1200

// Padding past the container edge so the biker fully clears the frame.
const OFFSCREEN_PAD = 40

// useLayoutEffect warns during SSR; fall back to useEffect on the server.
const useIsoLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect

type Phase = 'riding' | 'exiting' | 'entering'

interface CyclingBikerProps {
  /** Width of the biker in px. */
  width?: number
  /** Time each biker stays on screen before riding off, in ms. */
  interval?: number
  className?: string
  style?: React.CSSProperties
}

function shuffle<T>(input: readonly T[]): T[] {
  const a = [...input]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * A single biker that cycles through every city's bike livery: it starts as a
 * random city, rides off the right edge every `interval` ms, and a different
 * city rides in from the left. No city repeats until all have been shown (a new
 * shuffled pass starts once the current one is exhausted, avoiding a back-to-back
 * repeat across the seam).
 */
const CyclingBiker: React.FC<CyclingBikerProps> = ({
  width = 200,
  interval = DEFAULT_RIDE_MS,
  className,
  style,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)

  // Play order + how far through it we are. Refs so the timer loop always reads
  // the latest value without re-subscribing. Start with the deterministic city
  // order so SSR and the first client render match; the real shuffle + random
  // start happen in the mount effect below (before paint), avoiding a hydration
  // mismatch.
  const orderRef = useRef<string[]>([...CONFIGURED_CITY_IDS])
  const posRef = useRef(0)
  const phaseRef = useRef<Phase>('riding')

  const [cityId, setCityId] = useState(CONFIGURED_CITY_IDS[0])
  const [x, setX] = useState(0)
  const [transition, setTransition] = useState('none')
  // Hidden until the mount effect has positioned the biker, so it never flashes
  // at the un-centered SSR/first-paint position.
  const [ready, setReady] = useState(false)

  // Horizontal anchor positions in px, recomputed from the container width.
  const geomRef = useRef({
    center: 0,
    offLeft: -width - OFFSCREEN_PAD,
    offRight: width + OFFSCREEN_PAD,
  })

  useIsoLayoutEffect(() => {
    const timers: number[] = []
    const rafs: number[] = []

    const computeGeom = () => {
      const w = containerRef.current?.offsetWidth ?? 0
      geomRef.current = {
        center: Math.max(0, (w - width) / 2),
        offLeft: -width - OFFSCREEN_PAD,
        offRight: w + OFFSCREEN_PAD,
      }
    }

    // Advance the play order, reshuffling for a new pass when exhausted and
    // making sure the seam doesn't repeat the city we just showed.
    const nextCity = () => {
      posRef.current += 1
      if (posRef.current >= orderRef.current.length) {
        const last = orderRef.current[orderRef.current.length - 1]
        const fresh = shuffle(CONFIGURED_CITY_IDS)
        if (fresh.length > 1 && fresh[0] === last) {
          ;[fresh[0], fresh[1]] = [fresh[1], fresh[0]]
        }
        orderRef.current = fresh
        posRef.current = 0
      }
      return orderRef.current[posRef.current]
    }

    const scheduleExit = () => {
      timers.push(window.setTimeout(exit, interval))
    }

    const exit = () => {
      phaseRef.current = 'exiting'
      // Ease-in: accelerate away toward the right edge.
      setTransition(`transform ${EXIT_MS}ms cubic-bezier(0.45, 0, 0.9, 0.4)`)
      setX(geomRef.current.offRight)
      timers.push(window.setTimeout(afterExit, EXIT_MS))
    }

    const afterExit = () => {
      // Swap to the next city and drop it just off the left edge instantly.
      setCityId(nextCity())
      phaseRef.current = 'entering'
      setTransition('none')
      setX(geomRef.current.offLeft)
      // Two frames later (so the reposition has painted) ride in to center.
      rafs.push(
        requestAnimationFrame(() => {
          rafs.push(
            requestAnimationFrame(() => {
              // Ease-out: coast in and settle at center.
              setTransition(
                `transform ${ENTER_MS}ms cubic-bezier(0.1, 0.7, 0.3, 1)`
              )
              setX(geomRef.current.center)
              timers.push(window.setTimeout(afterEnter, ENTER_MS))
            })
          )
        })
      )
    }

    const afterEnter = () => {
      phaseRef.current = 'riding'
      scheduleExit()
    }

    const onResize = () => {
      computeGeom()
      // Keep a stationary biker centered; mid-transition ones finish on their own.
      if (phaseRef.current === 'riding') {
        setTransition('none')
        setX(geomRef.current.center)
      }
    }

    // Now that we're client-side, shuffle for a random start (no hydration
    // mismatch since this runs after the initial render), then center and begin.
    orderRef.current = shuffle(CONFIGURED_CITY_IDS)
    posRef.current = 0
    setCityId(orderRef.current[0])
    computeGeom()
    setTransition('none')
    setX(geomRef.current.center)
    setReady(true)
    scheduleExit()

    window.addEventListener('resize', onResize)
    return () => {
      timers.forEach(clearTimeout)
      rafs.forEach(cancelAnimationFrame)
      window.removeEventListener('resize', onResize)
    }
    // Intentionally run once on mount; `width`/`interval` changes are rare and a
    // remount is the clean way to pick them up.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const config = CITY_BIKE_CONFIG[cityId]

  const cityName = systems[cityId]?.metroArea

  return (
    <div className={className} style={{ width: '100%', ...style }}>
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          width: '100%',
          height: width * BIKER_ASPECT,
          overflow: 'hidden',
        }}
      >
        {/* Fixed ground line spanning the track, so it stays put as bikers ride
          across it (matches Biker's built-in showGround position + scale). */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: (GROUND_Y / 112) * width * BIKER_ASPECT,
            height: Math.max(1, width / 200),
            background: GROUND_COLOR,
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            transform: `translateX(${x}px)`,
            transition,
            willChange: 'transform',
            visibility: ready ? 'visible' : 'hidden',
          }}
        >
          <Biker
            width={width}
            colors={config.colors}
            basketType={config.basketType}
            skirtGuard={config.skirtGuard}
            downTube={config.downTube}
            wave={false}
            speedBursts={false}
          />
        </div>
      </div>
      {/* City name for the biker currently on screen, under the ground line. */}
      <div
        style={{
          textAlign: 'center',
          marginTop: 8,
          fontWeight: 600,
          visibility: ready ? 'visible' : 'hidden',
        }}
      >
        {cityName}
      </div>
    </div>
  )
}

export default CyclingBiker
