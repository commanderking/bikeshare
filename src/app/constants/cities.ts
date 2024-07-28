type Country = 'USA' | 'Taiwan' | 'Canada' | 'Mexico'

type System = {
  id: string
  systemName: string
  country: Country
}

export const systems: { [key: string]: System } = {
  nyc: {
    id: 'nyc',
    systemName: 'Citi Bike',
    country: 'USA',
  },
  chicago: {
    id: 'chicago',
    systemName: 'Divvy Bike',
    country: 'USA',
  },
  dc: {
    id: 'dc',
    systemName: 'Capital Bikeshare',
    country: 'USA',
  },
  boston: {
    id: 'boston',
    systemName: 'Bluebike',
    country: 'USA',
  },
  sf: {
    id: 'sf',
    systemName: 'Bay Wheels',
    country: 'USA',
  },
  philadelphia: {
    id: 'philadelphia',
    systemName: 'Indego',
    country: 'USA',
  },
  los_angeles: {
    id: 'los_angeles',
    systemName: 'Metro Bike Share',
    country: 'USA',
  },
  toronto: {
    id: 'toronto',
    systemName: 'Bike Share Toronto',
    country: 'Canada',
  },
  pittsburgh: {
    id: 'pittsburgh',
    systemName: 'POGOH',
    country: 'USA',
  },
  columbus: {
    id: 'columbus',
    systemName: 'CoGo',
    country: 'USA',
  },
  austin: {
    id: 'austin',
    systemName: 'CapMetro Bikeshare',
    country: 'USA',
  },
}

export const US_SYSTEMS = Object.values(systems)
  .filter((system) => {
    return system.country === 'USA'
  })
  .map((systems) => systems.id)
