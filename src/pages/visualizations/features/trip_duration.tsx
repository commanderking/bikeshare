import MedianTripTimeBoxPlot from '@/app/components/charts/MedianTripTimeBoxPlot'
import yearlyTrips from '@/data/trips_per_year.json'
import MedianTripHorizontalBoxPlot from '@/app/components/charts/MedianTripTimeHorizontalBoxPlot'
import { toTripsWithSystemData } from '@/app/utils/yearlyTrips'

const secondsToMinutes = (seconds: number) => seconds / 60

const toMinutes = (trip) => {
  const { duration_median, duration_q1, duration_q3 } = trip
  return {
    ...trip,
    duration_median: secondsToMinutes(duration_median),
    duration_q1: secondsToMinutes(duration_q1),
    duration_q3: secondsToMinutes(duration_q3),
  }
}

const cityTrip = yearlyTrips
  .filter((trip) => trip.city === 'taipei')
  .map(toMinutes)

const allCities = yearlyTrips
  .filter((trip) => trip.year === 2022)
  .map(toTripsWithSystemData)
  .map(toMinutes)
  .slice()
  .sort((a, b) => a.duration_median - b.duration_median)

const TripDuration = () => {
  return (
    <div>
      <MedianTripTimeBoxPlot data={cityTrip} />
      <h3 className="ml-12">
        Median Trip Duration (minutes) for Bikeshare Trips
      </h3>
      <span className="ml-12">Bar shows the Q1 and Q3 range of trips</span>
      <MedianTripHorizontalBoxPlot data={allCities} />
    </div>
  )
}

export default TripDuration
