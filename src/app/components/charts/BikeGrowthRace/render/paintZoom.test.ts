import { describe, expect, it } from 'vitest'
import { paintZoomFrame } from './paintZoom'
import type { ZoomRefs } from '../hooks/useZoomRefs'
import { BASE_ZOOM_SIZE, getDateIntroTop } from './zoomLayout'
import type { RaceCity } from '../timeline/buildRaceTimeline'

// Minimal stand-ins for the DOM nodes paint writes to: only `style` and the two
// setters it touches. Paint reads nothing back, so a bag of properties is enough.
const makeNode = () => {
  const attrs: Record<string, string> = {}
  return {
    style: {} as Record<string, string>,
    textContent: '',
    // Resting layout position; the date intro reads these to derive its travel.
    offsetLeft: 0,
    offsetTop: 0,
    attrs,
    setAttribute(name: string, value: string) {
      attrs[name] = value
    },
  }
}

const makeRefs = () => {
  const leaderValue = makeNode()
  const leaderTail = makeNode()
  const date = makeNode()
  const leftLine = makeNode()
  const beam = makeNode()
  const refs = {
    stage: { current: { clientWidth: 1136 } },
    leaderValue: { current: leaderValue },
    leaderTail: { current: leaderTail },
    date: { current: date },
    leftLine: { current: leftLine },
    beam: { current: beam },
    packRows: { current: new Map() },
    packNames: { current: new Map() },
    packBars: { current: new Map() },
    packValues: { current: new Map() },
    chasingBikers: { current: new Map() },
  } as unknown as ZoomRefs
  // Every other element ref is absent; paint null-checks each one.
  for (const name of [
    'leaderBar',
    'leaderName',
    'leaderColName',
    'shade',
    'marker',
    'connector',
    'rightLine',
    'panelBg',
    'dateMonth',
    'highlight',
  ]) {
    ;(refs as unknown as Record<string, { current: null }>)[name] = {
      current: null,
    }
  }
  return { refs, leaderValue, leaderTail, leftLine, beam, date }
}

// A leader sitting at `value` for the whole (two-month) axis.
const makeLeader = (value: number, city = 'paris'): RaceCity => ({
  city,
  metroArea: city,
  firstIndex: 0,
  lastIndex: 1,
  cumulative: [value, value],
  monthlyTrips: [value, 0],
})

const paintAt = (value: number, morph = 0) => {
  const { refs, leaderValue, leaderTail } = makeRefs()
  const cityMap = new Map([['paris', makeLeader(value)]])
  paintZoomFrame(
    refs,
    { order: ['paris'], cityMap, size: BASE_ZOOM_SIZE },
    0,
    morph
  )
  return { leaderValue, leaderTail }
}

// Paint a whole field, so the magnifier has a real last place to bracket.
const paintField = (values: Array<[string, number]>) => {
  const { refs, leftLine, beam } = makeRefs()
  const cityMap = new Map(
    values.map(([city, v]) => [city, makeLeader(v, city)])
  )
  const order = values.map(([city]) => city)
  paintZoomFrame(refs, { order, cityMap, size: BASE_ZOOM_SIZE }, 0)
  return { leftLine, beam }
}

describe('leader value label', () => {
  it('is hidden below the 3M threshold', () => {
    expect(paintAt(2_500_000).leaderValue.style.opacity).toBe('0')
  })

  // Regression: this opacity was once wired to a "bar is at full width" test, which
  // kept the label hidden until 50M. Asserting on the layout alone would not have
  // caught it — the bug was in what paint did with the layout.
  it('shows well before the bar pins at full width', () => {
    expect(paintAt(3_000_000).leaderValue.style.opacity).toBe('1')
    expect(paintAt(50_000_000).leaderValue.style.opacity).toBe('1')
  })

  it('tracks the bar tip and carries the formatted value', () => {
    const el = paintAt(6_000_000).leaderValue
    expect(el.textContent).toBe('6.0M')
    // Bar tip at 6M against the 50M intro scale, as a stage percentage.
    expect(el.style.left).toBe(`${(6 / 50) * (1 - 0.14) * 100}%`)
  })
})

describe("the leader's bike through the finale morph", () => {
  const { leaderBarHeight } = BASE_ZOOM_SIZE
  // The finale bar height the layout travels to (BAR_HEIGHT x scale 1).
  const FINALE_BAR_HEIGHT = 36

  it('is left unscaled while the race plays', () => {
    expect(paintAt(600_000_000, 0).leaderTail.style.transform).toBe('none')
  })

  it('shrinks to the finale bar height once settled', () => {
    const { transform } = paintAt(600_000_000, 1).leaderTail.style
    expect(transform).toBe(`scale(${FINALE_BAR_HEIGHT / leaderBarHeight})`)
  })

  it('keeps the bike exactly bar-height part-way through', () => {
    const { leaderTail } = paintAt(600_000_000, 0.6)
    const scale = Number(
      /scale\(([^)]+)\)/.exec(leaderTail.style.transform)![1]
    )
    const barHeight = Number(leaderTail.style.height.replace('px', ''))
    // Bike renders at its zoom height x scale; that must track the bar's own travel.
    expect(leaderBarHeight * scale).toBeCloseTo(barHeight, 6)
  })
})

describe('the magnifier beam', () => {
  const LEADER_MAX = 1 - 0.14
  // x on the leader's bar for a value, against the 50M intro scale.
  const barX = (value: number) => (value / 50_000_000) * LEADER_MAX * 100

  it('starts its left edge at the last visible city, not at zero', () => {
    const { leftLine, beam } = paintField([
      ['paris', 40_000_000],
      ['nyc', 20_000_000],
      ['london', 8_000_000],
    ])
    expect(Number(leftLine.attrs.x1)).toBeCloseTo(barX(8_000_000), 6)
    expect(beam.attrs.points.split(' ')[0]).toBe(`${barX(8_000_000)},0`)
  })

  it('spans last place to the #2 marker', () => {
    const { beam } = paintField([
      ['paris', 40_000_000],
      ['nyc', 20_000_000],
      ['london', 8_000_000],
    ])
    const [first, second] = beam.attrs.points.split(' ')
    expect(first).toBe(`${barX(8_000_000)},0`)
    expect(second).toBe(`${barX(20_000_000)},0`)
  })

  it('collapses to the origin when the leader is alone on screen', () => {
    const { leftLine } = paintField([['paris', 40_000_000]])
    expect(leftLine.attrs.x1).toBe('0')
  })
})

describe('the date readout entrance', () => {
  const REST_LEFT = 900
  const REST_TOP = 478

  // `entrance` is keyed to Montreal's value, so its presence controls the arrival.
  const paintDate = (montrealValue: number) => {
    const { refs, date } = makeRefs()
    date.offsetLeft = REST_LEFT
    date.offsetTop = REST_TOP
    const cityMap = new Map([
      ['paris', makeLeader(40_000_000)],
      ['montreal', makeLeader(montrealValue, 'montreal')],
    ])
    paintZoomFrame(
      refs,
      { order: ['paris', 'montreal'], cityMap, size: BASE_ZOOM_SIZE },
      0
    )
    return date
  }

  it('starts under the leader bar at the left edge, not at its resting corner', () => {
    const date = paintDate(0)
    const introTop = getDateIntroTop(BASE_ZOOM_SIZE)
    // Fully travelled back: left to x 0, and up to where it used to rest.
    expect(date.style.transform).toBe(
      `translate(${-REST_LEFT}px, ${-(REST_TOP - introTop)}px)`
    )
  })

  it('carries a real vertical drop, since the resting spot moved to the bottom', () => {
    const date = paintDate(0)
    const dy = Number(/,\s*(-?[\d.]+)px\)/.exec(date.style.transform)![1])
    expect(dy).toBeLessThan(-200)
  })

  it('settles to no transform once the pack has entered', () => {
    expect(paintDate(10_000_000).style.transform).toBe('none')
  })
})
