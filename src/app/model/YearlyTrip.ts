import type { System } from '@/app/model/System'

export type YearlyTrip = {
  year: number
  trip_count: number
  duration_q1: number
  duration_median: number
  duration_q3: number
  city: string
}

export type YearlyTripWithSystem = YearlyTrip & System

export type AggregatedTrip = Pick<YearlyTrip, 'year' | 'trip_count' | 'city'>
