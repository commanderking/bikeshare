import React, { useEffect, useRef } from 'react'
import * as Plot from '@observablehq/plot'
import { YearlyTripWithSystem } from '@/app/model/YearlyTrip'

type Row = YearlyTripWithSystem

interface Props {
  data: Row[]
  height?: number
  xLabel?: string
}

const barHeight = 28

const DurationBoxPlotHorizontal: React.FC<Props> = ({
  data,
  height = 320,
  xLabel = 'Trip Duration (minutes)',
}) => {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!ref.current || !data?.length) return

    const cities = data.map((d) => d.metroArea)
    const xMax = Math.max(...data.map((d) => d.duration_95_percent)) * 0.7

    const plot = Plot.plot({
      grid: true,
      height: Math.max(height, cities.length * (barHeight + 10)),
      style: {
        fontSize: '20',
      },
      width: 600,
      marginLeft: 150,
      marginRight: 30,
      marginBottom: 60,
      marginTop: 20,
      x: {
        domain: [0, xMax],
        label: null,
        tickFormat: (d: number) => d.toFixed(0),
      },
      y: {
        label: null,
        domain: cities,
        padding: 0.3,
      },
      marks: [
        // Bottom axis (labeled)
        Plot.axisX({ anchor: 'bottom', label: xLabel }),

        // Whiskers (lower → Q1)
        Plot.ruleY(data, {
          y: 'metroArea',
          x1: 'duration_5_percent',
          x2: 'duration_q1',
          stroke: '#888',
          strokeWidth: 2,
        }),

        // Whiskers (Q3 → upper)
        Plot.ruleY(data, {
          y: 'metroArea',
          x1: 'duration_q3',
          x2: 'duration_95_percent',
          stroke: '#888',
          strokeWidth: 2,
        }),

        // Small caps at each whisker end
        Plot.ruleY(data, {
          y: 'metroArea',
          x1: (d) => d.duration_5_percent,
          x2: (d) => d.duration_5_percent,
          stroke: '#888',
          strokeWidth: 4,
        }),
        Plot.ruleY(data, {
          y: 'metroArea',
          x1: (d) => d.duration_95_percent,
          x2: (d) => d.duration_95_percent,
          stroke: '#888',
          strokeWidth: 4,
        }),

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
          fontSize: 16,
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
