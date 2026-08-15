import { BIKER_ASPECT, TOP_N } from '../constants'

// Pure geometry for the zoom view. Horizontal positions are fractions [0..1] of
// the track width (fluid); pixel sizing lives in ZoomSize below and scales in
// fullscreen. Keeping the geometry a pure function is the invariant that lets the
// finale morph interpolate this layout toward the full stacked one.
export type RankedCity = { city: string; metroArea: string; value: number }

export type ZoomLayout = {
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

const PANEL_LEFT = 0.03 // stage-fraction
const PANEL_WIDTH = 0.63 // extends into the halved left padding (right edge unchanged)
const PANEL_RIGHT = PANEL_LEFT + PANEL_WIDTH
// Paris's bar pins here, not at 1.0, leaving room at the tip for its biker + value
// tail.
const LEADER_MAX = 0.88
// Until Paris reaches this, its own bar races 0 → full — an opening act of Paris
// climbing before it's the runaway giant. Mirrors the absolute view's 50M opening.
const PARIS_INTRO_MAX = 50_000_000

// A value's x on Paris's bar as a stage-fraction. Everything drawn against Paris's
// scale — its own bar, the #2 marker, and the pack bikers chasing along it — goes
// through here so they share one reference.
export const getBarFracOnLeader = (value: number, refMax: number) =>
  refMax > 0 ? (value / refMax) * LEADER_MAX : 0

export const computeZoomLayout = (ranked: RankedCity[]): ZoomLayout => {
  const leader = ranked[0] ?? null
  const leaderValue = leader?.value ?? 0
  const second = ranked[1]?.value ?? 0
  // Paris's bar and the #2 marker share this reference: PARIS_INTRO_MAX while
  // Paris is still climbing to it, then Paris's own total once it leads.
  const refMax = Math.max(PARIS_INTRO_MAX, leaderValue)

  return {
    leader,
    leaderWidth: getBarFracOnLeader(leaderValue, refMax),
    markerX: getBarFracOnLeader(second, refMax),
    refMax,
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
  bikerWidth: number
  bikerStackStep: number // y stagger per join order, so chase bikers don't overlap flat
  rowPitch: number // pack row pitch
  panelPadTop: number // caption room above the first pack row
  panelPadBottom: number
  panelTop: number
  bandGap: number // gap between Paris's bar and the connector band
  nameColWidth: number // pack name gutter
  rowInset: number // pack row inset within the panel
  tailGap: number // bar↔biker↔value flex gap
  dateTop: number // right column's y
  smallFont: number // Paris name, share tag
  packFont: number // pack names + values
  emphFont: number // Paris value, ×N
  capFont: number // panel caption
  monthFont: number
  yearFont: number
}

const BASE_ZOOM: ZoomSize = {
  scale: 1,
  leaderTop: 16,
  leaderBarHeight: 50,
  barHeight: 31,
  bikerWidth: 31,
  bikerStackStep: 1.5,
  rowPitch: 37,
  panelPadTop: 34,
  panelPadBottom: 12,
  panelTop: 150,
  bandGap: 8,
  nameColWidth: 104, // fits the longest metro labels (e.g. "Washington D.C.")
  rowInset: 12,
  tailGap: 6,
  dateTop: 70,
  smallFont: 11,
  packFont: 12,
  emphFont: 13,
  capFont: 10,
  monthFont: 15,
  yearFont: 44,
}

export const BASE_ZOOM_SIZE = BASE_ZOOM

export const makeZoomSize = (scale: number): ZoomSize => ({
  scale,
  leaderTop: BASE_ZOOM.leaderTop * scale,
  leaderBarHeight: BASE_ZOOM.leaderBarHeight * scale,
  barHeight: BASE_ZOOM.barHeight * scale,
  bikerWidth: BASE_ZOOM.bikerWidth * scale,
  bikerStackStep: BASE_ZOOM.bikerStackStep * scale,
  rowPitch: BASE_ZOOM.rowPitch * scale,
  panelPadTop: BASE_ZOOM.panelPadTop * scale,
  panelPadBottom: BASE_ZOOM.panelPadBottom * scale,
  panelTop: BASE_ZOOM.panelTop * scale,
  bandGap: BASE_ZOOM.bandGap * scale,
  nameColWidth: BASE_ZOOM.nameColWidth * scale,
  rowInset: BASE_ZOOM.rowInset * scale,
  tailGap: BASE_ZOOM.tailGap * scale,
  dateTop: BASE_ZOOM.dateTop * scale,
  smallFont: BASE_ZOOM.smallFont * scale,
  packFont: BASE_ZOOM.packFont * scale,
  emphFont: BASE_ZOOM.emphFont * scale,
  capFont: BASE_ZOOM.capFont * scale,
  monthFont: BASE_ZOOM.monthFont * scale,
  yearFont: BASE_ZOOM.yearFont * scale,
})

// The width for a bike ridden on Paris's bar — sized so its height matches the bar,
// so both the chase bikers and Paris's own tail biker scale with leaderBarHeight
// rather than the pack's fixed bikerWidth.
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
