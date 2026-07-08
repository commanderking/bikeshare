import type { BikerColors } from './colors'
import type { BasketType } from './Basket'

export interface CityBikeConfig {
  colors: Partial<BikerColors>
  basketType: BasketType
}

/**
 * Per-city bike configs, interpreted from real side-on photos of each system's
 * bicycle. See `docs/city-bike-colors.csv` for sources, confidence, and livery
 * notes. Keys match the ids in `constants/cities.ts`.
 *
 * Bike parts only — the rider (shirt/pants/skin/helmet) keeps the defaults.
 * `skirtGuard` is the branded panel over the rear wheel; `basketType` selects
 * the front-carrier shape (shared across cities with similar hardware).
 */
export const CITY_BIKE_CONFIG: Record<string, CityBikeConfig> = {
  austin: {
    basketType: 'rack',
    colors: {
      frame: '#17a3a0',
      frontFender: '#17a3a0',
      frameDark: '#0f7f7d',
      basket: '#0f7f7d',
      skirtGuard: '#6b4fa0',
      saddle: '#1b1b1b',
      tire: '#1a1a1a',
      wheelRim: '#ece8df',
      spoke: '#c9ccce',
      hub: '#7a7a7a',
      ring: '#2a2a2a',
      crank: '#2a2a2a',
    },
  },
  bergen: {
    basketType: 'rack',
    colors: {
      frame: '#e8e7e3',
      frontFender: '#e8e7e3',
      frameDark: '#3fae2c',
      basket: '#3fae2c',
      skirtGuard: '#dcdcd8',
      saddle: '#d6d6d3',
      tire: '#1a1a1a',
      wheelRim: '#3fae2c',
      spoke: '#c9ccce',
      hub: '#7a7a7a',
      ring: '#2a8a20',
      crank: '#2a2a2a',
    },
  },
  boston: {
    basketType: 'box',
    colors: {
      frame: '#1c8ac8',
      frontFender: '#1c8ac8',
      frameDark: '#135f97',
      basket: '#1c1c1c',
      skirtGuard: '#1c6fb0',
      saddle: '#1b1b1b',
      tire: '#1a1a1a',
      wheelRim: '#ece8df',
      spoke: '#c8cbce',
      hub: '#7a7a7a',
      ring: '#9a9a9a',
      crank: '#9a9a9a',
    },
  },
  chattanooga: {
    basketType: 'rack',
    colors: {
      frame: '#1d5fa0',
      frontFender: '#1d5fa0',
      frameDark: '#154a7a',
      basket: '#1a1a1a',
      skirtGuard: '#a6d50d',
      saddle: '#1b1b1b',
      tire: '#1a1a1a',
      wheelRim: '#b0b3b6',
      spoke: '#c0c3c6',
      hub: '#7a7a7a',
      ring: '#9a9a9a',
      crank: '#9a9a9a',
    },
  },
  chicago: {
    basketType: 'rack',
    colors: {
      frame: '#3aafd1',
      frontFender: '#3aafd1',
      frameDark: '#2385a3',
      basket: '#2a2a2a',
      skirtGuard: '#2f9cbe',
      saddle: '#1b1b1b',
      tire: '#1a1a1a',
      wheelRim: '#bfc2c5',
      spoke: '#c8cbce',
      hub: '#7a7a7a',
      ring: '#2a2a2a',
      crank: '#2a2a2a',
    },
  },
  columbus: {
    basketType: 'rack',
    colors: {
      frame: '#17171a',
      frontFender: '#17171a',
      frameDark: '#0b0b0d',
      basket: '#1a1a1a',
      skirtGuard: '#17827c',
      saddle: '#1b1b1b',
      tire: '#1a1a1a',
      wheelRim: '#c4c7ca',
      spoke: '#c8cbce',
      hub: '#8a8a8a',
      ring: '#9a9a9a',
      crank: '#9a9a9a',
    },
  },
  mexico_city: {
    basketType: 'box',
    colors: {
      frame: '#1a1a1d',
      frontFender: '#1a1a1d',
      frameDark: '#0c0c0e',
      basket: '#1e1e20',
      skirtGuard: '#b8b9bb',
      saddle: '#1b1b1b',
      tire: '#1a1a1a',
      wheelRim: '#e7e4de',
      spoke: '#c8cbce',
      hub: '#7a7a7a',
      ring: '#2a2a2a',
      crank: '#2a2a2a',
    },
  },
  seoul: {
    basketType: 'wire',
    colors: {
      frame: '#f3f3f0',
      frontFender: '#f3f3f0',
      frameDark: '#cfcfc9',
      basket: '#b8bbbe',
      skirtGuard: '#dcdcd8',
      saddle: '#1b1b1b',
      tire: '#1a1a1a',
      wheelRim: '#5cbe2d',
      spoke: '#c8cbce',
      hub: '#7a7a7a',
      ring: '#2a2a2a',
      crank: '#2a2a2a',
    },
  },
  taipei: {
    basketType: 'wire',
    colors: {
      frame: '#f4f3ef',
      frontFender: '#f7a70a',
      frameDark: '#c9c9c4',
      basket: '#1c1c1c',
      skirtGuard: '#f7a70a',
      saddle: '#1b1b1b',
      tire: '#1a1a1a',
      wheelRim: '#ece8df',
      spoke: '#c8cbce',
      hub: '#7a7a7a',
      ring: '#f7a70a',
      crank: '#2a2a2a',
    },
  },
}

/** City ids that have a bike config, in display order. */
export const CONFIGURED_CITY_IDS = Object.keys(CITY_BIKE_CONFIG)
