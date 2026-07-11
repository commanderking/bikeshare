export interface BikerColors {
  frame: string
  frameDark: string
  frontFender: string
  /** Stroke color of the front basket / bracket. Defaults to `frameDark`. */
  basket: string
  saddle: string
  shirt: string
  shirtBack: string
  pants: string
  pantsBack: string
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

export const DEFAULT_COLORS: BikerColors = {
  frame: '#1f7a8c',
  frameDark: '#175d6b',
  frontFender: '#f5e79e',
  basket: '#175d6b',
  saddle: '#2e2e2e',
  shirt: '#3b6ea5',
  shirtBack: '#2f5985',
  pants: '#eef1f5',
  pantsBack: '#cfd6dc',
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
