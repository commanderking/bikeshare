import { useEffect, useRef } from 'react'
import * as Plot from '@observablehq/plot'
import { YearlyTrip, AggregatedTrip } from 'src/app/model/YearlyTrip'

type Props = {
  data: YearlyTrip[] | AggregatedTrip[]
  marks?: Plot.Markish[]
}

const LatestYearChart = ({ data, marks = [] }: Props) => {
  const plotRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (data.length === 0) return

    const plot = Plot.plot({
      marginLeft: 100,
      marginBottom: 60,
      marginRight: 40,
      x: {
        grid: true,
        tickRotate: 20,
      },
      marks: [
        Plot.barX(data, {
          x: 'trip_count',
          y: 'system',
          sort: { y: 'x', reverse: true },
        }),
      ],
    })
    while (plotRef.current?.firstChild) {
      plotRef.current.removeChild(plotRef.current.firstChild)
    }
    plotRef.current && plotRef.current.append(plot)
  }, [data])

  return <div ref={plotRef}></div>
}

export default LatestYearChart
