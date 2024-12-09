export const cityRatings = [
  {
    id: 'austin',
    name: 'Austin',
    accessible: 5,
    complete: 5,
    processable: 4.5,
    fresh: 2,
    documented: 5,
    unique: 2, // Direct query on data, OData,
  },
  {
    id: 'bergen',
    name: 'Bergen',
    accessible: 4,
    complete: 5,
    processable: 5,
    fresh: 5,
    documented: 4,
    unique: 5, // Updated daily, example JSON/CSV, always updated daily， live look - https://bergenbysykkel.no/en/stations/live
  },
  {
    id: 'boston',
    name: 'Boston',
    accessible: 4,
    complete: 4,
    processable: 4,
    fresh: 4,
    documented: 4,
    unique: 4, // Link to 2020 Visualization made by city (+2), Membership and Ridership data presented as a table for every year, most popular stations
  },
  {
    id: 'chattanooga',
    name: 'Chattanooga',
    accessible: 5,
    complete: 3,
    processable: 5,
    fresh: 2,
    documented: 5,
    unique: 4, // Direct query on data, OData, response day of (+2)
  },
  {
    id: 'columbus',
    name: 'Columbus',
    accessible: 4,
    complete: 2,
    processable: 3,
    fresh: 4,
    documented: 4,
    unique: 0,
  },
  {
    id: 'chicago',
    name: 'Chicago',
    accessible: 4,
    complete: 2,
    processable: 3,
    fresh: 4,
    documented: 4,
    unique: 0,
  },
  {
    id: 'jersey_city',
    name: 'Jersey City',
    accessible: 4,
    complete: 3,
    processable: 4,
    fresh: 4,
    documented: 4,
    unique: 2, // Link to monthly operating expenses, link to google group and NYC bicycling data
  },
  {
    id: 'los_angeles',
    name: 'Los Angeles',
    accessible: 4,
    complete: 4,
    processable: 4,
    fresh: 4,
    documented: 4,
    unique: 1, // Limited visualization of data and projection of calories burned, emissions saved, and miles traveled
  },
  {
    id: 'mexico_city',
    name: 'Mexico City',
    accessible: 4,
    complete: 4,
    processable: 2,
    fresh: 4,
    documented: 2,
    unique: 0,
  },
  {
    id: 'montreal',
    name: 'Montreal',
    accessible: 4,
    complete: 3,
    processable: 3,
    fresh: 4,
    documented: 4,
    unique: 3, // Great per month visualization and breakdown of members vs occasionals (best in class)
  },
  {
    id: 'nyc',
    name: 'New York City',
    accessible: 4,
    complete: 3,
    processable: 3, // Worse than Jersey City - duplicate monthly data, too many date formats
    fresh: 4,
    documented: 4,
    unique: 2, // Same as Jersey City
  },
  {
    id: 'oslo',
    name: 'Oslo',
    accessible: 4,
    complete: 5,
    processable: 5,
    fresh: 5,
    documented: 4,
    unique: 5,
  },
  {
    id: 'philadelphia',
    name: 'Philadelphia',
    accessible: 4,
    complete: 5,
    processable: 4,
    fresh: 4,
    documented: 4, // Good documentation of types
    unique: 1, // Total ride, costs cut
  },
  {
    id: 'pittsburgh',
    name: 'Pittsburgh',
    accessible: 4,
    complete: 5,
    processable: 3,
    fresh: 4,
    documented: 4, // No documentation, but nice way to explore data for each month. Also notes as to station name renaming
    unique: 3, // Love the UI, download in wide variety of formats (CSV, TSV, JSON, XML, XLS), ability to explore/filter in UI
  },
  {
    id: 'sf',
    name: 'San Francisco',
    accessible: 4,
    complete: 1,
    processable: 4,
    fresh: 4,
    documented: 3, // San Francisco has less documentation than other Lyft
    unique: 0,
  },
  {
    id: 'taipei',
    name: 'Taipei',
    accessible: 3,
    complete: 5,
    processable: 4, // Really weird time structure that's not standard chrono format
    fresh: 2,
    documented: 2, // San Francisco has less documentation than other Lyft
    unique: 4, // World class visualizations on webpage https://www.youbike.com.tw/region/taipei/operation/ (+3), cool anonymization of start and end time
  },
  {
    id: 'toronto',
    name: 'Toronto',
    accessible: 5,
    complete: 5,
    processable: 4,
    fresh: 5,
    documented: 4,
    unique: 3, // Does their own data quality rating (+2), API documentation
  },
  {
    id: 'trondheim',
    name: 'Trondheim',
    accessible: 4,
    complete: 4,
    processable: 5,
    fresh: 5,
    documented: 4,
    unique: 5, // https://trondheimbysykkel.no/en/stations/live
  },
  {
    id: 'vancouver',
    name: 'Vancouver',
    accessible: 4,
    complete: 4,
    processable: 3, // One set of data structure, but hours of datetime not zero padded, utf8-lossy needed, horrendous where there are 30,000 rows at the end that have null data for any column
    fresh: 4,
    documented: 3, // Stopover data is cool that it exists
    unique: 0,
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
  },
]

export const getRating = (id: string) => {
  return cityRatings.find((rating) => rating.id === id)
}

export const A_PLUS_CITIES = ['bergen', 'oslo'].map(getRating)
export const A_CITIES = ['trondheim', 'toronto'].map(getRating)
export const B_CITIES = [
  'austin',
  'boston',
  'pittsburgh',
  'philadelphia',
  'los_angeles',
].map(getRating)
export const C_CITIES = [
  'chattanooga',
  'jersey_city',
  'taipei',
  'montreal',
  'nyc',
  'dc',
].map(getRating)
export const D_CITIES = [
  'vancouver',
  'mexico_city',
  'columbus',
  'chicago',
  'sf',
].map(getRating)
