export const cityRatings = [
  {
    name: 'Austin',
    accessible: 5,
    complete: 5,
    processable: 4.5,
    fresh: 2,
    documented: 5,
    unique: 2, // Direct query on data, OData,
  },
  {
    name: 'Bergen',
    accessible: 4,
    complete: 5,
    processable: 5,
    fresh: 5,
    documented: 4,
    unique: 5, // Updated daily, example JSON/CSV, always updated daily， live look - https://bergenbysykkel.no/en/stations/live
  },
  {
    name: 'Boston',
    accessible: 4,
    complete: 4,
    processable: 4,
    fresh: 4,
    documented: 4,
    unique: 4, // Link to 2020 Visualization made by city (+2), Membership and Ridership data presented as a table for every year, most popular stations
  },
  {
    name: 'Chattanooga',
    accessible: 5,
    complete: 3,
    processable: 5,
    fresh: 2,
    documented: 5,
    unique: 4, // Direct query on data, Odata, response day of (+2)
  },
  {
    name: 'Columbus',
    accessible: 4,
    complete: 2,
    processable: 3,
    fresh: 4,
    documented: 4,
    unique: 0,
  },
  {
    name: 'Chicago',
    accessible: 4,
    complete: 2,
    processable: 3,
    fresh: 4,
    documented: 4,
    unique: 0,
  },
  {
    name: 'Jersey City',
    accessible: 4,
    complete: 3,
    processable: 4,
    fresh: 4,
    documented: 4,
    unique: 2, // Link to monthly operating expenses, link to google group and NYC bicyclcing data
  },
  {
    name: 'Los Angeles',
    accessible: 4,
    complete: 4,
    processable: 4,
    fresh: 4,
    documented: 4,
    unique: 1, // Limited visualization of data and projection of calories burned, emissions saved, and miles traveled
  },
  {
    name: 'Mexico City',
    accessible: 4,
    complete: 4,
    processable: 2,
    fresh: 4,
    documented: 2,
    unique: 0,
  },
  {
    name: 'Montreal',
    accessible: 4,
    complete: 3,
    processable: 3,
    fresh: 4,
    documented: 4,
    unique: 3, // Great per month visualization and breakdown of members vs occasionals (best in class)
  },

  {
    name: 'New York City',
    accessible: 4,
    complete: 3,
    processable: 3, // worse than Jersey city - duplicate monthly data, too many date_formats
    fresh: 4,
    documented: 4,
    unique: 2, // Same as Jersey City
  },
  {
    name: 'Oslo',
    accessible: 4,
    complete: 5,
    processable: 5,
    fresh: 5,
    documented: 4,
    unique: 5,
  },
  {
    name: 'Philadelphia',
    accessible: 4,
    complete: 5,
    processable: 4,
    fresh: 4,
    documented: 4, // good documentation of types
    unique: 1, // Total ride, costs cut
  },
  {
    name: 'Pittsburgh',
    accessible: 4,
    complete: 5,
    processable: 3,
    fresh: 4,
    documented: 4, // No documentation, but nice way to explore data for each month. Also notes as to station name renaming
    unique: 3, // Love the UI, download in wide variety of format (CSV, TSV, JSON, XML ,XLS), ability to explore/filter in UI
  },
  {
    name: 'San Francisco',
    accessible: 4,
    complete: 1,
    processable: 4,
    fresh: 4,
    documented: 3, // San Francisco has less documentation than other Lyft
    unique: 0,
  },
  {
    name: 'Taipei',
    accessible: 3,
    complete: 5,
    processable: 4, // really weird time structure that's not standard crono format
    fresh: 2,
    documented: 2, // San Francisco has less documentation than other Lyft
    unique: 4, // world class visualizations on webpage https://www.youbike.com.tw/region/taipei/operation/ (+3), cool anonymization of start and end time
  },
  {
    name: 'Toronto',
    accessible: 5,
    complete: 5,
    processable: 4,
    fresh: 5,
    documented: 4,
    unique: 3, // Does their own data quality rating (+2), API documentation,
  },
  {
    name: 'Trondheim',
    accessible: 4,
    complete: 4,
    processable: 5,
    fresh: 5,
    documented: 4,
    unique: 5, // https://trondheimbysykkel.no/en/stations/live
  },
  {
    name: 'Vancouver',
    accessible: 4,
    complete: 4,
    processable: 3, // one set of data structure, but hours of datetime not zero padded, utf8-lossy needed, horrendous where there are 30,000 rows at the end that have null data for any column
    fresh: 4,
    documented: 3, // stopover data is cool that it exists
    unique: 0,
  },
  {
    name: 'Washington DC',
    accessible: 4,
    complete: 3,
    processable: 4,
    fresh: 4,
    documented: 3,
    unique: 1, // Has expansion plan , KML?
  },
]

const toRating = (cityName: string) => {
  return cityRatings.find((rating) => rating.name === cityName)
}

export const A_PLUS_CIITES = ['Bergen', 'Oslo'].map(toRating)
export const A_CITIES = ['Trondheim', 'Toronto'].map(toRating)
export const B_CITIES = [
  'Austin',
  'Boston',
  'Pittsburgh',
  'Philadelphia',
  'Los Angeles',
].map(toRating)
export const C_CITIES = [
  'Chattanooga',
  'Jersey City',
  'Taipei',
  'Montreal',
  'New York City',
  'Washington DC',
].map(toRating)
export const D_CITIES = [
  'Vancouver',
  'Mexico City',
  'Columbus',
  'Chicago',
  'San Francisco',
].map(toRating)
