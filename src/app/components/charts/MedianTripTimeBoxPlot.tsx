import React, { useEffect, useRef } from 'react'
import * as Plot from '@observablehq/plot'
import { YearlyTripWithSystem } from '@/app/model/YearlyTrip'

type Row = YearlyTripWithSystem

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
    const yMax =
      Math.max(...data.map((d) => d.duration_95_percent ?? d.duration_q3)) * 1.1

    const plot = Plot.plot({
      grid: true,
      height,
      width: years.length * 75,
      marginLeft: 60,
      marginRight: 40,
      marginBottom: 40,

      x: {
        label: 'Year',
        domain: [minYear - 1, maxYear + 1],
        tickFormat: (d: number) => d.toString(),
      },
      y: {
        label: yLabel,
        domain: [0, yMax],
      },

      marks: [
        // Whiskers (vertical lines from 5% to 95%)
        Plot.ruleX(data, {
          x: 'year',
          y1: 'duration_5_percent',
          y2: 'duration_95_percent',
          stroke: '#888',
          strokeWidth: 2,
          opacity: 0.9,
        }),

        // Box (Q1–Q3)
        Plot.ruleX(data, {
          x: 'year',
          y1: 'duration_q1',
          y2: 'duration_q3',
          strokeWidth: 30,
          stroke: '#bfbfbf',
          opacity: 1,
        }),

        // Median line (horizontal)
        Plot.ruleY(data, {
          x1: (d) => d.year - 0.3,
          x2: (d) => d.year + 0.3,
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
