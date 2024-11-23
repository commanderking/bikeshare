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
  systemName: string
  country: Country
  longitude: number
  latitude: number
}
