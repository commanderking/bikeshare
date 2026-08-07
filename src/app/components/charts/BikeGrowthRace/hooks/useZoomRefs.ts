import { MutableRefObject, RefObject, useRef } from 'react'

// Every DOM node the zoom view paints imperatively, bundled so paintZoomFrame can
// reach them by name. Element refs animate individually; the four maps hold the pack
// rows keyed by city id (populated via callback refs in the render).
export type ZoomRefs = {
  stage: RefObject<HTMLDivElement>
  leaderBar: RefObject<HTMLDivElement>
  leaderTail: RefObject<HTMLDivElement>
  leaderValue: RefObject<HTMLSpanElement>
  leaderName: RefObject<HTMLSpanElement>
  leaderColName: RefObject<HTMLSpanElement>
  shade: RefObject<HTMLDivElement>
  marker: RefObject<HTMLDivElement>
  connector: RefObject<SVGSVGElement>
  beam: RefObject<SVGPolygonElement>
  rightLine: RefObject<SVGLineElement>
  panelBg: RefObject<HTMLDivElement>
  date: RefObject<HTMLDivElement>
  highlight: RefObject<HTMLDivElement>
  packRows: MutableRefObject<Map<string, HTMLDivElement>>
  packNames: MutableRefObject<Map<string, HTMLSpanElement>>
  packBars: MutableRefObject<Map<string, HTMLDivElement>>
  packValues: MutableRefObject<Map<string, HTMLSpanElement>>
  // Pack bikers riding along Paris's own bar, keyed by city id.
  chasingBikers: MutableRefObject<Map<string, HTMLDivElement>>
}

export const useZoomRefs = (): ZoomRefs => ({
  stage: useRef<HTMLDivElement>(null),
  leaderBar: useRef<HTMLDivElement>(null),
  leaderTail: useRef<HTMLDivElement>(null),
  leaderValue: useRef<HTMLSpanElement>(null),
  leaderName: useRef<HTMLSpanElement>(null),
  leaderColName: useRef<HTMLSpanElement>(null),
  shade: useRef<HTMLDivElement>(null),
  marker: useRef<HTMLDivElement>(null),
  connector: useRef<SVGSVGElement>(null),
  beam: useRef<SVGPolygonElement>(null),
  rightLine: useRef<SVGLineElement>(null),
  panelBg: useRef<HTMLDivElement>(null),
  date: useRef<HTMLDivElement>(null),
  highlight: useRef<HTMLDivElement>(null),
  packRows: useRef(new Map<string, HTMLDivElement>()),
  packNames: useRef(new Map<string, HTMLSpanElement>()),
  packBars: useRef(new Map<string, HTMLDivElement>()),
  packValues: useRef(new Map<string, HTMLSpanElement>()),
  chasingBikers: useRef(new Map<string, HTMLDivElement>()),
})
