import _ from 'lodash'
import {
  RawRating,
  Rating,
  UpdateFrequency,
  Grade,
} from 'src/app/model/Ratings'

const UpdateFrequencyEnum: {
  [key in UpdateFrequency]: {
    id: UpdateFrequency
    name: string
  }
} = {
  UNKNOWN: {
    id: 'UNKNOWN',
    name: 'Unknown',
  },
  DAILY: {
    id: 'DAILY',
    name: 'Daily',
  },
  BIWEEKLY: {
    id: 'BIWEEKLY',
    name: 'Biweekly',
  },
  MONTHLY: {
    id: 'MONTHLY',
    name: 'Monthly',
  },
  UPON_REQUEST: {
    id: 'UPON_REQUEST',
    name: 'Upon Request',
  },
}

export const cityRatings: RawRating[] = [
  {
    id: 'austin',
    name: 'Austin',
    accessible: 5,
    complete: 5,
    processable: 4.5,
    fresh: 1,
    documented: 5, // You can preview all the data and see headers for the whole data set
    unique: 2, // Direct query on data, OData,
    updateFrequency: 'UNKNOWN',
  },
  {
    id: 'bergen',
    name: 'Bergen',
    accessible: 3,
    complete: 5,
    processable: 5,
    fresh: 5,
    documented: 5,
    unique: 5, // Updated daily, example JSON/CSV, always updated daily， live look - https://bergenbysykkel.no/en/stations/live
    updateFrequency: 'DAILY',
  },
  {
    id: 'boston',
    name: 'Boston',
    accessible: 4,
    complete: 4,
    processable: 4,
    fresh: 4,
    documented: 3,
    unique: 4, // Link to 2020 Visualization made by city (+2), Membership and Ridership data presented as a table for every year, most popular stations
    updateFrequency: 'MONTHLY',
  },
  {
    id: 'chattanooga',
    name: 'Chattanooga',
    accessible: 5,
    complete: 4,
    processable: 5,
    fresh: 2,
    documented: 5,
    unique: 4, // Direct query on data, OData, response day of (+2)
    updateFrequency: 'UPON_REQUEST',
  },
  {
    id: 'columbus',
    name: 'Columbus',
    accessible: 4,
    complete: 3,
    processable: 3,
    fresh: 4,
    documented: 3,
    unique: 0,
    updateFrequency: 'MONTHLY',
  },
  {
    id: 'chicago',
    name: 'Chicago',
    accessible: 4,
    complete: 2,
    processable: 3,
    fresh: 4,
    documented: 3,
    unique: 0,
    updateFrequency: 'MONTHLY',
  },
  {
    id: 'jersey_city',
    name: 'Jersey City',
    accessible: 4,
    complete: 4,
    processable: 4,
    fresh: 4,
    documented: 3,
    unique: 2, // Link to monthly operating expenses, link to google group and NYC bicycling data
    updateFrequency: 'MONTHLY',
  },
  {
    id: 'los_angeles',
    name: 'Los Angeles',
    accessible: 3,
    complete: 4,
    processable: 4,
    fresh: 4,
    documented: 4,
    unique: 1, // Limited visualization of data and projection of calories burned, emissions saved, and miles traveled
    updateFrequency: 'MONTHLY',
  },
  {
    id: 'mexico_city',
    name: 'Mexico City',
    accessible: 3,
    complete: 4,
    processable: 2,
    fresh: 4,
    documented: 1,
    unique: 0,
    updateFrequency: 'MONTHLY',
  },
  {
    id: 'montreal',
    name: 'Montreal',
    accessible: 3,
    complete: 4,
    processable: 3,
    fresh: 4,
    documented: 1,
    unique: 3, // Great per month visualization and breakdown of members vs occasionals (best in class)
    updateFrequency: 'MONTHLY',
  },
  {
    id: 'nyc',
    name: 'New York City',
    accessible: 4,
    complete: 4,
    processable: 3, // Worse than Jersey City - duplicate monthly data, too many date formats
    fresh: 4,
    documented: 3,
    unique: 2, // Same as Jersey City
    updateFrequency: 'MONTHLY',
  },
  {
    id: 'oslo',
    name: 'Oslo',
    accessible: 3,
    complete: 5,
    processable: 5,
    fresh: 5,
    documented: 5,
    unique: 5,
    updateFrequency: 'DAILY',
  },
  {
    id: 'philadelphia',
    name: 'Philadelphia',
    accessible: 3,
    complete: 5,
    processable: 4,
    fresh: 4,
    documented: 4, // Good documentation of types
    unique: 1, // Total ride, costs cut
    updateFrequency: 'MONTHLY',
  },
  {
    id: 'pittsburgh',
    name: 'Pittsburgh',
    accessible: 3,
    complete: 4,
    processable: 3,
    fresh: 4,
    documented: 3, // No documentation, but nice way to explore data for each month. Also notes as to station name renaming
    unique: 3, // Love the UI, download in wide variety of formats (CSV, TSV, JSON, XML, XLS), ability to explore/filter in UI
    updateFrequency: 'MONTHLY',
  },
  {
    id: 'sf',
    name: 'San Francisco',
    accessible: 4,
    complete: 1,
    processable: 4,
    fresh: 4,
    documented: 3,
    unique: 0,
    updateFrequency: 'MONTHLY',
  },
  {
    id: 'taipei',
    name: 'Taipei',
    accessible: 2,
    complete: 5,
    processable: 4, // Really weird time structure that's not standard chrono format
    fresh: 2,
    documented: 1,
    unique: 4, // World class visualizations on webpage https://www.youbike.com.tw/region/taipei/operation/ (+3), cool anonymization of start and end time
    updateFrequency: 'UPON_REQUEST',
  },
  {
    id: 'toronto',
    name: 'Toronto',
    accessible: 4,
    complete: 5,
    processable: 4,
    fresh: 5,
    documented: 3,
    unique: 3, // Does their own data quality rating (+2), API documentation
    updateFrequency: 'MONTHLY',
  },
  {
    id: 'trondheim',
    name: 'Trondheim',
    accessible: 3,
    complete: 4,
    processable: 5,
    fresh: 5,
    documented: 5,
    unique: 5, // https://trondheimbysykkel.no/en/stations/live
    updateFrequency: 'DAILY',
  },
  {
    id: 'vancouver',
    name: 'Vancouver',
    accessible: 2, // GOOGLE DOCS?
    complete: 4,
    processable: 2, // One set of data structure, but hours of datetime not zero padded, utf8-lossy needed, horrendous where there are 30,000 rows at the end that have null data for any column
    fresh: 4,
    documented: 1, // Stopover data is cool that it exists
    unique: 0,
    updateFrequency: 'MONTHLY',
  },
  {
    id: 'dc',
    name: 'Washington DC',
    accessible: 4,
    complete: 3,
    processable: 4,
    fresh: 4,
    documented: 3,
    unique: 1, // Has expansion plan, KML?
    updateFrequency: 'MONTHLY',
  },
  {
    id: 'london',
    name: 'London',
    accessible: 4,
    complete: 4,
    processable: 4,
    fresh: 4.5,
    documented: 1,
    unique: 2, // Has other potentially neat data in bucket
    updateFrequency: 'BIWEEKLY',
  },
  {
    id: 'helsinki',
    name: 'Helsinki',
    accessible: 3,
    complete: 4,
    processable: 5,
    fresh: 4,
    documented: 1,
    unique: 2,
    updateFrequency: 'MONTHLY',
  },
  {
    id: 'guadalajara',
    name: 'Guadalajara',
    accessible: 3, // the year tabs close when you download a file.
    complete: 5,
    processable: 4,
    fresh: 4,
    documented: 1,
    unique: 1,
    updateFrequency: 'MONTHLY',
  },
]

export const getRating = (id: string) => {
  return cityRatings.find((rating) => rating.id === id)
}

const getGrade = (score: number, maxScore: number): Grade => {
  const percentage = (score / maxScore) * 100
  if (percentage >= 95) {
    return 'A+'
  }
  if (percentage >= 90) {
    return 'A'
  }
  if (percentage >= 80) {
    return 'B'
  }

  if (percentage >= 70) {
    return 'C'
  }

  return 'D'
}

const MAX_SCORE = 35

export const calculateScore = (rating: RawRating): Rating => {
  const score =
    rating.accessible +
    rating.complete * 2 +
    rating.processable * 2 +
    rating.fresh +
    rating.documented
  const grade = getGrade(score, MAX_SCORE)

  return {
    ...rating,
    score,
    frequency: UpdateFrequencyEnum[rating.updateFrequency].name,
    grade,
  }
}

export const getCityRating = (id: string) => {
  // @ts-ignore - TODO: Update id to an enum
  return calculateScore(getRating(id))
}

const allCityRatings = cityRatings.map(calculateScore)

export const allCityRatingsByGrade = _.groupBy(allCityRatings, 'grade')
export const allCitiesByGrade = _.mapValues(
  allCityRatingsByGrade,
  (citiesForGrade) => {
    return citiesForGrade
      .sort((a, b) => b.score - a.score)
      .map((city) => city.id)
  }
)
