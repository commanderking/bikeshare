export type Country =
  | 'USA'
  | 'Taiwan'
  | 'Canada'
  | 'Mexico'
  | 'Norway'
  | 'Finland'
  | 'United Kingdom'

export type System = {
  id: string
  metroArea: string
  city: string
  country: Country
  longitude: number
  latitude: number
}
