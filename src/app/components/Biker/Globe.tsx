'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { geoOrthographic, geoPath, geoDistance } from 'd3-geo'
import type { GeoPermissibleObjects } from 'd3-geo'

// Colors: gray outlines for both the globe rim and country borders, white land.
const OUTLINE_COLOR = '#9ca3af' // country borders
const SPHERE_COLOR = '#9ca3af' // globe rim
const OCEAN_COLOR = '#ffffff'
const LAND_COLOR = '#ffffff'
const MARKER_COLOR = '#ef4444' // dot at the current city

// How long the spin from one city to the next takes (ms).
const SPIN_MS = 1000
// Map-content zoom (the outer ring is fixed; only the map inside scales). The
// globe rests zoomed IN on the current city, and pulls back to the full globe
// only while rotating to the next one.
const ZOOM_REST = 1.6 // settled, zoomed-in on the city
const ZOOM_TRAVEL = 1.0 // pulled back to the full globe mid-spin
// Label text color under the marker.
const LABEL_COLOR = '#374151'

interface GlobeProps {
  /** Longitude of the city to face toward the viewer. */
  longitude: number
  /** Latitude of the city to face toward the viewer. */
  latitude: number
  /** City name to label next to the marker. */
  city?: string
  /** Diameter of the globe in px. */
  size?: number
  className?: string
  style?: React.CSSProperties
}

type Rotation = [number, number]

// Orthographic rotation that puts [lng, lat] dead-center facing the viewer.
const rotationFor = (lng: number, lat: number): Rotation => [-lng, -lat]

// Shortest signed angular delta from a to b, wrapped to [-180, 180].
const shortestDelta = (a: number, b: number): number => {
  const d = ((b - a) % 360 + 540) % 360 - 180
  return d
}

const easeCubicInOut = (t: number): number =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

// Zoom across a spin: rest (zoomed in) → travel (full globe) → rest. The globe
// starts and ends at ZOOM_REST, dipping to ZOOM_TRAVEL at the midpoint, so it
// pulls back to rotate and then settles back in — without popping to full globe.
const zoomAt = (t: number): number =>
  ZOOM_REST - (ZOOM_REST - ZOOM_TRAVEL) * Math.sin(Math.PI * t)

/**
 * A small orthographic globe with gray country outlines on a white land/ocean
 * fill and a gray rim. It smoothly spins to face `[longitude, latitude]` and
 * marks that spot with a dot whenever the coordinates change.
 */
const Globe: React.FC<GlobeProps> = ({
  longitude,
  latitude,
  city,
  size = 150,
  className,
  style,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [features, setFeatures] = useState<GeoPermissibleObjects[]>([])

  // The rotation currently painted, the spot the marker sits on, and the current
  // zoom factor (1 at rest, <1 mid-spin). Refs so the rAF loop always reads the
  // latest without re-subscribing.
  const rotationRef = useRef<Rotation>(rotationFor(longitude, latitude))
  const markerRef = useRef<[number, number]>([longitude, latitude])
  const zoomRef = useRef(ZOOM_REST)
  const hasFacedRef = useRef(false)
  const rafRef = useRef<number>()

  // Load the low-res world outlines once.
  useEffect(() => {
    let cancelled = false
    fetch('./world_countries.geojson')
      .then((r) => r.json())
      .then((geo) => {
        if (!cancelled) setFeatures(geo.features)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
    const [lng, lat] = markerRef.current
    const rotation = rotationRef.current

    // The outer ring stays static: a base projection (never zoomed) draws the
    // ocean disc + rim and clips everything inside. Inset a hair so the rim
    // stroke isn't cut off by the canvas edge.
    const extent: [[number, number], [number, number]] = [
      [1, 1],
      [size - 1, size - 1],
    ]
    const base = geoOrthographic().rotate(rotation).fitExtent(extent, {
      type: 'Sphere',
    })
    const basePath = geoPath(base, ctx)

    // Only the map content zooms: same center, radius scaled by the spin zoom.
    const zoomed = geoOrthographic().rotate(rotation).fitExtent(extent, {
      type: 'Sphere',
    })
    zoomed.scale(zoomed.scale() * zoomRef.current)
    const zoomPath = geoPath(zoomed, ctx)

    ctx.save()
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, size, size)

    // Static ocean disc.
    ctx.beginPath()
    basePath({ type: 'Sphere' })
    ctx.fillStyle = OCEAN_COLOR
    ctx.fill()

    // Clip the zooming content to the static ring so it can't spill past it.
    ctx.save()
    ctx.beginPath()
    basePath({ type: 'Sphere' })
    ctx.clip()

    // Country land + borders. Orthographic clipping hides the far side for us.
    ctx.beginPath()
    for (const f of features) zoomPath(f)
    ctx.fillStyle = LAND_COLOR
    ctx.fill()
    ctx.lineWidth = Math.max(0.5, size / 250)
    ctx.strokeStyle = OUTLINE_COLOR
    ctx.stroke()

    // Marker dot + label, only when the city is on the near (visible) hemisphere.
    const center: [number, number] = [-rotation[0], -rotation[1]]
    if (geoDistance([lng, lat], center) < Math.PI / 2) {
      const p = zoomed([lng, lat])
      if (p) {
        const r = Math.max(2, size / 45)
        ctx.beginPath()
        ctx.arc(p[0], p[1], r, 0, 2 * Math.PI)
        ctx.fillStyle = MARKER_COLOR
        ctx.fill()

        if (city) {
          ctx.font = `600 ${Math.max(10, size / 12)}px system-ui, -apple-system, sans-serif`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'top'
          ctx.lineJoin = 'round'
          const labelY = p[1] + r + 3
          // White halo so the label stays legible over country lines.
          ctx.lineWidth = 3
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)'
          ctx.strokeText(city, p[0], labelY)
          ctx.fillStyle = LABEL_COLOR
          ctx.fillText(city, p[0], labelY)
        }
      }
    }

    ctx.restore() // drop the ring clip

    // Static rim on top, so it reads as a crisp, unmoving edge.
    ctx.beginPath()
    basePath({ type: 'Sphere' })
    ctx.lineWidth = Math.max(1, size / 120)
    ctx.strokeStyle = SPHERE_COLOR
    ctx.stroke()

    ctx.restore()
  }, [features, size, city])

  // Keep the canvas backing store sized for the device pixel ratio.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    canvas.width = size * dpr
    canvas.height = size * dpr
    draw()
  }, [size, draw])

  // Redraw when the outlines finish loading.
  useEffect(() => {
    draw()
  }, [features, draw])

  // Spin to the new city whenever coordinates change (snap on the first face).
  useEffect(() => {
    const target = rotationFor(longitude, latitude)

    if (!hasFacedRef.current) {
      hasFacedRef.current = true
      rotationRef.current = target
      markerRef.current = [longitude, latitude]
      draw()
      return
    }

    if (rafRef.current) cancelAnimationFrame(rafRef.current)

    const start = rotationRef.current
    const dLambda = shortestDelta(start[0], target[0])
    const dPhi = shortestDelta(start[1], target[1])
    markerRef.current = [longitude, latitude]
    const t0 = performance.now()

    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / SPIN_MS)
      const e = easeCubicInOut(t)
      rotationRef.current = [start[0] + dLambda * e, start[1] + dPhi * e]
      // Pull back to the full globe to rotate, then settle back in on the city.
      zoomRef.current = zoomAt(t)
      draw()
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        zoomRef.current = ZOOM_REST
      }
    }
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [longitude, latitude, draw])

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className={className}
      style={{ width: size, height: size, ...style }}
      aria-hidden="true"
    />
  )
}

export default Globe
