import React, { useEffect, useRef } from 'react'
import * as Plot from '@observablehq/plot'

type DurationRow = {
  bucket: number
  count: number
  year: number
  city: string
}

interface Props {
  data: DurationRow[]
  width?: number
  height?: number
}

const DurationHistogram: React.FC<Props> = ({
  data,
  width = 800,
  height = 400,
}) => {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!ref.current || !data?.length) return

    // --- Compute bin width dynamically (assuming uniform bins)
    const sorted = [...data].sort((a, b) => a.bucket - b.bucket)
    const binWidth =
      sorted.length > 1 ? sorted[1].bucket - sorted[0].bucket : 180

    // --- Convert to ranged bins for rectY
    const ranged = sorted.map((d) => ({
      x1: d.bucket,
      x2: d.bucket + binWidth,
      y: d.count,
      year: d.year,
      city: d.city,
    }))

    // --- Clear previous plots
    ref.current.innerHTML = ''

    // --- Create Plot
    const plot = Plot.plot({
      width,
      height,
      grid: true,
      marginLeft: 70,
      marginBottom: 50,
      x: {
        label: 'Trip Duration (minutes)',
      },
      y: {
        label: 'Number of Trips',
        grid: true,
      },
      marks: [
        Plot.rectY(ranged, {
          x1: 'x1',
          x2: 'x2',
          y: 'y',
          fill: '#3b82f6', // Tailwind blue-500
          title: (d) =>
            `${d.city} ${d.year}\n${d.x1}–${d.x2} min\n${d.y.toLocaleString()} trips`,
        }),
      ],
    })

    ref.current.append(plot)

    // --- Cleanup on rerender
    return () => plot.remove()
  }, [data, width, height])

  return <div ref={ref} />
}

export default DurationHistogram
