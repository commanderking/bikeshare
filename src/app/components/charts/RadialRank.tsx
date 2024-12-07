import * as Plot from '@observablehq/plot'
import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { Rating } from '@/app/model/Ratings'
/** Completeness scores:
 * 5 - 100%
 * 4 - 99%+
 * 3 -
 **/

type Options = {
  hideLegend?: boolean
  showFullCategories?: boolean
}

const getPoints = (data: Rating[], options: Options | undefined) => {
  const columns = 3

  const startingCount = options?.hideLegend ? 0 : 1
  const points = d3
    .sort(
      data,
      (d) =>
        (d.accessible +
          d.complete * 2 +
          d.processable * 1.5 +
          d.fresh +
          d.documented +
          d.unique) *
        -1
    )
    .flatMap(({ name, ...values }, i) =>
      Object.entries(values).map(([key, raw]) => ({
        name,
        key,
        raw,
        fx: (i + startingCount) % columns,
        fy: Math.floor((i + startingCount) / columns),
        value: 0,
      }))
    )
  const pointsWithValue = d3.group(points, (d) => d.key)
  for (const [, g] of d3.group(points, (d) => d.key)) {
    for (const d of g) d.value = d.raw / 5
  }

  console.log({ points })
  return points
}

type Props = {
  data: Rating[]
  options?: Options
}

const RadialRank = ({ data, options }: Props) => {
  const plotRef = useRef<HTMLDivElement>(null)
  const points = getPoints(data, options)

  const longitude = d3
    .scalePoint(new Set(Plot.valueof(points, 'key')), [180, -180])
    .padding(0.5)
    .align(0.5)

  useEffect(() => {
    console.log({ points })
    const plot = Plot.plot({
      width: Math.max(500, 600),
      marginBottom: 10,
      projection: {
        type: 'azimuthal-equidistant',
        rotate: [0, -90],
        // Note: 1.22° corresponds to max. percentage (1.0), plus some room for the labels
        domain: d3.geoCircle().center([0, 90]).radius(1.22)(),
      },
      facet: {
        data: points,
        x: 'fx',
        y: 'fy',
        // @ts-ignore removes fx and fy labels
        axis: null,
        marginRight: 20,
        marginBottom: 20,
      },
      marks: [
        // Facet name
        Plot.text(
          points,
          Plot.selectFirst({
            text: 'name',
            frameAnchor: 'bottom',
            fontWeight: '400',
            fontSize: 14,
            // y: 0,
          })
        ),

        // grey discs
        Plot.geo([1.0, 0.8, 0.6, 0.4, 0.2], {
          geometry: (r) => d3.geoCircle().center([0, 90]).radius(r)(),
          stroke: 'black',
          fill: 'black',
          strokeOpacity: 0.2,
          fillOpacity: 0.02,
          strokeWidth: 0.5,
        }),

        // white axes
        Plot.link(longitude.domain(), {
          x1: longitude,
          y1: 90 - 0.8,
          x2: 0,
          y2: 90,
          stroke: 'white',
          strokeOpacity: 0.5,
          strokeWidth: 2.5,
        }),

        // tick labels
        // Plot.text([0.4, 0.6, 0.8], {
        //   fx: 0,
        //   fy: 0,
        //   x: 180,
        //   y: (d) => 90 - d,
        //   dx: 2,
        //   textAnchor: 'start',
        //   text: (d) => (d == 0.8 ? `${100 * d}th percentile` : `${100 * d}th`),
        //   fill: 'currentColor',
        //   stroke: 'white',
        //   fontSize: 12,
        // }),

        // axes labels
        Plot.text(longitude.domain(), {
          fx: 0,
          fy: 0,
          x: longitude,
          y: 90 - 1.07,
          text: Plot.identity,
          lineWidth: 5,
          fontSize: 14,
        }),

        // axes labels, initials
        Plot.text(longitude.domain(), {
          fx: 0,
          fy: 0,
          facet: 'exclude',
          x: longitude,
          y: 90 - 1.09,
          text: (d) => d.slice(0, 1),
          lineWidth: 10,
        }),

        // areas
        Plot.area(points, {
          x1: ({ key }) => longitude(key),
          y1: ({ value }) => 90 - value,
          x2: 0,
          y2: 90,
          fill: '#4269D0',
          fillOpacity: 0.25,
          stroke: '#4269D0',
          curve: 'cardinal-closed',
        }),

        // points
        Plot.dot(points, {
          x: ({ key }) => longitude(key),
          y: ({ value }) => 90 - value,
          fill: '#4269D0',
          stroke: 'white',
        }),

        // interactive labels
        // Plot.text(
        //   points,
        //   Plot.pointer({
        //     x: ({ key }) => longitude(key),
        //     y: ({ value }) => 90 - value,
        //     text: (d) => `${d.raw}\n(${Math.round(100 * d.value)}%)`,
        //     textAnchor: 'start',
        //     dx: 4,
        //     fill: 'currentColor',
        //     stroke: 'white',
        //     maxRadius: 10,
        //     fontSize: 12,
        //   })
        // ),
      ],
    })
    while (plotRef.current?.firstChild) {
      plotRef.current.removeChild(plotRef.current.firstChild)
    }
    plotRef.current && plotRef.current.append(plot)
  }, [data])

  return <div ref={plotRef}></div>
}

export default RadialRank
