import React, { useEffect, useRef } from 'react'
import * as Plot from '@observablehq/plot'

type Row = {
  year?: number
  trip_count?: number
  duration_median: number
  duration_q1: number
  duration_q3: number
  null_rows?: number
  city: string
  metroArea: string
}

interface Props {
  data: Row[]
  height?: number
  xLabel?: string
}

const barHeight = 20

const DurationBoxPlotHorizontal: React.FC<Props> = ({
  data,
  height = 320,
  xLabel = 'Trip Duration (minutes)',
}) => {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!ref.current || !data?.length) return

    const cities = data.map((d) => d.metroArea)
    const xMax = Math.max(...data.map((d) => d.duration_q3)) * 1.1

    const plot = Plot.plot({
      grid: true,
      height: Math.max(height, cities.length * (barHeight + 8)),
      marginLeft: 110,
      marginRight: 30,
      marginBottom: 40,
      marginTop: 40,
      x: {
        domain: [0, xMax],
        label: null,
        tickFormat: (d: number) => d.toFixed(0),
      },
      y: {
        label: null,
        domain: cities,
        padding: 0.1,
      },
      marks: [
        // Bottom axis (labeled)
        Plot.axisX({ anchor: 'bottom', label: xLabel }),

        // Box (Q1–Q3)
        Plot.ruleY(data, {
          y: 'metroArea',
          x1: 'duration_q1',
          x2: 'duration_q3',
          strokeWidth: barHeight,
          stroke: '#bfbfbf',
        }),

        // Median line (horizontal, thick)
        Plot.ruleY(data, {
          y: 'metroArea',
          x1: (d) => d.duration_median - 0.1,
          x2: (d) => d.duration_median + 0.1,
          stroke: 'black',
          strokeWidth: barHeight,
        }),

        // Label for median line
        Plot.text(data, {
          y: 'metroArea',
          x: (d) => d.duration_median + 0.5,
          text: (d) => d.duration_median.toFixed(1),
          fontSize: 9,
          fill: '#333',
          textAnchor: 'start',
          dx: 2,
        }),
      ],
    })

    ref.current.innerHTML = ''
    ref.current.append(plot)

    return () => plot.remove()
  }, [data, height, xLabel])

  return <div ref={ref} />
}

export default DurationBoxPlotHorizontal
