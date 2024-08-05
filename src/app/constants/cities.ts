type Country = 'USA' | 'Taiwan' | 'Canada' | 'Mexico'

type System = {
  id: string
  metroArea: string
  systemName: string
  country: Country
  longitude: number
  latitude: number
}

export const systems: { [key: string]: System } = {
  nyc: {
    id: 'nyc',
    metroArea: 'New York City',
    systemName: 'Citi Bike',
    country: 'USA',
    longitude: -74.006,
    latitude: 40.7128,
  },
  chicago: {
    id: 'chicago',
    metroArea: 'Chicago',
    systemName: 'Divvy Bike',
    country: 'USA',
    longitude: -87.6298,
    latitude: 41.8781,
  },
  dc: {
    id: 'dc',
    metroArea: 'Washington D.C.',
    systemName: 'Capital Bikeshare',
    country: 'USA',
    longitude: -77.0369,
    latitude: 38.9072,
  },
  boston: {
    id: 'boston',
    metroArea: 'Boston',
    systemName: 'Bluebike',
    country: 'USA',
    longitude: -71.0589,
    latitude: 42.3601,
  },
  sf: {
    id: 'sf',
    metroArea: 'San Francisco',
    systemName: 'Bay Wheels',
    country: 'USA',
    longitude: -122.4194,
    latitude: 37.7749,
  },
  philadelphia: {
    id: 'philadelphia',
    metroArea: 'Philadelphia',
    systemName: 'Indego',
    country: 'USA',
    longitude: -75.1652,
    latitude: 39.9526,
  },
  los_angeles: {
    id: 'los_angeles',
    metroArea: 'Los Angeles',
    systemName: 'Metro Bike Share',
    country: 'USA',
    longitude: -118.2437,
    latitude: 34.0522,
  },
  toronto: {
    id: 'toronto',
    metroArea: 'Toronto',
    systemName: 'Bike Share Toronto',
    country: 'Canada',
    longitude: -79.3832,
    latitude: 43.6532,
  },
  pittsburgh: {
    id: 'pittsburgh',
    metroArea: 'Pittsburgh',
    systemName: 'POGOH',
    country: 'USA',
    longitude: -79.9959,
    latitude: 40.4406,
  },
  columbus: {
    id: 'columbus',
    metroArea: 'Columbus',
    systemName: 'CoGo',
    country: 'USA',
    longitude: -82.9988,
    latitude: 39.9612,
  },
  austin: {
    id: 'austin',
    metroArea: 'Austin',
    systemName: 'CapMetro Bikeshare',
    country: 'USA',
    longitude: -97.7431,
    latitude: 30.2672,
  },
}

export const US_SYSTEMS = Object.values(systems)
  .filter((system) => {
    return system.country === 'USA'
  })
  .map((systems) => systems.id)
