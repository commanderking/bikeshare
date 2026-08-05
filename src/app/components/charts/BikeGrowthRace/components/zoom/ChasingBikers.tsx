import { RefCallback } from 'react'
import { ZoomSize } from '../../render/zoomLayout'
import RaceBiker, { BikerRender } from './RaceBiker'

export type ChasingBiker = {
  city: string
  joinOrder: number // order of appearance after Paris: first to join = 0, next = 1, …
  biker: BikerRender
}

type Props = {
  bikers: ChasingBiker[]
  size: ZoomSize
  registerRef: (city: string) => RefCallback<HTMLDivElement>
}

// The pack riding along Paris's own bar: each city's bike parks at its value's x on
// Paris's scale, overlaid on the bar (its left is set in paint so the rear wheel lands
// on the mark). Because Paris is a runaway leader they bunch near the left and overlap,
// so each is nudged up a step by join order to fan them out; the earliest joiner sits
// lowest and on top (z-index falls off with join order).
export default function ChasingBikers({ bikers, size, registerRef }: Props) {
  return (
    <>
      {bikers.map(({ city, joinOrder, biker }) => (
        <div
          key={city}
          ref={registerRef(city)}
          className="absolute flex items-center opacity-0"
          style={{
            top: size.leaderTop - joinOrder * size.bikerStackStep,
            left: 0,
            width: size.bikerWidth,
            height: size.leaderBarHeight, // items-center keeps the bike centered on Paris's bar
            zIndex: 100 - joinOrder,
          }}
        >
          <RaceBiker biker={biker} width={size.bikerWidth} />
        </div>
      ))}
    </>
  )
}
