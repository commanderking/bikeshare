import { Rating } from 'src/app/model/Ratings'

export const cityRatings: Rating[] = [
  {
    id: 'austin',
    name: 'Austin',
    grade: 'B',
    accessible: 5,
    complete: 5,
    processable: 4.5,
    fresh: 2,
    documented: 5,
    unique: 2, // Direct query on data, OData,
    updateFrequency: 'UNKNOWN',
  },
  {
    id: 'bergen',
    name: 'Bergen',
    grade: 'A+',
    accessible: 4,
    complete: 5,
    processable: 5,
    fresh: 5,
    documented: 4,
    unique: 5, // Updated daily, example JSON/CSV, always updated daily， live look - https://bergenbysykkel.no/en/stations/live
    updateFrequency: 'DAILY',
  },
  {
    id: 'boston',
    name: 'Boston',
    grade: 'B',
    accessible: 4,
    complete: 4,
    processable: 4,
    fresh: 4,
    documented: 4,
    unique: 4, // Link to 2020 Visualization made by city (+2), Membership and Ridership data presented as a table for every year, most popular stations
    updateFrequency: 'MONTHLY',
  },
  {
    id: 'chattanooga',
    name: 'Chattanooga',
    grade: 'C',
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
    grade: 'D',
    accessible: 4,
    complete: 2,
    processable: 3,
    fresh: 4,
    documented: 4,
    unique: 0,
    updateFrequency: 'MONTHLY',
  },
  {
    id: 'chicago',
    name: 'Chicago',
    grade: 'D',
    accessible: 4,
    complete: 2,
    processable: 3,
    fresh: 4,
    documented: 4,
    unique: 0,
    updateFrequency: 'MONTHLY',
  },
  {
    id: 'jersey_city',
    name: 'Jersey City',
    grade: 'C',
    accessible: 4,
    complete: 4,
    processable: 4,
    fresh: 4,
    documented: 4,
    unique: 2, // Link to monthly operating expenses, link to google group and NYC bicycling data
    updateFrequency: 'MONTHLY',
  },
  {
    id: 'los_angeles',
    name: 'Los Angeles',
    grade: 'B',
    accessible: 4,
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
    grade: 'D',
    accessible: 4,
    complete: 4,
    processable: 2,
    fresh: 4,
    documented: 2,
    unique: 0,
    updateFrequency: 'MONTHLY',
  },
  {
    id: 'montreal',
    name: 'Montreal',
    grade: 'C',
    accessible: 4,
    complete: 4,
    processable: 3,
    fresh: 4,
    documented: 4,
    unique: 3, // Great per month visualization and breakdown of members vs occasionals (best in class)
    updateFrequency: 'MONTHLY',
  },
  {
    id: 'nyc',
    name: 'New York City',
    grade: 'C',
    accessible: 4,
    complete: 4,
    processable: 3, // Worse than Jersey City - duplicate monthly data, too many date formats
    fresh: 4,
    documented: 4,
    unique: 2, // Same as Jersey City
    updateFrequency: 'MONTHLY',
  },
  {
    id: 'oslo',
    name: 'Oslo',
    grade: 'A+',
    accessible: 4,
    complete: 5,
    processable: 5,
    fresh: 5,
    documented: 4,
    unique: 5,
    updateFrequency: 'DAILY',
  },
  {
    id: 'philadelphia',
    name: 'Philadelphia',
    grade: 'B',
    accessible: 4,
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
    grade: 'B',
    accessible: 4,
    complete: 5,
    processable: 3,
    fresh: 4,
    documented: 4, // No documentation, but nice way to explore data for each month. Also notes as to station name renaming
    unique: 3, // Love the UI, download in wide variety of formats (CSV, TSV, JSON, XML, XLS), ability to explore/filter in UI
    updateFrequency: 'MONTHLY',
  },
  {
    id: 'sf',
    name: 'San Francisco',
    grade: 'D',
    accessible: 4,
    complete: 1,
    processable: 4,
    fresh: 4,
    documented: 3, // San Francisco has less documentation than other Lyft
    unique: 0,
    updateFrequency: 'MONTHLY',
  },
  {
    id: 'taipei',
    name: 'Taipei',
    grade: 'C',
    accessible: 3,
    complete: 5,
    processable: 4, // Really weird time structure that's not standard chrono format
    fresh: 2,
    documented: 2, // San Francisco has less documentation than other Lyft
    unique: 4, // World class visualizations on webpage https://www.youbike.com.tw/region/taipei/operation/ (+3), cool anonymization of start and end time
    updateFrequency: 'UPON_REQUEST',
  },
  {
    id: 'toronto',
    name: 'Toronto',
    grade: 'A',
    accessible: 5,
    complete: 5,
    processable: 4,
    fresh: 5,
    documented: 4,
    unique: 3, // Does their own data quality rating (+2), API documentation
    updateFrequency: 'MONTHLY',
  },
  {
    id: 'trondheim',
    name: 'Trondheim',
    grade: 'A',
    accessible: 4,
    complete: 4,
    processable: 5,
    fresh: 5,
    documented: 4,
    unique: 5, // https://trondheimbysykkel.no/en/stations/live
    updateFrequency: 'DAILY',
  },
  {
    id: 'vancouver',
    name: 'Vancouver',
    grade: 'D',
    accessible: 4,
    complete: 4,
    processable: 3, // One set of data structure, but hours of datetime not zero padded, utf8-lossy needed, horrendous where there are 30,000 rows at the end that have null data for any column
    fresh: 4,
    documented: 3, // Stopover data is cool that it exists
    unique: 0,
    updateFrequency: 'MONTHLY',
  },
  {
    id: 'dc',
    name: 'Washington DC',
    grade: 'C',
    accessible: 4,
    complete: 3,
    processable: 4,
    fresh: 4,
    documented: 3,
    unique: 1, // Has expansion plan, KML?
    updateFrequency: 'MONTHLY',
  },
]

export const getRating = (id: string) => {
  return cityRatings.find((rating) => rating.id === id)
}

export const calculateScore = (rating: Rating) => {
  const score =
    rating.accessible +
    rating.complete * 2 +
    rating.processable * 1.5 +
    rating.fresh +
    rating.documented +
    rating.unique * 0.5

  return {
    ...rating,
    score,
  }
}

export const getCityRating = (id: string) => {
  // @ts-ignore - TODO: Update id to an enum
  return calculateScore(getRating(id))
}

export const A_PLUS_CITIES = ['bergen', 'oslo'].map(getCityRating)
export const A_CITIES = ['trondheim', 'toronto'].map(getCityRating)
export const B_CITIES = [
  'austin',
  'boston',
  'pittsburgh',
  'philadelphia',
  'los_angeles',
].map(getCityRating)
export const C_CITIES = [
  'chattanooga',
  'jersey_city',
  'taipei',
  'montreal',
  'nyc',
  'dc',
].map(getCityRating)
export const D_CITIES = [
  'vancouver',
  'mexico_city',
  'columbus',
  'chicago',
  'sf',
].map(getCityRating)
