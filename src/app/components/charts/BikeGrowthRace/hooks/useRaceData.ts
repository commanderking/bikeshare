'use client'

import { useMemo } from 'react'
import { useAllTimeTrips } from '@/app/hooks/useAllTimeTrips'
import { applyBackfills } from '../backfill/backfill'
import { buildRaceTimeline, MonthKey, RaceCity } from '../timeline/buildRaceTimeline'
import { makeSpeedScale, referenceGrowth } from '../render/speed'
import { FINAL_MONTH } from '../constants'
import { useBackfills } from './useBackfills'

export type YearTick = { year: number; monthIndex: number }

export type RaceData = {
  loading: boolean
  months: MonthKey[]
  cities: RaceCity[]
  maxT: number
  cityMap: Map<string, RaceCity>
  speedScale: (growth: number) => number
  yearTicks: YearTick[]
}

// Assembles the full race data model: fetches every city's trips, folds in the
// historical backfills, builds the (capped) timeline, and derives the lookups the
// race needs. Pure data — no refs, no playback state.
export const useRaceData = (): RaceData => {
  const { trips, loading: tripsLoading } = useAllTimeTrips()
  const { byCity: backfills, loading: backfillLoading } = useBackfills()
  const loading = tripsLoading || backfillLoading

  // Race-only: fold each city's historical backfill into its series (Taipei
  // YouBike 1.0, Montreal BIXI's pre-2014 seasons). Other charts are unaffected.
  const augmentedTrips = useMemo(
    () => applyBackfills(trips, backfills),
    [trips, backfills]
  )
  const timeline = useMemo(
    () => buildRaceTimeline(augmentedTrips, FINAL_MONTH),
    [augmentedTrips]
  )
  const { months, cities } = timeline
  const maxT = Math.max(0, months.length - 1)

  const cityMap = useMemo(
    () => new Map(cities.map((raceCity) => [raceCity.city, raceCity])),
    [cities]
  )
  const speedScale = useMemo(
    () => makeSpeedScale(referenceGrowth(cities)),
    [cities]
  )
  // First month index of each calendar year — the scrubber's timeline ticks.
  const yearTicks = useMemo(() => {
    const ticks: YearTick[] = []
    let last = -1
    months.forEach((month, monthIndex) => {
      if (month.year !== last) {
        ticks.push({ year: month.year, monthIndex })
        last = month.year
      }
    })
    return ticks
  }, [months])

  return {
    loading,
    months,
    cities,
    maxT,
    cityMap,
    speedScale,
    yearTicks,
  }
}
