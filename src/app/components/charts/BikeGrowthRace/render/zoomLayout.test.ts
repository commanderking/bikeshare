import { describe, expect, it } from 'vitest'
import { TOP_N } from '../constants'
import { BASE_ZOOM_SIZE, getFinaleRows, makeZoomSize } from './zoomLayout'

describe('the finale rows', () => {
  // Where the pack's last row (index TOP_N-2) ends during the race — the line the
  // date's bottom sits on.
  const getLastPackRowBottom = (size = BASE_ZOOM_SIZE) =>
    size.panelTop +
    size.panelPadTop +
    (TOP_N - 2) * size.rowPitch +
    size.barHeight

  it("end the last bar level with the pack's last row, at any scale", () => {
    for (const size of [BASE_ZOOM_SIZE, makeZoomSize(1.7)]) {
      const { top, pitch, barHeight } = getFinaleRows(size)
      const lastBarBottom = top + (TOP_N - 1) * pitch + barHeight
      expect(lastBarBottom).toBeCloseTo(getLastPackRowBottom(size), 6)
    }
  })

  it('thicken the bars rather than only widening the gaps', () => {
    const { pitch, barHeight } = getFinaleRows(BASE_ZOOM_SIZE)
    expect(barHeight).toBeGreaterThan(36)
    expect(barHeight / pitch).toBeCloseTo(36 / 42, 6)
  })
})
