type NullCounts = {
  start_time: string
  end_time: string
  start_station_name: string
  end_station_name: string
}

export type RawSystemStatistics = {
  null_counts: NullCounts
  total_rows: number
  null_rows: number
  percent_complete: number
  updated_at: string
}

export type SystemStats = {
  name: number
  trips: number
  percentComplete: number
  nullCounts: NullCounts
}

type Grade = 'A+' | 'A' | 'B' | 'C' | 'D'

export type Rating = {
  name: string
  id: string
  grade: Grade
  accessible: number
  complete: number
  processable: number
  fresh: number
  documented: number
  unique: number
}
