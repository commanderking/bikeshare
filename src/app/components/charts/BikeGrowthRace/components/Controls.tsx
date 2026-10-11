'use client'

import { RefObject } from 'react'
import { SPEED_OPTIONS } from '../constants'

type Props = {
  playing: boolean
  ended: boolean
  onPlayPause: () => void
  speedMul: number
  onSpeedChange: (mul: number) => void
  maxT: number
  onScrub: (time: number) => void
  scrubberRef: RefObject<HTMLInputElement>
  // Year labels + the month index each year starts at, for the timeline ticks.
  yearTicks: { year: number; monthIndex: number }[]
}

// Playback bar: play/pause (or replay at the end), a scrubber the parent drives
// imperatively, and speed multipliers.
const Controls = ({
  playing,
  ended,
  onPlayPause,
  speedMul,
  onSpeedChange,
  maxT,
  onScrub,
  scrubberRef,
  yearTicks,
}: Props) => (
  <div className="flex items-center gap-3 pt-3 pb-6">
    <button
      type="button"
      onClick={onPlayPause}
      className="w-20 shrink-0 rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
    >
      {ended ? 'Replay' : playing ? 'Pause' : 'Play'}
    </button>

    <div className="relative min-w-0 flex-1">
      <input
        ref={scrubberRef}
        type="range"
        min={0}
        max={maxT}
        step={0.02}
        defaultValue={0}
        onChange={(event) => onScrub(Number(event.target.value))}
        aria-label="Timeline"
        className="w-full accent-blue-600"
      />
      {/* Year ticks + labels beneath the track. Label every other year to keep
          the axis uncluttered; a tick marks each year. */}
      {maxT > 0 &&
        yearTicks.map(({ year, monthIndex }, index) => (
          <div
            key={year}
            className="pointer-events-none absolute top-full -translate-x-1/2"
            style={{ left: `${(monthIndex / maxT) * 100}%` }}
          >
            <div className="mx-auto h-1.5 w-px bg-gray-400" />
            {index % 2 === 0 && (
              <div className="mt-0.5 whitespace-nowrap text-[9px] tabular-nums text-gray-400">
                {year}
              </div>
            )}
          </div>
        ))}
    </div>

    <div className="flex shrink-0 items-center gap-1">
      {SPEED_OPTIONS.map((mul) => (
        <button
          key={mul}
          type="button"
          onClick={() => onSpeedChange(mul)}
          className={`rounded px-2 py-1 text-xs font-medium ${
            speedMul === mul
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          {mul}x
        </button>
      ))}
    </div>
  </div>
)

export default Controls
