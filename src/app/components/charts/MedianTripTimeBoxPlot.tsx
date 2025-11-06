import React, { useEffect, useRef } from 'react'
import * as Plot from '@observablehq/plot'

type Row = {
  year: number
  trip_count: number
  duration_median: number
  duration_q1: number
  duration_q3: number
  null_rows?: number
  city?: string
}

interface Props {
  data: Row[]
  height?: number
  yLabel?: string
}

const DurationBoxPlot: React.FC<Props> = ({
  data,
  height = 320,
  yLabel = 'Trip Duration (minutes)',
}) => {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!ref.current || !data?.length) return

    const years = data.map((d) => d.year)
    const minYear = Math.min(...years)
    const maxYear = Math.max(...years)
    const yMax = Math.max(...data.map((d) => d.duration_q3)) * 1.1

    const plot = Plot.plot({
      grid: true,
      height,
      //   width: Math.max(height, years.length * (20 + 8)),

      marginLeft: 60,
      marginRight: 40,
      marginBottom: 40,
      x: {
        label: 'Year',
        domain: [minYear - 1, maxYear],
        tickFormat: (d: number) => d.toString(),
      },
      y: {
        label: yLabel,
        domain: [0, yMax],
      },
      marks: [
        // Box (Q1–Q3)
        Plot.ruleX(data, {
          x: 'year',
          y1: 'duration_q1',
          y2: 'duration_q3',
          strokeWidth: 18,
          stroke: '#999',
          opacity: 1,
        }),

        // Median line (horizontal)
        Plot.ruleY(data, {
          x1: (d) => d.year - 0.2,
          x2: (d) => d.year + 0.2,
          y: 'duration_median',
          stroke: 'black',
          strokeWidth: 2,
        }),
      ],
    })

    ref.current.innerHTML = ''
    ref.current.append(plot)

    return () => plot.remove()
  }, [data, height, yLabel])

  return <div ref={ref} />
}

export default DurationBoxPlot
