'use client'

import { forwardRef, useImperativeHandle } from 'react'
import { CITY_BIKE_CONFIG } from '@/app/components/Biker/cityBikeConfig'
import { getGrowthAt, MonthKey, RaceCity } from '../timeline/buildRaceTimeline'
import { barColorFor, BikerConfig } from '../render/barColor'
import {
  computeZoomLayout,
  formatPct,
  getZoomPanelHeight,
  getZoomStageHeight,
  ZoomSize,
} from '../render/zoomLayout'
import { paintZoomFrame } from '../render/paintZoom'
import { useZoomRefs } from '../hooks/useZoomRefs'
import ParisLeader from './zoom/ParisLeader'
import ChasingBikers from './zoom/ChasingBikers'
import ConnectorBand from './zoom/ConnectorBand'
import PackPanel from './zoom/PackPanel'
import PackRow from './zoom/PackRow'
import DateReadout from './zoom/DateReadout'
import HighlightArea from './zoom/HighlightArea'

// The parent calls paint(time, morph) every frame; the imperative work lives in
// paintZoomFrame (render/paintZoom.ts), driven through the refs bundled by useZoomRefs.
// This component only wires those refs to the section markup and derives the shell.
export type ZoomTrackHandle = { paint: (time: number, morph?: number) => void }

type Props = {
  // Top-N city ids, ranked; [0] is Paris (the leader), the rest are the pack.
  order: string[]
  cityMap: Map<string, RaceCity>
  // Cities that ever reach the top-N — the only ones put on the chase path.
  everTopCities: Set<string>
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

const getBarColor = (city: string) =>
  barColorFor(CITY_BIKE_CONFIG[city] as BikerConfig | undefined)
// A callback ref that registers/unregisters an element in a per-city map, so paint
// can reach each pack row's DOM node by city id.
const setRef =
  <T extends HTMLElement>(map: Map<string, T>, city: string) =>
  (el: T | null) => {
    if (el) map.set(city, el)
    else map.delete(city)
  }

const ZoomRaceTrack = forwardRef<ZoomTrackHandle, Props>(function ZoomRaceTrack(
  {
    order,
    cityMap,
    everTopCities,
    monthTick,
    months,
    reduceMotion,
    size,
    speedScale,
    playing,
  },
  ref
) {
  const refs = useZoomRefs()

  useImperativeHandle(
    ref,
    () => ({
      paint: (time: number, morph = 0) =>
        paintZoomFrame(refs, { order, cityMap, size }, time, morph),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [order, cityMap, size]
  )

  // Value-independent geometry + sizing for the shell.
  const geom = computeZoomLayout([])
  const bandTop = size.leaderTop + size.leaderBarHeight + size.bandGap
  const bandHeight = size.panelTop - bandTop
  const leaderMetro = order[0] ? cityMap.get(order[0])?.metroArea : undefined
  const monthKey = months[Math.min(Math.max(monthTick, 0), months.length - 1)]
  const monthName = monthKey
    ? new Date(monthKey.year, monthKey.month - 1, 1).toLocaleString('en-US', {
        month: 'long',
      })
    : ''
  const pack = order.slice(1)

  const getBikerProps = (city: string) => {
    const raceCity = cityMap.get(city)
    const growth = raceCity ? getGrowthAt(raceCity, monthTick) : 0
    return {
      config: CITY_BIKE_CONFIG[city] as BikerConfig | undefined,
      speed: speedScale(growth),
      paused: !playing || growth <= 0,
    }
  }
  const leaderCity = order[0]
  const leaderBiker = leaderCity ? getBikerProps(leaderCity) : null
  // Every city that ever contends (reaches the top-N at some month), except the
  // leader, rides Paris's bar — a trimmed field, not literally every city. Only cities
  // with bike art are drawn, sorted by order of appearance (each city's firstIndex,
  // its join month on the axis) so joinOrder staggers them earliest-first.
  const chasingBikers = [...cityMap.values()]
    .filter(
      (raceCity) =>
        raceCity.city !== leaderCity &&
        everTopCities.has(raceCity.city) &&
        CITY_BIKE_CONFIG[raceCity.city]
    )
    .sort(
      (cityA, cityB) =>
        cityA.firstIndex - cityB.firstIndex ||
        cityA.city.localeCompare(cityB.city)
    )
    .map((raceCity, joinOrder) => ({
      city: raceCity.city,
      joinOrder,
      biker: getBikerProps(raceCity.city),
    }))
  const rowLeft = `calc(${formatPct(geom.panelLeft)} + ${size.rowInset}px)`
  const rowRight = `calc(${formatPct(1 - geom.panelRight)} + ${size.rowInset}px)`
  const rightColumnLeft = formatPct(geom.panelRight + 0.04)

  return (
    <div
      ref={refs.stage}
      className="relative"
      style={{ height: getZoomStageHeight(size) }}
    >
      {leaderCity && leaderBiker && (
        <ParisLeader
          size={size}
          metro={leaderMetro}
          color={getBarColor(leaderCity)}
          biker={leaderBiker}
          nameRef={refs.leaderName}
          colNameRef={refs.leaderColName}
          barRef={refs.leaderBar}
          shadeRef={refs.shade}
          tailRef={refs.leaderTail}
          valueRef={refs.leaderValue}
          markerRef={refs.marker}
        />
      )}

      <ChasingBikers
        bikers={chasingBikers}
        size={size}
        registerRef={(city) => setRef(refs.chasingBikers.current, city)}
      />

      <ConnectorBand
        top={bandTop}
        height={bandHeight}
        panelLeft={geom.panelLeft}
        panelRight={geom.panelRight}
        connectorRef={refs.connector}
        beamRef={refs.beam}
        rightLineRef={refs.rightLine}
      />

      <PackPanel
        panelRef={refs.panelBg}
        top={size.panelTop}
        left={formatPct(geom.panelLeft)}
        width={formatPct(geom.panelRight - geom.panelLeft)}
        height={getZoomPanelHeight(size)}
        capFont={size.capFont}
      />

      {/* Pack rows are stage siblings (not panel children) so paint can travel them
          out of the panel during the finale morph. */}
      {pack.map((city, rank) => (
        <PackRow
          key={city}
          rank={rank}
          size={size}
          reduceMotion={reduceMotion}
          metro={cityMap.get(city)?.metroArea}
          color={getBarColor(city)}
          biker={getBikerProps(city)}
          rowLeft={rowLeft}
          rowRight={rowRight}
          rowRef={setRef(refs.packRows.current, city)}
          nameRef={setRef(refs.packNames.current, city)}
          barRef={setRef(refs.packBars.current, city)}
          valueRef={setRef(refs.packValues.current, city)}
        />
      ))}

      <DateReadout
        dateRef={refs.date}
        size={size}
        left={rightColumnLeft}
        monthName={monthName}
        year={monthKey?.year}
      />
      <HighlightArea
        highlightRef={refs.highlight}
        size={size}
        left={rightColumnLeft}
      />
    </div>
  )
})

export default ZoomRaceTrack
