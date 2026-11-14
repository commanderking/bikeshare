import Biker, { RiderOutfit } from '@/app/components/Biker'
import { BIKER_VIEWBOX, PASS_WAVE_MS } from '../../constants'
import { BikerConfig } from '../../render/barColor'

// The bike that trails a bar's tip. Cadence is set per month React-side (not every
// frame), so these props change only on a month tick. Bike and rider stay separate
// here the way their configs do — barColorFor reads `config` alone, and reading a
// bar's color off the rider's clothes would be nonsense.
export type BikerRender = {
  config: BikerConfig | undefined
  outfit: RiderOutfit | undefined
  speed: number
  paused: boolean
  /** Bumped when this city overtakes someone, so its rider waves. */
  waveNonce: number
}

type Props = { biker: BikerRender; width: number }

// Fixed-width box so the value label past the bike stays put regardless of the art.
export default function RaceBiker({ biker, width }: Props) {
  return (
    <div className="shrink-0" style={{ width }}>
      {biker.config && (
        <Biker
          {...biker.config}
          outfit={biker.outfit}
          width={width}
          viewBox={BIKER_VIEWBOX}
          speed={biker.speed}
          paused={biker.paused}
          wave={false}
          waveNonce={biker.waveNonce}
          waveDurationMs={PASS_WAVE_MS}
          speedBursts={false}
        />
      )}
    </div>
  )
}
