export type YearlyTrip = {
  year: number
  trip_count: number
  mean_duration: number
  first_quantile_duration: number
  median_duration: number
  third_quantile_duration: number
  system: string
}

export type AggregatedTrip = Pick<YearlyTrip, 'year' | 'trip_count' | 'system'>
