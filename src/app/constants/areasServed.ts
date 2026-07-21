// Municipalities / areas each bikeshare system actually serves, with official
// population figures. Keys match `src/app/constants/cities.ts`.
//
// Notes on the data:
// - `population` is the whole-municipality figure from that country's official
//   statistics agency (census or latest official estimate). A system may cover
//   only PART of a listed municipality — see `partialCoverage`.
// - Coverage reflects a mid-2026 snapshot; service areas shift over time.
// - Prose companion / sourcing rationale: `docs/city_areas_served.md`.

export type AreaType = 'city' | 'town' | 'borough' | 'county' | 'district'

export type CoveredArea = {
  /** Display name, e.g. "Cambridge". */
  name: string
  /** State / province / region the area sits in, e.g. "MA", "QC". */
  admin?: string
  type: AreaType
  /** Whole-municipality population. */
  population: number
  /** Reference year of the population figure. */
  populationYear: number
  /** Official source name, e.g. "U.S. Census Bureau, 2020 Census". */
  source: string
  /** Link to the official source. */
  sourceUrl: string
  /** True when the system covers only a minority of this municipality. */
  partialCoverage?: boolean
}

export type SystemAreas = {
  /** The system's brand name, e.g. "Bluebikes". */
  system: string
  note?: string
  coveredAreas: CoveredArea[]
}

// Per-country official statistics sources, referenced below to stay DRY.
const SRC = {
  usCensus2020: {
    source: 'U.S. Census Bureau, 2020 Census',
    sourceUrl: 'https://www.census.gov/quickfacts',
    year: 2020,
  },
  statCan2021: {
    source: 'Statistics Canada, 2021 Census',
    sourceUrl:
      'https://www12.statcan.gc.ca/census-recensement/2021/dp-pd/prof/index.cfm',
    year: 2021,
  },
  inegi2020: {
    source: 'INEGI, 2020 Census',
    sourceUrl: 'https://www.inegi.org.mx/programas/ccpv/2020/',
    year: 2020,
  },
  ssb2024: {
    source: 'Statistics Norway (SSB), 2024',
    sourceUrl:
      'https://www.ssb.no/en/befolkning/folketall/statistikk/befolkning',
    year: 2024,
  },
  statFi2024: {
    source: 'Statistics Finland, 2024',
    sourceUrl: 'https://stat.fi/',
    year: 2024,
  },
  ons2021: {
    source: 'UK ONS, 2021 Census',
    sourceUrl:
      'https://www.ons.gov.uk/peoplepopulationandcommunity/populationandmigration/populationestimates',
    year: 2021,
  },
  kostat2023: {
    source: 'Statistics Korea (KOSTAT), 2023',
    sourceUrl: 'https://kostat.go.kr/',
    year: 2023,
  },
  taipei2024: {
    source: 'Taipei City Government, 2024',
    sourceUrl: 'https://english.gov.taipei/',
    year: 2024,
  },
  indec2022: {
    source: 'INDEC, 2022 Census',
    sourceUrl: 'https://www.indec.gob.ar/',
    year: 2022,
  },
} as const

type SourceRef = { source: string; sourceUrl: string; year: number }

// Every official statistics source used for the population figures.
export const POPULATION_SOURCES: SourceRef[] = Object.values(SRC)

// Small builder so each area row reads as data, not boilerplate.
const area = (
  name: string,
  admin: string | undefined,
  type: AreaType,
  population: number,
  src: SourceRef,
  partialCoverage?: boolean
): CoveredArea => ({
  name,
  admin,
  type,
  population,
  populationYear: src.year,
  source: src.source,
  sourceUrl: src.sourceUrl,
  ...(partialCoverage ? { partialCoverage } : {}),
})

export const AREAS_SERVED: Record<string, SystemAreas> = {
  // ---- United States ----
  austin: {
    system: 'CapMetro Bikeshare (formerly MetroBike)',
    coveredAreas: [
      area('Austin', 'TX', 'city', 961855, SRC.usCensus2020, true),
    ],
  },
  boston: {
    system: 'Bluebikes',
    coveredAreas: [
      area('Boston', 'MA', 'city', 675647, SRC.usCensus2020),
      area('Cambridge', 'MA', 'city', 118403, SRC.usCensus2020),
      area('Newton', 'MA', 'city', 88923, SRC.usCensus2020),
      area('Somerville', 'MA', 'city', 81045, SRC.usCensus2020),
      area('Malden', 'MA', 'city', 66263, SRC.usCensus2020),
      area('Brookline', 'MA', 'town', 63191, SRC.usCensus2020),
      area('Revere', 'MA', 'city', 62186, SRC.usCensus2020),
      area('Medford', 'MA', 'city', 59659, SRC.usCensus2020),
      area('Everett', 'MA', 'city', 49075, SRC.usCensus2020),
      area('Arlington', 'MA', 'town', 46308, SRC.usCensus2020),
      area('Salem', 'MA', 'city', 44480, SRC.usCensus2020),
      area('Chelsea', 'MA', 'city', 40787, SRC.usCensus2020),
      area('Watertown', 'MA', 'city', 35329, SRC.usCensus2020),
    ],
  },
  chattanooga: {
    system: 'Bike Chattanooga',
    coveredAreas: [
      area('Chattanooga', 'TN', 'city', 181099, SRC.usCensus2020, true),
    ],
  },
  chicago: {
    system: 'Divvy',
    coveredAreas: [
      area('Chicago', 'IL', 'city', 2746388, SRC.usCensus2020),
      area('Evanston', 'IL', 'city', 78110, SRC.usCensus2020),
    ],
  },
  columbus: {
    system: 'CoGo',
    note: 'CoGo ceased operations in Spring 2025.',
    coveredAreas: [
      area('Columbus', 'OH', 'city', 905748, SRC.usCensus2020, true),
      area('Upper Arlington', 'OH', 'city', 36800, SRC.usCensus2020),
      area('Bexley', 'OH', 'city', 12793, SRC.usCensus2020),
      area('Grandview Heights', 'OH', 'city', 9184, SRC.usCensus2020),
    ],
  },
  jersey_city: {
    system: 'Citi Bike (New Jersey)',
    note: 'Part of the same Citi Bike system as New York City.',
    coveredAreas: [
      area('Jersey City', 'NJ', 'city', 292449, SRC.usCensus2020),
      area('Hoboken', 'NJ', 'city', 60419, SRC.usCensus2020),
    ],
  },
  los_angeles: {
    system: 'Metro Bike Share',
    note: 'Covers select LA neighborhoods (DTLA, Hollywood, Westside, Venice) plus the Port of LA.',
    coveredAreas: [
      area('Los Angeles', 'CA', 'city', 3898747, SRC.usCensus2020, true),
    ],
  },
  new_york_city: {
    system: 'Citi Bike',
    note: 'The same Citi Bike system also serves Jersey City & Hoboken, NJ (see jersey_city), but those are not included as those city trips are captured in the Jersey City trips.',
    coveredAreas: [
      area('Brooklyn', 'NY', 'borough', 2736074, SRC.usCensus2020),
      area('Queens', 'NY', 'borough', 2405464, SRC.usCensus2020, true),
      area('Manhattan', 'NY', 'borough', 1694251, SRC.usCensus2020),
      area('The Bronx ', 'NY', 'borough', 1472654, SRC.usCensus2020, true),
    ],
  },
  philadelphia: {
    system: 'Indego',
    coveredAreas: [
      area('Philadelphia', 'PA', 'city', 1603797, SRC.usCensus2020, true),
    ],
  },
  pittsburgh: {
    system: 'POGOH',
    note: 'A planned Phase 4 (~2026) reaches beyond city limits for the first time.',
    coveredAreas: [
      area('Pittsburgh', 'PA', 'city', 302971, SRC.usCensus2020, true),
    ],
  },
  san_francisco: {
    system: 'Bay Wheels',
    coveredAreas: [
      area('San Jose', 'CA', 'city', 1013240, SRC.usCensus2020, true),
      area('San Francisco', 'CA', 'city', 873965, SRC.usCensus2020),
      area('Oakland', 'CA', 'city', 440646, SRC.usCensus2020),
      area('Berkeley', 'CA', 'city', 124321, SRC.usCensus2020),
      area('Daly City', 'CA', 'city', 104901, SRC.usCensus2020, true),
      area('Emeryville', 'CA', 'city', 12905, SRC.usCensus2020),
    ],
  },
  washington_dc: {
    system: 'Capital Bikeshare',
    coveredAreas: [
      area('Fairfax County', 'VA', 'county', 1150309, SRC.usCensus2020, true),
      area(
        'Montgomery County',
        'MD',
        'county',
        1062061,
        SRC.usCensus2020,
        true
      ),
      area(
        "Prince George's County",
        'MD',
        'county',
        967201,
        SRC.usCensus2020,
        true
      ),
      area('Washington', 'DC', 'city', 689545, SRC.usCensus2020),
      area('Arlington County', 'VA', 'county', 238643, SRC.usCensus2020),
      area('Alexandria', 'VA', 'city', 159467, SRC.usCensus2020),
      area('City of Fairfax', 'VA', 'city', 24146, SRC.usCensus2020),
      area('Falls Church', 'VA', 'city', 14658, SRC.usCensus2020),
    ],
  },

  // ---- Canada ----
  montreal: {
    system: 'BIXI',
    coveredAreas: [
      area('Montréal', 'QC', 'city', 1762949, SRC.statCan2021),
      area('Laval', 'QC', 'city', 438366, SRC.statCan2021),
      area('Longueuil', 'QC', 'city', 254483, SRC.statCan2021),
      area('Terrebonne', 'QC', 'city', 119944, SRC.statCan2021, true),
      area('Boucherville', 'QC', 'city', 41743, SRC.statCan2021),
      area('Sainte-Julie', 'QC', 'city', 30045, SRC.statCan2021),
      area('Mont-Royal', 'QC', 'town', 21202, SRC.statCan2021),
      area('Westmount', 'QC', 'city', 20834, SRC.statCan2021),
      area('Montréal-Est', 'QC', 'city', 4394, SRC.statCan2021),
    ],
  },
  toronto: {
    system: 'Bike Share Toronto',
    coveredAreas: [area('Toronto', 'ON', 'city', 2794356, SRC.statCan2021)],
  },
  vancouver: {
    system: 'Mobi',
    coveredAreas: [
      area('Vancouver', 'BC', 'city', 662248, SRC.statCan2021, true),
    ],
  },

  // ---- Mexico ----
  guadalajara: {
    system: 'MiBici',
    coveredAreas: [
      area('Zapopan', 'Jalisco', 'city', 1476491, SRC.inegi2020, true),
      area('Guadalajara', 'Jalisco', 'city', 1385629, SRC.inegi2020),
      area(
        'San Pedro Tlaquepaque',
        'Jalisco',
        'city',
        687127,
        SRC.inegi2020,
        true
      ),
    ],
  },
  mexico_city: {
    system: 'Ecobici',
    coveredAreas: [
      area('Álvaro Obregón', 'CDMX', 'borough', 759137, SRC.inegi2020, true),
      area('Coyoacán', 'CDMX', 'borough', 614447, SRC.inegi2020, true),
      area('Cuauhtémoc', 'CDMX', 'borough', 545884, SRC.inegi2020),
      area('Benito Juárez', 'CDMX', 'borough', 434153, SRC.inegi2020),
      area('Azcapotzalco', 'CDMX', 'borough', 432205, SRC.inegi2020, true),
      area('Miguel Hidalgo', 'CDMX', 'borough', 414470, SRC.inegi2020),
    ],
  },

  // ---- South Korea ----
  seoul: {
    system: 'Ddareungi (Seoul Bike)',
    coveredAreas: [area('Seoul', undefined, 'city', 9386034, SRC.kostat2023)],
  },
  daejeon: {
    system: 'Tashu',
    coveredAreas: [area('Daejeon', undefined, 'city', 1442216, SRC.kostat2023)],
  },

  // ---- Taiwan ----
  taipei: {
    system: 'YouBike',
    note: 'YouBike also runs as a separate regional network across New Taipei City and other Taiwanese cities, but those trips are not included in this data set.',
    coveredAreas: [
      area('Taipei City', undefined, 'city', 2494813, SRC.taipei2024),
    ],
  },

  // ---- Norway ----
  bergen: {
    system: 'Bergen Bysykkel',
    coveredAreas: [
      area('Bergen', undefined, 'city', 291940, SRC.ssb2024, true),
    ],
  },
  oslo: {
    system: 'Oslo Bysykkel',
    coveredAreas: [area('Oslo', undefined, 'city', 717710, SRC.ssb2024, true)],
  },
  trondheim: {
    system: 'Trondheim Bysykkel',
    coveredAreas: [
      area('Trondheim', undefined, 'city', 214565, SRC.ssb2024, true),
    ],
  },

  // ---- Finland ----
  helsinki: {
    system: 'HSL City Bikes',
    note: 'Helsinki and Espoo share one service; Vantaa runs a separate system (suspended 2026–2028).',
    coveredAreas: [
      area('Helsinki', undefined, 'city', 684018, SRC.statFi2024),
      area('Espoo', undefined, 'city', 320000, SRC.statFi2024),
    ],
  },

  // ---- United Kingdom ----
  london: {
    system: 'Santander Cycles',
    note: 'Covers central/inner London boroughs only, and typically only part of each.',
    coveredAreas: [
      area('Newham', 'Greater London', 'borough', 351100, SRC.ons2021, true),
      area(
        'Wandsworth',
        'Greater London',
        'borough',
        327500,
        SRC.ons2021,
        true
      ),
      area('Lambeth', 'Greater London', 'borough', 317600, SRC.ons2021, true),
      area(
        'Tower Hamlets',
        'Greater London',
        'borough',
        310300,
        SRC.ons2021,
        true
      ),
      area('Southwark', 'Greater London', 'borough', 307700, SRC.ons2021, true),
      area('Hackney', 'Greater London', 'borough', 259200, SRC.ons2021, true),
      area('Islington', 'Greater London', 'borough', 216600, SRC.ons2021, true),
      area('Camden', 'Greater London', 'borough', 210100, SRC.ons2021, true),
      area(
        'Westminster',
        'Greater London',
        'borough',
        204300,
        SRC.ons2021,
        true
      ),
      area(
        'Hammersmith and Fulham',
        'Greater London',
        'borough',
        183200,
        SRC.ons2021,
        true
      ),
      area(
        'Kensington and Chelsea',
        'Greater London',
        'borough',
        143400,
        SRC.ons2021,
        true
      ),
      area('City of London', 'Greater London', 'city', 8600, SRC.ons2021, true),
    ],
  },

  // ---- Argentina ----
  rosario: {
    system: 'Mi Bici Tu Bici',
    coveredAreas: [area('Rosario', 'Santa Fe', 'city', 1030069, SRC.indec2022)],
  },
}

// Total population of every municipality a system serves, keyed by systems key.
// Note: sums whole-municipality figures, so systems that only partially cover
// large areas (see `partialCoverage`) have an inflated denominator.
export const POPULATION_SERVED: Record<string, number> = Object.fromEntries(
  Object.entries(AREAS_SERVED).map(([key, { coveredAreas }]) => [
    key,
    coveredAreas.reduce((sum, a) => sum + a.population, 0),
  ])
)
