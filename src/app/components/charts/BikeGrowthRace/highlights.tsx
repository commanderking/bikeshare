import { ReactNode } from 'react'

// Callouts annotating moments in the race — shown in the right column when the
// clock reaches their month, then faded out. Authored by hand; the month/year is
// converted onto the race axis at runtime (see highlightStack).
export type RaceHighlight = {
  // Stable key. Identifies a card across months and keys its mount.
  id: string
  year: number
  month: number // 1-12
  title: string
  // A plain string, or markup for anything richer:
  //   content: (
  //     <>
  //       Paris opens with <strong>7,000 bikes</strong>.
  //       <ul>
  //         <li>Largest system in the world at the time</li>
  //       </ul>
  //     </>
  //   )
  // HighlightCard styles <strong>/<ul>/<li> for you; don't set font sizes here,
  // or the text stops scaling with the rest of the chart in fullscreen.
  content: ReactNode
  // Which of the column's two fixed slots the card claims. Required: the point is
  // composing the column by hand, and a default would silently collide with a
  // neighbor.
  placement: 1 | 2
  // Intrinsic pixel dimensions are required by next/image; the card scales the
  // rendered size down to its own width.
  image?: { src: string; alt: string; width: number; height: number }
  // City id (as in CITY_BIKE_CONFIG) whose bar color accents the card's edge.
  // Omit for highlights that aren't about one city.
  city?: string
  // Months the card stays up, counting its own month. Defaults below.
  durationMonths?: number
}

export const DEFAULT_HIGHLIGHT_MONTHS = 6

// Authored in any order — resolveHighlights sorts them onto the axis.
export const RACE_HIGHLIGHTS: RaceHighlight[] = [
  {
    id: 'velib-launch',
    year: 2007,
    month: 7,
    title: 'Vélib’ launches',
    content:
      'Paris opens with 7,000 bikes across 750 stations — the largest bikeshare system in the world at the time.',
    placement: 1,
    city: 'paris',
    durationMonths: 12,
  },
  {
    id: 'velib-two-months',
    year: 2007,
    month: 9,
    title: "Paris's Early Success",
    content:
      'In the first two months, over 3.7 million rides were taken in Paris. This will be more than many cities ride in a year. ',
    placement: 2,
    city: 'paris',
    durationMonths: 6,
  },
  {
    id: 'hangzhoul-launch',
    year: 2008,
    month: 5,
    title: 'Hangzhou invests US $26 million to launch bikeshare program.',
    content:
      'Chinese cities will soon launch bikeshare problems to fight intense congestion in cities. Exact numbers are hard to find, so Hangzhou and other China cities will be absent from this visual.',
    placement: 1,
    durationMonths: 6,
  },
  {
    id: 'bixi-launch',
    year: 2009,
    month: 5,
    title: 'Montreal launches Bixi',
    content:
      "Bixi launches North America's first large scale bike sharing system. Bixi's name is a combination of  bicyclette and taxi.",
    placement: 1,
    city: 'montreal',
    durationMonths: 12,
  },
  {
    id: 'bixi-winter',
    year: 2009,
    month: 11,
    title: "Montreal's Winter Freeze",
    content:
      "Montreal's bikeshares are shut down in the winter, and would continue to be shut down each year until November 16th, 2023.",
    placement: 2,
    city: 'montreal',
    durationMonths: 8,
  },

  {
    id: 'mexico-city-launch',
    year: 2010,
    month: 2,
    title: 'Mexico City launches Ecobici',
    content: (
      <a href="https://itdp.org/2010/02/26/mexico-city-launches-latin-americas-largest-public-bike-sharing-program/">
        "Mexico City makes 1,114 bikes across 85 stations available. An annual
        subscription starts at US $23 / year."
      </a>
    ),
    placement: 1,
    city: 'mexico_city',
    durationMonths: 6,
  },
  {
    id: 'london-launch',
    year: 2010,
    month: 7,
    title: `"Boris" Bikes Begin in London `,
    content:
      "Under Barclays sponsorship and Boris Johnson's mayoral tenure, London's bikeshare systems launch with 5000 bikes and 350 docks.",
    placement: 2,
    city: 'london',
    durationMonths: 6,
  },
  {
    id: 'dc-launch',
    year: 2010,
    month: 9,
    title: 'DC launches first large scale bikeshare in USA',
    content:
      "DC had launched a smaller scale bikeshare system, SmartBike, in 2008 with 120 bikes at 10 stations. It wasn't until but 2010 when the modern bikeshare network, Capital Bikeshare, officially launched with 1100 bikes across 100 stations in DC and North Virginia. Cities like Denver and Minneapolis also launch bikeshare systems during this time, but their trip data is not publicly available.",
    placement: 1,
    city: 'washington_dc',
    durationMonths: 6,
  },
  {
    id: 'us-cities',
    year: 2011,
    month: 6,
    title: 'US Systems Join the Pack',
    content:
      "In the coming year, many US cities will try to mimic Paris's success. Boston, Chicago, and Chattanooga among others will join within the year.",
    placement: 2,
    city: 'boston',
    durationMonths: 6,
  },
  {
    id: 'taipei-launch',
    year: 2012,
    month: 11,
    title: 'Taipei Surges!',
    content:
      'After 3 years of low bike usage in a small scale pilot, Taipei launches a larger citywide program that sees widespread adoption. Key to its success is its low cost - free for EasyCard users or only US $0.33 for a 30 minute ride.',
    placement: 1,
    city: 'taipei',
    durationMonths: 6,
  },
  {
    id: 'nyc-launch',
    year: 2013,
    month: 5,
    title: 'New York! New York! Biking arrives in the Concrete Jungle',
    content:
      'Technology failures and Hurricane Sandy successfully delayed its launch for over a year, but in 2013, Citi Bike finally launches with 6,000 bikes over 332 stations.',
    placement: 1,
    city: 'new_york_city',
    durationMonths: 6,
  },
  {
    id: 'taipei-surpasses-london',
    year: 2014,
    month: 10,
    title: 'Taipei passes London for Total Rides, still far behind Paris.',
    content:
      '2014 is a record year for Taipei, which sees a record 22.5 million rides. This still pails in comparison to Paris where an estimated 39.4 million rides were taken.',
    placement: 1,
    city: 'taipei',
    durationMonths: 12,
  },
]
