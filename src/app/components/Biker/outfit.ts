import { BikerColors, SKIN_TONES, SkinTone } from './colors'
import type { HelmetType } from './Helmet'

export type SleeveLength = 'long' | 'short'
export type LegwearType = 'pants' | 'shorts' | 'skirt'

/**
 * What the rider is wearing. The biker's limbs are drawn as plain strokes, so
 * an outfit is mostly a mapping from garments to per-segment colors (see
 * `getOutfitColors`); only the skirt adds a shape of its own.
 */
export interface RiderOutfit {
  top: { sleeves: SleeveLength; color: string }
  legwear: { type: LegwearType; color: string }
  helmet: { type: HelmetType; color: string }
  skinTone: SkinTone
}

/**
 * How much the far-side garment is darkened relative to the near side. The far
 * limbs are also drawn at reduced opacity, so this only needs to be enough to
 * separate the two sides where they cross.
 */
const FAR_SIDE_SHADE = 0.78
/** Vents are cut into the shell, so they read as a deeper shade of it. */
const HELMET_VENT_SHADE = 0.68

/** Scale a #rrggbb color's channels toward black. */
function shade(hex: string, factor: number): string {
  const int = parseInt(hex.replace('#', ''), 16)
  const channels = [(int >> 16) & 255, (int >> 8) & 255, int & 255]
  return (
    '#' +
    channels
      .map((value) => Math.round(value * factor).toString(16).padStart(2, '0'))
      .join('')
  )
}

/** Vent slot color for a helmet shell. */
export const getHelmetVentColor = (shellColor: string) =>
  shade(shellColor, HELMET_VENT_SHADE)

/**
 * Resolve an outfit into the limb colors the SVG paints. Shorts bare the shins;
 * a skirt bares the whole leg, since its hem stops at mid-thigh (see
 * RiderSkirt.tsx).
 */
export function getOutfitColors(outfit: RiderOutfit): Partial<BikerColors> {
  const skin = SKIN_TONES[outfit.skinTone]
  const topColor = outfit.top.color
  const topBack = shade(topColor, FAR_SIDE_SHADE)
  const legwearColor = outfit.legwear.color
  const legwearBack = shade(legwearColor, FAR_SIDE_SHADE)

  const bareForearms = outfit.top.sleeves === 'short'
  const bareThighs = outfit.legwear.type === 'skirt'
  const bareShins = outfit.legwear.type !== 'pants'

  return {
    skin,
    shirt: topColor,
    shirtBack: topBack,
    forearm: bareForearms ? skin : topColor,
    forearmBack: bareForearms ? skin : topBack,
    hip: legwearColor,
    thigh: bareThighs ? skin : legwearColor,
    thighBack: bareThighs ? skin : legwearBack,
    shin: bareShins ? skin : legwearColor,
    shinBack: bareShins ? skin : legwearBack,
    helmet: outfit.helmet.color,
  }
}
