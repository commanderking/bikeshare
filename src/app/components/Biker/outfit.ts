import { BikerColors, SKIN_TONES, SkinTone } from './colors'
import type { HelmetType } from './Helmet'
import { parseHexChannels } from './hexColor'

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
 * How much the far side of the top is darkened relative to the near side. The
 * far arm is also drawn at reduced opacity, so this only needs to be enough to
 * separate the two sides where they cross. Legs aren't shaded: a darker far leg
 * read as a different skin tone.
 */
const FAR_SIDE_SHADE = 0.78
/** Vents are cut into the shell, so they read as a deeper shade of it. */
const HELMET_VENT_SHADE = 0.68

/** Scale a hex color's channels toward black. */
function shade(hex: string, factor: number): string {
  return (
    '#' +
    parseHexChannels(hex)
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
    shin: bareShins ? skin : legwearColor,
    helmet: outfit.helmet.color,
  }
}
