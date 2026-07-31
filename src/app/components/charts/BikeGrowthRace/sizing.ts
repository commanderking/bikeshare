import { BAR_HEIGHT, BIKER_WIDTH, NAME_COL_PX, ROW_HEIGHT } from './constants'

// Every layout dimension that grows when the race goes fullscreen. At normal size
// these are the fixed constants (BASE_SIZE); in fullscreen they all scale off the
// row height in lockstep, so the desktop proportions are preserved, just bigger.
export type SizeScale = {
  rowHeight: number
  barHeight: number
  bikerWidth: number
  nameColPx: number
  // Small text: city names + value labels (Tailwind text-xs at base).
  labelFontPx: number
  // Axis tick labels (text-[10px] at base).
  axisFontPx: number
  // The big month/year readout (text-4xl at base).
  monthFontPx: number
}

export const BASE_SIZE: SizeScale = {
  rowHeight: ROW_HEIGHT,
  barHeight: BAR_HEIGHT,
  bikerWidth: BIKER_WIDTH,
  nameColPx: NAME_COL_PX,
  labelFontPx: 12,
  axisFontPx: 10,
  monthFontPx: 36,
}

// Scale every dimension off the row height so a taller row grows bars, bikers, and
// text together. A row-height equal to ROW_HEIGHT reproduces BASE_SIZE exactly, so
// the normal-size layout is unchanged.
export const scaleToRowHeight = (rowHeight: number): SizeScale => {
  const factor = rowHeight / ROW_HEIGHT
  return {
    rowHeight,
    barHeight: BASE_SIZE.barHeight * factor,
    bikerWidth: BASE_SIZE.bikerWidth * factor,
    nameColPx: BASE_SIZE.nameColPx * factor,
    labelFontPx: BASE_SIZE.labelFontPx * factor,
    axisFontPx: BASE_SIZE.axisFontPx * factor,
    monthFontPx: BASE_SIZE.monthFontPx * factor,
  }
}
