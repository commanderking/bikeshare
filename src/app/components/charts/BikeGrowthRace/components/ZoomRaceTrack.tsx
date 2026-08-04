'use client'

import { forwardRef, useImperativeHandle, useRef } from 'react'
import Biker from '@/app/components/Biker'
import { CITY_BIKE_CONFIG } from '@/app/components/Biker/cityBikeConfig'
import {
  getGrowthAt,
  getValueAt,
  MonthKey,
  RaceCity,
} from '../timeline/buildRaceTimeline'
import { barColorFor, BikerConfig } from '../render/barColor'
import {
  BAR_HEIGHT,
  BAR_MAX_PCT,
  BIKER_VIEWBOX,
  formatValue,
  REORDER_MS,
  ROW_HEIGHT,
} from '../constants'
import {
  computeZoomLayout,
  RankedCity,
  SECOND_PLACE_PCT,
  ZoomSize,
  zoomPanelHeight,
  zoomStageHeight,
} from '../render/zoomLayout'

// The parent calls paint(time, morph) every frame; the view owns its own refs and
// does all its imperative bar/marker/connector painting here. `morph` (0 normally,
// 0→1 at race end) first dissolves the magnifier chrome (Beat 1), then travels every
// bar out to the full stacked layout (Beat 2).
export type ZoomTrackHandle = { paint: (time: number, morph?: number) => void }

// Fraction of the morph spent dissolving the chrome before the bars travel.
const DISSOLVE = 0.3
// The full stacked layout the morph settles into, as stage fractions: the left
// name column, the share of the track the bars use (leaving room for name + biker
// + value), and the finale axis the bars are scaled against (just above Paris's
// ~632M finish). Approximate — tune by eye.
const ABS_NAME_FRAC = 0.13
const ABS_TRACK_FRAC = 0.78
const ABS_FINAL_AXIS = 650_000_000
// The inset (panel + connectors + marker + Montreal's bar) fades and grows in as
// Montreal — the first pack member — climbs from 0 to this many trips, then holds.
// Coupling the entrance to Montreal's value (not a wall clock) keeps it scrub- and
// pause-safe: land anywhere past it and the inset is already fully formed. Tune by eye.
const INSET_INTRO = 750_000

type Props = {
  // Top-N city ids, ranked; [0] is Paris (the leader), the rest are the pack.
  order: string[]
  cityMap: Map<string, RaceCity>
  monthTick: number
  months: MonthKey[]
  reduceMotion: boolean
  // Pixel sizing (scales in fullscreen).
  size: ZoomSize
  // Biker cadence: crank speed from this month's growth (constant within a month,
  // so it's set React-side per month rather than every frame).
  speedScale: (growth: number) => number
  playing: boolean
}

const barColor = (city: string) =>
  barColorFor(CITY_BIKE_CONFIG[city] as BikerConfig | undefined)
const pct = (fraction: number) => `${fraction * 100}%`
const lerp = (from: number, to: number, t: number) => from + (to - from) * t
// A value's bar width as a stage-fraction on the absolute finale axis.
const absBarFrac = (value: number) =>
  (value / ABS_FINAL_AXIS) * (BAR_MAX_PCT / 100) * ABS_TRACK_FRAC

const ZoomRaceTrack = forwardRef<ZoomTrackHandle, Props>(function ZoomRaceTrack(
  {
    order,
    cityMap,
    monthTick,
    months,
    reduceMotion,
    size,
    speedScale,
    playing,
  },
  ref
) {
  const stageRef = useRef<HTMLDivElement>(null)
  const leaderBarRef = useRef<HTMLDivElement>(null)
  const leaderTailRef = useRef<HTMLDivElement>(null)
  const leaderValueRef = useRef<HTMLSpanElement>(null)
  const leaderNameRef = useRef<HTMLSpanElement>(null)
  const leaderColNameRef = useRef<HTMLSpanElement>(null)
  const shadeRef = useRef<HTMLDivElement>(null)
  const markerRef = useRef<HTMLDivElement>(null)
  const connectorRef = useRef<SVGSVGElement>(null)
  const beamRef = useRef<SVGPolygonElement>(null)
  const rightLineRef = useRef<SVGLineElement>(null)
  const panelBgRef = useRef<HTMLDivElement>(null)
  const dateRef = useRef<HTMLDivElement>(null)
  const highlightRef = useRef<HTMLDivElement>(null)
  const packRowRefs = useRef(new Map<string, HTMLDivElement>())
  const packNameRefs = useRef(new Map<string, HTMLSpanElement>())
  const packBarRefs = useRef(new Map<string, HTMLDivElement>())
  const packValueRefs = useRef(new Map<string, HTMLSpanElement>())

  useImperativeHandle(
    ref,
    () => ({
      paint: (time: number, morph = 0) => {
        const ranked: RankedCity[] = []
        for (const city of order) {
          const raceCity = cityMap.get(city)
          if (!raceCity) continue
          ranked.push({
            city,
            metroArea: raceCity.metroArea,
            value: getValueAt(raceCity, time) ?? 0,
          })
        }
        const layout = computeZoomLayout(ranked)
        const second = ranked[1]?.value ?? 0
        const chrome = 1 - Math.min(morph / DISSOLVE, 1)
        const settle = Math.min(
          Math.max((morph - DISSOLVE) / (1 - DISSOLVE), 0),
          1
        )
        // The zoomed inset (panel + connectors + marker + pack) fades and grows in as
        // Montreal — the first pack member — climbs from 0 to INSET_INTRO trips; before
        // that it's just Paris climbing. `entrance` (0→1) scales both the inset chrome's
        // opacity and the pack bar widths, so Montreal's bar grows from 0 rather than
        // snapping to its full share.
        const montreal = cityMap.get('montreal')
        const montrealValue = montreal ? getValueAt(montreal, time) ?? 0 : 0
        const entrance = Math.min(montrealValue / INSET_INTRO, 1)
        const insetChrome = String(entrance * chrome)

        // --- always: value text, chrome opacities, date slide ---
        if (leaderValueRef.current)
          leaderValueRef.current.textContent = formatValue(
            layout.leader?.value ?? 0
          )
        for (let rank = 1; rank < ranked.length; rank++) {
          const { city, value } = ranked[rank]
          const valueEl = packValueRefs.current.get(city)
          if (valueEl) valueEl.textContent = formatValue(value)
          // Pack rows fade in with the inset; they stay put through the morph
          // (entrance is long since 1 by then), so no morph-side opacity handling.
          const row = packRowRefs.current.get(city)
          if (row) row.style.opacity = String(entrance)
        }
        if (shadeRef.current) shadeRef.current.style.opacity = insetChrome
        if (markerRef.current) markerRef.current.style.opacity = insetChrome
        if (connectorRef.current)
          connectorRef.current.style.opacity = insetChrome
        if (panelBgRef.current) panelBgRef.current.style.opacity = insetChrome
        if (highlightRef.current)
          highlightRef.current.style.opacity = String(chrome)
        if (dateRef.current) {
          const target = zoomStageHeight(size) - 80 * size.scale
          dateRef.current.style.top = `${lerp(size.dateTop, target, settle)}px`
        }

        if (morph <= 0) {
          // --- play: zoom widths + marker/connector positions ---
          if (leaderBarRef.current)
            leaderBarRef.current.style.width = pct(layout.leaderWidth)
          if (leaderTailRef.current)
            leaderTailRef.current.style.left = pct(layout.leaderWidth)
          if (shadeRef.current)
            shadeRef.current.style.width = pct(layout.markerX)
          if (markerRef.current)
            markerRef.current.style.left = pct(layout.markerX)
          if (rightLineRef.current)
            rightLineRef.current.setAttribute(
              'x1',
              String(layout.markerX * 100)
            )
          if (beamRef.current)
            beamRef.current.setAttribute(
              'points',
              `0,0 ${layout.markerX * 100},0 ${layout.panelRight * 100},100 ${layout.panelLeft * 100},100`
            )
          for (let rank = 1; rank < ranked.length; rank++) {
            const { city, value } = ranked[rank]
            const bar = packBarRefs.current.get(city)
            if (bar)
              bar.style.width =
                second > 0
                  ? `${(value / second) * SECOND_PLACE_PCT * entrance}%`
                  : '0%'
          }
          return
        }

        // --- morph: travel each bar from the zoom layout to the absolute one ---
        const stageW = stageRef.current?.clientWidth ?? 0
        const absRowPitch = ROW_HEIGHT * size.scale
        const absBarH = BAR_HEIGHT * size.scale
        const axisSpace = 30 * size.scale
        const rowBaseTop = size.panelTop + size.panelPadTop

        // Paris (rank 0): standalone top bar → row 0 of the unified list.
        const lTop = lerp(size.leaderTop, axisSpace, settle)
        const lWidth = lerp(
          layout.leaderWidth,
          absBarFrac(layout.leader?.value ?? 0),
          settle
        )
        const lHeight = lerp(size.barHeight, absBarH, settle)
        // Bar left = name column + a tailGap (the same gap the pack rows put between
        // their name and bar), so Paris lines up with them at the finish.
        const barLeftPx =
          ABS_NAME_FRAC * stageW * settle + size.tailGap * settle
        if (leaderBarRef.current) {
          const s = leaderBarRef.current.style
          s.top = `${lTop}px`
          s.left = `${barLeftPx}px`
          s.width = pct(lWidth)
          s.height = `${lHeight}px`
        }
        if (leaderTailRef.current) {
          leaderTailRef.current.style.top = `${lTop}px`
          leaderTailRef.current.style.left = `${barLeftPx + lWidth * stageW}px`
          leaderTailRef.current.style.height = `${lHeight}px`
        }
        // Crossfade "PARIS" (above) → "Paris" (in the name column).
        if (leaderNameRef.current)
          leaderNameRef.current.style.opacity = String(1 - settle)
        if (leaderColNameRef.current) {
          const s = leaderColNameRef.current.style
          s.opacity = String(settle)
          s.top = `${lTop}px`
          s.height = `${lHeight}px` // match the bar so items-center vertically centers it
          // Right edge a tailGap short of the bar's left, matching the pack rows.
          s.right = `${stageW - barLeftPx + size.tailGap}px`
          s.width = `${ABS_NAME_FRAC * stageW}px`
        }

        // Pack: inset rows → the stacked list beneath Paris.
        for (let rank = 1; rank < ranked.length; rank++) {
          const { city, value } = ranked[rank]
          const packIndex = rank - 1
          const rowLeft = lerp(
            size.rowInset + geom.panelLeft * stageW,
            0,
            settle
          )
          const rowRight = lerp(
            size.rowInset + (1 - geom.panelRight) * stageW,
            0.02 * stageW,
            settle
          )
          const translateY = lerp(
            packIndex * size.rowPitch,
            axisSpace + rank * absRowPitch - rowBaseTop,
            settle
          )
          const rowHeight = lerp(size.barHeight, absBarH, settle)
          const row = packRowRefs.current.get(city)
          if (row) {
            const s = row.style
            s.left = `${rowLeft}px`
            s.right = `${rowRight}px`
            s.height = `${rowHeight}px`
            s.transform = `translateY(${translateY}px)`
            s.transition = 'none'
          }
          const nameEl = packNameRefs.current.get(city)
          if (nameEl)
            nameEl.style.width = `${lerp(size.nameColWidth, ABS_NAME_FRAC * stageW, settle)}px`
          const bar = packBarRefs.current.get(city)
          if (bar) {
            const zoomPct = second > 0 ? (value / second) * SECOND_PLACE_PCT : 0
            const absPct = (value / ABS_FINAL_AXIS) * BAR_MAX_PCT
            bar.style.width = `${lerp(zoomPct, absPct, settle)}%`
            bar.style.height = `${rowHeight}px`
          }
        }
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [order, cityMap, size]
  )

  // Value-independent geometry + sizing for the shell.
  const geom = computeZoomLayout([])
  const bandTop = size.leaderTop + size.barHeight + size.bandGap
  const bandHeight = size.panelTop - bandTop
  const leaderMetro = order[0] ? cityMap.get(order[0])?.metroArea : undefined
  const monthKey = months[Math.min(Math.max(monthTick, 0), months.length - 1)]
  const monthName = monthKey
    ? new Date(monthKey.year, monthKey.month - 1, 1).toLocaleString('en-US', {
        month: 'long',
      })
    : ''
  const pack = order.slice(1)

  const bikerProps = (city: string) => {
    const raceCity = cityMap.get(city)
    const growth = raceCity ? getGrowthAt(raceCity, monthTick) : 0
    return {
      config: CITY_BIKE_CONFIG[city] as BikerConfig | undefined,
      speed: speedScale(growth),
      paused: !playing || growth <= 0,
    }
  }
  const parisBiker = order[0] ? bikerProps(order[0]) : null
  const rowLeft = `calc(${pct(geom.panelLeft)} + ${size.rowInset}px)`
  const rowRight = `calc(${pct(1 - geom.panelRight)} + ${size.rowInset}px)`

  return (
    <div
      ref={stageRef}
      className="relative"
      style={{ height: zoomStageHeight(size) }}
    >
      {/* ---- Paris ---- */}
      {order[0] && (
        <>
          <span
            ref={leaderNameRef}
            className="absolute font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400"
            style={{
              top: size.leaderTop - size.smallFont - 3,
              left: 0,
              fontSize: size.smallFont,
            }}
          >
            {leaderMetro}
          </span>
          {/* the name-column label Paris crossfades into during the morph */}
          <span
            ref={leaderColNameRef}
            className="absolute flex items-center justify-end overflow-hidden whitespace-nowrap font-semibold text-gray-700 opacity-0 dark:text-gray-100"
            style={{
              top: size.leaderTop,
              right: '100%',
              width: 0,
              height: size.barHeight,
              fontSize: size.packFont,
            }}
          >
            {leaderMetro}
          </span>
          <div
            ref={leaderBarRef}
            className="absolute rounded"
            style={{
              top: size.leaderTop,
              left: 0,
              width: 0,
              height: size.barHeight,
              background: barColor(order[0]),
            }}
          />
          <div
            ref={shadeRef}
            className="absolute rounded-l opacity-0"
            style={{
              top: size.leaderTop,
              left: 0,
              width: 0,
              height: size.barHeight,
              background: 'rgba(255,255,255,0.28)',
              borderRight: '1px dashed rgba(255,255,255,0.6)',
            }}
          />
          <div
            ref={leaderTailRef}
            className="absolute flex items-center"
            style={{
              top: size.leaderTop,
              left: 0,
              height: size.barHeight,
              paddingLeft: size.tailGap,
              gap: size.tailGap,
            }}
          >
            <div className="shrink-0" style={{ width: size.bikerWidth }}>
              {parisBiker?.config && (
                <Biker
                  {...parisBiker.config}
                  width={size.bikerWidth}
                  viewBox={BIKER_VIEWBOX}
                  speed={parisBiker.speed}
                  paused={parisBiker.paused}
                  wave={false}
                  speedBursts={false}
                />
              )}
            </div>
            <span
              ref={leaderValueRef}
              className="shrink-0 whitespace-nowrap font-bold tabular-nums text-gray-700 dark:text-gray-100"
              style={{ fontSize: size.emphFont }}
            />
          </div>
          <div
            ref={markerRef}
            className="absolute opacity-0"
            style={{
              top: size.leaderTop - 4 * size.scale,
              left: 0,
              height: size.barHeight + size.bandGap,
              width: 0,
            }}
          >
            <div className="absolute inset-y-0 -left-px w-0.5 rounded bg-gray-900 dark:bg-gray-100" />
          </div>
        </>
      )}

      {/* ---- connector band ---- */}
      <svg
        ref={connectorRef}
        className="absolute text-gray-400 opacity-0 dark:text-gray-600"
        style={{ top: bandTop, left: 0, width: '100%', height: bandHeight }}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <polygon
          ref={beamRef}
          points="0,0 0,0 0,0 0,0"
          fill="rgba(133,191,66,0.12)"
        />
        <line
          x1="0"
          y1="0"
          x2={geom.panelLeft * 100}
          y2="100"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeDasharray="4 3"
          vectorEffect="non-scaling-stroke"
        />
        <line
          ref={rightLineRef}
          x1="0"
          y1="0"
          x2={geom.panelRight * 100}
          y2="100"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeDasharray="4 3"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {/* ---- inset pack panel background (dissolves in Beat 1) ---- */}
      <div
        ref={panelBgRef}
        className="absolute rounded-lg border border-gray-300 bg-gray-100/70 dark:border-gray-700 dark:bg-gray-800/40"
        style={{
          top: size.panelTop,
          left: pct(geom.panelLeft),
          width: pct(geom.panelRight - geom.panelLeft),
          height: zoomPanelHeight(size),
        }}
      >
        <span
          className="absolute left-3 top-2 font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
          style={{ fontSize: size.capFont }}
        >
          The Pack
        </span>
      </div>

      {/* ---- pack rows (stage children; rank swaps slide, then morph out) ---- */}
      {pack.map((city, rank) => {
        const pb = bikerProps(city)
        return (
          <div
            key={city}
            ref={(el) => {
              if (el) packRowRefs.current.set(city, el)
              else packRowRefs.current.delete(city)
            }}
            className="absolute flex items-center"
            style={{
              top: size.panelTop + size.panelPadTop,
              left: rowLeft,
              right: rowRight,
              height: size.barHeight,
              gap: size.tailGap,
              transform: `translateY(${rank * size.rowPitch}px)`,
              transition: reduceMotion
                ? undefined
                : `transform ${REORDER_MS}ms ease`,
            }}
          >
            <span
              ref={(el) => {
                if (el) packNameRefs.current.set(city, el)
                else packNameRefs.current.delete(city)
              }}
              className="shrink-0 whitespace-nowrap text-right font-semibold text-gray-500 dark:text-gray-400"
              style={{ width: size.nameColWidth, fontSize: size.packFont }}
            >
              {cityMap.get(city)?.metroArea}
            </span>
            <div
              className="flex min-w-0 flex-1 items-center"
              style={{ gap: size.tailGap }}
            >
              <div
                ref={(el) => {
                  if (el) packBarRefs.current.set(city, el)
                  else packBarRefs.current.delete(city)
                }}
                className="rounded"
                style={{
                  width: 0,
                  height: size.barHeight,
                  background: barColor(city),
                }}
              />
              <div className="shrink-0" style={{ width: size.bikerWidth }}>
                {pb.config && (
                  <Biker
                    {...pb.config}
                    width={size.bikerWidth}
                    viewBox={BIKER_VIEWBOX}
                    speed={pb.speed}
                    paused={pb.paused}
                    wave={false}
                    speedBursts={false}
                  />
                )}
              </div>
              <span
                ref={(el) => {
                  if (el) packValueRefs.current.set(city, el)
                  else packValueRefs.current.delete(city)
                }}
                className="shrink-0 whitespace-nowrap font-semibold tabular-nums text-gray-700 dark:text-gray-200"
                style={{ fontSize: size.packFont }}
              />
            </div>
          </div>
        )
      })}

      {/* ---- right column: month/year (slides to bottom-right) + highlight ---- */}
      <div
        ref={dateRef}
        className="absolute"
        style={{
          top: size.dateTop,
          left: pct(geom.panelRight + 0.04),
          right: 0,
        }}
      >
        <div
          className="font-semibold text-gray-500 dark:text-gray-400"
          style={{ fontSize: size.monthFont }}
        >
          {monthName}
        </div>
        <div
          className="font-extrabold leading-none tracking-tight tabular-nums text-gray-800 dark:text-gray-100"
          style={{ fontSize: size.yearFont }}
        >
          {monthKey?.year}
        </div>
      </div>
      <div
        ref={highlightRef}
        className="absolute rounded-md border border-dashed border-gray-300 p-3 text-gray-400 dark:border-gray-600 dark:text-gray-500"
        style={{
          top: size.dateTop + 76 * size.scale,
          left: pct(geom.panelRight + 0.04),
          right: 0,
        }}
      >
        <span
          className="font-bold uppercase tracking-wider"
          style={{ fontSize: size.capFont }}
        >
          Highlight area
        </span>
      </div>
    </div>
  )
})

export default ZoomRaceTrack
