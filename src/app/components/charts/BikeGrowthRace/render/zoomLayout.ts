import { BIKER_ASPECT, TOP_N } from '../constants'

// Pure geometry for the zoom view. Horizontal positions are fractions [0..1] of
// the track width (fluid); pixel sizing lives in ZoomSize below and scales in
// fullscreen. Keeping the geometry a pure function is the invariant that lets the
// finale morph interpolate this layout toward the full stacked one.
export type RankedCity = { city: string; metroArea: string; value: number }

export type ZoomLayout = {
  // Whether the leader's bar is wide enough to carry its value label inside it.
  showLeaderValue: boolean
  // x of the lowest-ranked city still on screen — the magnifier's left edge, so the
  // beam brackets exactly the cities the panel below is showing.
  lastPlaceX: number
  leader: RankedCity | null
  // Paris's own bar width (stage-fraction): races 0 → full while it climbs to
  // PARIS_INTRO_MAX, then pins at LEADER_MAX once it's the runaway leader.
  leaderWidth: number
  markerX: number // #2 marker on Paris's bar (stage-fraction, shares Paris's ref)
  refMax: number // the value Paris's bar scale is measured against (see below)
  panelLeft: number // stage-fraction
  panelRight: number
}

export const SECOND_PLACE_PCT = 75 // #2 fills 75% of the pack's bar track

// A stage-fraction as a CSS percentage string — the bridge from this file's [0..1]
// coordinates to the styles the render and paint apply.
export const formatPct = (fraction: number) => `${fraction * 100}%`

// Room kept to the right of Paris's bar tip for its tail — now just the biker, since
// the value label moved inside the bar. The tail is sized in px and scales in
// fullscreen, but this reserve is a fraction of the stage's *width*, which doesn't —
// so it's set for the worst case: a ~140px tail at the fullscreen scale cap still
// fits a stage down to ~1030px wide. Dropping the label bought back more than the
// 1.5x taller (and so wider) biker spent.
const TAIL_RESERVE = 0.14
// Paris's bar pins here, not at 1.0, so the tail always has that reserve to sit in.
const LEADER_MAX = 1 - TAIL_RESERVE
const PANEL_LEFT = 0.03 // stage-fraction
// The panel's right edge stops where Paris's bar pins, so the inset spans the same
// track as the bar it magnifies instead of overshooting it.
const PANEL_RIGHT = LEADER_MAX
// Until Paris reaches this, its own bar races 0 → full — an opening act of Paris
// climbing before it's the runaway giant. Mirrors the absolute view's 50M opening.
const PARIS_INTRO_MAX = 50_000_000
// The leader's value label sits inside its bar, so it can only show once the bar is
// wide enough to hold it. At 3M the bar is ~59px on a 1136px stage against a label
// of ~30px plus its inset — comfortable. It only gets tight on a stage under ~800px
// wide, where the bar is ~41px and the label barely clears it.
const LEADER_VALUE_LABEL_MIN = 3_000_000

// A value's x on Paris's bar as a stage-fraction. Everything drawn against Paris's
// scale — its own bar, the #2 marker, and the pack bikers chasing along it — goes
// through here so they share one reference.
export const getBarFracOnLeader = (value: number, refMax: number) =>
  refMax > 0 ? (value / refMax) * LEADER_MAX : 0

export const computeZoomLayout = (ranked: RankedCity[]): ZoomLayout => {
  const leader = ranked[0] ?? null
  const leaderValue = leader?.value ?? 0
  const second = ranked[1]?.value ?? 0
  // Last place among the *visible* field. Only meaningful once someone trails the
  // leader; with the leader alone on screen there is no pack to bracket.
  const lastPlace = ranked.length > 1 ? ranked[ranked.length - 1].value : 0
  // Paris's bar and the #2 marker share this reference: PARIS_INTRO_MAX while
  // Paris is still climbing to it, then Paris's own total once it leads.
  const refMax = Math.max(PARIS_INTRO_MAX, leaderValue)

  return {
    leader,
    leaderWidth: getBarFracOnLeader(leaderValue, refMax),
    markerX: getBarFracOnLeader(second, refMax),
    lastPlaceX: getBarFracOnLeader(lastPlace, refMax),
    refMax,
    showLeaderValue: leaderValue >= LEADER_VALUE_LABEL_MIN,
    panelLeft: PANEL_LEFT,
    panelRight: PANEL_RIGHT,
  }
}

// --- pixel sizing: the base (normal-size) values; every field scales in lockstep
// in fullscreen (see makeZoomSize / useZoomFit), just like the absolute view. ---
export type ZoomSize = {
  scale: number
  leaderTop: number // Paris bar's y
  leaderBarHeight: number // Paris's bar — taller than the pack bars, for the chase bikers
  barHeight: number
  bikerStackStep: number // y stagger per join order, so chase bikers don't overlap flat
  rowPitch: number // pack row pitch
  panelPadTop: number // caption room above the first pack row
  panelPadBottom: number
  panelTop: number
  bandGap: number // gap between Paris's bar and the connector band
  nameColWidth: number // pack name gutter
  rowInset: number // pack row inset within the panel
  tailGap: number // bar↔biker↔value flex gap
  dateInset: number // date readout's inset from the panel's right edge
  smallFont: number // Paris name, share tag
  packFont: number // pack names + values
  emphFont: number // Paris value, ×N
  capFont: number // panel caption
  monthFont: number
  yearFont: number
  highlightTitleFont: number
  highlightBodyFont: number
}

const BASE_ZOOM: ZoomSize = {
  scale: 1,
  leaderTop: 16,
  // 1.5x the pack bars' presence: the leader's bike is sized off this, so the
  // leader and chase bikes grow with it.
  leaderBarHeight: 75,
  // 34 in a 37 pitch: a 3px gap between pack bars, half the 6 it was, with the
  // reclaimed height going to the bars themselves.
  barHeight: 38,
  bikerStackStep: 1.5,
  rowPitch: 41,
  panelPadTop: 34,
  panelPadBottom: 12,
  // Half the connector band the layout used to run, the height going to the rows
  // below rather than to empty stage. The date used to live in that band; it now
  // sits in the panel's bottom-right, so nothing needs the room.
  panelTop: 137,
  bandGap: 8,
  nameColWidth: 104, // fits the longest metro labels (e.g. "Washington D.C.")
  rowInset: 12,
  tailGap: 6,
  dateInset: 12,
  smallFont: 11,
  packFont: 12,
  emphFont: 13,
  capFont: 10,
  monthFont: 15,
  yearFont: 44,
  highlightTitleFont: 17,
  highlightBodyFont: 14,
}

export const BASE_ZOOM_SIZE = BASE_ZOOM

export const makeZoomSize = (scale: number): ZoomSize => ({
  scale,
  leaderTop: BASE_ZOOM.leaderTop * scale,
  leaderBarHeight: BASE_ZOOM.leaderBarHeight * scale,
  barHeight: BASE_ZOOM.barHeight * scale,
  bikerStackStep: BASE_ZOOM.bikerStackStep * scale,
  rowPitch: BASE_ZOOM.rowPitch * scale,
  panelPadTop: BASE_ZOOM.panelPadTop * scale,
  panelPadBottom: BASE_ZOOM.panelPadBottom * scale,
  panelTop: BASE_ZOOM.panelTop * scale,
  bandGap: BASE_ZOOM.bandGap * scale,
  nameColWidth: BASE_ZOOM.nameColWidth * scale,
  rowInset: BASE_ZOOM.rowInset * scale,
  tailGap: BASE_ZOOM.tailGap * scale,
  dateInset: BASE_ZOOM.dateInset * scale,
  smallFont: BASE_ZOOM.smallFont * scale,
  packFont: BASE_ZOOM.packFont * scale,
  emphFont: BASE_ZOOM.emphFont * scale,
  capFont: BASE_ZOOM.capFont * scale,
  monthFont: BASE_ZOOM.monthFont * scale,
  yearFont: BASE_ZOOM.yearFont * scale,
  highlightTitleFont: BASE_ZOOM.highlightTitleFont * scale,
  highlightBodyFont: BASE_ZOOM.highlightBodyFont * scale,
})

// Gap the date keeps below the leader's bar at the start of its entrance.
const DATE_INTRO_BAR_GAP = 5

// Where the date begins its entrance: tucked under the right end of the leader's
// bar, the spot it used to rest in. It now travels from here down to the pack's
// bottom-right corner, so the arrival reads as a drop rather than a slide.
export const getDateIntroTop = (size: ZoomSize): number =>
  size.leaderTop + size.leaderBarHeight + DATE_INTRO_BAR_GAP * size.scale

// The width for a pack row's bike — sized so its height matches that row's bar,
// so the two stay locked together if either is retuned.
export const getPackBikerWidth = (size: ZoomSize): number =>
  size.barHeight * BIKER_ASPECT

// The width for a bike ridden on Paris's bar — sized so its height matches the bar,
// so both the chase bikers and Paris's own tail biker scale with leaderBarHeight
// rather than the pack row's bar height.
export const getLeaderBikerWidth = (size: ZoomSize): number =>
  size.leaderBarHeight * BIKER_ASPECT

// Chase bikers ride a bit smaller than Paris's own, so the leader stays the biggest
// bike on the bar.
export const getChaseBikerWidth = (size: ZoomSize): number =>
  getLeaderBikerWidth(size) * 0.8

export const getZoomPanelHeight = (size: ZoomSize): number =>
  size.panelPadTop + (TOP_N - 1) * size.rowPitch + size.panelPadBottom

export const getZoomStageHeight = (size: ZoomSize): number =>
  size.panelTop + getZoomPanelHeight(size)

// The natural (unscaled) stage height — the reference a fullscreen fit scales from.
export const BASE_ZOOM_STAGE_HEIGHT = getZoomStageHeight(BASE_ZOOM)
