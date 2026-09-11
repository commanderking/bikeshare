import type { RiderOutfit } from './outfit'

/**
 * What each city's rider wears. Rolled once at random from a curated garment
 * palette and then frozen here, so the page renders identically on every load
 * and any single outfit can be hand-tuned without disturbing its neighbors.
 *
 * Two constraints shaped the roll: each sleeve/legwear/helmet variant was dealt
 * out in round-robin passes so none is under-represented, and a top had to be
 * far enough from both white and its city's frame color — the torso sits
 * against the page rather than the bike, so pale tops vanish.
 *
 * `skinTone` is the exception — it is not random. Each is the modal skin tone of
 * that city's residents, taken from the plurality group in the figures cited per
 * entry below. Three caveats travel with it:
 *
 *   - Skin tone is not race, and "race" is not a portable category. The US and
 *     Canada count it, the UK counts ethnic group, Norway and Finland count
 *     immigrant background or language, and France, Spain and Mexico do not
 *     count it at all. Entries marked ESTIMATE or UNSOURCED have no official
 *     figure standing behind them.
 *   - Most of these cities have no majority group. Washington DC turns on 3.4
 *     points, Chicago's top three are within 3, and San Francisco's plurality
 *     reverses under 2024 estimates. A plurality rule resolves every one of
 *     those toward the largest group.
 *   - One rider cannot represent a city. Read each as "a plausible resident",
 *     never as a claim about who lives there.
 *
 * Rider only; the bike each one rides comes from CITY_BIKE_CONFIG. Keys match
 * the ids in `constants/cities.ts`.
 */
export const CITY_RIDER_OUTFIT: Record<string, RiderOutfit> = {
  // 47.1% non-Hispanic white, 32.5% Hispanic, 8.9% Asian, 6.9% Black (2020 census).
  // Source: Wikipedia "Austin, Texas".
  austin: {
    top: { sleeves: 'short', color: '#6b7f9e' },
    legwear: { type: 'shorts', color: '#7a3b3b' },
    helmet: { type: 'cap', color: '#e0e0dc' },
    skinTone: 'light',
  },
  // Norway-wide: 16.8% immigrants, 20.8% including Norwegian-born to immigrant
  // parents (2024). Bergen sits below Oslo's 30.4%; no city figure published.
  // Source: Wikipedia "Immigration to Norway".
  bergen: {
    top: { sleeves: 'long', color: '#2f3e56' },
    legwear: { type: 'skirt', color: '#d9d4c5' },
    helmet: { type: 'road', color: '#d97ba0' },
    skinTone: 'light',
  },
  // 44.6% non-Hispanic white, 19.1% Black, 18.7% Hispanic, 11.2% Asian (2020 census).
  // Source: Wikipedia "List of largest U.S. municipalities by race/ethnicity in 2020".
  boston: {
    top: { sleeves: 'long', color: '#f0a63c' },
    legwear: { type: 'pants', color: '#33415c' },
    helmet: { type: 'commuter', color: '#1c1c1c' },
    skinTone: 'light',
  },
  // 54.7% non-Hispanic white, 28.9% Black, 9.2% Hispanic, 2.7% Asian (2020 census).
  // Source: Wikipedia "Chattanooga, Tennessee".
  chattanooga: {
    top: { sleeves: 'short', color: '#3f3f46' },
    legwear: { type: 'shorts', color: '#8d99ae' },
    helmet: { type: 'road', color: '#59b3c4' },
    skinTone: 'light',
  },
  // 31.4% non-Hispanic white, 29.8% Hispanic, 28.7% Black, 6.9% Asian (2020 census).
  // Top three groups within 3 points — the tone is a coin toss between them.
  // Source: Wikipedia "Demographics of Chicago".
  chicago: {
    top: { sleeves: 'long', color: '#2f3e56' },
    legwear: { type: 'pants', color: '#d9d4c5' },
    helmet: { type: 'cap', color: '#b8543a' },
    skinTone: 'light',
  },
  // 52.0% non-Hispanic white, 28.3% Black, 7.8% Hispanic, 6.2% Asian (2020 census).
  // Source: Wikipedia "Columbus, Ohio".
  columbus: {
    top: { sleeves: 'short', color: '#2f3e56' },
    legwear: { type: 'skirt', color: '#5c6b73' },
    helmet: { type: 'commuter', color: '#b8543a' },
    skinTone: 'light',
  },
  // ESTIMATE — no official figure exists. Mexico dropped racial categories after
  // the 1921 census (~60% mestizo then) and has never published Euro-descendant results.
  // Source: Wikipedia "Demographics of Mexico".
  mexico_city: {
    top: { sleeves: 'short', color: '#7a8b3c' },
    legwear: { type: 'shorts', color: '#5c6b73' },
    helmet: { type: 'road', color: '#f0a63c' },
    skinTone: 'olive',
  },
  // South Korea is 94.6% ethnic Korean; 5.4% foreign residents (Dec 2025).
  // National figure — no separate city-level ethnic breakdown is collected.
  // Source: Wikipedia "Demographics of South Korea".
  seoul: {
    top: { sleeves: 'long', color: '#7a8b3c' },
    legwear: { type: 'skirt', color: '#4a4a52' },
    helmet: { type: 'commuter', color: '#8e5ea8' },
    skinTone: 'tan',
  },
  // Han Chinese (Hoklo, Waishengren, Hakka) majority; indigenous peoples under 1%
  // (16,713 in 2018); 71,858 foreign residents (2022).
  // Source: Wikipedia "Taipei".
  taipei: {
    top: { sleeves: 'short', color: '#3b6ea5' },
    legwear: { type: 'pants', color: '#7a3b3b' },
    helmet: { type: 'cap', color: '#d9534f' },
    skinTone: 'tan',
  },
  // 44.3% not a visible minority; South Asian 14.0%, Chinese 10.7%, Black 9.6% (2021).
  // Visible minorities are 55.7% in aggregate, so the plurality is not a majority.
  // Source: Wikipedia "Demographics of Toronto".
  toronto: {
    top: { sleeves: 'long', color: '#6b7f9e' },
    legwear: { type: 'shorts', color: '#d9d4c5' },
    helmet: { type: 'road', color: '#59b3c4' },
    skinTone: 'light',
  },
  // 41.4% Black, 38.0% non-Hispanic white, 11.3% Hispanic, 4.8% Asian (2020 census).
  // Closest call on the list — 3.4 points.
  // Source: Wikipedia "Demographics of Washington, D.C.".
  washington_dc: {
    top: { sleeves: 'short', color: '#3f3f46' },
    legwear: { type: 'skirt', color: '#7a3b3b' },
    helmet: { type: 'commuter', color: '#f0a63c' },
    skinTone: 'brown',
  },
  // South Korea is 94.6% ethnic Korean; 5.4% foreign residents (Dec 2025).
  // National figure — no separate city-level ethnic breakdown is collected.
  // Source: Wikipedia "Demographics of South Korea".
  daejeon: {
    top: { sleeves: 'long', color: '#8e5ea8' },
    legwear: { type: 'pants', color: '#33415c' },
    helmet: { type: 'cap', color: '#d97ba0' },
    skinTone: 'tan',
  },
  // ESTIMATE — no official figure exists, as for Mexico City. Mexico has not
  // categorized the population by race in a census since 1921.
  // Source: Wikipedia "Demographics of Mexico".
  guadalajara: {
    top: { sleeves: 'long', color: '#8c5a3c' },
    legwear: { type: 'skirt', color: '#8d99ae' },
    helmet: { type: 'cap', color: '#59b3c4' },
    skinTone: 'olive',
  },
  // By native language: Finnish 73.4%, Swedish 5.4%, other 21.2%. Finland reports
  // language and country of birth rather than ethnicity.
  // Source: Wikipedia "Helsinki".
  helsinki: {
    top: { sleeves: 'short', color: '#b8543a' },
    legwear: { type: 'pants', color: '#8d99ae' },
    helmet: { type: 'road', color: '#f0a63c' },
    skinTone: 'light',
  },
  // 27.8% Asian, 24.9% Hispanic, 23.8% non-Hispanic white, 18.5% Black (2020 census).
  // Asian plurality is largely South Asian and Filipino. Four groups within 9 points.
  // Source: Wikipedia "Jersey City, New Jersey".
  jersey_city: {
    top: { sleeves: 'short', color: '#8c5a3c' },
    legwear: { type: 'shorts', color: '#d9d4c5' },
    helmet: { type: 'commuter', color: '#8e5ea8' },
    skinTone: 'olive',
  },
  // 30.9% non-Hispanic white, 28.3% Hispanic, 20.2% Black, 15.6% Asian (2020 census).
  // Source: Wikipedia "Demographics of New York City".
  new_york_city: {
    top: { sleeves: 'long', color: '#7a8b3c' },
    legwear: { type: 'pants', color: '#7a3b3b' },
    helmet: { type: 'road', color: '#8e5ea8' },
    skinTone: 'light',
  },
  // 30.4% immigrant background (2012), the highest of any Norwegian city; nationally
  // 20.8% including Norwegian-born to immigrant parents (2024).
  // Source: Wikipedia "Immigration to Norway".
  oslo: {
    top: { sleeves: 'long', color: '#c94f4f' },
    legwear: { type: 'skirt', color: '#2f5d50' },
    helmet: { type: 'commuter', color: '#59b3c4' },
    skinTone: 'light',
  },
  // 36.8% White British, 53.8% white overall, 20.8% Asian, 13.5% Black, 5.7% mixed (2021).
  // White British has been a minority in London since 2011.
  // Source: Wikipedia "Demography of London".
  london: {
    top: { sleeves: 'short', color: '#8e5ea8' },
    legwear: { type: 'shorts', color: '#7a3b3b' },
    helmet: { type: 'cap', color: '#d97ba0' },
    skinTone: 'light',
  },
  // 46.9% Hispanic, 28.9% non-Hispanic white, 11.7% Asian, 8.3% Black (2020 census).
  // Source: Wikipedia "Demographics of Los Angeles".
  los_angeles: {
    top: { sleeves: 'long', color: '#d97ba0' },
    legwear: { type: 'shorts', color: '#7a3b3b' },
    helmet: { type: 'commuter', color: '#59b3c4' },
    skinTone: 'olive',
  },
  // 60.3% not a visible minority; Black 11.5%, Arab 8.2%, South Asian 4.6% (2021).
  // Source: Wikipedia "Demographics of Montreal".
  montreal: {
    top: { sleeves: 'short', color: '#8c5a3c' },
    legwear: { type: 'skirt', color: '#5c6b73' },
    helmet: { type: 'cap', color: '#59b3c4' },
    skinTone: 'light',
  },
  // 38.3% Black, 34.4% non-Hispanic white, 14.9% Hispanic, 8.3% Asian (2020 census).
  // Source: Wikipedia "List of largest U.S. municipalities by race/ethnicity in 2020".
  philadelphia: {
    top: { sleeves: 'long', color: '#8e5ea8' },
    legwear: { type: 'pants', color: '#33415c' },
    helmet: { type: 'road', color: '#f0a63c' },
    skinTone: 'brown',
  },
  // 64.7% non-Hispanic white, 23.0% Black, 5.8% Asian, 3.2% Hispanic (2020 census).
  // Source: Wikipedia "Pittsburgh".
  pittsburgh: {
    top: { sleeves: 'short', color: '#6b7f9e' },
    legwear: { type: 'skirt', color: '#33415c' },
    helmet: { type: 'cap', color: '#d9534f' },
    skinTone: 'light',
  },
  // Argentina is roughly 79-86% European-descended by various estimates; the 2022
  // census recorded 2.8% Native and 0.7% Black. Rosario is heavily Italian/Spanish.
  // Source: Wikipedia "Demographics of Argentina".
  rosario: {
    top: { sleeves: 'long', color: '#b8543a' },
    legwear: { type: 'shorts', color: '#1c1c1c' },
    helmet: { type: 'road', color: '#f0a63c' },
    skinTone: 'tan',
  },
  // 39.1% non-Hispanic white, 33.7% Asian, 15.7% Hispanic, 5.2% Black (2020 census).
  // NOTE: 2024 estimates reverse this — Asian 37.2% vs non-Hispanic white 36.5%.
  // Source: Wikipedia "List of largest U.S. municipalities by race/ethnicity in 2020".
  san_francisco: {
    top: { sleeves: 'short', color: '#b8543a' },
    legwear: { type: 'pants', color: '#6b4f3a' },
    helmet: { type: 'commuter', color: '#4f9d69' },
    skinTone: 'light',
  },
  // No city figure published; below Oslo's 30.4%. Norway-wide 20.8% including
  // Norwegian-born to immigrant parents (2024).
  // Source: Wikipedia "Immigration to Norway".
  trondheim: {
    top: { sleeves: 'long', color: '#4f9d69' },
    legwear: { type: 'pants', color: '#3d2f4f' },
    helmet: { type: 'cap', color: '#b8543a' },
    skinTone: 'light',
  },
  // 43.2% European origin; East Asian 29.3%, Southeast Asian 9.1%, South Asian 6.9% (2021).
  // Visible minorities are over 56% in aggregate.
  // Source: Wikipedia "Demographics of Vancouver".
  vancouver: {
    top: { sleeves: 'short', color: '#8c5a3c' },
    legwear: { type: 'skirt', color: '#5c6b73' },
    helmet: { type: 'road', color: '#d9534f' },
    skinTone: 'light',
  },
  // ESTIMATE — French censuses are barred by law from asking about ethnicity.
  // Closest proxy: 21% immigrants and 28% with an immigrant parent (2020-21).
  // Source: Wikipedia "Demographics of Paris".
  paris: {
    top: { sleeves: 'long', color: '#3b6ea5' },
    legwear: { type: 'shorts', color: '#33415c' },
    helmet: { type: 'commuter', color: '#d97ba0' },
    skinTone: 'light',
  },
  // UNSOURCED — Spain records nationality and country of birth, not ethnicity, and
  // no usable Madrid figure was found. Tone is a placeholder; verify before shipping.
  // Source: none found.
  madrid: {
    top: { sleeves: 'short', color: '#6b7f9e' },
    legwear: { type: 'shorts', color: '#7a3b3b' },
    helmet: { type: 'cap', color: '#b8543a' },
    skinTone: 'tan',
  },
}
