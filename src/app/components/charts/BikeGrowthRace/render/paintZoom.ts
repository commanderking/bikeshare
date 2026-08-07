import { getValueAt, RaceCity } from '../timeline/buildRaceTimeline'
import { BAR_HEIGHT, BAR_MAX_PCT, formatValue, ROW_HEIGHT } from '../constants'
import {
  computeZoomLayout,
  formatPct,
  getBarFracOnLeader,
  getChaseBikerWidth,
  getZoomStageHeight,
  RankedCity,
  SECOND_PLACE_PCT,
  ZoomLayout,
  ZoomSize,
} from './zoomLayout'
import { ZoomRefs } from '../hooks/useZoomRefs'

// The zoom view's per-frame imperative paint, kept out of the React tree so bar
// widths/positions/opacities can be written straight to the DOM ~60×/sec without
// reconciliation. `morph` (0 during play, 0→1 at the finale) first dissolves the
// magnifier chrome (Beat 1, the DISSOLVE fraction), then travels every bar out to
// the full stacked layout (Beat 2).
const DISSOLVE = 0.3
// The full stacked layout the morph settles into, as stage fractions: the left name
// column, the share of the track the bars use (leaving room for name + biker +
// value), and the finale axis the bars are scaled against (just above Paris's ~632M
// finish). Approximate — tune by eye.
const ABS_NAME_FRAC = 0.13
const ABS_TRACK_FRAC = 0.78
const ABS_FINAL_AXIS = 650_000_000
// The inset (panel + connectors + marker + Montreal's bar) fades and grows in as
// Montreal — the first pack member — climbs from 0 to this many trips, then holds.
// Coupling the entrance to Montreal's value (not a wall clock) keeps it scrub- and
// pause-safe: land anywhere past it and the inset is already fully formed. Tune by eye.
const INSET_INTRO = 750_000

const lerp = (from: number, to: number, t: number) => from + (to - from) * t
// A value's bar width as a stage-fraction on the absolute finale axis.
const getAbsBarFrac = (value: number) =>
  (value / ABS_FINAL_AXIS) * (BAR_MAX_PCT / 100) * ABS_TRACK_FRAC

export type ZoomPaintInputs = {
  order: string[]
  cityMap: Map<string, RaceCity>
  size: ZoomSize
}

// Everything derived once per frame and shared across the paint steps below.
type Frame = {
  ranked: RankedCity[]
  layout: ZoomLayout
  second: number // #2's value; the pack bars scale against it
  chrome: number // magnifier chrome opacity (1 → 0 over Beat 1)
  settle: number // Beat 2 progress (0 → 1) once the chrome is gone
  entrance: number // inset fade/grow-in as Montreal enters (0 → 1)
  insetChrome: string // chrome × entrance, the inset elements' live opacity
}

// Score the field at `time` and roll up the scalars every step needs.
const readFrame = (
  { order, cityMap }: ZoomPaintInputs,
  time: number,
  morph: number
): Frame => {
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
  const chrome = 1 - Math.min(morph / DISSOLVE, 1)
  const settle = Math.min(Math.max((morph - DISSOLVE) / (1 - DISSOLVE), 0), 1)
  const montreal = cityMap.get('montreal')
  const montrealValue = montreal ? getValueAt(montreal, time) ?? 0 : 0
  const entrance = Math.min(montrealValue / INSET_INTRO, 1)
  return {
    ranked,
    layout,
    second: ranked[1]?.value ?? 0,
    chrome,
    settle,
    entrance,
    insetChrome: String(entrance * chrome),
  }
}

// Runs every frame regardless of beat: value labels, the inset's fade opacities, and
// the date's slide toward the bottom corner.
const paintChrome = (refs: ZoomRefs, frame: Frame, size: ZoomSize) => {
  const { ranked, layout, entrance, insetChrome, chrome, settle } = frame
  if (refs.leaderValue.current)
    refs.leaderValue.current.textContent = formatValue(layout.leader?.value ?? 0)
  for (let rank = 1; rank < ranked.length; rank++) {
    const { city, value } = ranked[rank]
    const valueEl = refs.packValues.current.get(city)
    if (valueEl) valueEl.textContent = formatValue(value)
    // Pack rows fade in with the inset; they stay put through the morph (entrance is
    // long since 1 by then), so no morph-side opacity handling.
    const row = refs.packRows.current.get(city)
    if (row) row.style.opacity = String(entrance)
  }
  if (refs.shade.current) refs.shade.current.style.opacity = insetChrome
  if (refs.marker.current) refs.marker.current.style.opacity = insetChrome
  if (refs.connector.current) refs.connector.current.style.opacity = insetChrome
  if (refs.panelBg.current) refs.panelBg.current.style.opacity = insetChrome
  if (refs.highlight.current)
    refs.highlight.current.style.opacity = String(chrome)
  if (refs.date.current) {
    const target = getZoomStageHeight(size) - 80 * size.scale
    refs.date.current.style.top = `${lerp(size.dateTop, target, settle)}px`
  }
}

// Beat 0 (play): the live zoom widths — Paris's bar, the #2 shade/marker, the
// connector beam, and each pack bar at its share of #2.
const paintPlay = (refs: ZoomRefs, frame: Frame) => {
  const { layout, ranked, second, entrance } = frame
  if (refs.leaderBar.current)
    refs.leaderBar.current.style.width = formatPct(layout.leaderWidth)
  if (refs.leaderTail.current)
    refs.leaderTail.current.style.left = formatPct(layout.leaderWidth)
  if (refs.shade.current) refs.shade.current.style.width = formatPct(layout.markerX)
  if (refs.marker.current) refs.marker.current.style.left = formatPct(layout.markerX)
  if (refs.rightLine.current)
    refs.rightLine.current.setAttribute('x1', String(layout.markerX * 100))
  if (refs.beam.current)
    refs.beam.current.setAttribute(
      'points',
      `0,0 ${layout.markerX * 100},0 ${layout.panelRight * 100},100 ${layout.panelLeft * 100},100`
    )
  for (let rank = 1; rank < ranked.length; rank++) {
    const { city, value } = ranked[rank]
    const bar = refs.packBars.current.get(city)
    if (bar)
      bar.style.width =
        second > 0 ? `${(value / second) * SECOND_PLACE_PCT * entrance}%` : '0%'
  }
}

// The bikers riding Paris's bar — the whole field, not just the top-N pack. Each is
// parked so its horizontal center lands on its own value's x on Paris's scale, so a
// city entering at 0 sits centered on the track's origin; the px offset goes through
// calc so it stays accurate at any stage width. Hidden until the city launches; all
// dissolve with the chrome at the finale. Runs every frame (both beats), keyed by the
// live chase-biker refs.
const paintChaseBikers = (
  refs: ZoomRefs,
  inputs: ZoomPaintInputs,
  frame: Frame,
  time: number
) => {
  const { cityMap, size } = inputs
  const centerOffset = getChaseBikerWidth(size) / 2
  refs.chasingBikers.current.forEach((el, city) => {
    const raceCity = cityMap.get(city)
    const value = raceCity ? getValueAt(raceCity, time) ?? 0 : 0
    el.style.opacity = value > 0 ? String(frame.chrome) : '0'
    const chaseX = getBarFracOnLeader(value, frame.layout.refMax)
    el.style.left = `calc(${formatPct(chaseX)} - ${centerOffset}px)`
  })
}

// Beat 2 (finale): travel every bar from the zoom layout to the absolute stacked one,
// interpolated by `settle`. `stageW` converts the layout's stage-fractions to px.
const paintMorph = (
  refs: ZoomRefs,
  frame: Frame,
  size: ZoomSize,
  stageW: number
) => {
  const { ranked, layout, second, settle } = frame
  const absRowPitch = ROW_HEIGHT * size.scale
  const absBarH = BAR_HEIGHT * size.scale
  const axisSpace = 30 * size.scale
  const rowBaseTop = size.panelTop + size.panelPadTop

  // Paris (rank 0): standalone top bar → row 0 of the unified list.
  const lTop = lerp(size.leaderTop, axisSpace, settle)
  const lWidth = lerp(
    layout.leaderWidth,
    getAbsBarFrac(layout.leader?.value ?? 0),
    settle
  )
  const lHeight = lerp(size.leaderBarHeight, absBarH, settle)
  // Bar left = name column + a tailGap (the same gap the pack rows put between their
  // name and bar), so Paris lines up with them at the finish.
  const barLeftPx = ABS_NAME_FRAC * stageW * settle + size.tailGap * settle
  if (refs.leaderBar.current) {
    const s = refs.leaderBar.current.style
    s.top = `${lTop}px`
    s.left = `${barLeftPx}px`
    s.width = formatPct(lWidth)
    s.height = `${lHeight}px`
  }
  if (refs.leaderTail.current) {
    refs.leaderTail.current.style.top = `${lTop}px`
    refs.leaderTail.current.style.left = `${barLeftPx + lWidth * stageW}px`
    refs.leaderTail.current.style.height = `${lHeight}px`
  }
  // Crossfade "PARIS" (above) → "Paris" (in the name column).
  if (refs.leaderName.current)
    refs.leaderName.current.style.opacity = String(1 - settle)
  if (refs.leaderColName.current) {
    const s = refs.leaderColName.current.style
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
    const rowLeft = lerp(size.rowInset + layout.panelLeft * stageW, 0, settle)
    const rowRight = lerp(
      size.rowInset + (1 - layout.panelRight) * stageW,
      0.02 * stageW,
      settle
    )
    const translateY = lerp(
      packIndex * size.rowPitch,
      axisSpace + rank * absRowPitch - rowBaseTop,
      settle
    )
    const rowHeight = lerp(size.barHeight, absBarH, settle)
    const row = refs.packRows.current.get(city)
    if (row) {
      const s = row.style
      s.left = `${rowLeft}px`
      s.right = `${rowRight}px`
      s.height = `${rowHeight}px`
      s.transform = `translateY(${translateY}px)`
      s.transition = 'none'
    }
    const nameEl = refs.packNames.current.get(city)
    if (nameEl)
      nameEl.style.width = `${lerp(size.nameColWidth, ABS_NAME_FRAC * stageW, settle)}px`
    const bar = refs.packBars.current.get(city)
    if (bar) {
      const zoomPct = second > 0 ? (value / second) * SECOND_PLACE_PCT : 0
      const absPct = (value / ABS_FINAL_AXIS) * BAR_MAX_PCT
      bar.style.width = `${lerp(zoomPct, absPct, settle)}%`
      bar.style.height = `${rowHeight}px`
    }
  }
}

// The frame pipeline: read → chrome (always) → play or morph.
export const paintZoomFrame = (
  refs: ZoomRefs,
  inputs: ZoomPaintInputs,
  time: number,
  morph = 0
) => {
  const frame = readFrame(inputs, time, morph)
  paintChrome(refs, frame, inputs.size)
  paintChaseBikers(refs, inputs, frame, time)
  if (morph <= 0) {
    paintPlay(refs, frame)
    return
  }
  const stageW = refs.stage.current?.clientWidth ?? 0
  paintMorph(refs, frame, inputs.size, stageW)
}
