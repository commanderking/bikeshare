import MedianTripTimeBoxPlot from '@/app/components/charts/MedianTripTimeBoxPlot'
import yearlyTrips from '@/data/trips_per_year.json'
import MedianTripHorizontalBoxPlot from '@/app/components/charts/MedianTripTimeHorizontalBoxPlot'
import { toTripsWithSystemData } from '@/app/utils/yearlyTrips'
import { YearlyTripWithSystem } from '@/app/model/YearlyTrip'

const secondsToMinutes = (seconds: number) => seconds / 60

const toMinutes = (trip: YearlyTripWithSystem) => {
  const {
    duration_median,
    duration_5_percent,
    duration_q1,
    duration_q3,
    duration_95_percent,
  } = trip
  return {
    ...trip,
    duration_median: secondsToMinutes(duration_median),
    duration_q1: secondsToMinutes(duration_q1),
    duration_q3: secondsToMinutes(duration_q3),
    duration_95_percent: secondsToMinutes(duration_95_percent),
    duration_5_percent: secondsToMinutes(duration_5_percent),
  }
}

const getCityTrip = (city: string) => {
  return yearlyTrips
    .map(toTripsWithSystemData)
    .filter((trip) => trip.city === city)
    .map(toMinutes)
}
const city = 'seoul'
const cityTrip = getCityTrip(city)

const year = 2023
const allCities = yearlyTrips
  .filter((trip) => trip.year === year)
  .map(toTripsWithSystemData)
  .map(toMinutes)
  .slice()
  .sort((a, b) => a.duration_median - b.duration_median)

const TripDuration = () => {
  return (
    <div className="max-w-[600px] m-auto p-8">
      <h3 className="text-2xl text-center">Median Trip Duration for {city} </h3>
      <MedianTripTimeBoxPlot data={cityTrip} />
      <h3 className="ml-12 text-2xl text-center">
        Median Trip Duration (minutes)
      </h3>
      <h4 className="ml-12 text-lg text-center">
        Whiskers are from 5% to 95% trip time
      </h4>
      <MedianTripHorizontalBoxPlot data={allCities} />
    </div>
  )
}

export default TripDuration
