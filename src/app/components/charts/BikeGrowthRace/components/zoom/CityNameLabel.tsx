import { ZoomSize } from '../../render/zoomLayout'

type Props = {
  size: ZoomSize
  metro: string | undefined
  startYear: number | undefined
}

// The name-column label: the metro name over its launch year. Shared by the pack rows
// and the "Paris" label the leader crossfades into, so both read the same at the
// finish.
export default function CityNameLabel({ size, metro, startYear }: Props) {
  return (
    <span className="flex flex-col items-end leading-tight">
      <span>{metro}</span>
      {startYear !== undefined && (
        <span className="font-normal" style={{ fontSize: size.smallFont }}>
          ({startYear})
        </span>
      )}
    </span>
  )
}
