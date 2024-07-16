import { useEffect, useRef } from 'react'
import * as Plot from '@observablehq/plot'
import { YearlyTrip, AggregatedTrip } from 'src/app/model/YearlyTrip'

type Props = {
  data: YearlyTrip[] | AggregatedTrip[]
  marks?: Plot.Markish[]
}

const StackedByYear = ({ data, marks = [] }: Props) => {
  const plotRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (data.length === 0) return

    const plot = Plot.plot({
      y: { grid: true },
      marginLeft: 80,

      x: { tickFormat: '' },
      marks: [
        Plot.rectY(data, {
          x: 'year',
          y: 'trip_count',
          fill: 'black',
          tip: true,
        }),
        Plot.ruleY([0]),
        Plot.rectY(data, {
          fill: 'red',
          x: 'year',
          y: 'trip_count',
          filter: (data) => data.year === 2023,
        }),
        ...marks,
      ],
    })
    while (plotRef.current?.firstChild) {
      plotRef.current.removeChild(plotRef.current.firstChild)
    }
    plotRef.current && plotRef.current.append(plot)
  }, [data])

  return <div ref={plotRef}></div>
}

export default StackedByYear
