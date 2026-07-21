import { ReactNode } from 'react'

type Props = {
  name: string
  // Superscript shown after the name when the city has a footnote.
  footnoteNumber?: number
  // Small gray line under the name, e.g. years of operation or population.
  subLabel?: string
  // Popover content; when present an info icon reveals it on click.
  info?: ReactNode
  infoOpen: boolean
  onToggleInfo: () => void
}

// The left-hand city name column: the name, an optional footnote superscript, an
// optional info icon + popover, and an optional gray sub-label line.
const CityLabel = ({
  name,
  footnoteNumber,
  subLabel,
  info,
  infoOpen,
  onToggleInfo,
}: Props) => (
  <div className="relative shrink-0 w-28 pr-1 text-right text-xs leading-tight">
    <span className="inline-flex items-center justify-end gap-0.5 align-middle">
      {name}
      {info != null && (
        <button
          data-info-ui
          type="button"
          aria-label={`Details for ${name}`}
          onClick={onToggleInfo}
          className="text-gray-400 hover:text-blue-600"
        >
          <svg
            viewBox="0 0 16 16"
            width="13"
            height="13"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            className="block"
          >
            <circle cx="8" cy="8" r="6.5" />
            <line x1="8" y1="7.2" x2="8" y2="11.2" />
            <circle cx="8" cy="4.8" r="0.5" fill="currentColor" stroke="none" />
          </svg>
        </button>
      )}
    </span>
    {footnoteNumber != null && (
      <sup className="ml-0.5 text-[9px] text-gray-400">{footnoteNumber}</sup>
    )}
    {info != null && infoOpen && (
      <div
        data-info-ui
        className="absolute left-0 top-full z-20 mt-1 w-60 rounded border border-gray-200 bg-white p-2 text-left text-xs font-normal leading-snug text-gray-700 shadow-lg"
      >
        {info}
      </div>
    )}
    {subLabel && <div className="text-[10px] text-gray-400">{subLabel}</div>}
  </div>
)

export default CityLabel
