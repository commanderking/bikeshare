export type Null_By_Year = {
  year: number
  has_null: number
}

export type RawSystemData = {
  null_start_time: number
  null_end_time: number
  null_start_station_name: number
  null_end_station_name: number
  null_by_year: Null_By_Year[]
  total_rows: number
  null_rows: number
  percent_complete: number
  first_trip: string
  last_trip: string
}

type NullByYear = {
  year: number
  hasNull: number
}

export type SystemData = {
  nullStartTime: number
  nullEndTime: number
  nullStartStationName: number
  nullEndStationName: number
  nullByYear: NullByYear[]
  totalRows: number
  nullRows: number
  percentComplete: number
  firstTrip: string
  lastTrip: string
}
