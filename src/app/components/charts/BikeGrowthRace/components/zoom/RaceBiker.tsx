import Biker from '@/app/components/Biker'
import { BIKER_VIEWBOX } from '../../constants'
import { BikerConfig } from '../../render/barColor'

// The bike that trails a bar's tip. Cadence is set per month React-side (not every
// frame), so these props change only on a month tick.
export type BikerRender = {
  config: BikerConfig | undefined
  speed: number
  paused: boolean
}

type Props = { biker: BikerRender; width: number }

// Fixed-width box so the value label past the bike stays put regardless of the art.
export default function RaceBiker({ biker, width }: Props) {
  return (
    <div className="shrink-0" style={{ width }}>
      {biker.config && (
        <Biker
          {...biker.config}
          width={width}
          viewBox={BIKER_VIEWBOX}
          speed={biker.speed}
          paused={biker.paused}
          wave={false}
          speedBursts={false}
        />
      )}
    </div>
  )
}
