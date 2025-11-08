export type Country =
  | 'USA'
  | 'Taiwan'
  | 'Canada'
  | 'Mexico'
  | 'Norway'
  | 'Finland'
  | 'United Kingdom'
  | 'Argentina'
  | 'South Korea'

export type System = {
  id: string
  metroArea: string
  city: string
  country: Country
  longitude: number
  latitude: number
}
