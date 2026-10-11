export interface BikerColors {
  frame: string
  frameDark: string
  frontFender: string
  /** Stroke color of the front basket / bracket. Defaults to `frameDark`. */
  basket: string
  saddle: string
  shirt: string
  shirtBack: string
  /** Near forearm — skin when the rider wears short sleeves, else `shirt`. */
  forearm: string
  /** Far forearm — skin when the rider wears short sleeves, else `shirtBack`. */
  forearmBack: string
  /** Hip joint — always the legwear color, since every garment covers the seat. */
  hip: string
  /** Near thigh — skin when the rider wears a skirt, whose hem stops at mid-thigh. */
  thigh: string
  thighBack: string
  /** Near shin — skin when the rider wears shorts or a skirt, else `thigh`. */
  shin: string
  /** Far shin — skin when the rider wears shorts or a skirt, else `thighBack`. */
  shinBack: string
  shoe: string
  skin: string
  helmet: string
  /** Outer tire color — usually black. */
  tire: string
  /** Thin inner rim band, drawn inside the tire (half the tire's width). */
  wheelRim: string
  spoke: string
  hub: string
  ring: string
  crank: string
  ground: string
}

/** Five rider skin tones, light to deep. */
export const SKIN_TONES = {
  light: '#f4d5bb',
  tan: '#e3b591',
  olive: '#c58e63',
  brown: '#96603c',
  deep: '#5f3b26',
} as const

export type SkinTone = keyof typeof SKIN_TONES

export const DEFAULT_COLORS: BikerColors = {
  frame: '#1f7a8c',
  frameDark: '#175d6b',
  frontFender: '#f5e79e',
  basket: '#175d6b',
  saddle: '#2e2e2e',
  shirt: '#3b6ea5',
  shirtBack: '#2f5985',
  forearm: '#3b6ea5',
  forearmBack: '#2f5985',
  // Black legs read clearly against every livery, so the pedaling stroke stays
  // legible even at small sizes. The far leg (thighBack) is drawn muted.
  hip: '#1c1c1c',
  thigh: '#1c1c1c',
  thighBack: '#2a2a2a',
  shin: '#1c1c1c',
  shinBack: '#2a2a2a',
  shoe: '#2b2b2b',
  skin: '#caa07a',
  helmet: '#d9534f',
  tire: '#1c1c1c',
  wheelRim: '#777',
  spoke: '#bbb',
  hub: '#666',
  ring: '#999',
  crank: '#888',
  ground: '#ccc',
}
