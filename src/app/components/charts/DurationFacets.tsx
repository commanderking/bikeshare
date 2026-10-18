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
  normalize?: boolean // set true to normalize each panel to its own max/extent
  facetKey?: keyof DurationRow
  facetColumns?: number
}

const DurationFacetedAreaPlot: React.FC<Props> = ({
  data,
  width = 960,
  height = 1200,
  normalize = false,
  facetKey = 'city',
  facetColumns = 3,
}) => {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!ref.current || !data?.length) return

    // sort for smooth areas
    const sorted = [...data]

    // === pattern: compute fx/fy from a fixed number of columns (n) ===
    const n = facetColumns // number of facet columns
    const keys = Array.from(new Set(sorted.map((d) => d[facetKey]))) // unique cities
    const index = new Map(keys.map((key, i) => [key, i]))
    const fx = (facetKey: string) => (index.get(facetKey) ?? 0) % n
    const fy = (facetKey: string) => Math.floor((index.get(facetKey) ?? 0) / n)

    ref.current.innerHTML = ''

    const plot = Plot.plot({
      width,
      height,
      //   axis: null, // like the pattern: hide axes (use frame + labels instead)
      //   y: { insetTop: 10 },
      //   fx: { padding: 0.05 }, // small gap between small multiples
      //   fy: { label: null },
      //   x: { label: 'Time (minutes)' },
      //   y: {
      //     label: 'Relative Number of Trips',
      //     grid: true,
      //   },
      marginBottom: 20,

      marks: [
        // area per panel
        Plot.areaY(
          sorted,
          normalize
            ? Plot.normalizeY('extent', {
                x: 'bucket',
                y: 'count',
                fx: (d: DurationRow) => fx(d[facetKey]),
                fy: (d: DurationRow) => fy(d[facetKey]),
                // curve: 'monotone-x',
                fill: '#334155',
              })
            : {
                x: 'bucket',
                y: 'count',
                fx: (d: DurationRow) => fx(d[facetKey]),
                fy: (d: DurationRow) => fy(d[facetKey]),
                curve: 'monotone-x',
                fill: '#334155',
              }
        ),

        // panel titles (top-right of each frame)
        Plot.text(
          keys.map((k) => ({ city: k })),
          {
            text: 'city',
            fx: (d: { city: string }) => fx(d.city),
            fy: (d: { city: string }) => fy(d.city),
            frameAnchor: 'top-right',
            dx: -6,
            dy: 6,
          }
        ),

        // draw frames around panels
        Plot.frame(),
      ],
    })

    ref.current.append(plot)
    return () => plot.remove()
  }, [data, width, height, normalize])

  return <div ref={ref} />
}

export default DurationFacetedAreaPlot
