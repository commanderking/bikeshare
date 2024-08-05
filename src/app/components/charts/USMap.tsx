import _ from 'lodash'
import { useEffect, useState, useRef, Ref } from 'react'
import * as Plot from '@observablehq/plot'
import { YearlyTrip } from 'src/app/model/YearlyTrip'

type Props = {
  data: YearlyTrip[]
  marks?: Plot.Markish[]
}

const currentYear = new Date().getFullYear()

export const USMapChart = ({ data, marks = [] }: Props) => {
  const [geoJSON, setGeoJSON] = useState(null)
  const fetchGeoJson = async () => {
    const response = await fetch('./contiguous_usa.geojson')
    const data = await response.json()
    setGeoJSON(data)
  }
  useEffect(() => {
    fetchGeoJson()
  }, [])

  const plotRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (geoJSON === null) return
    const plot = Plot.plot({
      r: { range: [2, 10] },
      marginLeft: 10,
      marginRight: 10,
      projection: 'albers',
      marks: [
        Plot.geo(geoJSON),
        Plot.dot(data, {
          x: 'longitude',
          y: 'latitude',
          r: 'trip_count',
          stroke: 'blue',
          fill: 'blue',
          fillOpacity: 0.5,
        }),
        Plot.tip(
          data,
          Plot.pointer({
            x: 'longitude',
            y: 'latitude',
            title: (d) => {
              return [
                `${d.metroArea} - ${d.systemName}`,
                `Trips: ${d.trip_count.toLocaleString()}`,
              ].join('\n\n')
            },
            fontSize: 14,
          })
        ),
      ],
    })

    plotRef.current && plotRef.current.append(plot)
    return () => plot.remove()
  }, [geoJSON, data])

  return (
    <div>
      <div ref={plotRef} />
    </div>
  )
}

export default USMapChart
