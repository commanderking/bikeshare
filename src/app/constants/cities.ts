type Country = 'USA' | 'Taiwan' | 'Canada' | 'Mexico'

type System = {
  id: string
  metroArea: string
  systemName: string
  country: Country
}

export const systems: { [key: string]: System } = {
  nyc: {
    id: 'nyc',
    metroArea: 'New York City',
    systemName: 'Citi Bike',
    country: 'USA',
  },
  chicago: {
    id: 'chicago',
    metroArea: 'Chicago',
    systemName: 'Divvy Bike',
    country: 'USA',
  },
  dc: {
    id: 'dc',
    metroArea: 'Washington D.C.',
    systemName: 'Capital Bikeshare',
    country: 'USA',
  },
  boston: {
    id: 'boston',
    metroArea: 'Boston',
    systemName: 'Bluebike',
    country: 'USA',
  },
  sf: {
    id: 'sf',
    metroArea: 'San Francisco',
    systemName: 'Bay Wheels',
    country: 'USA',
  },
  philadelphia: {
    id: 'philadelphia',
    metroArea: 'Philadelphia',
    systemName: 'Indego',
    country: 'USA',
  },
  los_angeles: {
    id: 'los_angeles',
    metroArea: 'Los Angeles',
    systemName: 'Metro Bike Share',
    country: 'USA',
  },
  toronto: {
    id: 'toronto',
    metroArea: 'Toronto',
    systemName: 'Bike Share Toronto',
    country: 'Canada',
  },
  pittsburgh: {
    id: 'pittsburgh',
    metroArea: 'Pittsburgh',
    systemName: 'POGOH',
    country: 'USA',
  },
  columbus: {
    id: 'columbus',
    metroArea: 'Columbus',
    systemName: 'CoGo',
    country: 'USA',
  },
  austin: {
    id: 'austin',
    metroArea: 'Austin',
    systemName: 'CapMetro Bikeshare',
    country: 'USA',
  },
}

export const US_SYSTEMS = Object.values(systems)
  .filter((system) => {
    return system.country === 'USA'
  })
  .map((systems) => systems.id)
