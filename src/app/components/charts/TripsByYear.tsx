import _ from 'lodash'
import { useEffect, useState, useRef, Ref } from 'react'
import * as Plot from '@observablehq/plot'
import { YearlyTrip } from 'src/app/model/YearlyTrip'

type Props = {
  data: YearlyTrip[]
  marks?: Plot.Markish[]
}

export const TripsByYearChart = ({ data, marks = [] }: Props) => {
  const plotRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (data === undefined) return
    const plot = Plot.plot({
      marginLeft: 80,
      marginRight: 80,
      y: { grid: true },
      // Remove default commas from year
      x: { tickFormat: '' },
      marks: [
        Plot.ruleY([0]),
        Plot.lineY(data, {
          x: 'year',
          y: 'trip_count',
          stroke: 'system',
          marker: true,
        }),
        Plot.dot(data, {
          ...Plot.pointer({ x: 'year', y: 'trip_count', fill: 'red', r: 3 }),
          channels: { system: 'system' },
          tip: true,
        }),

        ...marks,
      ],
    })

    plotRef.current && plotRef.current.append(plot)
    return () => plot.remove()
  }, [data])

  return (
    <div>
      <div ref={plotRef} />
    </div>
  )
}

export default TripsByYearChart
